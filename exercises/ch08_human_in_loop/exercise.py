"""第 8 章 人在回路 · 练手：断点审批、动态中断、时间旅行。

对应教程：content/08-人在回路.md
运行检查：pytest ch08_human_in_loop
运行演示：python ch08_human_in_loop/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from langchain_core.messages import HumanMessage, ToolMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.types import Command, interrupt


def multiply(a: int, b: int) -> int:
    """Multiply a and b."""
    return a * b


def divide(a: int, b: int) -> float:
    """Divide a by b."""
    return a / b


TOOLS = [multiply, divide]


def math_builder(model) -> StateGraph:
    """已经写好：第 6 章的数学 Agent（还没 compile）。"""
    llm = model.bind_tools(TOOLS)
    builder = StateGraph(MessagesState)
    builder.add_node("assistant", lambda s: {"messages": [llm.invoke(s["messages"])]})
    builder.add_node("tools", ToolNode(TOOLS))
    builder.add_edge(START, "assistant")
    builder.add_conditional_edges("assistant", tools_condition)
    builder.add_edge("tools", "assistant")
    return builder


# ---------------------------------------------------------------------------
# 练习 6.1 断点 + 命令行审批（教程练习 1）
# compile_with_breakpoint：在 "tools" 节点之前停下（interrupt_before），带上 InMemorySaver。
# run_with_approval：
#   1. 用 thread_id 跑 question，图会停在 tools 之前；
#   2. 只要 graph.get_state(config).next == ("tools",)：
#        - 把最后一条消息的 tool_calls 交给 approve(tool_calls)，它返回 True / False；
#        - True：graph.invoke(None, config) 继续跑；
#        - False：用 graph.update_state(config, {"messages": [...]}, as_node="tools")
#          为每个 tool_call 写一条 ToolMessage("用户拒绝了这次调用", tool_call_id=...)，
#          再 graph.invoke(None, config)，让模型看到拒绝结果后继续。
#   3. 返回最终状态里的 messages。
# ---------------------------------------------------------------------------
def compile_with_breakpoint(builder: StateGraph):
    raise NotImplementedError("TODO 6.1a：还没写，按上面的提示完成它")


def run_with_approval(graph, question: str, approve, thread_id: str = "1"):
    raise NotImplementedError("TODO 6.1b：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 6.2 只在 divide 时才请求审批（教程练习 2）
# 在 assistant 和 tools 之间插一个 review 节点：
#   - 如果这次没有调用 divide：直接 Command(goto="tools")
#   - 如果调用了 divide：approved = interrupt({"question": "允许除法吗？", "tool_calls": tool_calls})
#       - approved 为真：Command(goto="tools")
#       - 否则：Command(goto="assistant", update={"messages": [每个调用一条 ToolMessage("用户拒绝了这次调用", ...)]})
# build_guarded_agent 的边：START -> assistant；assistant 用 tools_condition，
#   但把 "tools" 映射到 "review"：add_conditional_edges("assistant", tools_condition, {"tools": "review", END: END})
#   tools -> assistant；review 用 Command 跳转，不需要再连边。
# ---------------------------------------------------------------------------
def review(state: MessagesState) -> Command:
    raise NotImplementedError("TODO 6.2a：还没写，按上面的提示完成它")


def build_guarded_agent(model):
    llm = model.bind_tools(TOOLS)
    raise NotImplementedError("TODO 6.2b：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 6.3 时间旅行：回到过去，改问题，分叉重跑（教程练习 3）
# 1. history = list(graph.get_state_history(config))（最新的在最前面）
# 2. 找到"刚收到用户输入、还没进 assistant"的那个检查点：
#    它的 .next == ("assistant",)，而且是最早的那一个（列表里最后一个满足条件的）
# 3. 用 graph.update_state(那个检查点.config, {"messages": [新的 HumanMessage]}) 分叉，
#    新消息要沿用原消息的 id，这样是"替换"而不是"追加"
# 4. graph.invoke(None, 分叉得到的 config)，返回结果
# ---------------------------------------------------------------------------
def fork_with_new_question(graph, config, new_question: str):
    raise NotImplementedError("TODO 6.3：还没写，按上面的提示完成它")


def main():
    from kit import call, get_model

    model = get_model([call("divide", {"a": 10, "b": 4}), "10 除以 4 等于 2.5。"])
    graph = build_guarded_agent(model)
    config = {"configurable": {"thread_id": "demo"}}
    result = graph.invoke({"messages": "10 除以 4 是多少？"}, config)
    if "__interrupt__" in result:
        print("中断：", result["__interrupt__"][0].value["question"])
        try:
            answer = input("允许吗？(y/n) ").strip().lower() == "y"
        except EOFError:
            answer = True
        result = graph.invoke(Command(resume=answer), config)
    print(result["messages"][-1].text)


if __name__ == "__main__":
    main()
