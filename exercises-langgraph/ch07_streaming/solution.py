# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 7 章 流式输出 · 练手：v2 统一格式、自定义进度条、nostream 过滤 token。

对应教程：content/07-流式输出.md
运行检查：pytest ch07_streaming
运行演示：python ch07_streaming/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from langchain_core.messages import HumanMessage
from langgraph.config import get_stream_writer
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


class TopicState(TypedDict, total=False):
    topic: str
    joke: str


def build_topic_graph():
    """已经写好：refine_topic -> generate_joke。"""
    builder = StateGraph(TopicState)
    builder.add_node("refine_topic", lambda s: {"topic": s["topic"] + "和猫"})
    builder.add_node("generate_joke", lambda s: {"joke": f"一个关于{s['topic']}的笑话"})
    builder.add_edge(START, "refine_topic")
    builder.add_edge("refine_topic", "generate_joke")
    builder.add_edge("generate_joke", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 7.1 v2 统一格式（教程练习 1）
# 用 graph.stream(inputs, stream_mode=modes, version="v2") 跑一遍，
# 按 chunk["type"] 分组，返回 {模式名: [这个模式下收到的 data, ...]}。
# ---------------------------------------------------------------------------
def collect_by_type(graph, inputs: dict, modes: list[str]) -> dict[str, list]:
    out: dict[str, list] = {}
    for chunk in graph.stream(inputs, stream_mode=modes, version="v2"):
        out.setdefault(chunk["type"], []).append(chunk["data"])
    return out


# ---------------------------------------------------------------------------
# 练习 7.2 进度条（教程练习 2）
# long_job：循环 i = 1..5，每次 writer({"progress": i * 20})，最后返回 {"done": True}。
# progress_bars：用 stream_mode="custom" 收集进度，每条转成进度条字符串：
#   40 -> "■■□□□ 40%"（每 20% 一个 ■，总共 5 格）
# ---------------------------------------------------------------------------
class JobState(TypedDict, total=False):
    done: bool


def long_job(state: JobState):
    writer = get_stream_writer()
    for i in range(1, 6):
        writer({"progress": i * 20})
    return {"done": True}


def build_job_graph():
    builder = StateGraph(JobState)
    builder.add_node("long_job", long_job)
    builder.add_edge(START, "long_job")
    builder.add_edge("long_job", END)
    return builder.compile()


def progress_bars(graph) -> list[str]:
    bars = []
    for event in graph.stream({}, stream_mode="custom"):
        p = event["progress"]
        bars.append("■" * (p // 20) + "□" * (5 - p // 20) + f" {p}%")
    return bars


# ---------------------------------------------------------------------------
# 练习 7.3 不让某个模型的 token 进流（教程练习 3）
# build_poem_graph：write_joke 和 write_poem 两个节点并行（都从 START 出发，都连到 END）。
#   - write_joke 用 joke_model，结果写 joke
#   - write_poem 用 poem_model.with_config(tags=["nostream"])，结果写 poem
# stream_text_by_node：用 stream_mode="messages" 跑，把 token 按 metadata["langgraph_node"]
#   拼起来，返回 {节点名: 拼好的文本}。
# 结果：流里只有 write_joke；但最终状态里 poem 依然存在。
# ---------------------------------------------------------------------------
class PoemState(TypedDict, total=False):
    topic: str
    joke: str
    poem: str


def build_poem_graph(joke_model, poem_model):
    quiet_poem_model = poem_model.with_config(tags=["nostream"])

    def write_joke(state: PoemState):
        return {"joke": joke_model.invoke([HumanMessage(f"Joke about {state['topic']}")]).text}

    def write_poem(state: PoemState):
        return {"poem": quiet_poem_model.invoke([HumanMessage(f"Poem about {state['topic']}")]).text}

    builder = StateGraph(PoemState)
    builder.add_node("write_joke", write_joke)
    builder.add_node("write_poem", write_poem)
    builder.add_edge(START, "write_joke")
    builder.add_edge(START, "write_poem")
    builder.add_edge("write_joke", END)
    builder.add_edge("write_poem", END)
    return builder.compile()


def stream_text_by_node(graph, inputs: dict) -> dict[str, str]:
    out: dict[str, str] = {}
    for token, metadata in graph.stream(inputs, stream_mode="messages"):
        node = metadata["langgraph_node"]
        out[node] = out.get(node, "") + token.text
    return out


def main():
    from kit import get_model

    print(collect_by_type(build_topic_graph(), {"topic": "冰淇淋"}, ["values", "updates"]))
    for bar in progress_bars(build_job_graph()):
        print(bar)
    graph = build_poem_graph(get_model(["一只猫走进了冰淇淋店……"]), get_model(["猫咪轻轻跳，月光静悄悄"]))
    print(stream_text_by_node(graph, {"topic": "猫"}))


if __name__ == "__main__":
    main()
