from langchain_core.messages import AIMessage, HumanMessage
from langgraph.graph import END, START, MessagesState, StateGraph

from kit import ScriptedChatModel


def test_reducer(ex):
    """5.1 reducer 合并、去重、排序，并能处理 None"""
    f = ex.merge_unique_sorted
    assert f(["b", "a"], ["c", "a"]) == ["a", "b", "c"]
    assert f(None, ["x"]) == ["x"]
    assert f(["x"], None) == ["x"]
    assert f(None, None) == []


def test_reducer_in_graph(ex):
    """5.1 并行节点写同一字段时由 reducer 合并"""
    assert ex.build_tag_graph().invoke({"tags": []})["tags"] == ["agent", "langgraph", "python"]


def test_keep_last_two(ex):
    """5.2 RemoveMessage 只留下最后两条"""
    builder = StateGraph(MessagesState)
    builder.add_node("trim", ex.keep_last_two)
    builder.add_edge(START, "trim")
    builder.add_edge("trim", END)
    msgs = [HumanMessage("1", id="1"), AIMessage("2", id="2"), HumanMessage("3", id="3"), AIMessage("4", id="4")]
    out = builder.compile().invoke({"messages": msgs})["messages"]
    assert [m.id for m in out] == ["3", "4"]


def test_should_summarize(ex):
    """5.3 超过阈值才去摘要"""
    four = {"messages": [HumanMessage(str(i)) for i in range(4)]}
    five = {"messages": [HumanMessage(str(i)) for i in range(5)]}
    assert ex.should_summarize(four, threshold=4) == END
    assert ex.should_summarize(five, threshold=4) == "summarize_conversation"


def test_summary_bot(ex):
    """5.3 阈值为 4 时，第 3 轮对话后生成摘要并只留 2 条消息"""
    model = ScriptedChatModel(["a1", "a2", "a3", "SUMMARY-1", "a4", "a5", "SUMMARY-2"])
    bot = ex.build_summary_bot(model, threshold=4)
    config = {"configurable": {"thread_id": "1"}}
    for text in ["q1", "q2", "q3"]:
        bot.invoke({"messages": [HumanMessage(text)]}, config)
    state = bot.get_state(config).values
    assert state.get("summary") == "SUMMARY-1", "6 条消息 > 4，应该已经生成摘要"
    assert [m.content for m in state["messages"]] == ["q3", "a3"], "摘要后只保留最后两条消息"
    assert model.calls[3][-1].content == "Create a summary of the conversation above:"

    for text in ["q4", "q5"]:
        bot.invoke({"messages": [HumanMessage(text)]}, config)
    assert bot.get_state(config).values["summary"] == "SUMMARY-2"
    prompt = model.calls[6][-1].content
    assert "SUMMARY-1" in prompt and "Extend the summary" in prompt, "已有摘要时要在旧摘要的基础上扩写"


def test_sqlite_persistence(ex, tmp_path):
    """5.4 关掉再打开，同一个 thread_id 还能接着聊"""
    db_path = str(tmp_path / "memory.sqlite")
    config = {"configurable": {"thread_id": "lance"}}

    bot = ex.open_persistent_bot(ScriptedChatModel(["你好 Lance"]), db_path)
    bot.invoke({"messages": [HumanMessage("hi, I'm Lance")]}, config)
    bot.checkpointer.conn.close()  # 相当于"退出 Python"

    bot2 = ex.open_persistent_bot(ScriptedChatModel(["你叫 Lance"]), db_path)
    msgs = bot2.get_state(config).values.get("messages", [])
    assert [m.content for m in msgs] == ["hi, I'm Lance", "你好 Lance"], "重新打开后应该能读到之前的对话"
    bot2.checkpointer.conn.close()
