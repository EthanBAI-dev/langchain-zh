# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 7 章 并行、子图与多智能体 · 练手：扇出扇入、Map-Reduce、子图。

对应教程：content/07-并行子图与多智能体.md
运行检查：pytest ch07_parallel_subgraphs
运行演示：python ch07_parallel_subgraphs/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

import operator
from typing import Annotated

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 7.1 三路并行检索（教程练习 1：再加一个 arXiv 数据源）
# 三个"检索"函数已经写好（离线假数据）。把它们包成三个节点，并行执行：
#   START -> search_web / search_wiki / search_arxiv（同时）-> generate -> END
# 每个检索节点返回 {"context": [检索结果]}，context 用 operator.add 合并。
# generate 节点把 context 拼进系统提示词，调用模型，返回 {"answer": 回复文本}。
# ---------------------------------------------------------------------------
def web_search(q: str) -> str:
    return f"[web] 关于 {q} 的网页结果"


def wiki_search(q: str) -> str:
    return f"[wiki] 关于 {q} 的维基百科条目"


def arxiv_search(q: str) -> str:
    return f"[arxiv] 关于 {q} 的论文摘要"


class ResearchState(TypedDict):
    question: str
    context: Annotated[list[str], operator.add]
    answer: str


def build_research_graph(model):
    def search_web(state: ResearchState):
        return {"context": [web_search(state["question"])]}

    def search_wiki(state: ResearchState):
        return {"context": [wiki_search(state["question"])]}

    def search_arxiv(state: ResearchState):
        return {"context": [arxiv_search(state["question"])]}

    def generate(state: ResearchState):
        context = "\n\n".join(state["context"])
        reply = model.invoke([
            SystemMessage(f"Answer the question using this context:\n\n{context}"),
            HumanMessage(state["question"]),
        ])
        return {"answer": reply.text}

    builder = StateGraph(ResearchState)
    for name, fn in [("search_web", search_web), ("search_wiki", search_wiki), ("search_arxiv", search_arxiv)]:
        builder.add_node(name, fn)
        builder.add_edge(START, name)
        builder.add_edge(name, "generate")
    builder.add_node("generate", generate)
    builder.add_edge("generate", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 7.2 Map-Reduce：并行总结长文章的每一段（教程练习 2）
# split_paragraphs：按空行切段，去掉首尾空白，丢掉空段。
# continue_to_summaries：为每一段发一个 Send("summarize_paragraph", {"paragraph": 段落})。
# summarize_paragraph：让模型总结这一段，返回 {"summaries": [总结]}。
# combine：把所有 summaries 用换行连起来，返回 {"final_summary": ...}。
# 图：START -> split -> (continue_to_summaries) -> summarize_paragraph -> combine -> END
# ---------------------------------------------------------------------------
class ArticleState(TypedDict):
    article: str
    paragraphs: list[str]
    summaries: Annotated[list[str], operator.add]
    final_summary: str


class ParagraphState(TypedDict):
    paragraph: str


def split_paragraphs(text: str) -> list[str]:
    return [p.strip() for p in text.split("\n\n") if p.strip()]


def continue_to_summaries(state: ArticleState):
    return [Send("summarize_paragraph", {"paragraph": p}) for p in state["paragraphs"]]


def build_summary_graph(model):
    def split(state: ArticleState):
        return {"paragraphs": split_paragraphs(state["article"])}

    def summarize_paragraph(state: ParagraphState):
        reply = model.invoke([HumanMessage(f"用一句话总结这段话：\n\n{state['paragraph']}")])
        return {"summaries": [reply.text]}

    def combine(state: ArticleState):
        return {"final_summary": "\n".join(state["summaries"])}

    builder = StateGraph(ArticleState)
    builder.add_node("split", split)
    builder.add_node("summarize_paragraph", summarize_paragraph)
    builder.add_node("combine", combine)
    builder.add_edge(START, "split")
    builder.add_conditional_edges("split", continue_to_summaries, ["summarize_paragraph"])
    builder.add_edge("summarize_paragraph", "combine")
    builder.add_edge("combine", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 7.3 子图
# build_failure_subgraph 已经写好：它读 logs，算出 failures（失败条数）。
# 在 build_parent_graph 里：把编译好的子图直接当成一个节点 "failure_analysis" 加进父图，
#   START -> failure_analysis -> report -> END
# 父图和子图共享 logs、failures 这两个键，所以不需要任何转换。
# report 节点已经写好。
# ---------------------------------------------------------------------------
class LogState(TypedDict):
    logs: list[dict]
    failures: int


class ParentState(TypedDict):
    logs: list[dict]
    failures: int
    report: str


def build_failure_subgraph():
    def count_failures(state: LogState):
        return {"failures": sum(1 for log in state["logs"] if log.get("status") == "fail")}

    sub = StateGraph(LogState)
    sub.add_node("count_failures", count_failures)
    sub.add_edge(START, "count_failures")
    sub.add_edge("count_failures", END)
    return sub.compile()


def report(state: ParentState):
    return {"report": f"共 {len(state['logs'])} 条日志，失败 {state['failures']} 条"}


def build_parent_graph():
    builder = StateGraph(ParentState)
    builder.add_node("failure_analysis", build_failure_subgraph())
    builder.add_node("report", report)
    builder.add_edge(START, "failure_analysis")
    builder.add_edge("failure_analysis", "report")
    builder.add_edge("report", END)
    return builder.compile()


def main():
    from kit import get_model

    model = get_model(["三路资料都说：LangGraph 是一个构建有状态 Agent 的框架。"])
    print(build_research_graph(model).invoke({"question": "LangGraph"})["answer"])

    model = get_model([lambda msgs: "总结：" + msgs[-1].content.split("\n\n", 1)[1][:12] + "…"])
    article = "LangGraph 用图来描述 Agent 的流程。\n\n节点是函数，边决定下一步。\n\n状态在节点之间流动。"
    print(build_summary_graph(model).invoke({"article": article})["final_summary"])


if __name__ == "__main__":
    main()
