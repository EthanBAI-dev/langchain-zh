from langchain_core.messages import ToolMessage

from kit import ScriptedChatModel, ai, call


def test_decide_mood(ex):
    """4.1 decide_mood 按是否包含 Lance 分流"""
    assert ex.decide_mood({"graph_state": "Hi, this is Lance."}) == "node_2"
    assert ex.decide_mood({"graph_state": "Hi, this is Bob."}) == "node_3"


def test_mood_graph(ex):
    """4.1 组装好的图能跑通两条路"""
    graph = ex.build_mood_graph()
    assert graph.invoke({"graph_state": "Lance:"})["graph_state"] == "Lance: I am happy!"
    assert graph.invoke({"graph_state": "Bob:"})["graph_state"] == "Bob: I am sad!"


def test_subtract(ex):
    """4.2 subtract 工具正确并且有说明书"""
    assert ex.subtract(10, 3) == 7
    assert ex.subtract.__doc__ and ex.subtract.__doc__.strip(), "工具一定要写 docstring，模型靠它理解工具"


def test_math_agent(ex):
    """4.3 Agent 能连续调用工具：10 减 3 再乘 4"""
    model = ScriptedChatModel([
        call("subtract", {"a": 10, "b": 3}),
        call("multiply", {"a": 7, "b": 4}),
        ai("答案是 28"),
    ])
    result = ex.build_math_agent(model).invoke({"messages": "10 减 3 再乘 4"})
    assert set(model.bound_tools) >= {"add", "multiply", "subtract"}, "要用 model.bind_tools(TOOLS)"
    outputs = [m.content for m in result["messages"] if isinstance(m, ToolMessage)]
    assert outputs == ["7", "28"], f"工具结果应该依次是 7 和 28，实际是 {outputs}"
    assert result["messages"][-1].content == "答案是 28"
    assert len(model.calls) == 3, "工具执行完要回到 assistant（tools -> assistant 这条回边）"


def test_count_parallel_turns(ex):
    """4.4 识别一次调用多个工具的回复"""
    model = ScriptedChatModel([
        call("multiply", {"a": 2, "b": 3}, ("multiply", {"a": 4, "b": 5})),
        ai("6 和 20"),
    ])
    result = ex.build_math_agent(model).invoke({"messages": "分别算 2×3 和 4×5"})
    assert ex.count_parallel_turns(result["messages"]) == 1
