from pathlib import Path

from langgraph.graph.state import CompiledStateGraph


def test_shout(ex):
    """0.1 shout 在末尾追加三个感叹号"""
    assert ex.shout({"text": "好"}) == {"text": "好！！！"}


def test_graph(ex):
    """0.2 图能跑通 greet → shout"""
    graph = ex.build_graph()
    assert graph.invoke({"text": "LangGraph"}) == {"text": "你好，LangGraph！！！"}


def test_trace_steps(ex):
    """0.3 用 stream 看清每一步"""
    steps = ex.trace_steps(ex.build_graph(), "X")
    assert steps == [("greet", "你好，X"), ("shout", "你好，X！！！")]


def test_langgraph_json(ex):
    """0.4 langgraph.json 指向模块里的 graph"""
    file = Path(ex.__file__).name
    cfg = ex.langgraph_config(file)
    assert cfg["dependencies"] == ["."]
    assert cfg["graphs"] == {"hello": f"./{file}:graph"}
    assert isinstance(ex.graph, CompiledStateGraph), "模块级变量 graph 要是编译好的图"
