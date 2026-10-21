from kit import ScriptedChatModel


def test_collect_by_type(ex):
    """7.1 v2 下按 chunk["type"] 分组"""
    out = ex.collect_by_type(ex.build_topic_graph(), {"topic": "冰淇淋"}, ["values", "updates"])
    assert set(out) == {"values", "updates"}
    assert out["updates"] == [{"refine_topic": {"topic": "冰淇淋和猫"}}, {"generate_joke": {"joke": "一个关于冰淇淋和猫的笑话"}}]
    assert out["values"][-1] == {"topic": "冰淇淋和猫", "joke": "一个关于冰淇淋和猫的笑话"}


def test_progress_bars(ex):
    """7.2 自定义进度事件变成进度条"""
    assert ex.progress_bars(ex.build_job_graph()) == [
        "■□□□□ 20%", "■■□□□ 40%", "■■■□□ 60%", "■■■■□ 80%", "■■■■■ 100%"]


def test_nostream(ex):
    """7.3 nostream 的模型不进流，但结果照样写入状态"""
    joke, poem = ScriptedChatModel(["哈哈"], loop=True), ScriptedChatModel(["静夜思"], loop=True)
    graph = ex.build_poem_graph(joke, poem)
    streamed = ex.stream_text_by_node(graph, {"topic": "猫"})
    assert streamed == {"write_joke": "哈哈"}, f"流里应该只有 write_joke，实际：{streamed}"
    assert graph.invoke({"topic": "猫"}) == {"topic": "猫", "joke": "哈哈", "poem": "静夜思"}
