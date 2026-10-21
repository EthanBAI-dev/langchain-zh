# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 11 章 工作流模式与多智能体 · 练手：带关卡的提示链、人来当评估者、子 Agent 当工具。

对应教程：content/11-工作流模式与多智能体.md
运行检查：pytest ch11_workflows_multiagent
运行演示：python ch11_workflows_multiagent/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from typing import Literal

from langchain.agents import create_agent
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.tools import tool
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# 练习 11.1 提示链 + 关卡（教程练习 1）
# generate -> polish -> (check_length) -> 太长就再 polish，否则 END
# check_length：润色后的笑话超过 50 个字，并且 polish_count < 2，就回到 "polish"；否则 END。
# polish 节点每运行一次，polish_count + 1（节点里自己加）。
# ---------------------------------------------------------------------------
class ChainState(TypedDict, total=False):
    topic: str
    joke: str
    polish_count: int


def check_length(state: ChainState) -> Literal["polish", "__end__"]:
    if len(state["joke"]) > 50 and state.get("polish_count", 0) < 2:
        return "polish"
    return END


def build_joke_chain(model):
    def generate(state: ChainState):
        return {"joke": model.invoke([HumanMessage(f"Write a short joke about {state['topic']}")]).text,
                "polish_count": 0}

    def polish(state: ChainState):
        text = model.invoke([HumanMessage(f"Make this joke funnier and shorter: {state['joke']}")]).text
        return {"joke": text, "polish_count": state.get("polish_count", 0) + 1}

    builder = StateGraph(ChainState)
    builder.add_node("generate", generate)
    builder.add_node("polish", polish)
    builder.add_edge(START, "generate")
    builder.add_edge("generate", "polish")
    builder.add_conditional_edges("polish", check_length, ["polish", END])
    return builder.compile()


# ---------------------------------------------------------------------------
# 练习 11.2 评估者-优化者：让人来打分（教程练习 2）
# evaluate 节点：
#   review = interrupt({"joke": state["joke"]})      # 恢复值形如 {"grade": "funny"/"not funny", "feedback": "..."}
#   - funny：Command(goto=END, update={"grade": "funny"})
#   - 否则：Command(goto="generator", update={"grade": "not funny", "feedback": review["feedback"]})
# generator 已写好：有 feedback 时会把它带进提示词。
# ---------------------------------------------------------------------------
class EvalState(TypedDict, total=False):
    topic: str
    joke: str
    feedback: str
    grade: str


def evaluate(state: EvalState) -> Command[Literal["generator", "__end__"]]:
    review = interrupt({"joke": state["joke"]})
    if review["grade"] == "funny":
        return Command(goto=END, update={"grade": "funny"})
    return Command(goto="generator", update={"grade": "not funny", "feedback": review.get("feedback", "")})


def build_optimizer(model):
    def generator(state: EvalState):
        prompt = f"Write a joke about {state['topic']}"
        if state.get("feedback"):
            prompt += f", taking into account the feedback: {state['feedback']}"
        return {"joke": model.invoke([HumanMessage(prompt)]).text}

    builder = StateGraph(EvalState)
    builder.add_node("generator", generator)
    builder.add_node("evaluate", evaluate)
    builder.add_edge(START, "generator")
    builder.add_edge("generator", "evaluate")
    return builder.compile(checkpointer=InMemorySaver())


# ---------------------------------------------------------------------------
# 练习 11.3 主管 + 子 Agent 当工具（教程练习 3）
# research_agent 是一个用 create_agent 做的子 Agent，它有 web_search 工具。
# 写一个工具 call_research_agent(query)：
#   - 调用 research_agent.invoke({"messages": [{"role": "user", "content": query}]})
#   - 统计这次运行里 web_search 被调用的次数（看所有 AIMessage 的 tool_calls）
#   - 返回 f"{最后一条消息的文本}（web_search 调用了 {次数} 次）"
# 主管只拿到这一句话，看不到子 Agent 的中间过程——这就是"上下文隔离"。
# ---------------------------------------------------------------------------
@tool
def web_search(query: str) -> str:
    """Search the web."""
    return f"关于 {query} 的搜索结果"


def build_supervisor(supervisor_model, research_model):
    research_agent = create_agent(research_model, tools=[web_search],
                                  system_prompt="You are a researcher. Use web_search, then answer briefly.")

    @tool
    def call_research_agent(query: str) -> str:
        """Delegate a research question to the research agent."""
        result = research_agent.invoke({"messages": [{"role": "user", "content": query}]})
        n = sum(1 for m in result["messages"] if isinstance(m, AIMessage)
                for tc in m.tool_calls if tc["name"] == "web_search")
        return f"{result['messages'][-1].text}（web_search 调用了 {n} 次）"

    return create_agent(supervisor_model, tools=[call_research_agent],
                        system_prompt="You are a supervisor. Delegate research to call_research_agent.")


def main():
    from kit import get_model

    model = get_model(["一个很长很长的笑话" * 8, "短一点的笑话" * 6, "最短的笑话"])
    out = build_joke_chain(model).invoke({"topic": "cats"})
    print(out["polish_count"], "次润色 →", out["joke"])

    graph = build_optimizer(get_model(["Why did the cat sit on the keyboard?"]))
    config = {"configurable": {"thread_id": "1"}}
    out = graph.invoke({"topic": "cats"}, config, version="v2")
    print("请打分：", out.interrupts[0].value)
    print(graph.invoke(Command(resume={"grade": "funny"}), config, version="v2").value)


if __name__ == "__main__":
    main()
