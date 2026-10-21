from langgraph.store.memory import InMemoryStore

from kit import ScriptedChatModel, call


def test_prefix_search(ex):
    """13.1 一次 search 列出一个用户的所有命名空间"""
    store = InMemoryStore()
    store.put(("user_1", "profile"), "p", {"name": "Lance"})
    store.put(("user_1", "memories"), "m1", {"text": "likes biking"})
    store.put(("user_1", "memories"), "m2", {"text": "lives in SF"})
    store.put(("user_2", "profile"), "p", {"name": "Bob"})
    assert ex.list_user_items(store, "user_1") == [
        (("user_1", "memories"), "m1"), (("user_1", "memories"), "m2"), (("user_1", "profile"), "p")]


def test_profile_bot(ex):
    """13.2 runtime.store 读写结构化画像，提示词只放兴趣"""
    model = ScriptedChatModel([
        "你好小李",
        call("UserProfile", {"user_name": "小李", "interests": ["骑车", "咖啡"]}),
        "去西湖骑车吧",
        call("UserProfile", {"user_name": "小李", "interests": ["骑车", "咖啡"]}),
    ])
    store = InMemoryStore()
    bot = ex.build_profile_bot(model, store)
    ctx = ex.Context(user_id="u1")
    bot.invoke({"messages": "我叫小李"}, {"configurable": {"thread_id": "1"}}, context=ctx)
    assert store.get(("profile", "u1"), "user_profile").value == {"user_name": "小李", "interests": ["骑车", "咖啡"]}
    bot.invoke({"messages": "周末去哪？"}, {"configurable": {"thread_id": "2"}}, context=ctx)
    prompts = model.system_prompts()
    assert prompts[0] == "你是贴心的助手。用户的兴趣：暂无"
    assert prompts[2] == "你是贴心的助手。用户的兴趣：骑车, 咖啡", "新对话里要读出画像，只放兴趣"
    assert "小李" not in prompts[2]


def test_semantic_search(ex):
    """13.3 按含义检索最相关的记忆"""
    store = ex.make_semantic_store()
    for i, text in enumerate(["我爱吃辣的川菜", "每天早上跑步运动", "周三下午有工作会议"]):
        store.put(("u1", "memories"), str(i), {"text": text})
    store.put(("u2", "memories"), "x", {"text": "我也爱吃菜"})
    assert ex.relevant_memories(store, "u1", "晚饭吃什么菜", k=1) == ["我爱吃辣的川菜"]
    assert ex.relevant_memories(store, "u1", "明天的会议几点", k=1) == ["周三下午有工作会议"]
    assert len(ex.relevant_memories(store, "u1", "运动", k=2)) == 2
