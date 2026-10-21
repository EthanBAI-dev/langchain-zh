"""第 1 章 用图来思考 · 练手：客服邮件图的路由、加一个跟进节点、super-step。

对应教程：content/01-用图来思考.md
运行检查：pytest ch01_thinking_in_graphs
运行演示：python ch01_thinking_in_graphs/exercise.py

这一章的节点全部用规则代替 LLM，完全离线。
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

import operator
from typing import Annotated, Literal

from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


class EmailClassification(TypedDict):
    intent: Literal["question", "bug", "billing", "feature", "complex"]
    urgency: Literal["low", "medium", "high", "critical"]
    topic: str


class EmailAgentState(TypedDict):
    email_content: str
    sender_email: str
    classification: EmailClassification | None
    search_results: list[str] | None
    draft_response: str | None
    needs_human: bool
    followup_days: int | None


def read_email(state: EmailAgentState) -> dict:
    return {"email_content": state["email_content"].strip()}


# ---------------------------------------------------------------------------
# 练习 1.1 分类规则
# 按关键字（不区分大小写）分类，从上到下先命中先算：
#   含 "charged" 或 "扣费"   -> {"intent": "billing", "urgency": "critical", "topic": "billing"}
#   含 "crash" 或 "崩溃"     -> {"intent": "bug",     "urgency": "high",     "topic": "export"}
#   含 "feature" 或 "希望增加" -> {"intent": "feature", "urgency": "low",      "topic": "product"}
#   其它                     -> {"intent": "question","urgency": "low",      "topic": "account"}
# 返回 {"classification": ...}
# ---------------------------------------------------------------------------
def classify_intent(state: EmailAgentState) -> dict:
    raise NotImplementedError("TODO 1.1：还没写，按上面的提示完成它")


def search_docs(state: EmailAgentState) -> dict:
    return {"search_results": ["Reset password via Settings > Security > Change Password"]}


def bug_tracking(state: EmailAgentState) -> dict:
    return {"search_results": ["Bug ticket BUG-12345 created"]}


def draft_response(state: EmailAgentState) -> dict:
    c = state["classification"]
    docs = "; ".join(state.get("search_results") or [])
    draft = f"[{c['intent']}] 您好，关于 {c['topic']}：{docs or '我们已收到您的问题'}"
    return {"draft_response": draft, "needs_human": c["urgency"] in ("high", "critical")}


def human_review(state: EmailAgentState) -> dict:
    return {}


def send_reply(state: EmailAgentState) -> dict:
    return {}


def route_by_intent(state: EmailAgentState) -> Literal["search_docs", "bug_tracking", "draft_response"]:
    intent = state["classification"]["intent"]
    if intent in ("question", "feature"):
        return "search_docs"
    if intent == "bug":
        return "bug_tracking"
    return "draft_response"


def route_after_draft(state: EmailAgentState) -> Literal["human_review", "send_reply"]:
    return "human_review" if state["needs_human"] else "send_reply"


# ---------------------------------------------------------------------------
# 练习 1.2 加一个跟进节点（教程练习 2）
# schedule_followup：返回 {"followup_days": 7}
# route_after_send：只有 intent == "feature" 时去 schedule_followup，否则 END。
# 想一想为什么放在 send_reply 之后：先回复用户，再安排 7 天后跟进。
# ---------------------------------------------------------------------------
def schedule_followup(state: EmailAgentState) -> dict:
    raise NotImplementedError("TODO 1.2a：还没写，按上面的提示完成它")


def route_after_send(state: EmailAgentState) -> Literal["schedule_followup", "__end__"]:
    raise NotImplementedError("TODO 1.2b：还没写，按上面的提示完成它")


def build_email_app():
    """已经写好：注意 send_reply 后面接的是 route_after_send。"""
    builder = StateGraph(EmailAgentState)
    for fn in [read_email, classify_intent, search_docs, bug_tracking,
               draft_response, human_review, send_reply, schedule_followup]:
        builder.add_node(fn)
    builder.add_edge(START, "read_email")
    builder.add_edge("read_email", "classify_intent")
    builder.add_conditional_edges("classify_intent", route_by_intent)
    builder.add_edge("search_docs", "draft_response")
    builder.add_edge("bug_tracking", "draft_response")
    builder.add_conditional_edges("draft_response", route_after_draft)
    builder.add_edge("human_review", END)
    builder.add_conditional_edges("send_reply", route_after_send)
    builder.add_edge("schedule_followup", END)
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 1.3 预测路径（教程练习 1）
# 用 stream_mode="updates" 跑一封邮件，按顺序返回经过的节点名。
# 跑之前先在心里预测一下 "The export feature crashes when I select PDF format" 会走哪条路！
# ---------------------------------------------------------------------------
def visited_nodes(app, email: str) -> list[str]:
    raise NotImplementedError("TODO 1.3：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 1.4 super-step：等所有分支到齐（教程练习 3）
# 图的形状：START -> plan -> (search -> rerank) 和 (outline) 两路并行 -> draft -> END
# 每个节点都会往 log 里写 "名字@第几步"。
# 要求 draft 只运行一次，并且等两路都完成后才运行。
# 提示：add_edge("rerank", "draft") + add_edge("outline", "draft") 会让 draft 跑两次；
#       改用 add_edge(["rerank", "outline"], "draft") 表示"都完成才触发"。
# ---------------------------------------------------------------------------
class StepState(TypedDict):
    log: Annotated[list[str], operator.add]


def make(name):
    def node(state: StepState, config: RunnableConfig):
        return {"log": [f"{name}@{config['metadata']['langgraph_step']}"]}

    return node


def build_superstep_graph():
    builder = StateGraph(StepState)
    for name in ["plan", "search", "rerank", "outline", "draft"]:
        builder.add_node(name, make(name))
    builder.add_edge(START, "plan")
    builder.add_edge("plan", "search")
    builder.add_edge("plan", "outline")
    builder.add_edge("search", "rerank")
    builder.add_edge("rerank", "draft")   # TODO 1.4：改成"两路都完成才触发"
    builder.add_edge("outline", "draft")
    builder.add_edge("draft", END)
    return builder.compile()


def main():
    app = build_email_app()
    for email in ["How do I reset my password?", "The export feature crashes when I select PDF format",
                  "Could you add a dark mode feature?"]:
        print("📩", email, "→", visited_nodes(app, email))
    print(build_superstep_graph().invoke({"log": []})["log"])


if __name__ == "__main__":
    main()
