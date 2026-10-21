from langchain_core.messages import HumanMessage, ToolMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command

from kit import ScriptedChatModel, ai, call


def _tool_outputs(messages):
    return [m.content for m in messages if isinstance(m, ToolMessage)]


def test_breakpoint_stops_before_tools(ex):
    """6.1 编译时设置断点，停在 tools 之前"""
    model = ScriptedChatModel([call("multiply", {"a": 2, "b": 3}), ai("6")])
    graph = ex.compile_with_breakpoint(ex.math_builder(model))
    config = {"configurable": {"thread_id": "x"}}
    graph.invoke({"messages": [HumanMessage("2 乘 3")]}, config)
    assert graph.get_state(config).next == ("tools",), "应该停在 tools 节点前（interrupt_before）"


def test_run_with_approval_yes(ex):
    """6.1 审批通过后工具照常执行"""
    model = ScriptedChatModel([call("multiply", {"a": 2, "b": 3}), ai("6")])
    graph = ex.compile_with_breakpoint(ex.math_builder(model))
    seen = []
    msgs = ex.run_with_approval(graph, "2 乘 3", lambda calls: seen.append(calls) or True)
    assert seen and seen[0][0]["name"] == "multiply", "approve 应该收到最后一条消息的 tool_calls"
    assert _tool_outputs(msgs) == ["6"] and msgs[-1].content == "6"


def test_run_with_approval_no(ex):
    """6.1 审批拒绝后工具不执行，模型收到拒绝结果"""
    model = ScriptedChatModel([call("multiply", {"a": 2, "b": 3}), ai("好的，不算了")])
    graph = ex.compile_with_breakpoint(ex.math_builder(model))
    msgs = ex.run_with_approval(graph, "2 乘 3", lambda calls: False)
    assert _tool_outputs(msgs) == ["用户拒绝了这次调用"]
    assert msgs[-1].content == "好的，不算了"


def test_guard_skips_multiply(ex):
    """6.2 乘法不需要审批，直接执行"""
    graph = ex.build_guarded_agent(ScriptedChatModel([call("multiply", {"a": 2, "b": 3}), ai("6")]))
    result = graph.invoke({"messages": "2 乘 3"}, {"configurable": {"thread_id": "m"}})
    assert "__interrupt__" not in result, "只有 divide 才需要中断"
    assert _tool_outputs(result["messages"]) == ["6"]


def test_guard_divide_approved(ex):
    """6.2 除法会中断，批准后继续"""
    graph = ex.build_guarded_agent(ScriptedChatModel([call("divide", {"a": 10, "b": 4}), ai("2.5")]))
    config = {"configurable": {"thread_id": "d1"}}
    result = graph.invoke({"messages": "10 除以 4"}, config)
    assert "__interrupt__" in result, "调用 divide 时应该用 interrupt() 停下来"
    payload = result["__interrupt__"][0].value
    assert payload["tool_calls"][0]["name"] == "divide", "interrupt 的内容里要带上 tool_calls"
    result = graph.invoke(Command(resume=True), config)
    assert _tool_outputs(result["messages"]) == ["2.5"]


def test_guard_divide_rejected(ex):
    """6.2 除法被拒绝时回到 assistant，不执行工具"""
    graph = ex.build_guarded_agent(ScriptedChatModel([call("divide", {"a": 1, "b": 0}), ai("好的")]))
    config = {"configurable": {"thread_id": "d2"}}
    graph.invoke({"messages": "1 除以 0"}, config)
    result = graph.invoke(Command(resume=False), config)
    assert _tool_outputs(result["messages"]) == ["用户拒绝了这次调用"]
    assert result["messages"][-1].content == "好的"


def test_time_travel_fork(ex):
    """6.3 回到过去改问题，分叉重跑"""
    model = ScriptedChatModel([call("multiply", {"a": 2, "b": 3}), ai("6"), call("multiply", {"a": 5, "b": 3}), ai("15")])
    graph = ex.math_builder(model).compile(checkpointer=InMemorySaver())
    config = {"configurable": {"thread_id": "tt"}}
    graph.invoke({"messages": [HumanMessage("2 乘 3")]}, config)

    result = ex.fork_with_new_question(graph, config, "5 乘 3")
    contents = [m.content for m in result["messages"]]
    assert contents[0] == "5 乘 3", "分叉后第一条消息应该被替换成新问题（沿用原消息 id）"
    assert "2 乘 3" not in contents, "原问题应该被替换，而不是在后面追加"
    assert result["messages"][-1].content == "15"
