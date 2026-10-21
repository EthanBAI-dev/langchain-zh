from langchain_core.messages import ToolMessage

from kit import ScriptedChatModel, ai, call


def test_memory_same_thread(ex):
    """3.1 同一个 thread_id 能记住上文"""
    model = ScriptedChatModel([ai("你好 Frank"), ai("你叫 Frank"), ai("我不知道你是谁")])
    agent = ex.build_memory_agent(model)
    assert ex.chat(agent, "我是 Frank", "t1") == "你好 Frank"
    assert ex.chat(agent, "我叫什么？", "t1") == "你叫 Frank"
    second = [m.type for m in model.calls[1] if m.type != "system"]
    assert second == ["human", "ai", "human"], "第二轮应该带上第一轮的对话，检查 checkpointer 和 thread_id"
    ex.chat(agent, "我叫什么？", "t2")
    third = [m.type for m in model.calls[2] if m.type != "system"]
    assert third == ["human"], "换了 thread_id 应该是全新的对话"


def test_extract_order(ex):
    """3.2 从通话记录里提取订单"""
    fields = set(ex.Order.model_fields)
    assert fields == {"product", "quantity"}, f"Order 应该正好有 product 和 quantity 两个字段，现在是 {fields}"
    model = ScriptedChatModel([call("Order", {"product": "Captain Crunch", "quantity": 50})])
    order = ex.extract_order(model, "He wanted to order 50 boxes of Captain Crunch.")
    assert isinstance(order, ex.Order), "要返回 result['structured_response']，它是一个 Order 对象"
    assert order.quantity == 50 and order.product == "Captain Crunch"
    assert "Order" in model.bound_tools, "要用 response_format=Order"


def test_dynamic_prompt(ex):
    """3.3 顾客和员工看到不同的系统提示词"""
    model = ScriptedChatModel([ai("ok")], loop=True)
    agent = ex.build_role_agent(model)
    agent.invoke({"messages": "hi"}, context=ex.RoleContext(is_employee=False))
    agent.invoke({"messages": "hi"}, context=ex.RoleContext(is_employee=True))
    customer, employee = model.system_prompts()
    assert ex.CUSTOMER_LIMITS in customer, "顾客的提示词里应该有表访问限制"
    assert ex.CUSTOMER_LIMITS not in employee, "员工的提示词里不应该有限制"
    assert customer.startswith(ex.BASE_PROMPT) and employee == ex.BASE_PROMPT


def _review(ex, decision_args):
    ex.EXECUTED.clear()
    model = ScriptedChatModel([call("execute_sql", {"query": "DELETE FROM Employee"}), ai("完成")])
    agent = ex.build_review_agent(model)
    config = {"configurable": {"thread_id": "review"}}
    result = agent.invoke({"messages": "清理员工表"}, config)
    assert "__interrupt__" in result, "工具执行前应该停下来等审批（检查 HumanInTheLoopMiddleware）"
    assert ex.EXECUTED == [], "审批前工具不应该被执行"
    review = result["__interrupt__"][-1].value["review_configs"][0]
    assert set(review["allowed_decisions"]) == {"approve", "edit", "reject"}
    return agent.invoke(ex.decide(*decision_args), config)


def test_review_edit(ex):
    """3.4 审批时把危险 SQL 改成安全的"""
    result = _review(ex, ("edit", "SELECT FirstName FROM Employee"))
    assert ex.EXECUTED == ["SELECT FirstName FROM Employee"], f"实际执行的是 {ex.EXECUTED}"
    assert result["messages"][-1].content == "完成"


def test_review_reject(ex):
    """3.4 拒绝时工具不执行，模型收到拒绝理由"""
    result = _review(ex, ("reject", None, "数据库维护中"))
    assert ex.EXECUTED == []
    tool_msgs = [m for m in result["messages"] if isinstance(m, ToolMessage)]
    assert tool_msgs and "数据库维护中" in tool_msgs[-1].content


def test_review_approve(ex):
    """3.4 批准后照原样执行"""
    _review(ex, ("approve",))
    assert ex.EXECUTED == ["DELETE FROM Employee"]
