from kit import ScriptedChatModel


def test_research_graph_parallel(ex):
    """7.1 三个检索节点都从 START 出发、并行执行"""
    model = ScriptedChatModel(["综合答案"])
    graph = ex.build_research_graph(model)
    edges = {(e.source, e.target) for e in graph.get_graph().edges}
    for node in ("search_web", "search_wiki", "search_arxiv"):
        assert ("__start__", node) in edges, f"{node} 应该直接连在 START 后面，三路才会并行"
        assert (node, "generate") in edges, f"{node} 之后要汇合到 generate"


def test_research_graph_answer(ex):
    """7.1 三路结果都进了 context，并交给模型"""
    model = ScriptedChatModel(["综合答案"])
    out = ex.build_research_graph(model).invoke({"question": "LangGraph"})
    assert len(out["context"]) == 3 and any("[arxiv]" in c for c in out["context"])
    assert out["answer"] == "综合答案"
    assert len(model.calls) == 1, "generate 只应该被调用一次（等三路都到齐再生成）"
    prompt = " ".join(m.content for m in model.calls[0])
    assert "[web]" in prompt and "[wiki]" in prompt and "[arxiv]" in prompt, "context 要拼进发给模型的消息里"


def test_split_paragraphs(ex):
    """7.2 按空行切段"""
    assert ex.split_paragraphs("  第一段。\n\n\n第二段。\n\n  \n\n第三段。 ") == ["第一段。", "第二段。", "第三段。"]


def test_send(ex):
    """7.2 每段生成一个 Send"""
    sends = ex.continue_to_summaries({"paragraphs": ["a", "b"]})
    assert [(s.node, s.arg) for s in sends] == [("summarize_paragraph", {"paragraph": "a"}), ("summarize_paragraph", {"paragraph": "b"})]


def test_map_reduce(ex):
    """7.2 每段并行总结，最后合并"""
    def fake_summary(messages):
        text = messages[-1].content
        for key in ("苹果", "香蕉", "橙子"):
            if key in text:
                return f"讲了{key}"
        return "?"

    model = ScriptedChatModel([fake_summary], loop=True)
    article = "苹果很好吃。\n\n香蕉是黄色的。\n\n橙子富含维C。"
    out = ex.build_summary_graph(model).invoke({"article": article})
    assert len(model.calls) == 3, "三段话应该调用三次模型"
    assert sorted(out["summaries"]) == sorted(["讲了苹果", "讲了香蕉", "讲了橙子"])
    assert set(out["final_summary"].split("\n")) == {"讲了苹果", "讲了香蕉", "讲了橙子"}


def test_subgraph(ex):
    """7.3 子图当节点用，结果流回父图"""
    logs = [{"status": "ok"}, {"status": "fail"}, {"status": "fail"}]
    graph = ex.build_parent_graph()
    assert "failure_analysis" in graph.get_graph().nodes
    assert graph.invoke({"logs": logs})["report"] == "共 3 条日志，失败 2 条"
