# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 2 章 Agent 的积木 · 练手：工具说明书、流式输出、自定义进度。

对应教程：content/02-Agent的积木.md
运行检查：pytest ch02_building_blocks
运行演示：python ch02_building_blocks/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from typing import Literal

from langchain.agents import create_agent
from langchain_core.tools import tool
from langgraph.config import get_stream_writer


# ---------------------------------------------------------------------------
# 练习 2.1 给计算器加上幂运算（教程练习 2）
# 要求：
#   - 工具名叫 "calculator"（用 @tool("calculator", ...) 改名）
#   - operation 多一个 "power"：power(2, 10) == 1024
#   - 描述（description）里要写清楚支持 power，模型才知道"2 的 10 次方"该用它
# 提示：@tool 的 description= 参数会覆盖 docstring。
# ---------------------------------------------------------------------------
@tool(
    "calculator",
    description=(
        "Perform arithmetic on two real numbers: add, subtract, multiply, divide, "
        "or power (a raised to the power of b, e.g. 2 to the 10th). "
        "Use this whenever you have operations on any numbers, even if they are integers."
    ),
)
def calculator(
    a: float, b: float, operation: Literal["add", "subtract", "multiply", "divide", "power"]
) -> float:
    if operation == "add":
        return a + b
    if operation == "subtract":
        return a - b
    if operation == "multiply":
        return a * b
    if operation == "divide":
        if b == 0:
            raise ValueError("Division by zero is not allowed.")
        return a / b
    return a**b


# ---------------------------------------------------------------------------
# 练习 2.2 工具推送自定义进度
# get_weather 执行时，用 get_stream_writer() 先后推送两条进度：
#   f"正在查询：{city}"   和   f"查询完成：{city}"
# 然后返回 f"{city}今天晴，25°C"
# ---------------------------------------------------------------------------
@tool
def get_weather(city: str) -> str:
    """Get weather for a given city."""
    writer = get_stream_writer()
    writer(f"正在查询：{city}")
    writer(f"查询完成：{city}")
    return f"{city}今天晴，25°C"


def build_agent(model):
    """已经写好：一个带计算器和天气工具的 Agent。"""
    return create_agent(model, tools=[calculator, get_weather], system_prompt="You are a helpful assistant.")


# ---------------------------------------------------------------------------
# 练习 2.3 收集自定义进度
# 用 agent.stream(..., stream_mode=["updates", "custom"]) 跑一遍 question，
# 把所有 "custom" 模式收到的数据按顺序放进列表返回。
# 提示：同时订阅多种模式时，每个 chunk 是 (模式名, 数据) 元组。
# ---------------------------------------------------------------------------
def collect_progress(agent, question: str) -> list:
    progress = []
    for mode, data in agent.stream({"messages": question}, stream_mode=["updates", "custom"]):
        if mode == "custom":
            progress.append(data)
    return progress


# ---------------------------------------------------------------------------
# 练习 2.4 看懂 updates 模式（教程练习 1）
# 用 stream_mode="updates" 跑一遍，按顺序返回每一步是哪个节点产生的更新。
# 一次"调工具再回答"的运行，应该得到 ["model", "tools", "model"]。
# 提示：updates 模式下每个 chunk 是 {节点名: 这个节点的更新}。
# ---------------------------------------------------------------------------
def node_sequence(agent, question: str) -> list[str]:
    steps = []
    for chunk in agent.stream({"messages": question}, stream_mode="updates"):
        steps.extend(chunk.keys())
    return steps


def main():
    from kit import call, get_model

    model = get_model([call("calculator", {"a": 2, "b": 10, "operation": "power"}), "2 的 10 次方是 1024。"])
    agent = build_agent(model)
    for chunk in agent.stream({"messages": "2 的 10 次方是多少？"}, stream_mode="updates"):
        for node, update in chunk.items():
            print(f"--- {node} ---")
            update["messages"][-1].pretty_print()


if __name__ == "__main__":
    main()
