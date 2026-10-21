"""第 2 章 第一张图 · 练手：条件边与 path_map、累加计数、Router。

对应教程：content/02-第一张图.md
运行检查：pytest ch02_first_graph
运行演示：python ch02_first_graph/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

import operator
from typing import Annotated, Literal

from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 2.1 条件边 + path_map（教程练习 1、2）
# decide_mood：句子里包含 "Lance" 返回 "happy"，否则返回 "sad"（注意：返回的是标签，不是节点名）。
# build_mood_graph：用 path_map 把标签映射到节点：
#   add_conditional_edges("node_1", decide_mood, {"happy": "node_2", "sad": "node_3"})
# ---------------------------------------------------------------------------
class MoodState(TypedDict):
    graph_state: str


def node_1(state: MoodState):
    return {"graph_state": state["graph_state"] + " I am"}


def node_2(state: MoodState):
    return {"graph_state": state["graph_state"] + " happy!"}


def node_3(state: MoodState):
    return {"graph_state": state["graph_state"] + " sad!"}


def decide_mood(state: MoodState) -> Literal["happy", "sad"]:
    raise NotImplementedError("TODO 2.1a：还没写，按上面的提示完成它")


def build_mood_graph():
    raise NotImplementedError("TODO 2.1b：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 2.2 数一数经过了几次模型（教程练习 3）
# ChainState 在消息之外多了一个 turns 字段。给它配上 operator.add reducer，
# 这样 tool_calling_llm 每次只要返回 {"turns": 1}，就会被累加。
# build_chain：START -> tool_calling_llm -> END
# ---------------------------------------------------------------------------
class ChainState(MessagesState):
    turns: int  # TODO 2.2：给它加上 operator.add reducer


def build_chain(model):
    def tool_calling_llm(state: ChainState):
        raise NotImplementedError("TODO 2.2b：还没写，按上面的提示完成它")

    builder = StateGraph(ChainState)
    builder.add_node("tool_calling_llm", tool_calling_llm)
    builder.add_edge(START, "tool_calling_llm")
    builder.add_edge("tool_calling_llm", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 2.3 Router：让 LLM 决定走哪条边（教程练习 4）
# 工具有 multiply 和 add 两个。图：
#   START -> tool_calling_llm -> (tools_condition) -> tools -> END
#                                               └-> END
# 注意 tools 之后直接 END，没有回边——所以 Router 最多只能做"一步"。
# ---------------------------------------------------------------------------
def multiply(a: int, b: int) -> int:
    """Multiply a and b."""
    return a * b


def add(a: int, b: int) -> int:
    """Add a and b."""
    return a + b


def build_router(model):
    raise NotImplementedError("TODO 2.3：还没写，按上面的提示完成它")


def main():
    from kit import call, get_model

    graph = build_mood_graph()
    print(graph.invoke({"graph_state": "Hi, this is Lance."}))
    print(graph.get_graph().draw_mermaid())

    model = get_model([call("multiply", {"a": 2, "b": 3}), "（不会被用到）"])
    result = build_router(model).invoke({"messages": "2 乘 3，再加 4"})
    for m in result["messages"]:
        m.pretty_print()
    print("Router 停在了工具结果这里——它没法再回去做加法。下一章加一条回边就变成 Agent。")


if __name__ == "__main__":
    main()
