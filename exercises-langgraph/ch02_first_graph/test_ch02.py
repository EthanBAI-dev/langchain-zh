from langchain_core.messages import ToolMessage

from kit import ScriptedChatModel, ai, call


def test_decide_mood(ex):
    """2.1 路由函数返回标签 happy / sad"""
    assert ex.decide_mood({"graph_state": "This is Lance"}) == "happy"
    assert ex.decide_mood({"graph_state": "This is Bob"}) == "sad"


def test_mood_graph(ex):
    """2.1 path_map 把标签映射到节点"""
    graph = ex.build_mood_graph()
    assert graph.invoke({"graph_state": "Lance:"})["graph_state"] == "Lance: I am happy!"
    assert graph.invoke({"graph_state": "Bob:"})["graph_state"] == "Bob: I am sad!"
    assert "happy" in graph.get_graph().draw_mermaid(), "用 path_map 后，图上的虚线会标出 happy / sad"


def test_turns(ex):
    """2.2 turns 用 reducer 累加"""
    graph = ex.build_chain(ScriptedChatModel([ai("hi")]))
    out = graph.invoke({"messages": "hello", "turns": 10})
    assert out["turns"] == 11, "输入 10，经过一次模型后应该是 11——节点返回 1，交给 operator.add 去加"
    assert out["messages"][-1].content == "hi"


def test_router_one_step(ex):
    """2.3 Router 执行一次工具就结束"""
    model = ScriptedChatModel([call("multiply", {"a": 2, "b": 3})])
    out = ex.build_router(model).invoke({"messages": "2 乘 3，再加 4"})
    assert {"multiply", "add"} <= set(model.bound_tools)
    assert isinstance(out["messages"][-1], ToolMessage) and out["messages"][-1].content == "6"
    assert len(model.calls) == 1, "Router 的 tools 之后直接 END，模型只会被调用一次"


def test_router_no_tool(ex):
    """2.3 不需要工具时直接回答"""
    out = ex.build_router(ScriptedChatModel([ai("你好")])).invoke({"messages": "hi"})
    assert out["messages"][-1].content == "你好"
