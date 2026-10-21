import pytest
from langchain_core.messages import ToolMessage

from kit import ScriptedChatModel, ai, call
from kit.chinook import make_db


@pytest.mark.parametrize(
    "query, ok",
    [
        ("SELECT Name FROM Track", True),
        ("  select 1;", True),
        ("WITH t AS (SELECT 1) SELECT * FROM t", True),
        ("DELETE FROM Invoice", False),
        ("drop table Track", False),
        ("SELECT 1; DROP TABLE Track", False),
        ("", False),
    ],
)
def test_is_read_only(ex, query, ok):
    """1.1 is_read_only 能分辨只读和危险语句"""
    assert ex.is_read_only(query) is ok, f"is_read_only({query!r}) 应该是 {ok}"


def _run(ex, script, db=None):
    db = db or make_db()
    model = ScriptedChatModel(script)
    agent = ex.build_agent(model)
    result = agent.invoke({"messages": "question"}, context=ex.RuntimeContext(db=db))
    tools = [m for m in result["messages"] if isinstance(m, ToolMessage)]
    return model, result, tools, db


def test_agent_runs_select(ex):
    """1.2 + 1.3 Agent 能调用 execute_sql 查到数据"""
    model, result, tools, _ = _run(ex, [
        call("execute_sql", {"query": "SELECT Name FROM Genre ORDER BY GenreId"}),
        ai("一共有 3 种流派。"),
    ])
    assert "execute_sql" in model.bound_tools, "create_agent 时要把 execute_sql 放进 tools"
    assert "Read-only" in model.system_prompts()[0], "别忘了传 system_prompt=SYSTEM_PROMPT"
    assert tools and "Rock" in tools[0].content, "工具应该返回 db.run(query) 的查询结果"
    assert result["messages"][-1].content == "一共有 3 种流派。"


def test_tool_blocks_writes(ex):
    """1.2 写操作在工具层被拦下，数据库没被改"""
    _, _, tools, db = _run(ex, [call("execute_sql", {"query": "DELETE FROM Invoice"}), ai("好的")])
    assert tools[0].content.startswith("Error"), "非只读语句要返回以 Error 开头的字符串"
    assert db.count("Invoice") == 3, "Invoice 表被删了！工具必须先检查再执行"


def test_tool_returns_errors(ex):
    """1.2 SQL 出错时把错误信息还给模型"""
    _, _, tools, _ = _run(ex, [call("execute_sql", {"query": "SELECT * FROM NoSuchTable"}), ai("抱歉")])
    assert tools[0].content.startswith("Error:"), "执行出错时不要抛异常，返回 f'Error: {e}'"
    assert "NoSuchTable" in tools[0].content


def test_count_tool_calls(ex):
    """1.4 数清楚一共调用了几次工具"""
    _, result, _, _ = _run(ex, [
        call("execute_sql", {"query": "SELECT 1"}),
        call("execute_sql", {"query": "SELECT 2"}, ("execute_sql", {"query": "SELECT 3"})),
        ai("完成"),
    ])
    assert ex.count_tool_calls(result["messages"]) == 3
