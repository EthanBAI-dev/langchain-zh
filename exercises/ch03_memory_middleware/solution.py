# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 3 章 记忆、结构化输出与中间件 · 练手。

对应教程：content/03-记忆结构化输出与中间件.md
运行检查：pytest ch03_memory_middleware
运行演示：python ch03_memory_middleware/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from dataclasses import dataclass

from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langchain.agents.middleware.types import ModelRequest, dynamic_prompt
from langchain_core.tools import tool
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 练习 3.1 短期记忆
# build_memory_agent：创建一个带 InMemorySaver 的 Agent（不需要工具）。
# chat：用指定的 thread_id 发一句话，返回 Agent 最后一条回复的文本。
# 同一个 thread_id 的对话会接着聊；换一个 thread_id 就是全新的对话。
# ---------------------------------------------------------------------------
def build_memory_agent(model):
    return create_agent(model, tools=[], checkpointer=InMemorySaver())


def chat(agent, text: str, thread_id: str) -> str:
    config = {"configurable": {"thread_id": thread_id}}
    result = agent.invoke({"messages": [{"role": "user", "content": text}]}, config)
    return result["messages"][-1].text


# ---------------------------------------------------------------------------
# 练习 3.2 结构化输出（教程练习 2）
# 定义 Pydantic 模型 Order(product: str, quantity: int)，
# 再用 create_agent(..., response_format=Order) 做一个"订单提取器"，
# extract_order 返回 result["structured_response"]。
# ---------------------------------------------------------------------------
class Order(BaseModel):
    """An order mentioned in a conversation."""

    product: str = Field(description="What the customer wants to buy")
    quantity: int = Field(description="How many units")


def extract_order(model, transcript: str) -> Order:
    agent = create_agent(model, response_format=Order)
    result = agent.invoke({"messages": [{"role": "user", "content": transcript}]})
    return result["structured_response"]


# ---------------------------------------------------------------------------
# 练习 3.3 动态提示词中间件
# 员工能查所有表；顾客只能查音乐相关的表。
# 用 @dynamic_prompt 写 role_prompt：
#   - 读 request.runtime.context.is_employee
#   - 顾客：返回 BASE_PROMPT + "\n" + CUSTOMER_LIMITS
#   - 员工：只返回 BASE_PROMPT
# 再在 build_role_agent 里把它放进 middleware，并指定 context_schema=RoleContext。
# ---------------------------------------------------------------------------
@dataclass
class RoleContext:
    is_employee: bool


BASE_PROMPT = "You are a careful SQLite analyst. Read-only queries only."
CUSTOMER_LIMITS = "- Limit access to these tables: Album, Artist, Genre, Playlist, PlaylistTrack, Track."


@dynamic_prompt
def role_prompt(request: ModelRequest) -> str:
    if request.runtime.context.is_employee:
        return BASE_PROMPT
    return BASE_PROMPT + "\n" + CUSTOMER_LIMITS


def build_role_agent(model):
    return create_agent(model, tools=[], middleware=[role_prompt], context_schema=RoleContext)


# ---------------------------------------------------------------------------
# 练习 3.4 人工审批，并允许"改参数"（教程练习 3）
# build_review_agent：execute_sql 执行前必须人工审批，allowed_decisions 是
#   ["approve", "edit", "reject"]。别忘了 checkpointer。
# decide：根据 decision 生成恢复用的 Command：
#   - "approve" -> {"type": "approve"}
#   - "reject"  -> {"type": "reject", "message": message}
#   - "edit"    -> {"type": "edit", "edited_action": {"name": "execute_sql", "args": {"query": new_query}}}
#   都要包成 Command(resume={"decisions": [ ... ]})
# ---------------------------------------------------------------------------
EXECUTED: list[str] = []  # 记录真正执行过的 SQL，方便检查


@tool
def execute_sql(query: str) -> str:
    """Execute a SQLite query."""
    EXECUTED.append(query)
    return f"ran: {query}"


def build_review_agent(model):
    return create_agent(
        model,
        tools=[execute_sql],
        checkpointer=InMemorySaver(),
        middleware=[
            HumanInTheLoopMiddleware(
                interrupt_on={"execute_sql": {"allowed_decisions": ["approve", "edit", "reject"]}},
            )
        ],
    )


def decide(decision: str, new_query: str | None = None, message: str = "") -> Command:
    if decision == "approve":
        d = {"type": "approve"}
    elif decision == "reject":
        d = {"type": "reject", "message": message}
    elif decision == "edit":
        d = {"type": "edit", "edited_action": {"name": "execute_sql", "args": {"query": new_query}}}
    else:
        raise ValueError(f"未知的决定：{decision}")
    return Command(resume={"decisions": [d]})


def main():
    from kit import call, get_model

    model = get_model([call("execute_sql", {"query": "SELECT * FROM Employee"}), "员工有 Andrew 和 Nancy。"])
    agent = build_review_agent(model)
    config = {"configurable": {"thread_id": "demo"}}
    result = agent.invoke({"messages": "What are the names of all the employees?"}, config)
    if "__interrupt__" in result:
        req = result["__interrupt__"][-1].value["action_requests"][-1]
        print("需要审批：", req["args"])
        result = agent.invoke(decide("edit", "SELECT FirstName FROM Employee LIMIT 5"), config)
    print("实际执行：", EXECUTED)
    print(result["messages"][-1].text)


if __name__ == "__main__":
    main()
