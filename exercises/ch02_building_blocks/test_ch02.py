from kit import ScriptedChatModel, ai, call


def test_calculator_power(ex):
    """2.1 计算器改名为 calculator 并支持 power"""
    calc = ex.calculator
    assert calc.name == "calculator", f"工具名应该是 calculator，现在是 {calc.name}"
    assert calc.invoke({"a": 2, "b": 10, "operation": "power"}) == 1024
    assert calc.invoke({"a": 6, "b": 3, "operation": "divide"}) == 2
    assert "power" in str(calc.args["operation"]), "operation 的 Literal 里要加上 \"power\""
    assert "power" in calc.description.lower(), "描述里要提到 power，模型才知道可以算幂"


def test_progress_events(ex):
    """2.2 + 2.3 工具推送的进度能被收集到"""
    agent = ex.build_agent(ScriptedChatModel([call("get_weather", {"city": "上海"}), ai("上海晴")]))
    progress = ex.collect_progress(agent, "上海天气怎么样？")
    assert progress == ["正在查询：上海", "查询完成：上海"], f"收到的进度是 {progress}"


def test_node_sequence(ex):
    """2.4 updates 模式下能看出 model → tools → model"""
    agent = ex.build_agent(ScriptedChatModel([call("calculator", {"a": 2, "b": 3, "operation": "add"}), ai("5")]))
    assert ex.node_sequence(agent, "2+3") == ["model", "tools", "model"]


def test_node_sequence_no_tools(ex):
    """2.4 不用工具时只有一步 model"""
    agent = ex.build_agent(ScriptedChatModel([ai("你好")]))
    assert ex.node_sequence(agent, "hi") == ["model"]
