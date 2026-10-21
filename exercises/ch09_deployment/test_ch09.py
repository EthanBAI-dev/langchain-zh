import asyncio
from pathlib import Path

from langgraph.graph.state import CompiledStateGraph

from kit import ScriptedChatModel


def test_graph_reads_config(ex):
    """9.1 图从 config 里读 system_prompt"""
    model = ScriptedChatModel(["ok"], loop=True)
    graph = ex.build_graph(lambda: model)
    graph.invoke({"messages": "hi"})
    graph.invoke({"messages": "hi"}, {"configurable": {"system_prompt": "Be brief."}})
    assert model.system_prompts() == ["You are a helpful assistant.", "Be brief."]


def test_langgraph_json(ex):
    """9.1 langgraph.json 指向模块里的 graph 变量"""
    file = Path(ex.__file__).name
    cfg = ex.langgraph_config(file)
    assert cfg.get("dependencies") == ["."]
    target = cfg["graphs"]["assistant"]
    path, _, attr = target.partition(":")
    assert path == f"./{file}" and attr == "graph", f"graphs.assistant 应该写成 ./{file}:graph，现在是 {target}"
    assert isinstance(ex.graph, CompiledStateGraph), "模块级变量 graph 必须是编译好的图，langgraph dev 才找得到"


def test_assistant_configs(ex):
    """9.2 两个 Assistant，共用一张图"""
    configs = ex.assistant_configs()
    assert set(configs) == {"中文助手", "English assistant"}
    model = ScriptedChatModel(["ok"], loop=True)
    graph = ex.build_graph(lambda: model)
    for cfg in configs.values():
        graph.invoke({"messages": "hi"}, cfg)
    zh, en = model.system_prompts()
    assert "中文" in zh and "English" in en


class FakeSDK:
    """模拟 langgraph_sdk 的异步客户端：run 先 pending，再 running，最后 success。"""

    def __init__(self):
        self.created = []
        self.polls = 0
        sdk = self

        class Threads:
            async def create(self):
                return {"thread_id": "thread-1"}

        class Runs:
            async def create(self, thread_id, assistant_id, input=None, **kw):
                sdk.created.append((thread_id, assistant_id, input))
                return {"run_id": "run-1", "status": "pending"}

            async def get(self, thread_id, run_id):
                sdk.polls += 1
                status = ["pending", "running", "running", "success"][min(sdk.polls - 1, 3)]
                return {"run_id": run_id, "thread_id": thread_id, "status": status}

        self.threads, self.runs = Threads(), Runs()


def test_background_run(ex):
    """9.3 创建后台 Run"""
    client = FakeSDK()
    ids = asyncio.run(ex.start_background_run(client, "assistant", "你好"))
    assert ids == ("thread-1", "run-1")
    assert client.created == [("thread-1", "assistant", {"messages": [{"role": "user", "content": "你好"}]})]


def test_wait_for_run(ex):
    """9.3 轮询直到 Run 完成"""
    client = FakeSDK()
    run = asyncio.run(ex.wait_for_run(client, "thread-1", "run-1", interval=0))
    assert run["status"] == "success"
    assert client.polls == 4, f"应该一直轮询到 success（第 4 次），实际轮询了 {client.polls} 次"
