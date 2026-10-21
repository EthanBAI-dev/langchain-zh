from langchain_core.messages import ToolMessage

from kit import ScriptedChatModel, ai, call


def _tool_outputs(result):
    return [m.content for m in result["messages"] if isinstance(m, ToolMessage)]


def test_calculator_records_ops(ex):
    """10.1 工具用 Command 同时更新 messages 和 ops"""
    model = ScriptedChatModel([
        call("calculator_wstate", {"operation": "add", "a": 3, "b": 4}),
        call("calculator_wstate", {"operation": "multiply", "a": 7, "b": 2}),
        ai("14"),
    ])
    result = ex.build_calc_agent(model).invoke({"messages": "(3+4)*2"})
    assert _tool_outputs(result) == ["7", "14"]
    assert result["ops"] == ["(add, 3, 4)", "(multiply, 7, 2)"], f"ops 是 {result.get('ops')}"


def test_virtual_files(ex):
    """10.2 写文件、列目录、读文件"""
    model = ScriptedChatModel([
        call("write_file", {"file_path": "notes.md", "content": "第一行\n第二行"}),
        call("ls", {}),
        call("read_file", {"file_path": "notes.md"}),
        call("read_file", {"file_path": "missing.md"}),
        ai("done"),
    ])
    result = ex.build_file_agent(model).invoke({"messages": "试试文件系统"})
    out = _tool_outputs(result)
    assert out[0] == "Updated file notes.md"
    assert "notes.md" in out[1], "ls 应该列出刚写入的文件"
    assert out[2] == "     1\t第一行\n     2\t第二行", f"read_file 的格式不对：{out[2]!r}"
    assert out[3] == "Error: File 'missing.md' not found"
    assert result["files"] == {"notes.md": "第一行\n第二行"}


def test_notes_agent(ex):
    """10.3 create_deep_agent 读书笔记助手能写文件"""
    model = ScriptedChatModel([
        call("write_file", {"file_path": "/notes/ch1.md", "content": "# 第一章\n要点"}),
        ai("写好了"),
    ])
    agent = ex.build_notes_agent(model)
    result = agent.invoke({"messages": "第一章：……"})
    assert "/notes/ch1.md" in result["files"]
    assert {"write_file", "task"} <= set(model.bound_tools), "deepagents 自带 write_file 和 task 工具"
    assert "reading-notes assistant" in model.system_prompts()[0], "要传 system_prompt=NOTES_INSTRUCTIONS"


def test_notes_agent_has_writer(ex):
    """10.3 主 Agent 能把任务委派给 writer-agent"""
    model = ScriptedChatModel([
        call("task", {"description": "Summarize /notes", "subagent_type": "writer-agent"}),
        ai("总结报告已完成"),   # 子智能体的回答
        ai("全部完成"),         # 主 Agent 的最终回答
    ])
    result = ex.build_notes_agent(model).invoke({"messages": "写总结"})
    out = _tool_outputs(result)
    assert out and "总结报告已完成" in out[0], f"task 工具应该成功调用 writer-agent，实际返回：{out}"
    assert any("turn chapter notes" in p for p in model.system_prompts()), "子智能体要用 WRITER_INSTRUCTIONS"
