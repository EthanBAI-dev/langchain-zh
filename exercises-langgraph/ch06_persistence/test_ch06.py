from kit import ScriptedChatModel


def test_fork_as_node(ex):
    """6.1 用 as_node 分叉，跳过 generate_topic"""
    calls = []
    model = ScriptedChatModel(["ice cream joke", "cat joke"])
    graph = ex.build_joke_graph(model, calls)
    config = {"configurable": {"thread_id": "1"}}
    graph.invoke({}, config)
    out = ex.fork_with_topic(graph, config, "cats")
    assert out["topic"] == "cats" and out["joke"] == "cat joke"
    assert calls == ["generate_topic", "write_joke", "write_joke"], f"分叉后 generate_topic 不该再运行，实际：{calls}"
    assert "cats" in model.calls[1][0].content


def test_retry_success(ex):
    """6.2 重试 3 次：第三次成功"""
    api = ex.make_flaky_api(fail_times=2)
    out = ex.build_resilient_graph(api, max_attempts=3).invoke({"status": ""})
    assert out["status"] == "ok | finalized"
    assert api.counter["n"] == 3


def test_retry_degraded(ex):
    """6.2 重试用尽：error_handler 标记 degraded 并跳到 finalize"""
    api = ex.make_flaky_api(fail_times=2)
    out = ex.build_resilient_graph(api, max_attempts=2).invoke({"status": ""})
    assert out["status"] == "degraded | finalized"
    assert api.counter["n"] == 2


def test_cache(ex):
    """6.3 同样的输入命中缓存"""
    seen = []

    def compute(x):
        seen.append(x)
        return x * x

    graph = ex.build_cached_graph(compute)
    assert graph.invoke({"x": 3})["y"] == 9
    assert graph.invoke({"x": 3})["y"] == 9
    assert graph.invoke({"x": 4})["y"] == 16
    assert seen == [3, 4], f"x=3 第二次应该命中缓存，实际计算记录：{seen}"
