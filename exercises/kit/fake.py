"""照剧本说话的假模型。

真模型要联网、要 API Key、每次回答还不一样，不适合做自动检查。
ScriptedChatModel 按顺序吐出你事先写好的回复，同时把它"看到"的每一轮消息
记在 ``model.calls`` 里，测试就能检查 Agent 到底给模型发了什么。

    model = ScriptedChatModel([
        call("add", {"a": 1, "b": 2}),   # 第 1 轮：调用工具
        ai("答案是 3"),                   # 第 2 轮：给出最终回答
    ])
"""

from __future__ import annotations

import itertools
from typing import Any, Callable, Sequence, Union

from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from pydantic import PrivateAttr

Reply = Union[AIMessage, str, Callable[[list[BaseMessage]], Union[AIMessage, str]]]

_ids = itertools.count(1)


def ai(text: str = "", **kwargs: Any) -> AIMessage:
    """一条普通的模型回复。"""
    return AIMessage(content=text, **kwargs)


def call(name: str, args: dict | None = None, *more: tuple[str, dict], text: str = "") -> AIMessage:
    """一条"我要调用工具"的模型回复。

    call("add", {"a": 1, "b": 2})                       # 调用 1 个工具
    call("add", {...}, ("multiply", {...}))             # 一次并行调用多个工具
    """
    pairs = [(name, args or {}), *more]
    return AIMessage(
        content=text,
        tool_calls=[
            {"name": n, "args": a, "id": f"call_{next(_ids)}", "type": "tool_call"}
            for n, a in pairs
        ],
    )


class ScriptedChatModel(BaseChatModel):
    """按剧本依次回复的假聊天模型。

    - ``replies``：回复列表。每一项可以是 AIMessage、字符串，或者一个
      ``函数(messages) -> AIMessage | str``（需要根据输入动态回答时用）。
    - ``loop=True``：剧本用完后从头再来；默认用完就报错，方便发现"多调用了一次模型"。
    """

    replies: list[Any]
    loop: bool = False

    _cursor: int = PrivateAttr(default=0)
    _calls: list[list[BaseMessage]] = PrivateAttr(default_factory=list)
    _tools: list[str] = PrivateAttr(default_factory=list)

    def __init__(self, replies: Sequence[Reply], loop: bool = False, **kwargs: Any):
        super().__init__(replies=list(replies), loop=loop, **kwargs)

    # ---- 给测试看的记录 -------------------------------------------------
    @property
    def calls(self) -> list[list[BaseMessage]]:
        """每次被调用时收到的完整消息列表。"""
        return self._calls

    @property
    def bound_tools(self) -> list[str]:
        """最近一次 bind_tools 绑定的工具名。"""
        return self._tools

    def system_prompts(self) -> list[str]:
        """每次调用时的系统提示词（没有就是空字符串）。"""
        out = []
        for msgs in self._calls:
            sys = [m for m in msgs if m.type == "system"]
            out.append(sys[0].text if sys else "")
        return out

    # ---- BaseChatModel 需要实现的部分 -----------------------------------
    @property
    def _llm_type(self) -> str:
        return "scripted-fake"

    def bind_tools(self, tools: Sequence[Any], **kwargs: Any):
        names = []
        for t in tools:
            if isinstance(t, dict):
                names.append(t.get("name") or t.get("function", {}).get("name") or t.get("title", "?"))
            else:
                names.append(getattr(t, "name", None) or getattr(t, "__name__", "?"))
        self._tools = names
        return self

    def _next_reply(self, messages: list[BaseMessage]) -> AIMessage:
        if self._cursor >= len(self.replies):
            if not self.loop or not self.replies:
                raise AssertionError(
                    f"假模型的剧本用完了：一共只准备了 {len(self.replies)} 条回复，"
                    f"但模型被调用了第 {self._cursor + 1} 次。"
                    "检查一下是不是多调用了模型，或者图里出现了死循环。"
                )
            self._cursor = 0
        reply = self.replies[self._cursor]
        self._cursor += 1
        if callable(reply) and not isinstance(reply, BaseMessage):
            reply = reply(messages)
        if isinstance(reply, str):
            reply = AIMessage(content=reply)
        # 复制一份并补上 id，避免同一条消息对象被多次放进状态
        return reply.model_copy(update={"id": reply.id or f"fake-{next(_ids)}"})

    def _generate(
        self,
        messages: list[BaseMessage],
        stop: list[str] | None = None,
        run_manager: CallbackManagerForLLMRun | None = None,
        **kwargs: Any,
    ) -> ChatResult:
        self._calls.append(list(messages))
        return ChatResult(generations=[ChatGeneration(message=self._next_reply(messages))])
