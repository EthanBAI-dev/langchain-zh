# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 8 章 人在回路 · 练手：带理由的拒绝、副作用放在 interrupt 之后、类型校验、逐个审核工具调用。

对应教程：content/08-人在回路.md
运行检查：pytest ch08_human_in_loop
运行演示：python ch08_human_in_loop/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from typing import Literal

from langchain_core.messages import ToolMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.types import Command, interrupt
from pydantic import BaseModel
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 8.1 拒绝时写下理由（教程练习 1）
# approval 节点：
#   decision = interrupt({"question": "是否批准？", "action": state["action"]})
#   decision 形如 {"ok": True} 或 {"ok": False, "reason": "金额太大"}
#   - ok：Command(goto="execute")
#   - 否则：Command(goto="cancel", update={"reason": decision["reason"]})
# cancel 节点：返回 {"status": f"已取消：{state['reason']}"}
# ---------------------------------------------------------------------------
class TransferState(TypedDict, total=False):
    action: str
    status: str
    reason: str


def plan(state: TransferState):
    return {"action": "给 alice@example.com 转账 100 元"}


def approval(state: TransferState) -> Command[Literal["execute", "cancel"]]:
    decision = interrupt({"question": "是否批准？", "action": state["action"]})
    if decision.get("ok"):
        return Command(goto="execute")
    return Command(goto="cancel", update={"reason": decision.get("reason", "")})


def execute(state: TransferState):
    return {"status": "已执行：" + state["action"]}


def cancel(state: TransferState):
    return {"status": f"已取消：{state['reason']}"}


def build_transfer_graph():
    builder = StateGraph(TransferState)
    for fn in (plan, approval, execute, cancel):
        builder.add_node(fn)
    builder.add_edge(START, "plan")
    builder.add_edge("plan", "approval")
    builder.add_edge("execute", END)
    builder.add_edge("cancel", END)
    return builder.compile(checkpointer=InMemorySaver())


# ---------------------------------------------------------------------------
# 练习 8.2 副作用要放在 interrupt 之后（教程练习 2）
# 恢复时，节点会从头重新执行一遍！所以 interrupt() 之前的副作用会做两次。
# audited_approval 要往 AUDIT_LOG 里追加一条 f"审批：{state['action']} -> {answer}"，
# 每次审批只能追加一次。
# ---------------------------------------------------------------------------
AUDIT_LOG: list[str] = []


def audited_approval(state: TransferState):
    answer = interrupt({"question": "是否批准？"})
    AUDIT_LOG.append(f"审批：{state['action']} -> {answer}")
    return {"status": answer}


def build_audited_graph():
    builder = StateGraph(TransferState)
    builder.add_node(plan)
    builder.add_node(audited_approval)
    builder.add_edge(START, "plan")
    builder.add_edge("plan", "audited_approval")
    builder.add_edge("audited_approval", END)
    return builder.compile(checkpointer=InMemorySaver())


# ---------------------------------------------------------------------------
# 练习 8.3 给 resume 的值加类型校验（教程练习 3）
# 定义 Score(BaseModel)，有一个 score: int 字段。
# grade 节点：result = interrupt({"question": "打几分？"}, response_schema=Score)
#   result 会是一个 Score 对象，返回 {"score": result.score}
# 传 Command(resume={"score": "abc"}) 时会报 ValidationError。
# ---------------------------------------------------------------------------
class Score(BaseModel):
    score: int


class GradeState(TypedDict, total=False):
    score: int


def grade(state: GradeState):
    result = interrupt({"question": "打几分？"}, response_schema=Score)
    return {"score": result.score}


def build_grade_graph():
    builder = StateGraph(GradeState)
    builder.add_node(grade)
    builder.add_edge(START, "grade")
    builder.add_edge("grade", END)
    return builder.compile(checkpointer=InMemorySaver())


# ---------------------------------------------------------------------------
# 练习 8.4 一次审核多个工具调用（教程练习 4）
# 模型一次发出多个 tool_calls 时，review 节点要对每个调用单独问一次：
#   approved = interrupt({"tool_call": tc})      # True / False
# 规则：先把所有决定都问完，再统一执行工具！（否则每次恢复都会把前面的工具重跑一遍）
#   - 批准：执行工具 TOOLS_BY_NAME[tc["name"]](**tc["args"])，结果放进 ToolMessage
#   - 拒绝：ToolMessage("用户拒绝了这次调用", tool_call_id=tc["id"])
# 最后 Command(goto="assistant", update={"messages": 所有 ToolMessage})
# ---------------------------------------------------------------------------
TOOL_RUNS: list[str] = []  # 记录工具真正执行了几次


def send_email(to: str) -> str:
    """Send an email."""
    TOOL_RUNS.append(f"send_email:{to}")
    return f"已发送给 {to}"


TOOLS_BY_NAME = {"send_email": send_email}


def review(state: MessagesState) -> Command[Literal["assistant"]]:
    tool_calls = state["messages"][-1].tool_calls
    decisions = [interrupt({"tool_call": tc}) for tc in tool_calls]
    results = []
    for tc, approved in zip(tool_calls, decisions):
        if approved:
            output = TOOLS_BY_NAME[tc["name"]](**tc["args"])
            results.append(ToolMessage(output, tool_call_id=tc["id"]))
        else:
            results.append(ToolMessage("用户拒绝了这次调用", tool_call_id=tc["id"]))
    return Command(goto="assistant", update={"messages": results})


def build_review_agent(model):
    llm = model.bind_tools([send_email])

    def assistant(state: MessagesState):
        return {"messages": [llm.invoke(state["messages"])]}

    def route(state: MessagesState):
        return "review" if state["messages"][-1].tool_calls else END

    builder = StateGraph(MessagesState)
    builder.add_node("assistant", assistant)
    builder.add_node("review", review)
    builder.add_edge(START, "assistant")
    builder.add_conditional_edges("assistant", route, ["review", END])
    return builder.compile(checkpointer=InMemorySaver())


def main():
    graph = build_transfer_graph()
    config = {"configurable": {"thread_id": "t1"}}
    out = graph.invoke({}, config, version="v2")
    print("中断：", out.interrupts[0].value)
    out = graph.invoke(Command(resume={"ok": False, "reason": "金额需要二次确认"}), config, version="v2")
    print(out.value["status"])


if __name__ == "__main__":
    main()
