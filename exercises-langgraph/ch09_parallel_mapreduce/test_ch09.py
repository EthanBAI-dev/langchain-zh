from kit import ScriptedChatModel


def test_defer(ex):
    """9.1 只走 b 分支时，d 依然运行一次"""
    path = ex.build_selective_graph().invoke({"path": []})["path"]
    assert path == ["a", "b", "d"], f"实际路径：{path}"


def test_send_payload(ex):
    """9.2 Send 的载荷里带上 n"""
    sends = ex.continue_to_jokes({"subjects": ["cats", "dogs"], "n": 2})
    assert [(s.node, s.arg) for s in sends] == [
        ("generate_joke", {"subject": "cats", "n": 2}), ("generate_joke", {"subject": "dogs", "n": 2})]


def test_best_joke(ex):
    """9.2 每个话题 n 条，选出最佳"""
    def joke(messages):
        subject = messages[-1].content.rsplit(" ", 1)[-1]
        return f"{subject} joke" + ("!!!" if subject == "dogs" else "")

    model = ScriptedChatModel([joke], loop=True)
    out = ex.build_jokes_graph(model).invoke({"subjects": ["cats", "dogs"], "n": 2})
    assert sorted(out["jokes"]) == ["cats joke", "cats joke", "dogs joke!!!", "dogs joke!!!"]
    assert out["best_joke"] == "dogs joke!!!"


def test_chunk_text(ex):
    """9.3 按字数切段"""
    assert ex.chunk_text("a" * 450) == ["a" * 200, "a" * 200, "a" * 50]
    assert ex.chunk_text("abcdef", size=4) == ["abcd", "ef"]


def test_combine_sorts(ex):
    """9.3 combine 按序号拼回去"""
    out = ex.combine({"summaries": [(2, "三"), (0, "一"), (1, "二")]})
    assert out == {"final": "一\n二\n三"}


def test_doc_graph(ex):
    """9.3 整篇文章：每段一次 Send"""
    model = ScriptedChatModel([lambda m: "S:" + m[-1].content[7:8]], loop=True)
    text = "A" * 200 + "B" * 200 + "C" * 10
    out = ex.build_doc_graph(model).invoke({"text": text})
    assert len(model.calls) == 3
    assert out["final"] == "S:A\nS:B\nS:C"
