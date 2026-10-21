def test_shared_keys(ex):
    """10.1 共享 foo 键，子图直接当节点"""
    graph = ex.build_shared_parent()
    assert graph.invoke({"foo": "start"}) == {"foo": "start -> before -> child -> after"}
    assert "child" in graph.get_graph().nodes


def test_different_schema(ex):
    """10.2 父子 schema 不同：在节点里转换"""
    out = ex.build_qa_graph().invoke({"question": "LangGraph"})
    assert out == {"question": "LangGraph", "answer": "找到 3 篇关于「LangGraph」的资料"}


def test_handoff_to_parent(ex):
    """10.3 售后问题从子图交给父图的 support_agent"""
    graph = ex.build_service_graph()
    out = graph.invoke({"question": "我买的耳机坏了"})
    assert out["answer"] == "售后：已为您登记处理" and out["handled_by"] == "sales→support"
    out = graph.invoke({"question": "这款多少钱？"})
    assert out["answer"] == "销售：这款产品 99 元" and out["handled_by"] == "sales"
