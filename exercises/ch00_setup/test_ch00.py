from langchain_core.messages import HumanMessage, SystemMessage

from kit import ScriptedChatModel


def test_versions(ex):
    """0.1 能读出 langchain / langgraph 的版本号"""
    v = ex.installed_versions()
    assert set(v) >= {"langchain", "langgraph"}, "字典里要有 langchain 和 langgraph 两个键"
    assert v["langchain"].startswith("1."), f"教程基于 LangChain 1.x，你装的是 {v['langchain']}"
    assert v["langgraph"].startswith("1."), f"教程基于 LangGraph 1.x，你装的是 {v['langgraph']}"


def test_build_messages(ex):
    """0.2 拼出 系统消息 + 用户消息"""
    msgs = ex.build_messages("什么是 Agent？", persona="一位程序员")
    assert len(msgs) == 2, "应该正好两条消息"
    assert isinstance(msgs[0], SystemMessage) and msgs[0].content == "你是一位程序员。"
    assert isinstance(msgs[1], HumanMessage) and msgs[1].content == "什么是 Agent？"


def test_ask(ex):
    """0.3 调用模型并返回纯文本"""
    model = ScriptedChatModel(["Agent 就是会自己用工具的模型。"])
    answer = ex.ask(model, "什么是 Agent？")
    assert answer == "Agent 就是会自己用工具的模型。", "要返回回复的纯文本（.text），而不是整条消息"
    sent = model.calls[0]
    assert [m.type for m in sent] == ["system", "human"], "发给模型的应该是 build_messages 拼好的两条消息"
