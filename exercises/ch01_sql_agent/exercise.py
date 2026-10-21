"""第 1 章 十分钟造一个 Agent · 练手：只读的 SQL 智能体。

对应教程：content/01-十分钟造一个Agent.md
运行检查：pytest ch01_sql_agent
运行演示：python ch01_sql_agent/exercise.py

数据库用的是 kit/chinook.py 里的迷你 Chinook（内存 SQLite），用法和教程里的
SQLDatabase 一样：db.run("SELECT ...") 返回字符串。
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from dataclasses import dataclass

from langchain.agents import create_agent
from langchain_core.messages import AIMessage
from langchain_core.tools import tool
from langgraph.runtime import get_runtime

from kit.chinook import MiniDB


@dataclass
class RuntimeContext:
    db: MiniDB


SYSTEM_PROMPT = """You are a careful SQLite analyst.

Rules:
- Think step-by-step.
- When you need data, call the tool `execute_sql` with ONE SELECT query.
- Read-only only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
- Limit to 5 rows of output unless the user explicitly asks otherwise.
- If the tool returns 'Error:', revise the SQL and try again.
"""


# ---------------------------------------------------------------------------
# 练习 1.1 在"工具层面"守住只读
# 教程的练习 2 说过：只靠提示词说"Read-only"不保险，模型可能不听。
# 写一个判断函数：只有 SELECT 或 WITH 开头、并且只有一条语句时返回 True。
#   is_read_only("SELECT * FROM Track")          -> True
#   is_read_only("  select 1;")                  -> True（末尾的分号可以有）
#   is_read_only("DELETE FROM Invoice")          -> False
#   is_read_only("SELECT 1; DROP TABLE Track")   -> False（偷偷塞第二条语句）
# ---------------------------------------------------------------------------
def is_read_only(query: str) -> bool:
    raise NotImplementedError("TODO 1.1：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 1.2 写 execute_sql 工具
# 要求：
#   - 用 get_runtime(RuntimeContext) 拿到本次调用传进来的 db；
#   - 不是只读语句 -> 返回 "Error: only read-only SELECT queries are allowed."
#   - 执行出错 -> 返回 f"Error: {e}"（把错误当结果返回，模型才能自我修正）
#   - 正常 -> 返回 db.run(query) 的结果
# ---------------------------------------------------------------------------
@tool
def execute_sql(query: str) -> str:
    """Execute a read-only SQLite SELECT query and return the results."""
    raise NotImplementedError("TODO 1.2：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 1.3 创建 Agent
# 用 create_agent 把模型、execute_sql、SYSTEM_PROMPT 和 RuntimeContext 组装起来。
# ---------------------------------------------------------------------------
def build_agent(model):
    raise NotImplementedError("TODO 1.3：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 1.4 数一数工具调用了几次
# 给定 agent.invoke 返回的 result["messages"]，统计所有 AIMessage 里 tool_calls 的总数。
# ---------------------------------------------------------------------------
def count_tool_calls(messages) -> int:
    raise NotImplementedError("TODO 1.4：还没写，按上面的提示完成它")


def main():
    from kit import call, get_model
    from kit.chinook import make_db

    model = get_model([
        call("execute_sql", {"query": "SELECT g.Name, AVG(t.Milliseconds) AS avg_ms FROM Track t "
                                      "JOIN Genre g ON g.GenreId = t.GenreId GROUP BY g.Name ORDER BY avg_ms DESC LIMIT 1"}),
        "平均时长最长的流派是 Jazz。",
    ])
    agent = build_agent(model)
    result = agent.invoke(
        {"messages": "Which genre on average has the longest tracks?"},
        context=RuntimeContext(db=make_db()),
    )
    for m in result["messages"]:
        m.pretty_print()
    print("工具调用次数：", count_tool_calls(result["messages"]))


if __name__ == "__main__":
    main()
