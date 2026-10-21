import asyncio
from pathlib import Path

from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph

from kit import call


def test_context_persona(ex):
    """14.1 context 决定 persona 和 model"""
    assert {"persona", "model"} <= set(ex.Context.__dataclass_fields__)
    out = ex.graph.invoke({"messages": "你好"}, context=ex.Context(persona="海盗船长", model="strong"))
    assert out["messages"][-1].content == "[海盗船长/strong] 收到：你好"
    out = ex.graph.invoke({"messages": "hi"})
    assert out["messages"][-1].content == "[助手/fast] 收到：hi"


def test_langgraph_json(ex):
    """14.1 langgraph.json 指向 graph"""
    file = Path(ex.__file__).name
    assert ex.langgraph_config(file) == {"dependencies": ["."], "graphs": {"echo": f"./{file}:graph"}}


def test_single_node(ex):
    """14.2 只运行一个节点"""
    app = ex.create_pipeline().compile(checkpointer=InMemorySaver())
    assert ex.run_single_node(app) == {"my_key": "hello from node1"}


def test_partial(ex):
    """14.2 从中间开始、跑到 node3 停下"""
    app = ex.create_pipeline().compile(checkpointer=InMemorySaver())
    assert ex.run_partial(app) == "hello from node3"
    assert app.get_state({"configurable": {"thread_id": "partial"}}).next == ("node4",)


class FakeSDK:
    def __init__(self):
        self.calls = []
        sdk = self

        class Threads:
            async def create(self):
                return {"thread_id": "t-1"}

            async def get_state(self, thread_id):
                sdk.calls.append(("get_state", thread_id))
                return {"next": ["review"], "interrupts": [{"value": {"question": "可以发送吗？"}, "id": "i1"}]}

        class Runs:
            async def wait(self, thread_id, assistant_id, *, input=None, command=None, **kw):
                sdk.calls.append(("wait", thread_id, assistant_id, input, command))
                if command:
                    return {"draft": "周六见", "approved": command["resume"]}
                return {"draft": "周六见", "__interrupt__": [{"value": {"question": "可以发送吗？"}}]}

        self.threads, self.runs = Threads(), Runs()


def test_review_on_server(ex):
    """14.3 用 SDK 跑到中断、查看、再恢复"""
    client = FakeSDK()
    questions, final = asyncio.run(ex.review_on_server(client, "hitl", {"draft": "周六见"}, "同意"))
    assert questions == [{"question": "可以发送吗？"}]
    assert final == {"draft": "周六见", "approved": "同意"}
    assert client.calls[0] == ("wait", "t-1", "hitl", {"draft": "周六见"}, None)
    assert client.calls[1] == ("get_state", "t-1")
    assert client.calls[2][4] == {"resume": "同意"}


def test_clean_dangling(ex):
    """14.4 删掉没有结果的工具调用"""
    ok_call = call("search", {"q": "a"})
    dangling = call("search", {"q": "b"})
    msgs = [
        HumanMessage("q1", id="h1"), ok_call.model_copy(update={"id": "ai1"}),
        ToolMessage("r", tool_call_id=ok_call.tool_calls[0]["id"], id="t1"), AIMessage("a1", id="ai2"),
        HumanMessage("q2", id="h2"), dangling.model_copy(update={"id": "ai3"}),
        HumanMessage("q3（连发）", id="h3"),
    ]
    builder = StateGraph(MessagesState)
    builder.add_node("clean", ex.clean_dangling)
    builder.add_edge(START, "clean")
    builder.add_edge("clean", END)
    out = builder.compile().invoke({"messages": msgs})["messages"]
    assert [m.id for m in out] == ["h1", "ai1", "t1", "ai2", "h2", "h3"]
