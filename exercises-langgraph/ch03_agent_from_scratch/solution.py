# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 3 章 从零造一个 Agent · 练手：回边、工具报错、优雅降级、记忆与检查点。

对应教程：content/03-从零造一个Agent.md
运行检查：pytest ch03_agent_from_scratch
运行演示：python ch03_agent_from_scratch/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from langchain_core.messages import AIMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.managed import RemainingSteps
from langgraph.prebuilt import ToolNode, tools_condition


def add(a: int, b: int) -> int:
    """Add a and b."""
    return a + b


def multiply(a: int, b: int) -> int:
    """Multiply a and b."""
    return a * b


def divide(a: int, b: int) -> float:
    """Divide a by b."""
    return a / b


# ---------------------------------------------------------------------------
# 练习 3.1 补一个 subtract 工具（教程练习 3 要用）
# ---------------------------------------------------------------------------
def subtract(a: int, b: int) -> int:
    """Subtract b from a."""
    return a - b


TOOLS = [add, multiply, divide, subtract]


# ---------------------------------------------------------------------------
# 练习 3.2 从 Router 到 Agent，并能处理工具报错（教程练习 2）
# 和上一章的 Router 一样，只是 tools 之后要连回 assistant（回边）。
# handle_errors=True 时用 ToolNode(TOOLS, handle_tool_errors=True)：
#   工具抛异常不会让整张图崩掉，而是把错误作为 ToolMessage 还给模型。
# checkpointer 参数原样传给 compile()。
# ---------------------------------------------------------------------------
def build_agent(model, handle_errors: bool = False, checkpointer=None):
    llm = model.bind_tools(TOOLS)

    def assistant(state: MessagesState):
        return {"messages": [llm.invoke(state["messages"])]}

    builder = StateGraph(MessagesState)
    builder.add_node("assistant", assistant)
    builder.add_node("tools", ToolNode(TOOLS, handle_tool_errors=True) if handle_errors else ToolNode(TOOLS))
    builder.add_edge(START, "assistant")
    builder.add_conditional_edges("assistant", tools_condition)
    builder.add_edge("tools", "assistant")
    return builder.compile(checkpointer=checkpointer)


# ---------------------------------------------------------------------------
# 练习 3.3 优雅降级：RemainingSteps
# 模型如果一直调用工具，图会撞上 recursion_limit 报 GraphRecursionError。
# 在状态里加一个 remaining_steps: RemainingSteps，assistant 先检查它：
#   remaining_steps <= 2 时不再调用模型，直接返回 AIMessage("步数快用完了，先停在这里。")
# 这样 tools_condition 看到没有 tool_calls，就会体面地结束。
# ---------------------------------------------------------------------------
class SafeState(MessagesState):
    remaining_steps: RemainingSteps


def build_safe_agent(model):
    llm = model.bind_tools(TOOLS)

    def assistant(state: SafeState):
        if state["remaining_steps"] <= 2:
            return {"messages": [AIMessage("步数快用完了，先停在这里。")]}
        return {"messages": [llm.invoke(state["messages"])]}

    builder = StateGraph(SafeState)
    builder.add_node("assistant", assistant)
    builder.add_node("tools", ToolNode(TOOLS))
    builder.add_edge(START, "assistant")
    builder.add_conditional_edges("assistant", tools_condition)
    builder.add_edge("tools", "assistant")
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 3.4 数检查点（教程练习 3）
# 有记忆的 Agent 连续回答三个问题，每个问题都是"调一次工具，再回答"：
#   "3 加 4" -> "乘以 2" -> "再减去 1"
# 先预测：一共会产生多少个检查点（len(list(graph.get_state_history(config)))）？
# 把你的预测填在下面。提示：每次 invoke 都有"输入"这一步，之后每个 super-step 各存一个。
# ---------------------------------------------------------------------------
PREDICTED_CHECKPOINTS = 15  # 每轮：输入(-1) + START 写入(0) + assistant + tools + assistant = 5，三轮 15


def main():
    from kit import call, get_model

    model = get_model([
        call("add", {"a": 3, "b": 4}), "7",
        call("multiply", {"a": 7, "b": 2}), "14",
        call("subtract", {"a": 14, "b": 1}), "13",
    ])
    graph = build_agent(model, checkpointer=InMemorySaver())
    config = {"configurable": {"thread_id": "1"}}
    for q in ["3 加 4", "乘以 2", "再减去 1"]:
        print(q, "→", graph.invoke({"messages": q}, config)["messages"][-1].text)
    print("检查点数量：", len(list(graph.get_state_history(config))), "你的预测：", PREDICTED_CHECKPOINTS)


if __name__ == "__main__":
    main()
