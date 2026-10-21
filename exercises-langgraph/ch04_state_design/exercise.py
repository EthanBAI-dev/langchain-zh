"""第 4 章 状态设计 · 练手：reducer、Overwrite、输出过滤、Command + context。

对应教程：content/04-状态设计.md
运行检查：pytest ch04_state_design
运行演示：python ch04_state_design/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

import operator
from dataclasses import dataclass
from typing import Annotated

from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.runtime import Runtime
from langgraph.types import Command, Overwrite
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 4.1 并行写入 + operator.add（教程练习 1）
# 给 foo 配上 operator.add reducer，然后预测 invoke({"foo": 1}) 的结果。
# 图：START -> node_1 -> (node_2, node_3 并行) -> END，三个节点都返回 {"foo": 1}
# ---------------------------------------------------------------------------
class ForkState(TypedDict):
    foo: int  # TODO 4.1：加上 operator.add reducer


PREDICTED_FOO = 0  # TODO 4.1：预测 invoke({"foo": 1})["foo"]


def build_fork_graph():
    builder = StateGraph(ForkState)
    for name in ["node_1", "node_2", "node_3"]:
        builder.add_node(name, lambda s: {"foo": 1})
    builder.add_edge(START, "node_1")
    builder.add_edge("node_1", "node_2")
    builder.add_edge("node_1", "node_3")
    builder.add_edge("node_2", END)
    builder.add_edge("node_3", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 4.2 自定义 reducer：只保留最近 3 个（教程练习 2）
#   keep_last_3(["a", "b"], ["c", "d"]) -> ["b", "c", "d"]
#   任意一边可能是 None。
# ---------------------------------------------------------------------------
def keep_last_3(left: list | None, right: list | None) -> list:
    raise NotImplementedError("TODO 4.2：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 4.3 用 Overwrite 清空一个带 reducer 的字段
# errors 用 operator.add 追加。clear_errors 节点要把它真正清空。
# 提示：返回 {"errors": []} 只会"追加一个空列表"，什么都不变。
# ---------------------------------------------------------------------------
class ErrorState(TypedDict):
    errors: Annotated[list[str], operator.add]


def clear_errors(state: ErrorState):
    raise NotImplementedError("TODO 4.3：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 4.4 多 Schema：内部字段不出现在输出里（教程练习 3）
# OverallState 有 question / answer / debug 三个字段，OutputState 只有 answer。
# build_filtered_graph：
#   - 用 StateGraph(OverallState, input_schema=InputState, output_schema=OutputState)
#   - think 节点写 debug=f"thinking about {question}"
#   - respond 节点写 answer=f"Answer to {question}"
#   - START -> think -> respond -> END
# 结果：invoke 只返回 answer；stream_mode="values" 能看到 debug。
# ---------------------------------------------------------------------------
class InputState(TypedDict):
    question: str


class OutputState(TypedDict):
    answer: str


class OverallState(TypedDict):
    question: str
    answer: str
    debug: str


def build_filtered_graph():
    raise NotImplementedError("TODO 4.4：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 4.5 用 Command 路由，用 context 选模型（教程练习 4）
# models 是 {"fast": 模型A, "strong": 模型B}；调用时通过 context=Context(model_name=...) 选一个。
# assistant 节点：
#   - 从 runtime.context.model_name 选模型，bind_tools(TOOLS) 后调用
#   - 回复里有 tool_calls -> Command(goto="tools", update={"messages": [reply]})
#   - 没有 -> Command(goto=END, update={"messages": [reply]})
# 图：START -> assistant；tools -> assistant；assistant 靠 Command 跳转，不用条件边。
# 提示：add_node("assistant", assistant, destinations=("tools", END)) 能让画图更准确（可选）。
# ---------------------------------------------------------------------------
def multiply(a: int, b: int) -> int:
    """Multiply a and b."""
    return a * b


TOOLS = [multiply]


@dataclass
class Context:
    model_name: str = "fast"


def build_command_agent(models: dict):
    raise NotImplementedError("TODO 4.5：还没写，按上面的提示完成它")


def main():
    from kit import call, get_model

    print("foo =", build_fork_graph().invoke({"foo": 1})["foo"], "你的预测：", PREDICTED_FOO)
    print(build_filtered_graph().invoke({"question": "What is LangGraph?"}))
    model = get_model([call("multiply", {"a": 6, "b": 7}), "42"])
    agent = build_command_agent({"fast": model, "strong": model})
    print(agent.invoke({"messages": "6 乘 7"}, context=Context(model_name="strong"))["messages"][-1].text)


if __name__ == "__main__":
    main()
