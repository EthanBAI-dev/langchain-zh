"""第 14 章 部署与平台 · 练手：带 context 的可部署图、测试三板斧、SDK 人在回路、清理悬空工具调用。

对应教程：content/14-部署与平台.md
运行检查：pytest ch14_deployment
写出 langgraph.json：python ch14_deployment/exercise.py
然后可以在本目录运行 `langgraph dev`（需要 pip install "langgraph-cli[inmem]"）。
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from dataclasses import dataclass

from langchain_core.messages import AIMessage, RemoveMessage, ToolMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.runtime import Runtime
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 14.1 一张图，多个 assistant（教程练习 2）
# Context 有两个字段：persona（默认 "助手"）和 model（默认 "fast"）。
# echo 节点：返回 AIMessage(f"[{persona}/{model}] 收到：{最后一条消息的文本}")
#   调用时没传 context 的话 runtime.context 是 None，这时用默认的 Context()。
# langgraph_config(graph_file)：{"dependencies": ["."], "graphs": {"echo": f"./{graph_file}:graph"}}
# 部署后：client.assistants.create("echo", context={"persona": "海盗船长", "model": "strong"})
# ---------------------------------------------------------------------------
@dataclass
class Context:
    persona: str = "助手"   # TODO 14.1：再加一个 model 字段，默认 "fast"


def echo(state: MessagesState, runtime: Runtime[Context]):
    raise NotImplementedError("TODO 14.1b：还没写，按上面的提示完成它")


def build_echo_graph():
    builder = StateGraph(MessagesState, context_schema=Context)
    builder.add_node("echo", echo)
    builder.add_edge(START, "echo")
    builder.add_edge("echo", END)
    return builder.compile()


graph = build_echo_graph()  # langgraph dev 从这里加载


def langgraph_config(graph_file: str) -> dict:
    raise NotImplementedError("TODO 14.1c：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 14.2 测试图的三个套路（教程 14.10）
# create_pipeline 返回未编译的 builder：node1 -> node2 -> node3 -> node4，
# 每个节点都把 my_key 设为 f"hello from nodeN"。
# run_single_node：只运行 node1：app.nodes["node1"].invoke({"my_key": "init"})，返回它的更新
# run_partial：假装 node1 刚执行完（update_state(..., as_node="node1")），
#              再 invoke(None, config, interrupt_after=["node3"])，返回结果里的 my_key
# ---------------------------------------------------------------------------
class PipeState(TypedDict):
    my_key: str


def create_pipeline() -> StateGraph:
    builder = StateGraph(PipeState)
    for i in range(1, 5):
        builder.add_node(f"node{i}", lambda state, i=i: {"my_key": f"hello from node{i}"})
    builder.add_edge(START, "node1")
    for i in range(1, 4):
        builder.add_edge(f"node{i}", f"node{i + 1}")
    builder.add_edge("node4", END)
    return builder


def run_single_node(app) -> dict:
    raise NotImplementedError("TODO 14.2a：还没写，按上面的提示完成它")


def run_partial(app, thread_id: str = "partial") -> str:
    raise NotImplementedError("TODO 14.2b：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 14.3 在服务器上做人在回路（教程练习 3）
# 用异步 SDK 客户端：
#   1. t = await client.threads.create()
#   2. await client.runs.wait(t["thread_id"], assistant_id, input=inputs)     # 跑到中断
#   3. st = await client.threads.get_state(t["thread_id"])
#      questions = [i["value"] for i in st["interrupts"]]
#   4. final = await client.runs.wait(t["thread_id"], assistant_id, command={"resume": resume})
#   返回 (questions, final)
# ---------------------------------------------------------------------------
async def review_on_server(client, assistant_id: str, inputs: dict, resume):
    raise NotImplementedError("TODO 14.3：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 14.4 清理"悬空"的工具调用（教程练习 4）
# 用户连发消息（double texting）时，上一次 run 可能刚发出 tool_calls 就被打断，
# 线程里留下一条"有 tool_calls 却没有对应 ToolMessage"的 AIMessage——下次调模型会被 API 拒绝。
# clean_dangling 节点：找出所有这种 AIMessage，用 RemoveMessage 删掉它们。
# 只要有一个 tool_call 没有对应的 ToolMessage（看 tool_call_id），就算悬空。
# ---------------------------------------------------------------------------
def clean_dangling(state: MessagesState):
    raise NotImplementedError("TODO 14.4：还没写，按上面的提示完成它")


def main():
    import json

    here = pathlib.Path(__file__).parent
    (here / "langgraph.json").write_text(json.dumps(langgraph_config(pathlib.Path(__file__).name), indent=2))
    print("已写出", here / "langgraph.json")
    for ctx in (Context(persona="海盗船长", model="strong"), Context(persona="语文老师")):
        print(graph.invoke({"messages": "你好"}, context=ctx)["messages"][-1].text)
    app = create_pipeline().compile(checkpointer=InMemorySaver())
    print(run_single_node(app), run_partial(app))


if __name__ == "__main__":
    main()
