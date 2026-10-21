"""第 5 章 状态与短期记忆 · 练手：自定义 reducer、删消息、滚动摘要、SQLite 持久化。

对应教程：content/05-状态与短期记忆.md
运行检查：pytest ch05_state_memory
运行演示：python ch05_state_memory/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

import sqlite3
from typing import Annotated, Literal

from langchain_core.messages import HumanMessage, RemoveMessage, SystemMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, MessagesState, StateGraph
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 5.1 写一个 reducer（教程练习 1）
# 合并两个列表、去重、排序。任意一边可能是 None（还没写过的字段）。
#   merge_unique_sorted(["b", "a"], ["c", "a"]) -> ["a", "b", "c"]
#   merge_unique_sorted(None, ["x"])            -> ["x"]
# ---------------------------------------------------------------------------
def merge_unique_sorted(left: list | None, right: list | None) -> list:
    raise NotImplementedError("TODO 5.1：还没写，按上面的提示完成它")


class TagState(TypedDict):
    tags: Annotated[list[str], merge_unique_sorted]


def build_tag_graph():
    """已经写好：tagger_a 和 tagger_b 在同一步并行写 tags，靠 reducer 合并。"""

    def tagger_a(state):
        return {"tags": ["python", "agent"]}

    def tagger_b(state):
        return {"tags": ["agent", "langgraph"]}

    builder = StateGraph(TagState)
    builder.add_node("tagger_a", tagger_a)
    builder.add_node("tagger_b", tagger_b)
    builder.add_edge(START, "tagger_a")
    builder.add_edge(START, "tagger_b")
    builder.add_edge("tagger_a", END)
    builder.add_edge("tagger_b", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 5.2 用 RemoveMessage 删消息
# 写一个节点：只保留最后两条消息，其余的全部删掉。
# 提示：返回 {"messages": [RemoveMessage(id=m.id) for m in 要删的消息]}
# ---------------------------------------------------------------------------
def keep_last_two(state: MessagesState):
    raise NotImplementedError("TODO 5.2：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 5.3 带滚动摘要的聊天机器人（教程练习 2：把阈值改小）
# should_summarize：消息条数 > threshold 时去 "summarize_conversation"，否则 END。
# summarize_conversation：
#   - 已有摘要：提示语用 f"This is summary of the conversation to date: {summary}\n\n"
#                "Extend the summary by taking into account the new messages above:"
#   - 没有摘要：提示语用 "Create a summary of the conversation above:"
#   - 把 state["messages"] + [HumanMessage(提示语)] 发给模型
#   - 返回新的 summary，并删掉除最后两条以外的所有消息
# ---------------------------------------------------------------------------
class SummaryState(MessagesState):
    summary: str


def should_summarize(state: SummaryState, threshold: int = 6) -> Literal["summarize_conversation", "__end__"]:
    raise NotImplementedError("TODO 5.3a：还没写，按上面的提示完成它")


def summarize_conversation(state: SummaryState, model):
    raise NotImplementedError("TODO 5.3b：还没写，按上面的提示完成它")


def build_summary_bot(model, threshold: int = 6, checkpointer=None):
    """已经写好：conversation 节点带上摘要回答，然后按阈值决定要不要摘要。"""

    def conversation(state: SummaryState):
        summary = state.get("summary", "")
        messages = state["messages"]
        if summary:
            messages = [SystemMessage(content=f"Summary of conversation earlier: {summary}")] + messages
        return {"messages": [model.invoke(messages)]}

    builder = StateGraph(SummaryState)
    builder.add_node("conversation", conversation)
    builder.add_node("summarize_conversation", lambda s: summarize_conversation(s, model))
    builder.add_edge(START, "conversation")
    builder.add_conditional_edges(
        "conversation", lambda s: should_summarize(s, threshold), ["summarize_conversation", END]
    )
    builder.add_edge("summarize_conversation", END)
    return builder.compile(checkpointer=checkpointer or InMemorySaver())


# ---------------------------------------------------------------------------
# 练习 5.4 把记忆存进 SQLite（教程练习 3）
# 返回一个用 SqliteSaver 做 checkpointer 的摘要机器人。
# 程序退出再启动、用同一个 db_path 和 thread_id，就能接着聊。
# 提示：sqlite3.connect(db_path, check_same_thread=False) -> SqliteSaver(conn)
# ---------------------------------------------------------------------------
def open_persistent_bot(model, db_path: str):
    raise NotImplementedError("TODO 5.4：还没写，按上面的提示完成它")


def main():
    from kit import get_model

    model = get_model(["你好！", "很高兴认识你。", "好的。", "（摘要）用户在和我打招呼、做自我介绍。"])
    bot = build_summary_bot(model, threshold=4)
    config = {"configurable": {"thread_id": "1"}}
    for text in ["hi! I'm Lance", "I like the 49ers", "Nice to meet you"]:
        bot.invoke({"messages": [HumanMessage(text)]}, config)
    state = bot.get_state(config).values
    print("摘要：", state.get("summary"))
    print("剩下的消息条数：", len(state["messages"]))


if __name__ == "__main__":
    main()
