"""第 4 章 LangGraph 图的基本功 · 练手：条件边，以及从零搭一个数学 Agent。

对应教程：content/04-LangGraph图的基本功.md
运行检查：pytest ch04_graph_basics
运行演示：python ch04_graph_basics/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from typing import Literal

from langchain_core.messages import AIMessage
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 4.1 条件边（教程练习 1）
# 字符串里包含 "Lance" 就去 node_2（happy），否则去 node_3（sad）。
# 然后在 build_mood_graph 里把图组装起来：
#   START -> node_1 -> (decide_mood) -> node_2 / node_3 -> END
# ---------------------------------------------------------------------------
class MoodState(TypedDict):
    graph_state: str


def node_1(state: MoodState):
    return {"graph_state": state["graph_state"] + " I am"}


def node_2(state: MoodState):
    return {"graph_state": state["graph_state"] + " happy!"}


def node_3(state: MoodState):
    return {"graph_state": state["graph_state"] + " sad!"}


def decide_mood(state: MoodState) -> Literal["node_2", "node_3"]:
    raise NotImplementedError("TODO 4.1a：还没写，按上面的提示完成它")


def build_mood_graph():
    raise NotImplementedError("TODO 4.1b：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 4.2 加一个 subtract 工具（教程练习 2）
# 仿照 add 和 multiply，写 subtract(a, b) = a - b，记得写 docstring（模型看的说明书）。
# ---------------------------------------------------------------------------
def add(a: int, b: int) -> int:
    """Adds a and b."""
    return a + b


def multiply(a: int, b: int) -> int:
    """Multiplies a and b."""
    return a * b


def subtract(a: int, b: int) -> int:
    raise NotImplementedError("TODO 4.2：写 subtract 和它的 docstring")


TOOLS = [add, multiply, subtract]


# ---------------------------------------------------------------------------
# 练习 4.3 从零搭出 Agent
# 用 StateGraph(MessagesState) 搭出 ReAct 循环：
#   - "assistant" 节点：调用 model.bind_tools(TOOLS)，返回 {"messages": [回复]}
#   - "tools" 节点：ToolNode(TOOLS)
#   - START -> assistant；assistant 用 tools_condition 决定去 tools 还是 END
#   - tools -> assistant（这条"回边"让它变成 Agent）
# ---------------------------------------------------------------------------
def build_math_agent(model):
    raise NotImplementedError("TODO 4.3：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 4.4 看懂并行工具调用（教程练习 3）
# 一条 AIMessage 里可能有多个 tool_calls。返回 messages 里"一次调了不止一个工具"
# 的 AIMessage 有几条。
# ---------------------------------------------------------------------------
def count_parallel_turns(messages) -> int:
    raise NotImplementedError("TODO 4.4：还没写，按上面的提示完成它")


def main():
    from kit import call, get_model

    print(build_mood_graph().invoke({"graph_state": "Hi, this is Lance."}))
    model = get_model([
        call("subtract", {"a": 10, "b": 3}),
        call("multiply", {"a": 7, "b": 4}),
        "10 减 3 再乘 4 等于 28。",
    ])
    result = build_math_agent(model).invoke({"messages": "10 减 3 再乘 4 是多少？"})
    for m in result["messages"]:
        m.pretty_print()


if __name__ == "__main__":
    main()
