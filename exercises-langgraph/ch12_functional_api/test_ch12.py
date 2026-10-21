import time

from langchain_core.messages import HumanMessage
from langgraph.types import Command

from kit import ScriptedChatModel


def test_parallel(ex):
    """12.1 四个 task 并行，总耗时接近一个"""
    t0 = time.time()
    assert ex.parallel.invoke([1, 2, 3, 4]) == [2, 4, 6, 8]
    elapsed = time.time() - t0
    assert elapsed < 0.6, f"耗时 {elapsed:.2f}s，看起来是一个一个等的：先把 future 全部发出去，再 .result()"


def test_final(ex):
    """12.2 返回上一次的总数，保存新的总数"""
    cfg = {"configurable": {"thread_id": "acc"}}
    assert [ex.accumulate.invoke(n, cfg) for n in (1, 2, 3)] == [0, 1, 3]
    assert ex.accumulate.invoke(0, cfg) == 6, "第 4 次调用拿到的 previous 应该是保存下来的总数 6"


def test_chatbot_history(ex):
    """12.3 previous 让机器人记住对话"""
    model = ScriptedChatModel(["a1", "a2"])
    bot = ex.build_chatbot(model)
    cfg = {"configurable": {"thread_id": "c"}}
    assert bot.invoke([HumanMessage("q1")], cfg).content == "a1"
    bot.invoke([HumanMessage("q2")], cfg)
    assert [m.content for m in model.calls[1]] == ["q1", "a1", "q2"]


def test_chatbot_summary(ex):
    """12.3 历史超过 6 条时先摘要，只留摘要 + 最近两条"""
    model = ScriptedChatModel(["a1", "a2", "a3", "SUM", "a4", "a5"])
    bot = ex.build_chatbot(model)
    cfg = {"configurable": {"thread_id": "s"}}
    for q in ["q1", "q2", "q3", "q4"]:
        bot.invoke([HumanMessage(q)], cfg)
    last_input = model.calls[-1]
    assert last_input[0].type == "system" and "SUM" in last_input[0].content, "第 4 轮应该先生成摘要"
    assert [m.content for m in last_input[1:]] == ["a3", "q4"]
    bot.invoke([HumanMessage("q5")], cfg)
    assert [m.content for m in model.calls[-1][1:]] == ["a3", "q4", "a4", "q5"], "要用 save= 保存摘要后的历史"


def test_interrupt_no_recompute(ex):
    """12.4 人来打分；恢复时已完成的 task 不重算"""
    model = ScriptedChatModel(["joke v1", "joke v2"])
    wf = ex.build_joke_workflow(model)
    cfg = {"configurable": {"thread_id": "j"}}
    out = wf.invoke("cats", cfg, version="v2")
    assert out.interrupts[0].value == {"joke": "joke v1"}
    out = wf.invoke(Command(resume={"grade": "not funny", "feedback": "更冷一点"}), cfg, version="v2")
    assert out.interrupts[0].value == {"joke": "joke v2"}
    assert "更冷一点" in model.calls[1][0].content
    out = wf.invoke(Command(resume={"grade": "funny"}), cfg, version="v2")
    assert out.value == "joke v2"
    assert len(model.calls) == 2, f"模型只该被调用 2 次，实际 {len(model.calls)} 次（task 结果应该被复用）"
