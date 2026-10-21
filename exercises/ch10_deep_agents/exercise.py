"""第 10 章 Deep Agents · 练手：工具读写状态、虚拟文件系统、用 deepagents 做读书笔记助手。

对应教程：content/10-DeepAgents.md
运行检查：pytest ch10_deep_agents
运行演示：python ch10_deep_agents/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from typing import Annotated, Literal, NotRequired, Union

from deepagents import create_deep_agent
from langchain.agents import AgentState, create_agent
from langchain_core.messages import ToolMessage
from langchain_core.tools import InjectedToolCallId, tool
from langgraph.prebuilt import InjectedState
from langgraph.types import Command


# ---------------------------------------------------------------------------
# 练习 10.1 工具返回 Command，顺手记一笔"做过的运算"
# calculator_wstate 计算 a 和 b，然后返回 Command(update={...})：
#   - "ops": [f"({operation}, {a}, {b})"]       （reduce_list 会把它追加进去）
#   - "messages": [ToolMessage(f"{result}", tool_call_id=tool_call_id)]
# ---------------------------------------------------------------------------
def reduce_list(left, right):
    return (left or []) + (right or [])


class CalcState(AgentState):
    ops: Annotated[list[str], reduce_list]


@tool
def calculator_wstate(
    operation: Literal["add", "subtract", "multiply", "divide"],
    a: Union[int, float],
    b: Union[int, float],
    tool_call_id: Annotated[str, InjectedToolCallId],
) -> Command:
    """Define a two-input calculator tool."""
    raise NotImplementedError("TODO 10.1：还没写，按上面的提示完成它")


def build_calc_agent(model):
    """已经写好：注意 state_schema=CalcState，ops 字段才会出现在状态里。"""
    return create_agent(model, tools=[calculator_wstate], state_schema=CalcState)


# ---------------------------------------------------------------------------
# 练习 10.2 从零实现虚拟文件系统
# 文件存在状态的 files 字段里：{路径: 内容}。
#   ls        -> 返回所有文件路径的列表
#   read_file -> 文件不存在时返回 f"Error: File '{file_path}' not found"；
#                否则返回带行号的内容，每行格式 f"{行号:6d}\t{这一行}"，行号从 1 开始
#   write_file-> 返回 Command，更新 files（只放这一个文件即可，file_reducer 会合并），
#                并附一条 ToolMessage(f"Updated file {file_path}", tool_call_id=tool_call_id)
# ---------------------------------------------------------------------------
def file_reducer(left, right):
    if left is None:
        return right
    if right is None:
        return left
    return {**left, **right}


class FileState(AgentState):
    files: Annotated[NotRequired[dict[str, str]], file_reducer]


@tool
def ls(state: Annotated[FileState, InjectedState]) -> list[str]:
    """List all files in the virtual filesystem."""
    raise NotImplementedError("TODO 10.2a：还没写，按上面的提示完成它")


@tool
def read_file(file_path: str, state: Annotated[FileState, InjectedState]) -> str:
    """Read a file from the virtual filesystem, with line numbers."""
    raise NotImplementedError("TODO 10.2b：还没写，按上面的提示完成它")


@tool
def write_file(file_path: str, content: str, tool_call_id: Annotated[str, InjectedToolCallId]) -> Command:
    """Write content to a file in the virtual filesystem."""
    raise NotImplementedError("TODO 10.2c：还没写，按上面的提示完成它")


def build_file_agent(model):
    """已经写好。"""
    return create_agent(model, tools=[ls, read_file, write_file], state_schema=FileState)


# ---------------------------------------------------------------------------
# 练习 10.3 用 deepagents 做一个"读书笔记助手"（教程练习 2 + 练习 1）
# 用 create_deep_agent 创建 Agent：
#   - system_prompt=NOTES_INSTRUCTIONS
#   - subagents 里放一个子智能体：name="writer-agent"，description 说明它负责把笔记写成最终报告，
#     system_prompt=WRITER_INSTRUCTIONS
# deepagents 已经内置了 ls / read_file / write_file / task 等工具，不用自己写。
# ---------------------------------------------------------------------------
NOTES_INSTRUCTIONS = """You are a reading-notes assistant.
1. Split the text the user gives you into chapters.
2. Write notes for each chapter to /notes/<chapter>.md with write_file.
3. Delegate the final summary to the writer-agent, which writes /notes/summary.md."""

WRITER_INSTRUCTIONS = "You turn chapter notes into a clear final summary report. Read the files in /notes first."


def build_notes_agent(model):
    raise NotImplementedError("TODO 10.3：还没写，按上面的提示完成它")


def main():
    from kit import call, get_model

    model = get_model([
        call("write_file", {"file_path": "/notes/ch1.md", "content": "# 第一章\n- 要点 A"}),
        call("write_file", {"file_path": "/notes/ch2.md", "content": "# 第二章\n- 要点 B"}),
        "两章笔记都写好了。",
    ])
    result = build_notes_agent(model).invoke({"messages": "第一章……第二章……请帮我做读书笔记"})
    for path, f in result.get("files", {}).items():
        print(path, "→", f["content"] if isinstance(f, dict) else f)


if __name__ == "__main__":
    main()
