import asyncio

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import END, START, MessagesState, StateGraph

from kit import ScriptedChatModel, call


def test_drop_two_oldest(ex):
    """5.1 只删除最早的两条"""
    builder = StateGraph(MessagesState)
    builder.add_node("f", ex.drop_two_oldest)
    builder.add_edge(START, "f")
    builder.add_edge("f", END)
    graph = builder.compile()
    msgs = [HumanMessage(str(i), id=str(i)) for i in range(5)]
    assert [m.id for m in graph.invoke({"messages": msgs})["messages"]] == ["2", "3", "4"]
    assert len(graph.invoke({"messages": msgs[:2]})["messages"]) == 2, "只有 2 条时不要删"


def _history():
    tc = call("search", {"q": "x"})
    return [
        SystemMessage("sys"),
        HumanMessage("q1"), AIMessage("a1"),
        HumanMessage("q2"), tc, ToolMessage("result", tool_call_id=tc.tool_calls[0]["id"]), AIMessage("a2"),
    ]


def test_trim_safely(ex):
    """5.2 裁剪后从用户消息开始，工具调用对完整"""
    msgs = _history()
    assert isinstance(ex.naive_tail(msgs, 2)[0], ToolMessage), "（对照）直接切片会从 ToolMessage 开始"
    out = ex.trim_safely(msgs, 5)
    assert out[0].type == "system", "要保留系统消息（include_system=True）"
    assert out[1].type == "human", "系统消息之后要从用户消息开始（start_on='human'）"
    assert [m.content for m in out[1:]] == ["q2", "", "result", "a2"]


def test_should_summarize_tokens(ex):
    """5.3 按 token 数而不是条数判断"""
    short = {"messages": [HumanMessage("hi")] * 10}
    long = {"messages": [HumanMessage("word " * 300)]}
    assert ex.should_summarize(short) == "__end__", "10 条很短的消息加起来不到 200 token，不用摘要"
    assert ex.should_summarize(long) == "summarize_conversation"


def test_summary_keeps_four(ex):
    """5.3 摘要后保留最近 4 条"""
    model = ScriptedChatModel(["a1", "a2", "a3 " + "long " * 300, "SUMMARY"])
    bot = ex.build_summary_bot(model)
    config = {"configurable": {"thread_id": "1"}}
    for q in ["q1", "q2", "q3"]:
        bot.invoke({"messages": [HumanMessage(q)]}, config)
    state = bot.get_state(config).values
    assert state["summary"] == "SUMMARY"
    assert [m.content for m in state["messages"]][:3] == ["q2", "a2", "q3"]
    assert len(state["messages"]) == 4


def test_async_sqlite(ex, tmp_path):
    """5.4 每次"重启"后，对话都还在"""
    db = str(tmp_path / "chat.sqlite")
    model = ScriptedChatModel(["ok"], loop=True)
    counts = [asyncio.run(ex.chat_once(model, db, "t", text)) for text in ["a", "b", "c"]]
    assert counts == [2, 4, 6], f"三次调用后的消息数应该是 2、4、6，实际是 {counts}"
    assert asyncio.run(ex.chat_once(model, db, "other", "x")) == 2, "换一个 thread_id 是新对话"
