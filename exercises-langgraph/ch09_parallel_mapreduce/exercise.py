"""第 9 章 并行与 Map-Reduce · 练手：defer 等待、Send 带参数、长文分段总结。

对应教程：content/09-并行与MapReduce.md
运行检查：pytest ch09_parallel_mapreduce
运行演示：python ch09_parallel_mapreduce/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

import operator
from typing import Annotated

from langchain_core.messages import HumanMessage
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 9.1 只走了一条分支时，汇合节点还能运行吗？（教程练习 2）
# a 之后用条件边只选 b（不选 c），b 和 c 都连到 d。
# 用 add_edge(["b", "c"], "d") 的话，d 要等 b 和 c 都完成——c 没运行，d 就永远不会运行。
# 改用：add_node("d", ..., defer=True)，再分别 add_edge("b", "d")、add_edge("c", "d")。
# defer=True 表示"等这一轮所有能跑的分支都跑完再运行"，d 会正好运行一次。
# ---------------------------------------------------------------------------
class PathState(TypedDict):
    path: Annotated[list[str], operator.add]


def build_selective_graph():
    builder = StateGraph(PathState)
    builder.add_node("a", lambda s: {"path": ["a"]})
    builder.add_node("b", lambda s: {"path": ["b"]})
    builder.add_node("c", lambda s: {"path": ["c"]})
    builder.add_edge(START, "a")
    builder.add_conditional_edges("a", lambda s: ["b"], ["b", "c"])  # 只选 b
    builder.add_node("d", lambda s: {"path": ["d"]})
    builder.add_edge(["b", "c"], "d")   # TODO 9.1：d 永远等不到 c
    builder.add_edge("d", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 9.2 每个话题生成 n 条笑话，再选出全场最佳（教程练习 3）
# continue_to_jokes：为每个 subject 发 Send("generate_joke", {"subject": s, "n": state["n"]})
# generate_joke：调用模型 n 次（提示语 f"Tell a joke about {subject}"），返回 {"jokes": [...]}
# pick_best：把最长的那条当作最佳（真实场景可以让模型来选），返回 {"best_joke": ...}
# ---------------------------------------------------------------------------
class JokesState(TypedDict):
    subjects: list[str]
    n: int
    jokes: Annotated[list[str], operator.add]
    best_joke: str


class JokeTask(TypedDict):
    subject: str
    n: int


def continue_to_jokes(state: JokesState):
    raise NotImplementedError("TODO 9.2a：还没写，按上面的提示完成它")


def build_jokes_graph(model):
    def generate_joke(task: JokeTask):
        raise NotImplementedError("TODO 9.2b：还没写，按上面的提示完成它")

    def pick_best(state: JokesState):
        raise NotImplementedError("TODO 9.2c：还没写，按上面的提示完成它")

    builder = StateGraph(JokesState)
    builder.add_node("generate_joke", generate_joke)
    builder.add_node("pick_best", pick_best)
    builder.add_conditional_edges(START, continue_to_jokes, ["generate_joke"])
    builder.add_edge("generate_joke", "pick_best")
    builder.add_edge("pick_best", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 9.3 长文分段总结（教程练习 4）
# chunk_text：每 size 个字切一段（最后一段可以短一些）。
# fan_out：为每一段发 Send("summarize", {"index": 序号, "chunk": 段落})，序号从 0 开始。
# summarize 节点（已写好）返回 {"summaries": [(index, 总结)]}——并行完成的顺序不确定，
# combine：按 index 排序后，用换行把总结拼起来，返回 {"final": ...}
# ---------------------------------------------------------------------------
class DocState(TypedDict):
    text: str
    summaries: Annotated[list[tuple[int, str]], operator.add]
    final: str


def chunk_text(text: str, size: int = 200) -> list[str]:
    raise NotImplementedError("TODO 9.3a：还没写，按上面的提示完成它")


def fan_out(state: DocState):
    raise NotImplementedError("TODO 9.3b：还没写，按上面的提示完成它")


def combine(state: DocState):
    raise NotImplementedError("TODO 9.3c：还没写，按上面的提示完成它")


def build_doc_graph(model):
    def summarize(task: dict):
        reply = model.invoke([HumanMessage(f"用一句话总结：{task['chunk']}")])
        return {"summaries": [(task["index"], reply.text)]}

    builder = StateGraph(DocState)
    builder.add_node("summarize", summarize)
    builder.add_node("combine", combine)
    builder.add_conditional_edges(START, fan_out, ["summarize"])
    builder.add_edge("summarize", "combine")
    builder.add_edge("combine", END)
    return builder.compile()


def main():
    from kit import get_model

    print(build_selective_graph().invoke({"path": []}))
    model = get_model(["Why did the cat sit on the computer? To keep an eye on the mouse!", "Dogs!"])
    out = build_jokes_graph(model).invoke({"subjects": ["cats", "dogs"], "n": 2})
    print("最佳：", out["best_joke"])
    model = get_model([lambda msgs: "总结：" + msgs[-1].content[7:17] + "…"])
    print(build_doc_graph(model).invoke({"text": "LangGraph 让你用图来编排 Agent。" * 20})["final"])


if __name__ == "__main__":
    main()
