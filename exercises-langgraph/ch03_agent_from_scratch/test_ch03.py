import pytest
from langchain_core.messages import ToolMessage
from langgraph.checkpoint.memory import InMemorySaver

from kit import ScriptedChatModel, ai, call


def _tools(out):
    return [m for m in out["messages"] if isinstance(m, ToolMessage)]


def test_subtract(ex):
    """3.1 subtract 工具"""
    assert ex.subtract(14, 1) == 13 and ex.subtract.__doc__


def test_agent_loop(ex):
    """3.2 有回边：工具结果会回到 assistant"""
    model = ScriptedChatModel([call("add", {"a": 3, "b": 4}), call("multiply", {"a": 7, "b": 2}), ai("14")])
    out = ex.build_agent(model).invoke({"messages": "(3+4)*2"})
    assert [m.content for m in _tools(out)] == ["7", "14"]
    assert out["messages"][-1].content == "14"


def test_tool_error_default(ex):
    """3.2 默认 ToolNode：除以 0 会让图报错"""
    model = ScriptedChatModel([call("divide", {"a": 10, "b": 0}), ai("?")])
    with pytest.raises(ZeroDivisionError):
        ex.build_agent(model).invoke({"messages": "10/0"})


def test_tool_error_handled(ex):
    """3.2 handle_tool_errors=True：错误交还给模型"""
    model = ScriptedChatModel([call("divide", {"a": 10, "b": 0}), ai("不能除以 0")])
    out = ex.build_agent(model, handle_errors=True).invoke({"messages": "10/0"})
    msg = _tools(out)[0]
    assert msg.status == "error" and "division by zero" in msg.content
    assert out["messages"][-1].content == "不能除以 0"


def test_remaining_steps(ex):
    """3.3 快到 recursion_limit 时体面地停下"""
    model = ScriptedChatModel([call("add", {"a": 1, "b": 1})], loop=True)  # 模型永远想调工具
    out = ex.build_safe_agent(model).invoke({"messages": "loop"}, {"recursion_limit": 8})
    assert out["messages"][-1].content == "步数快用完了，先停在这里。"


def test_checkpoint_prediction(ex):
    """3.4 你对检查点数量的预测是对的"""
    model = ScriptedChatModel([
        call("add", {"a": 3, "b": 4}), ai("7"),
        call("multiply", {"a": 7, "b": 2}), ai("14"),
        call("subtract", {"a": 14, "b": 1}), ai("13"),
    ])
    graph = ex.build_agent(model, checkpointer=InMemorySaver())
    config = {"configurable": {"thread_id": "1"}}
    for q in ["3 加 4", "乘以 2", "再减去 1"]:
        graph.invoke({"messages": q}, config)
    second_call = [m.type for m in model.calls[2]]
    assert second_call == ["human", "ai", "tool", "ai", "human"], "第二个问题应该能看到第一轮的对话（checkpointer）"
    actual = len(list(graph.get_state_history(config)))
    assert ex.PREDICTED_CHECKPOINTS == actual, f"你的预测是 {ex.PREDICTED_CHECKPOINTS}，实际是 {actual}。想想每次 invoke 存了哪几步"
