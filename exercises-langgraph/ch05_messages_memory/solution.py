# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 5 章 消息管理与短期记忆 · 练手：删消息、安全裁剪、按 token 摘要、异步 SQLite。

对应教程：content/05-消息管理与短期记忆.md
运行检查：pytest ch05_messages_memory
运行演示：python ch05_messages_memory/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from typing import Literal

from langchain_core.messages import HumanMessage, RemoveMessage, SystemMessage, trim_messages
from langchain_core.messages.utils import count_tokens_approximately
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.graph import END, START, MessagesState, StateGraph


# ---------------------------------------------------------------------------
# 练习 5.1 只删除最早的 2 条（教程练习 1）
# 消息多于 2 条时，删掉最早的 2 条；否则什么都不做（返回 {}）。
# ---------------------------------------------------------------------------
def drop_two_oldest(state: MessagesState):
    if len(state["messages"]) <= 2:
        return {}
    return {"messages": [RemoveMessage(id=m.id) for m in state["messages"][:2]]}


# ---------------------------------------------------------------------------
# 练习 5.2 裁剪时别拆散工具调用对（教程练习 2）
# naive_tail 直接切片，可能从一条 ToolMessage 开始——模型 API 会拒绝这种输入。
# trim_safely 用 trim_messages：
#   strategy="last"，token_counter=len（按"条数"算），max_tokens=max_messages，
#   start_on="human"（保证从用户消息开始），include_system=True（保留系统消息）
# ---------------------------------------------------------------------------
def naive_tail(messages, max_messages: int):
    return messages[-max_messages:]


def trim_safely(messages, max_messages: int):
    return trim_messages(
        messages,
        strategy="last",
        token_counter=len,
        max_tokens=max_messages,
        start_on="human",
        include_system=True,
    )


# ---------------------------------------------------------------------------
# 练习 5.3 按 token 数决定要不要摘要（教程练习 3）
# should_summarize：count_tokens_approximately(state["messages"]) > token_limit 时
#   返回 "summarize_conversation"，否则 END。
# summarize_conversation：和教程 5.4 一样生成/扩写摘要，但保留最近 4 条消息。
#   - 已有摘要：f"This is summary of the conversation to date: {summary}\n\n"
#               "Extend the summary by taking into account the new messages above:"
#   - 没有摘要："Create a summary of the conversation above:"
# ---------------------------------------------------------------------------
class SummaryState(MessagesState):
    summary: str


def should_summarize(state: SummaryState, token_limit: int = 200) -> Literal["summarize_conversation", "__end__"]:
    return "summarize_conversation" if count_tokens_approximately(state["messages"]) > token_limit else END


def summarize_conversation(state: SummaryState, model):
    summary = state.get("summary", "")
    if summary:
        prompt = (
            f"This is summary of the conversation to date: {summary}\n\n"
            "Extend the summary by taking into account the new messages above:"
        )
    else:
        prompt = "Create a summary of the conversation above:"
    response = model.invoke(state["messages"] + [HumanMessage(content=prompt)])
    return {"summary": response.text, "messages": [RemoveMessage(id=m.id) for m in state["messages"][:-4]]}


def build_summary_bot(model, token_limit: int = 200, checkpointer=None):
    """已经写好。"""

    def call_model(state: SummaryState):
        messages = state["messages"]
        if state.get("summary"):
            messages = [SystemMessage(content=f"Summary of conversation earlier: {state['summary']}")] + messages
        return {"messages": [model.invoke(messages)]}

    builder = StateGraph(SummaryState)
    builder.add_node("conversation", call_model)
    builder.add_node("summarize_conversation", lambda s: summarize_conversation(s, model))
    builder.add_edge(START, "conversation")
    builder.add_conditional_edges("conversation", lambda s: should_summarize(s, token_limit),
                                  ["summarize_conversation", END])
    builder.add_edge("summarize_conversation", END)
    return builder.compile(checkpointer=checkpointer or InMemorySaver())


# ---------------------------------------------------------------------------
# 练习 5.4 异步版 SQLite 持久化（教程练习 4）
# 每次调用都相当于"重新启动一次程序"：
#   async with AsyncSqliteSaver.from_conn_string(db_path) as saver:
#       graph = build_chat_graph(model).compile(checkpointer=saver)
#       result = await graph.ainvoke(...)
# 返回这次调用之后，该 thread 里一共有几条消息。
# ---------------------------------------------------------------------------
def build_chat_graph(model) -> StateGraph:
    builder = StateGraph(MessagesState)
    builder.add_node("chat", lambda s: {"messages": [model.invoke(s["messages"])]})
    builder.add_edge(START, "chat")
    builder.add_edge("chat", END)
    return builder


async def chat_once(model, db_path: str, thread_id: str, text: str) -> int:
    async with AsyncSqliteSaver.from_conn_string(db_path) as saver:
        graph = build_chat_graph(model).compile(checkpointer=saver)
        result = await graph.ainvoke(
            {"messages": [HumanMessage(text)]}, {"configurable": {"thread_id": thread_id}}
        )
        return len(result["messages"])


def main():
    import asyncio
    import tempfile

    from kit import get_model

    model = get_model(["收到！"])
    db = pathlib.Path(tempfile.gettempdir()) / "lg-zh-ch05.sqlite"
    for text in ["hi, I'm Lance", "I like the 49ers", "what's my name?"]:
        print(text, "→ 消息数", asyncio.run(chat_once(model, str(db), "demo", text)))


if __name__ == "__main__":
    main()
