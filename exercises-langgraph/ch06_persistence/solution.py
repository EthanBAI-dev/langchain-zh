# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 6 章 持久化与时间旅行 · 练手：用 as_node 分叉、重试 + 错误补偿、节点缓存。

对应教程：content/06-持久化与时间旅行.md
运行检查：pytest ch06_persistence
运行演示：python ch06_persistence/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from langchain_core.messages import HumanMessage
from langgraph.cache.memory import InMemoryCache
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.errors import NodeError
from langgraph.graph import END, START, StateGraph
from langgraph.types import CachePolicy, Command, RetryPolicy
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 6.1 分叉时直接"扮演"某个节点（教程练习 2）
# 笑话图：START -> generate_topic -> write_joke -> END（已经写好）。
# fork_with_topic：
#   1. 在 graph.get_state_history(config) 里找到 next == ("generate_topic",) 的检查点
#   2. graph.update_state(它的 config, {"topic": topic}, as_node="generate_topic")
#      —— 相当于宣布"generate_topic 已经跑完了，输出是这个"
#   3. graph.invoke(None, 新 config)，返回结果
# 这样 generate_topic 不会再运行，直接从 write_joke 开始。
# ---------------------------------------------------------------------------
class JokeState(TypedDict, total=False):
    topic: str
    joke: str


def build_joke_graph(model, calls: list):
    """calls 用来记录每个节点被运行了几次。"""

    def generate_topic(state: JokeState):
        calls.append("generate_topic")
        return {"topic": "ice cream"}

    def write_joke(state: JokeState):
        calls.append("write_joke")
        return {"joke": model.invoke([HumanMessage(f"Write a joke about {state['topic']}")]).text}

    builder = StateGraph(JokeState)
    builder.add_node("generate_topic", generate_topic)
    builder.add_node("write_joke", write_joke)
    builder.add_edge(START, "generate_topic")
    builder.add_edge("generate_topic", "write_joke")
    builder.add_edge("write_joke", END)
    return builder.compile(checkpointer=InMemorySaver())


def fork_with_topic(graph, config, topic: str):
    before = next(s for s in graph.get_state_history(config) if s.next == ("generate_topic",))
    fork_config = graph.update_state(before.config, {"topic": topic}, as_node="generate_topic")
    return graph.invoke(None, fork_config)


# ---------------------------------------------------------------------------
# 练习 6.2 重试 + 错误补偿（教程练习 4）
# call_api 调用一个"不稳定的外部 API"，它前几次会抛 ConnectionError。
# build_resilient_graph(api, max_attempts)：
#   - call_api 节点返回 {"status": api()}
#   - 给它配 retry_policy=RetryPolicy(max_attempts=max_attempts, retry_on=ConnectionError,
#                                     initial_interval=0.01, jitter=False)
#   - 再配 error_handler=on_error：重试用尽后跳到 finalize，并把 status 标记为 "degraded"
#   - START -> call_api -> finalize -> END
# finalize 已经写好，会在 status 后面加 " | finalized"。
# ---------------------------------------------------------------------------
class ApiState(TypedDict):
    status: str


def make_flaky_api(fail_times: int):
    """前 fail_times 次调用抛 ConnectionError，之后返回 "ok"。"""
    counter = {"n": 0}

    def api():
        counter["n"] += 1
        if counter["n"] <= fail_times:
            raise ConnectionError(f"第 {counter['n']} 次调用失败")
        return "ok"

    api.counter = counter
    return api


def finalize(state: ApiState):
    return {"status": state["status"] + " | finalized"}


def on_error(state: ApiState, error: NodeError) -> Command:
    return Command(update={"status": "degraded"}, goto="finalize")


def build_resilient_graph(api, max_attempts: int):
    builder = StateGraph(ApiState)
    builder.add_node(
        "call_api",
        lambda state: {"status": api()},
        retry_policy=RetryPolicy(max_attempts=max_attempts, retry_on=ConnectionError,
                                 initial_interval=0.01, jitter=False),
        error_handler=on_error,
    )
    builder.add_node("finalize", finalize)
    builder.add_edge(START, "call_api")
    builder.add_edge("call_api", "finalize")
    builder.add_edge("finalize", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 6.3 节点缓存：同样的输入不重复计算
# expensive 节点很慢（这里用一个计数函数代替）。给它配 cache_policy=CachePolicy(ttl=60)，
# 编译时传 cache=InMemoryCache()。同样的输入第二次 invoke 时，节点函数不应再被调用。
# ---------------------------------------------------------------------------
class SquareState(TypedDict):
    x: int
    y: int


def build_cached_graph(compute):
    builder = StateGraph(SquareState)
    builder.add_node("expensive", lambda s: {"y": compute(s["x"])}, cache_policy=CachePolicy(ttl=60))
    builder.add_edge(START, "expensive")
    builder.add_edge("expensive", END)
    return builder.compile(cache=InMemoryCache())


def main():
    from kit import get_model

    calls = []
    model = get_model(["Why did the ice cream blush? It saw the milkshake!", "Why do cats love computers? The mouse!"])
    graph = build_joke_graph(model, calls)
    config = {"configurable": {"thread_id": "1"}}
    print(graph.invoke({}, config)["joke"])
    print(fork_with_topic(graph, config, "cats")["joke"])
    print("节点运行记录：", calls)

    for attempts in (3, 2):
        api = make_flaky_api(fail_times=2)
        print(f"max_attempts={attempts}:", build_resilient_graph(api, attempts).invoke({"status": ""}))


if __name__ == "__main__":
    main()
