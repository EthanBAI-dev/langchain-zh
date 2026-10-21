# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 15 章 综合项目：邮件助理 · 练手：审核哪些工具、按优先级分诊、处理人类反馈并记住偏好。

对应教程：content/15-综合项目-邮件助理.md
运行检查：pytest ch15_email_assistant
运行演示：python ch15_email_assistant/exercise.py

这里是教程 15.6–15.7 节 v2 邮件助理的精简版：分诊 → 回复 Agent → 人在回路 → 记忆。
为了离线可测，"更新偏好"用简单的追加代替了 LLM（真实版本见教程 15.7）。
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from datetime import datetime
from typing import Literal

from langchain_core.tools import tool
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.runtime import Runtime
from langgraph.store.base import BaseStore
from langgraph.store.memory import InMemoryStore
from langgraph.types import Command, interrupt
from pydantic import BaseModel, Field
from typing_extensions import TypedDict


# ===== 共享部分：工具、邮件、记忆（已写好） =====================================
@tool
def write_email(to: str, subject: str, content: str) -> str:
    """Write and send an email."""
    return f"Email sent to {to} with subject '{subject}'"


@tool
def schedule_meeting(attendees: list[str], subject: str, duration_minutes: int,
                     preferred_day: datetime, start_time: int) -> str:
    """Schedule a calendar meeting."""
    return (f"Meeting '{subject}' scheduled on {preferred_day:%Y-%m-%d} at {start_time} "
            f"for {duration_minutes} minutes with {len(attendees)} attendees")


@tool
def check_calendar_availability(day: str) -> str:
    """Check calendar availability for a given day."""
    return f"Available times on {day}: 9:00 AM, 2:00 PM, 4:00 PM"


@tool
class Question(BaseModel):
    """Question to ask user."""

    content: str


@tool
class Done(BaseModel):
    """E-mail has been sent."""

    done: bool


TOOLS = [write_email, schedule_meeting, check_calendar_availability, Question, Done]
TOOLS_BY_NAME = {t.name: t for t in TOOLS}

EMAIL = {
    "author": "Alice Smith <alice.smith@company.com>",
    "to": "Lance Martin <lance@company.com>",
    "subject": "Quick question about API documentation",
    "email_thread": "Hi Lance, the /auth/refresh and /auth/validate endpoints seem to be "
                    "missing from the docs. Was this intentional? Thanks! Alice",
}


def format_email(email: dict) -> str:
    return (f"**Subject**: {email['subject']}\n**From**: {email['author']}\n"
            f"**To**: {email['to']}\n\n{email['email_thread']}")


DEFAULTS = {
    "triage_preferences": "营销邮件 ignore；构建通知 notify；同事技术问题 respond。",
    "response_preferences": "语气专业简洁。",
    "cal_preferences": "偏好 30 分钟会议。",
}


def get_memory(store: BaseStore, key: str) -> str:
    item = store.get(("email_assistant", key), "user_preferences")
    return item.value["text"] if item else DEFAULTS[key]


def update_memory(store: BaseStore, key: str, note: str) -> None:
    """精简版：把新学到的偏好追加到档案末尾。"""
    store.put(("email_assistant", key), "user_preferences", {"text": get_memory(store, key) + "\n- " + note})


# ===== 状态 ====================================================================
# ---------------------------------------------------------------------------
# 练习 15.1 给分诊结果加上优先级（教程练习 2）
# 在 RouterSchema 里加一个字段：
#   priority: Literal["high", "low"] = Field(description="'high' 需要马上知道, 'low' 可以晚点看")
# ---------------------------------------------------------------------------
class RouterSchema(BaseModel):
    """Analyze the unread email and route it according to its content."""

    reasoning: str = Field(description="Step-by-step reasoning behind the classification.")
    classification: Literal["ignore", "respond", "notify"] = Field(
        description="'ignore' 无关邮件, 'notify' 重要但无需回复, 'respond' 需要回复")
    priority: Literal["high", "low"] = Field(description="'high' 需要马上知道, 'low' 可以晚点看")


class StateInput(TypedDict):
    email_input: dict


class State(MessagesState):
    email_input: dict
    classification_decision: Literal["ignore", "respond", "notify"]


# ---------------------------------------------------------------------------
# 练习 15.2 只审核真正有风险的工具（教程练习 1）
# 现在 schedule_meeting 也要人审。改成只审核 write_email 和 Question。
# ---------------------------------------------------------------------------
HITL_TOOLS = {"write_email", "Question"}


TRIAGE_PROMPT = "你是 Lance 的邮件分诊助手。把邮件分成 ignore / notify / respond，并给出优先级 high / low。"
AGENT_PROMPT = """你是一位顶尖的行政助理。每次只调用一个工具，直到任务完成。发完邮件后调用 Done。
< 回复偏好 >
{response_preferences}
< 日程偏好 >
{cal_preferences}"""


def build_email_assistant(router_model, agent_model, store=None):
    router_llm = router_model.with_structured_output(RouterSchema)
    agent_llm = agent_model.bind_tools(TOOLS, tool_choice="any")

    # -----------------------------------------------------------------------
    # 练习 15.3 分诊：notify 邮件按优先级处理（教程练习 2）
    #   respond          -> Command(goto="response_agent", update={classification_decision, messages})（已写好）
    #   notify + high    -> Command(goto="triage_interrupt_handler", update={"classification_decision": "notify"})
    #   notify + low     -> Command(goto=END, update={"classification_decision": "notify"})
    #   ignore           -> Command(goto=END, update={"classification_decision": "ignore"})
    # -----------------------------------------------------------------------
    def triage_router(state: State, runtime: Runtime) -> Command[
            Literal["triage_interrupt_handler", "response_agent", "__end__"]]:
        email = state["email_input"]
        prefs = get_memory(runtime.store, "triage_preferences")
        result = router_llm.invoke([
            {"role": "system", "content": TRIAGE_PROMPT + "\n用户的分诊偏好：\n" + prefs},
            {"role": "user", "content": format_email(email)},
        ])
        if result.classification == "respond":
            return Command(goto="response_agent", update={
                "classification_decision": "respond",
                "messages": [{"role": "user", "content": f"请回复这封邮件：\n{format_email(email)}"}]})
        if result.classification == "notify" and result.priority == "high":
            return Command(goto="triage_interrupt_handler", update={"classification_decision": "notify"})
        return Command(goto=END, update={"classification_decision": result.classification})

    def triage_interrupt_handler(state: State, runtime: Runtime) -> Command[Literal["response_agent", "__end__"]]:
        email_md = format_email(state["email_input"])
        request = {
            "action_request": {"action": "Email Assistant: notify", "args": {}},
            "config": {"allow_ignore": True, "allow_respond": True, "allow_edit": False, "allow_accept": False},
            "description": email_md,
        }
        response = interrupt([request])[0]
        messages = [{"role": "user", "content": f"需要告知用户的邮件：\n{email_md}"}]
        if response["type"] == "response":
            messages.append({"role": "user", "content": f"用户决定回复，参考意见：{response['args']}"})
            update_memory(runtime.store, "triage_preferences", "这类 notify 邮件用户也想回复")
            return Command(goto="response_agent", update={"messages": messages})
        update_memory(runtime.store, "triage_preferences", "这类 notify 邮件用户选择忽略")
        return Command(goto=END, update={"messages": messages})

    def llm_call(state: State, runtime: Runtime):
        prompt = AGENT_PROMPT.format(
            response_preferences=get_memory(runtime.store, "response_preferences"),
            cal_preferences=get_memory(runtime.store, "cal_preferences"))
        return {"messages": [agent_llm.invoke([{"role": "system", "content": prompt}] + state["messages"])]}

    # -----------------------------------------------------------------------
    # 练习 15.4 处理人类的四种答复，并从修改里学习偏好（教程 15.6–15.7）
    # interrupt_handler 对每个 tool_call：
    #   - 不在 HITL_TOOLS 里：直接执行（已写好）
    #   - 否则 response = interrupt([request])[0]，按 response["type"] 处理：
    #     accept   -> 原样执行工具，结果作为 tool 消息（已写好）
    #     edit     -> new_args = response["args"]["args"]
    #                 1) 把 AIMessage 里这个 tool_call 的 args 换成 new_args（同 id 覆盖，教程 ④）
    #                 2) 用 new_args 执行工具，结果作为 tool 消息
    #                 3) update_memory(store, pref_key, f"用户把 {tc['name']} 的参数改成了 {new_args}")
    #     ignore   -> tool 消息 "用户忽略了这个草稿，结束流程。"，goto = END（已写好）
    #     response -> tool 消息 f"用户反馈：{response['args']}"，继续回到 llm_call 重写；
    #                 不是 Question 时 update_memory(store, pref_key, f"用户反馈：{response['args']}")
    #   pref_key：schedule_meeting 用 "cal_preferences"，其它用 "response_preferences"
    # -----------------------------------------------------------------------
    def interrupt_handler(state: State, runtime: Runtime) -> Command[Literal["llm_call", "__end__"]]:
        store, result, goto = runtime.store, [], "llm_call"
        ai_msg = state["messages"][-1]
        for tc in ai_msg.tool_calls:
            tool_ = TOOLS_BY_NAME[tc["name"]]
            if tc["name"] not in HITL_TOOLS:
                result.append({"role": "tool", "content": tool_.invoke(tc["args"]), "tool_call_id": tc["id"]})
                continue
            is_question = tc["name"] == "Question"
            request = {
                "action_request": {"action": tc["name"], "args": tc["args"]},
                "config": {"allow_ignore": True, "allow_respond": True,
                           "allow_edit": not is_question, "allow_accept": not is_question},
                "description": format_email(state["email_input"]),
            }
            response = interrupt([request])[0]
            kind = response["type"]
            pref_key = "cal_preferences" if tc["name"] == "schedule_meeting" else "response_preferences"

            if kind == "accept":
                result.append({"role": "tool", "content": tool_.invoke(tc["args"]), "tool_call_id": tc["id"]})
            elif kind == "ignore":
                result.append({"role": "tool", "content": "用户忽略了这个草稿，结束流程。", "tool_call_id": tc["id"]})
                goto = END
            elif kind == "edit":
                new_args = response["args"]["args"]
                new_calls = [c for c in ai_msg.tool_calls if c["id"] != tc["id"]] + [
                    {"type": "tool_call", "name": tc["name"], "args": new_args, "id": tc["id"]}]
                result.append(ai_msg.model_copy(update={"tool_calls": new_calls}))
                result.append({"role": "tool", "content": tool_.invoke(new_args), "tool_call_id": tc["id"]})
                update_memory(store, pref_key, f"用户把 {tc['name']} 的参数改成了 {new_args}")
            elif kind == "response":
                result.append({"role": "tool", "content": f"用户反馈：{response['args']}", "tool_call_id": tc["id"]})
                if not is_question:
                    update_memory(store, pref_key, f"用户反馈：{response['args']}")
        return Command(goto=goto, update={"messages": result})

    def should_continue(state: State) -> Literal["interrupt_handler", "__end__"]:
        for tc in state["messages"][-1].tool_calls:
            return END if tc["name"] == "Done" else "interrupt_handler"
        return END

    agent_builder = StateGraph(State)
    agent_builder.add_node("llm_call", llm_call)
    agent_builder.add_node("interrupt_handler", interrupt_handler)
    agent_builder.add_edge(START, "llm_call")
    agent_builder.add_conditional_edges("llm_call", should_continue)
    response_agent = agent_builder.compile()

    builder = (
        StateGraph(State, input_schema=StateInput)
        .add_node(triage_router)
        .add_node(triage_interrupt_handler)
        .add_node("response_agent", response_agent)
        .add_edge(START, "triage_router")
    )
    return builder.compile(checkpointer=InMemorySaver(), store=store or InMemoryStore())


def main():
    from kit import ScriptedChatModel, call

    router = ScriptedChatModel([call("RouterSchema", {"reasoning": "同事的技术问题", "classification": "respond",
                                                      "priority": "high"})])
    agent = ScriptedChatModel([
        call("write_email", {"to": "alice.smith@company.com", "subject": "Re: API documentation",
                             "content": "Hi Alice, I'll check and reply by Friday."}),
        call("Done", {"done": True}),
    ])
    store = InMemoryStore()
    app = build_email_assistant(router, agent, store)
    config = {"configurable": {"thread_id": "demo"}}
    out = app.invoke({"email_input": EMAIL}, config, version="v2")
    print("等待审核：", out.interrupts[0].value[0]["action_request"])
    out = app.invoke(Command(resume=[{"type": "edit", "args": {"args": {
        "to": "alice.smith@company.com", "subject": "Re: API documentation",
        "content": "Hi Alice, good catch! Cheers"}}}]), config, version="v2")
    print("学到的回复偏好：", get_memory(store, "response_preferences"))


if __name__ == "__main__":
    main()
