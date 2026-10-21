import pytest


@pytest.mark.parametrize(
    "email, intent",
    [
        ("I was charged twice!", "billing"),
        ("App 崩溃了", "bug"),
        ("The export feature crashes when I select PDF format", "bug"),
        ("Could you add a dark mode feature?", "feature"),
        ("How do I reset my password?", "question"),
    ],
)
def test_classify(ex, email, intent):
    """1.1 分类规则按顺序命中"""
    c = ex.classify_intent({"email_content": email})["classification"]
    assert c["intent"] == intent, f"{email!r} 应该分到 {intent}，实际是 {c['intent']}（注意规则的先后顺序）"


def test_followup_route(ex):
    """1.2 只有 feature 邮件才安排跟进"""
    assert ex.route_after_send({"classification": {"intent": "feature"}}) == "schedule_followup"
    assert ex.route_after_send({"classification": {"intent": "question"}}) == "__end__"
    assert ex.schedule_followup({}) == {"followup_days": 7}


def test_paths(ex):
    """1.3 三种邮件各走各的路"""
    app = ex.build_email_app()
    assert ex.visited_nodes(app, "The export feature crashes when I select PDF format") == [
        "read_email", "classify_intent", "bug_tracking", "draft_response", "human_review"]
    assert ex.visited_nodes(app, "Could you add a dark mode feature?") == [
        "read_email", "classify_intent", "search_docs", "draft_response", "send_reply", "schedule_followup"]
    assert ex.visited_nodes(app, "How do I reset my password?")[-1] == "send_reply"


def test_superstep(ex):
    """1.4 draft 等两路都到齐，只运行一次"""
    log = ex.build_superstep_graph().invoke({"log": []})["log"]
    drafts = [x for x in log if x.startswith("draft")]
    assert drafts == ["draft@4"], f"draft 应该只在第 4 步运行一次，实际是 {drafts}"
