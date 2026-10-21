"""第 0 章 环境准备 · 练手：第一张小图、看它一步步运行、写 langgraph.json。

对应教程：content/00-环境准备.md
运行检查：pytest ch00_setup
运行演示：python ch00_setup/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from importlib.metadata import version

from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


class State(TypedDict):
    text: str


def greet(state: State):
    return {"text": "你好，" + state["text"]}


# ---------------------------------------------------------------------------
# 练习 0.1 改一改 shout（教程练习 1）
# 让 shout 在末尾追加 "！！！"（三个全角感叹号）。
# ---------------------------------------------------------------------------
def shout(state: State):
    raise NotImplementedError("TODO 0.1：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 0.2 组装并编译：START -> greet -> shout -> END
# ---------------------------------------------------------------------------
def build_graph():
    raise NotImplementedError("TODO 0.2：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 0.3 逐步观察
# 用 graph.stream(inputs)（默认 updates 模式）跑一遍，
# 返回 [(节点名, 该节点写入的 text), ...]，例如 [("greet", "你好，X"), ("shout", "你好，X！！！")]
# ---------------------------------------------------------------------------
def trace_steps(graph, text: str) -> list[tuple[str, str]]:
    raise NotImplementedError("TODO 0.3：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 0.4 写 langgraph.json（教程练习 4）
# 返回一个字典，让 langgraph dev 能找到名叫 "hello" 的图：
#   {"dependencies": ["."], "graphs": {"hello": f"./{graph_file}:graph"}}
# ---------------------------------------------------------------------------
def langgraph_config(graph_file: str) -> dict:
    raise NotImplementedError("TODO 0.4：还没写，按上面的提示完成它")


try:
    graph = build_graph()  # langgraph dev 会从这里加载图
except NotImplementedError:
    graph = None


def installed_versions() -> dict[str, str]:
    """已经写好：看看装的版本。"""
    return {"langgraph": version("langgraph"), "langchain": version("langchain")}


def main():
    import json

    print(installed_versions())
    for step in trace_steps(graph, "LangGraph"):
        print(step)
    here = pathlib.Path(__file__).parent
    (here / "langgraph.json").write_text(json.dumps(langgraph_config(pathlib.Path(__file__).name), indent=2))
    print("已写出 langgraph.json，可以在本目录运行 langgraph dev")


if __name__ == "__main__":
    main()
