import pytest
from langchain_core.messages import ToolMessage
from langgraph.store.memory import InMemoryStore
from langgraph.types import Command

from kit import ScriptedChatModel, call


def router(classification, priority="high"):
    return ScriptedChatModel([call("RouterSchema", {"reasoning": "test", "classification": classification,
                                                    "priority": priority})])


WRITE = call("write_email", {"to": "alice", "subject": "Re: docs", "content": "Hi Alice"})
MEETING = call("schedule_meeting", {"attendees": ["alice"], "subject": "Docs sync", "duration_minutes": 30,
                                    "preferred_day": "2026-10-23", "start_time": 14})
DONE = call("Done", {"done": True})


def _cfg(t):
    return {"configurable": {"thread_id": t}}


def _tools(messages):
    return [m.content for m in messages if isinstance(m, ToolMessage)]


def test_priority_field(ex):
    """15.1 RouterSchema 有 priority 字段"""
    assert "priority" in ex.RouterSchema.model_fields


def test_meeting_not_reviewed(ex):
    """15.2 schedule_meeting 不再需要人审"""
    assert ex.HITL_TOOLS == {"write_email", "Question"}
    agent = ScriptedChatModel([MEETING, DONE])
    app = ex.build_email_assistant(router("respond"), agent)
    out = app.invoke({"email_input": ex.EMAIL}, _cfg("m"), version="v2")
    assert not out.interrupts, "schedule_meeting 应该直接执行，不中断"
    assert _tools(out.value["messages"])[0].startswith("Meeting 'Docs sync' scheduled")


@pytest.mark.parametrize(
    "classification, priority, interrupted, decision",
    [
        ("notify", "high", True, "notify"),
        ("notify", "low", False, "notify"),
        ("ignore", "high", False, "ignore"),
        ("ignore", "low", False, "ignore"),
    ],
)
def test_triage_priority(ex, classification, priority, interrupted, decision):
    """15.3 notify 且 high 才打断你"""
    app = ex.build_email_assistant(router(classification, priority), ScriptedChatModel([]))
    out = app.invoke({"email_input": ex.EMAIL}, _cfg(f"{classification}-{priority}"), version="v2")
    assert bool(out.interrupts) is interrupted, f"{classification}+{priority} 时{'应该' if interrupted else '不应该'}中断"
    assert out.value["classification_decision"] == decision


def test_edit_learns(ex):
    """15.4 edit：用改过的参数执行，并记住偏好"""
    store = InMemoryStore()
    agent = ScriptedChatModel([WRITE, DONE])
    app = ex.build_email_assistant(router("respond"), agent, store)
    out = app.invoke({"email_input": ex.EMAIL}, _cfg("e"), version="v2")
    assert out.interrupts[0].value[0]["action_request"]["action"] == "write_email"
    new_args = {"to": "alice", "subject": "Re: docs", "content": "Hi Alice, cheers!"}
    out = app.invoke(Command(resume=[{"type": "edit", "args": {"args": new_args}}]), _cfg("e"), version="v2")
    msgs = out.value["messages"]
    assert _tools(msgs) == ["Email sent to alice with subject 'Re: docs'"]
    edited = [m for m in msgs if m.type == "ai" and m.tool_calls and m.tool_calls[0]["name"] == "write_email"]
    assert len(edited) == 1 and edited[0].tool_calls[0]["args"] == new_args, "AIMessage 里的参数要被同 id 覆盖成修改后的"
    assert "cheers" in ex.get_memory(store, "response_preferences"), "要把这次修改记进 response_preferences"


def test_response_rewrites(ex):
    """15.4 response：带着反馈回到 llm_call 重写"""
    store = InMemoryStore()
    agent = ScriptedChatModel([WRITE, WRITE, DONE])
    app = ex.build_email_assistant(router("respond"), agent, store)
    app.invoke({"email_input": ex.EMAIL}, _cfg("r"), version="v2")
    out = app.invoke(Command(resume=[{"type": "response", "args": "更口语一点，结尾写 Cheers"}]), _cfg("r"), version="v2")
    assert out.interrupts, "收到反馈后应该回到 llm_call 重写，并再次请你审核"
    assert "用户反馈：更口语一点，结尾写 Cheers" in [m.content for m in agent.calls[1]]
    assert "更口语一点" in ex.get_memory(store, "response_preferences")
    assert "更口语一点" in agent.system_prompts()[1], "下一轮的系统提示词里应该已经带上新偏好"
    out = app.invoke(Command(resume=[{"type": "accept"}]), _cfg("r"), version="v2")
    assert not out.interrupts
