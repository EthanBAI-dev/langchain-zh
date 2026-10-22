"""第 10 章 长期记忆 · 练手：Store 基本用法、跨会话记住用户、结构化画像。

对应教程：content/10-长期记忆.md
运行检查：pytest ch10_long_term_memory
运行演示：python ch10_long_term_memory/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

import uuid

from langchain_core.messages import SystemMessage
from langchain_core.runnables.config import RunnableConfig
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.store.base import BaseStore
from langgraph.store.memory import InMemoryStore
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 8.1 Store 的基本用法
# remember：在命名空间 (user_id, "memories") 下，用一个新的 uuid 当 key，
#           存入 {"memory": text}。
# recall：列出这个命名空间下所有记忆的文本（顺序不限）。
# ---------------------------------------------------------------------------
def remember(store: BaseStore, user_id: str, text: str) -> None:
    raise NotImplementedError("TODO 8.1a：还没写，按上面的提示完成它")


def recall(store: BaseStore, user_id: str) -> list[str]:
    raise NotImplementedError("TODO 8.1b：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 8.2 跨会话记住用户的聊天机器人
# 记忆存在 ("memory", user_id) 命名空间下，key 固定为 "user_memory"，
# 值是 {"memory": "……"}。user_id 从 config["configurable"]["user_id"] 读。
# call_model：读出记忆（没有就用 "No existing memory found."），
#             用 MODEL_SYSTEM_MESSAGE 拼系统提示词，加上对话历史调用模型。
# write_memory：同样读出旧记忆，用 CREATE_MEMORY_INSTRUCTION 拼系统提示词，
#             调用模型得到新记忆文本，写回 Store。
# ---------------------------------------------------------------------------
MODEL_SYSTEM_MESSAGE = """You are a helpful assistant with memory that provides information about the user.
If you have memory for this user, use it to personalize your responses.
Here is the memory (it may be empty): {memory}"""

CREATE_MEMORY_INSTRUCTION = """You are collecting information about the user to personalize your responses.
CURRENT USER INFORMATION:
{memory}
Based on the chat history below, please update the user information as a short bulleted list:"""


def build_memory_bot(model):
    raise NotImplementedError("TODO 8.2：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 8.3 更丰富的用户画像（教程练习 2）
# 在 UserProfile 里再加两个字段：location: str 和 favorite_foods: list[str]。
# extract_profile：用 model.with_structured_output(UserProfile) 从对话里抽取画像。
# ---------------------------------------------------------------------------
class UserProfile(TypedDict):
    """User profile schema with typed fields"""

    user_name: str
    interests: list[str]
    # TODO 8.3：在这里加 location 和 favorite_foods


def extract_profile(model, messages) -> dict:
    raise NotImplementedError("TODO 8.3b：还没写，按上面的提示完成它")


def main():
    from langchain_core.messages import HumanMessage

    from kit import get_model

    model = get_model(["Hi Lance!", "- Name: Lance", "去金门大桥骑车吧！", "- Name: Lance\n- Likes biking"])
    bot = build_memory_bot(model)
    bot.invoke({"messages": [HumanMessage("Hi, my name is Lance")]}, {"configurable": {"thread_id": "1", "user_id": "lance"}})
    result = bot.invoke(
        {"messages": [HumanMessage("Where would you recommend that I go biking?")]},
        {"configurable": {"thread_id": "2", "user_id": "lance"}},
    )
    print(result["messages"][-1].text)


if __name__ == "__main__":
    main()
