"""第 9 章 部署上线 · 练手：langgraph.json、Assistant 配置、轮询后台 Run。

对应教程：content/09-部署上线.md
运行检查：pytest ch09_deployment
写出 langgraph.json：python ch09_deployment/exercise.py
然后可以在本目录运行 `langgraph dev`（需要 pip install "langgraph-cli[inmem]"）在 Studio 里打开它。
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

import asyncio
import json
from pathlib import Path

from langchain_core.messages import SystemMessage
from langchain_core.runnables.config import RunnableConfig
from langgraph.graph import END, START, MessagesState, StateGraph

_model = None


def get_deploy_model():
    """部署时用的模型：第一次用到时才创建（设置 LC_MODEL 就是真模型）。"""
    global _model
    if _model is None:
        from kit import get_model

        _model = get_model(["Hello from the deployed graph! / 你好，我是部署好的图！"])
    return _model


# ---------------------------------------------------------------------------
# 练习 9.1 写一张"可部署"的图，并生成 langgraph.json
# build_graph(model_getter)：一张只有一个 "assistant" 节点的图。
#   assistant 从 config["configurable"] 里读 "system_prompt"（读不到就用 "You are a helpful assistant."），
#   把它作为 SystemMessage 放在对话最前面，调用 model_getter() 得到的模型，返回回复。
#   （练习 9.2 会用不同的 system_prompt 做出两个 Assistant。）
# langgraph_config(graph_file)：返回 langgraph.json 的内容（一个字典）：
#   {"dependencies": ["."], "graphs": {"assistant": f"./{graph_file}:graph"}, "env": ".env"}
# ---------------------------------------------------------------------------
def build_graph(model_getter=get_deploy_model):
    raise NotImplementedError("TODO 9.1a：还没写，按上面的提示完成它")


def langgraph_config(graph_file: str) -> dict:
    raise NotImplementedError("TODO 9.1b：还没写，按上面的提示完成它")


# langgraph dev 会从这里找到图（模块级变量 graph）
try:
    graph = build_graph()
except NotImplementedError:
    graph = None


# ---------------------------------------------------------------------------
# 练习 9.2 一张图，两个 Assistant（教程练习 3）
# 返回一个字典：Assistant 名字 -> 它的 config。要有两个：
#   "中文助手"：system_prompt 要求"请始终用中文回答。"
#   "English assistant"：system_prompt 要求 "Always answer in English."
# 形如 {"中文助手": {"configurable": {"system_prompt": "..."}}, ...}
# 部署后可以用 client.assistants.create("assistant", config=...) 真的创建它们。
# ---------------------------------------------------------------------------
def assistant_configs() -> dict[str, dict]:
    raise NotImplementedError("TODO 9.2：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 9.3 创建后台 Run 并轮询状态（教程练习 2）
# start_background_run：
#   thread = await client.threads.create()
#   run = await client.runs.create(thread["thread_id"], assistant_id,
#                                  input={"messages": [{"role": "user", "content": question}]})
#   返回 (thread["thread_id"], run["run_id"])
# wait_for_run：每隔 interval 秒调用 await client.runs.get(thread_id, run_id)，
#   直到 status 不再是 "pending" / "running"，返回最后拿到的 run 字典。
#   提示：await asyncio.sleep(interval)
# ---------------------------------------------------------------------------
async def start_background_run(client, assistant_id: str, question: str) -> tuple[str, str]:
    raise NotImplementedError("TODO 9.3a：还没写，按上面的提示完成它")


async def wait_for_run(client, thread_id: str, run_id: str, interval: float = 1.0) -> dict:
    raise NotImplementedError("TODO 9.3b：还没写，按上面的提示完成它")


def main():
    here = Path(__file__).parent
    (here / "langgraph.json").write_text(json.dumps(langgraph_config(Path(__file__).name), indent=2))
    print("已写出", here / "langgraph.json")
    for name, config in assistant_configs().items():
        print(name, "→", graph.invoke({"messages": "Hi!"}, config)["messages"][-1].text)


if __name__ == "__main__":
    main()
