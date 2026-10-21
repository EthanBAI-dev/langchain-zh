# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 10 章 子图 · 练手：共享键直接挂载、不同 schema 手动转换、Command.PARENT 交接。

对应教程：content/10-子图.md
运行检查：pytest ch10_subgraphs
运行演示：python ch10_subgraphs/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from langgraph.graph import END, START, StateGraph
from langgraph.types import Command
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 10.1 方式一：共享键，直接 add_node（教程练习 2）
# 子图和父图都有 foo 键。子图把 foo 变成 foo + " -> child"。
# build_shared_parent：START -> before -> child（编译好的子图直接当节点）-> after -> END
# ---------------------------------------------------------------------------
class FooState(TypedDict):
    foo: str


def build_child():
    sub = StateGraph(FooState)
    sub.add_node("child_node", lambda s: {"foo": s["foo"] + " -> child"})
    sub.add_edge(START, "child_node")
    sub.add_edge("child_node", END)
    return sub.compile()


def build_shared_parent():
    builder = StateGraph(FooState)
    builder.add_node("before", lambda s: {"foo": s["foo"] + " -> before"})
    builder.add_node("child", build_child())
    builder.add_node("after", lambda s: {"foo": s["foo"] + " -> after"})
    builder.add_edge(START, "before")
    builder.add_edge("before", "child")
    builder.add_edge("child", "after")
    builder.add_edge("after", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 10.2 方式二：schema 不同，在节点里 invoke
# 父图用 question / answer，子图（搜索小组）用 query / result。
# ask_search_team 节点：把 question 转成子图的输入 {"query": ...}，
# 调用 search_team.invoke(...)，再把 result 转回父图的 {"answer": ...}。
# ---------------------------------------------------------------------------
class SearchState(TypedDict, total=False):
    query: str
    result: str


class QAState(TypedDict, total=False):
    question: str
    answer: str


def build_search_team():
    sub = StateGraph(SearchState)
    sub.add_node("search", lambda s: {"result": f"找到 3 篇关于「{s['query']}」的资料"})
    sub.add_edge(START, "search")
    sub.add_edge("search", END)
    return sub.compile()


search_team = build_search_team()


def ask_search_team(state: QAState):
    out = search_team.invoke({"query": state["question"]})
    return {"answer": out["result"]}


def build_qa_graph():
    builder = StateGraph(QAState)
    builder.add_node("ask_search_team", ask_search_team)
    builder.add_edge(START, "ask_search_team")
    builder.add_edge("ask_search_team", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 10.3 从子图跳回父图：Command.PARENT（教程练习 4）
# sales_agent 是一个子图，里面只有 sales 节点：
#   - 问题里含 "退款" 或 "坏了"：这是售后问题，交给父图的 support_agent：
#       Command(goto="support_agent", graph=Command.PARENT, update={"handled_by": "sales→support"})
#   - 否则自己回答：{"answer": "销售：这款产品 99 元", "handled_by": "sales"}
# 父图：START -> sales_agent -> END；support_agent -> END。
#   add_node("sales_agent", 子图, destinations=("support_agent",)) 让父图知道它可能跳去哪里。
# ---------------------------------------------------------------------------
class ServiceState(TypedDict, total=False):
    question: str
    answer: str
    handled_by: str


def sales(state: ServiceState):
    if "退款" in state["question"] or "坏了" in state["question"]:
        return Command(goto="support_agent", graph=Command.PARENT, update={"handled_by": "sales→support"})
    return {"answer": "销售：这款产品 99 元", "handled_by": "sales"}


def support_agent(state: ServiceState):
    return {"answer": "售后：已为您登记处理"}


def build_service_graph():
    sales_agent = StateGraph(ServiceState).add_node("sales", sales).add_edge(START, "sales").compile()
    builder = StateGraph(ServiceState)
    builder.add_node("sales_agent", sales_agent, destinations=("support_agent",))
    builder.add_node("support_agent", support_agent)
    builder.add_edge(START, "sales_agent")
    builder.add_edge("sales_agent", END)
    builder.add_edge("support_agent", END)
    return builder.compile()


def main():
    print(build_shared_parent().invoke({"foo": "start"}))
    print(build_qa_graph().invoke({"question": "LangGraph 子图"}))
    graph = build_service_graph()
    for q in ["这款多少钱？", "我买的耳机坏了"]:
        print(q, "→", graph.invoke({"question": q}))


if __name__ == "__main__":
    main()
