from langchain_core.messages import HumanMessage
from langgraph.store.memory import InMemoryStore

from kit import ScriptedChatModel, call


def test_store_basics(ex):
    """8.1 存进去、读出来，不同用户互不干扰"""
    store = InMemoryStore()
    ex.remember(store, "u1", "I like pizza")
    ex.remember(store, "u1", "I live in SF")
    ex.remember(store, "u2", "I like sushi")
    assert sorted(ex.recall(store, "u1")) == ["I like pizza", "I live in SF"]
    assert ex.recall(store, "u2") == ["I like sushi"]
    assert ex.recall(store, "nobody") == []
    keys = [i.key for i in store.search(("u1", "memories"))]
    assert len(set(keys)) == 2, "每条记忆要用不同的 key（uuid）"


def test_memory_bot_cross_thread(ex):
    """8.2 换了对话（thread）也记得同一个用户"""
    model = ScriptedChatModel(["Hi Lance", "- Name: Lance", "Go to Golden Gate", "- Name: Lance\n- Bikes"])
    bot = ex.build_memory_bot(model)
    bot.invoke({"messages": [HumanMessage("I'm Lance")]}, {"configurable": {"thread_id": "1", "user_id": "lance"}})
    bot.invoke({"messages": [HumanMessage("Where to bike?")]}, {"configurable": {"thread_id": "2", "user_id": "lance"}})
    prompts = model.system_prompts()
    assert "No existing memory found." in prompts[0], "第一次聊天还没有记忆"
    assert "CURRENT USER INFORMATION" in prompts[1], "write_memory 要用 CREATE_MEMORY_INSTRUCTION"
    assert "- Name: Lance" in prompts[2], "新对话里，系统提示词应该带上之前写入的记忆"
    item = bot.store.get(("memory", "lance"), "user_memory")
    assert item and item.value == {"memory": "- Name: Lance\n- Bikes"}


def test_memory_bot_isolated_users(ex):
    """8.2 不同 user_id 的记忆互不串（教程练习 1）"""
    model = ScriptedChatModel(["Hi", "- Name: Lance", "Hi stranger", "- Unknown"])
    bot = ex.build_memory_bot(model)
    bot.invoke({"messages": [HumanMessage("I'm Lance")]}, {"configurable": {"thread_id": "1", "user_id": "lance"}})
    bot.invoke({"messages": [HumanMessage("Who am I?")]}, {"configurable": {"thread_id": "2", "user_id": "bob"}})
    assert "Lance" not in model.system_prompts()[2], "bob 不应该看到 lance 的记忆"


def test_profile_fields(ex):
    """8.3 UserProfile 增加了 location 和 favorite_foods"""
    fields = ex.UserProfile.__annotations__
    assert {"user_name", "interests", "location", "favorite_foods"} <= set(fields)


def test_extract_profile(ex):
    """8.3 用 with_structured_output 抽取画像"""
    args = {"user_name": "Lance", "interests": ["biking"], "location": "San Francisco", "favorite_foods": ["croissant"]}
    model = ScriptedChatModel([call("UserProfile", args)])
    profile = ex.extract_profile(model, [HumanMessage("I'm Lance from SF, I bike and love croissants")])
    assert profile == args
