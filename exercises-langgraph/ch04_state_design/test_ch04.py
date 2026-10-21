from langchain_core.messages import ToolMessage
from langgraph.graph import END, START, StateGraph
from typing_extensions import Annotated, TypedDict

from kit import ScriptedChatModel, ai, call


def test_fork_prediction(ex):
    """4.1 operator.add 合并并行写入，预测正确"""
    actual = ex.build_fork_graph().invoke({"foo": 1})["foo"]
    assert actual != 1, "foo 还没有 reducer：并行写同一个键会报 InvalidUpdateError，或只保留一个值"
    assert ex.PREDICTED_FOO == actual, f"你的预测是 {ex.PREDICTED_FOO}，实际是 {actual}"


def test_keep_last_3(ex):
    """4.2 keep_last_3 只留最近 3 个"""
    assert ex.keep_last_3(["a", "b"], ["c", "d"]) == ["b", "c", "d"]
    assert ex.keep_last_3(None, ["x"]) == ["x"]
    assert ex.keep_last_3(["x"], None) == ["x"]


def test_keep_last_3_in_graph(ex):
    """4.2 三个串联节点之后只剩最近 3 个元素"""

    class S(TypedDict):
        items: Annotated[list[int], ex.keep_last_3]

    builder = StateGraph(S)
    prev = START
    for i in range(3):
        builder.add_node(f"n{i}", lambda s, i=i: {"items": [i * 2, i * 2 + 1]})
        builder.add_edge(prev, f"n{i}")
        prev = f"n{i}"
    builder.add_edge(prev, END)
    assert builder.compile().invoke({"items": []})["items"] == [3, 4, 5]


def test_overwrite(ex):
    """4.3 Overwrite 真正清空带 reducer 的字段"""
    builder = StateGraph(ex.ErrorState)
    builder.add_node("fail", lambda s: {"errors": ["boom"]})
    builder.add_node("clear", ex.clear_errors)
    builder.add_edge(START, "fail")
    builder.add_edge("fail", "clear")
    builder.add_edge("clear", END)
    assert builder.compile().invoke({"errors": ["old"]})["errors"] == []


def test_output_schema(ex):
    """4.4 invoke 只返回 answer，debug 只在流里看得到"""
    graph = ex.build_filtered_graph()
    assert graph.invoke({"question": "Q"}) == {"answer": "Answer to Q"}
    values = list(graph.stream({"question": "Q"}, stream_mode="values"))
    assert any(v.get("debug") == "thinking about Q" for v in values), "think 节点要写入 debug"


def test_command_agent(ex):
    """4.5 Command 路由 + context 选模型"""
    fast = ScriptedChatModel([ai("fast answer")])
    strong = ScriptedChatModel([call("multiply", {"a": 6, "b": 7}), ai("42")])
    agent = ex.build_command_agent({"fast": fast, "strong": strong})
    out = agent.invoke({"messages": "6*7"}, context=ex.Context(model_name="strong"))
    assert [m.content for m in out["messages"] if isinstance(m, ToolMessage)] == ["42"]
    assert out["messages"][-1].content == "42" and not fast.calls
    out = agent.invoke({"messages": "hi"}, context=ex.Context(model_name="fast"))
    assert out["messages"][-1].content == "fast answer"
