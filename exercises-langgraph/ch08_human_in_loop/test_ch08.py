import pydantic
import pytest
from langchain_core.messages import ToolMessage
from langgraph.types import Command

from kit import ScriptedChatModel, ai, call


def _cfg(t):
    return {"configurable": {"thread_id": t}}


def test_approve(ex):
    """8.1 批准后执行"""
    graph = ex.build_transfer_graph()
    out = graph.invoke({}, _cfg("a"), version="v2")
    assert out.interrupts and out.interrupts[0].value["action"].startswith("给 alice"), "approval 要用 interrupt() 停下，并带上 action"
    out = graph.invoke(Command(resume={"ok": True}), _cfg("a"), version="v2")
    assert out.value["status"].startswith("已执行")


def test_reject_with_reason(ex):
    """8.1 拒绝时把理由写进状态"""
    graph = ex.build_transfer_graph()
    graph.invoke({}, _cfg("r"), version="v2")
    out = graph.invoke(Command(resume={"ok": False, "reason": "金额太大"}), _cfg("r"), version="v2")
    assert out.value["status"] == "已取消：金额太大"
    assert out.value["reason"] == "金额太大"


def test_side_effect_once(ex):
    """8.2 恢复后日志只追加一次"""
    ex.AUDIT_LOG.clear()
    graph = ex.build_audited_graph()
    graph.invoke({}, _cfg("log"))
    assert ex.AUDIT_LOG == [], "还没审批，不应该写日志（副作用要放在 interrupt 之后）"
    out = graph.invoke(Command(resume="approved"), _cfg("log"))
    assert out["status"] == "approved"
    assert ex.AUDIT_LOG == ["审批：给 alice@example.com 转账 100 元 -> approved"], f"日志：{ex.AUDIT_LOG}"


def test_response_schema(ex):
    """8.3 resume 的值按 Score 校验"""
    assert "score" in ex.Score.model_fields
    graph = ex.build_grade_graph()
    out = graph.invoke({}, _cfg("g"), version="v2")
    assert out.interrupts[0].response_schema, "interrupt 时要传 response_schema=Score"
    assert graph.invoke(Command(resume={"score": 5}), _cfg("g"))["score"] == 5
    graph.invoke({}, _cfg("g2"))
    with pytest.raises(pydantic.ValidationError):
        graph.invoke(Command(resume={"score": "abc"}), _cfg("g2"))


def test_review_each_call(ex):
    """8.4 两个工具调用各审一次，工具只执行一次"""
    ex.TOOL_RUNS.clear()
    model = ScriptedChatModel([call("send_email", {"to": "alice"}, ("send_email", {"to": "bob"})), ai("处理完毕")])
    graph = ex.build_review_agent(model)
    out = graph.invoke({"messages": "给 alice 和 bob 发邮件"}, _cfg("m"), version="v2")
    assert out.interrupts[0].value["tool_call"]["args"] == {"to": "alice"}
    out = graph.invoke(Command(resume=True), _cfg("m"), version="v2")
    assert out.interrupts and out.interrupts[0].value["tool_call"]["args"] == {"to": "bob"}, "第二个调用也要单独问一次"
    assert ex.TOOL_RUNS == [], "所有决定问完之前，不要执行任何工具"
    out = graph.invoke(Command(resume=False), _cfg("m"), version="v2")
    tools = [m.content for m in out.value["messages"] if isinstance(m, ToolMessage)]
    assert tools == ["已发送给 alice", "用户拒绝了这次调用"]
    assert ex.TOOL_RUNS == ["send_email:alice"], f"工具应该只执行一次，实际：{ex.TOOL_RUNS}"
    assert out.value["messages"][-1].content == "处理完毕"
