from langgraph.types import Command

from kit import ScriptedChatModel, ai, call


def test_gate_stops_when_short(ex):
    """11.1 润色后够短就结束"""
    model = ScriptedChatModel(["初稿" * 30, "短笑话"])
    out = ex.build_joke_chain(model).invoke({"topic": "cats"})
    assert out["joke"] == "短笑话" and out["polish_count"] == 1


def test_gate_max_two(ex):
    """11.1 一直太长时最多润色 2 次"""
    model = ScriptedChatModel(["长" * 60], loop=True)
    out = ex.build_joke_chain(model).invoke({"topic": "cats"})
    assert out["polish_count"] == 2, f"最多润色 2 次，实际 {out['polish_count']} 次"
    assert len(model.calls) == 3


def test_human_evaluator(ex):
    """11.2 人说不好笑就带着反馈重写"""
    model = ScriptedChatModel(["joke v1", "joke v2"])
    graph = ex.build_optimizer(model)
    cfg = {"configurable": {"thread_id": "1"}}
    out = graph.invoke({"topic": "cats"}, cfg, version="v2")
    assert out.interrupts[0].value == {"joke": "joke v1"}
    out = graph.invoke(Command(resume={"grade": "not funny", "feedback": "加个双关"}), cfg, version="v2")
    assert out.interrupts[0].value == {"joke": "joke v2"}, "不好笑时要回到 generator 重写，再次请人打分"
    assert "加个双关" in model.calls[1][-1].content
    out = graph.invoke(Command(resume={"grade": "funny"}), cfg, version="v2")
    assert out.value["grade"] == "funny" and not out.interrupts


def test_supervisor_tool(ex):
    """11.3 子 Agent 当工具，返回结论和搜索次数"""
    research = ScriptedChatModel([
        call("web_search", {"query": "LangGraph"}),
        call("web_search", {"query": "LangGraph 1.2"}),
        ai("LangGraph 是图运行时"),
    ])
    boss = ScriptedChatModel([call("call_research_agent", {"query": "什么是 LangGraph"}), ai("总结完毕")])
    out = ex.build_supervisor(boss, research).invoke({"messages": "研究一下 LangGraph"})
    tool_msg = out["messages"][2]
    assert tool_msg.type == "tool"
    assert tool_msg.content == "LangGraph 是图运行时（web_search 调用了 2 次）"
    boss_seen = [m.type for m in boss.calls[1] if m.type != "system"]
    assert boss_seen == ["human", "ai", "tool"], "主管只应看到工具结果，看不到子 Agent 的中间过程"
