"""第 13 章 长期记忆 · 练手：按前缀搜索、runtime.store + 结构化画像、语义检索。

对应教程：content/13-长期记忆.md
运行检查：pytest ch13_long_term_memory
运行演示：python ch13_long_term_memory/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from dataclasses import dataclass

from langchain_core.messages import SystemMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.runtime import Runtime
from langgraph.store.base import BaseStore
from langgraph.store.memory import InMemoryStore
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 13.1 一次 search 列出某个用户的所有记忆（教程练习 1）
# 数据存在 (user_id, "profile")、(user_id, "memories") 等多个命名空间里。
# store.search 的第一个参数是"命名空间前缀"：传 (user_id,) 就能把这个用户的所有命名空间一起搜出来。
# 返回 [(namespace, key), ...]，按字典序排好。
# 提示：search 默认最多返回 10 条，传 limit=100。
# ---------------------------------------------------------------------------
def list_user_items(store: BaseStore, user_id: str) -> list[tuple[tuple, str]]:
    raise NotImplementedError("TODO 13.1：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 13.2 用 runtime.store 维护结构化的用户画像（教程练习 2）
# 记忆存在 ("profile", user_id) 下，key 固定为 "user_profile"，值是 UserProfile 字典。
# user_id 从运行时上下文 runtime.context.user_id 读。
# call_model：读出画像，系统提示词只放兴趣：
#   有画像：f"你是贴心的助手。用户的兴趣：{', '.join(兴趣)}"
#   没有：  "你是贴心的助手。用户的兴趣：暂无"
# write_memory：用 model.with_structured_output(UserProfile) 根对话抽取画像，写回 Store。
# ---------------------------------------------------------------------------
class UserProfile(TypedDict):
    """The user's profile."""

    user_name: str
    interests: list[str]


@dataclass
class Context:
    user_id: str


CREATE_PROFILE = "根据下面的对话，更新用户画像（姓名、兴趣）。已有画像：{profile}"


def build_profile_bot(model, store=None):
    raise NotImplementedError("TODO 13.2：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 13.3 语义检索：只取最相关的记忆（教程练习 4 的简化版）
# make_semantic_store 已写好：用一个"按关键词计数"的玩具向量代替真正的 embedding 模型，
# 这样不用联网也能体验 store.search(..., query=...) 的语义检索。
# relevant_memories：在 (user_id, "memories") 里按 query 检索，返回最相关的 k 条记忆的 "text"。
# 提示：store.search(namespace, query=query, limit=k)
# ---------------------------------------------------------------------------
VOCAB = ["吃", "饭", "菜", "辣", "跑步", "运动", "骑车", "电影", "书", "工作", "会议"]


def keyword_embed(texts: list[str]) -> list[list[float]]:
    return [[float(t.count(w)) + 0.01 for w in VOCAB] for t in texts]


def make_semantic_store() -> InMemoryStore:
    return InMemoryStore(index={"embed": keyword_embed, "dims": len(VOCAB), "fields": ["text"]})


def relevant_memories(store: BaseStore, user_id: str, query: str, k: int = 2) -> list[str]:
    raise NotImplementedError("TODO 13.3：还没写，按上面的提示完成它")


def main():
    from kit import call, get_model

    model = get_model(["你好小李！", call("UserProfile", {"user_name": "小李", "interests": ["骑车"]}),
                       "推荐你去西湖骑车！", call("UserProfile", {"user_name": "小李", "interests": ["骑车"]})])
    bot = build_profile_bot(model)
    ctx = Context(user_id="u1")
    bot.invoke({"messages": "我叫小李，喜欢骑车"}, {"configurable": {"thread_id": "1"}}, context=ctx)
    out = bot.invoke({"messages": "周末去哪玩？"}, {"configurable": {"thread_id": "2"}}, context=ctx)
    print(out["messages"][-1].text)

    store = make_semantic_store()
    for i, text in enumerate(["我爱吃辣的川菜", "每天早上跑步", "周三下午有工作会议"]):
        store.put(("u1", "memories"), str(i), {"text": text})
    print(relevant_memories(store, "u1", "晚饭吃什么菜", k=1))


if __name__ == "__main__":
    main()
