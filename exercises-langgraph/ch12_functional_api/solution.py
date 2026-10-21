# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 12 章 函数式 API · 练手：并行 task、entrypoint.final、带摘要的聊天机器人、中断不重算。

对应教程：content/12-函数式API.md
运行检查：pytest ch12_functional_api
运行演示：python ch12_functional_api/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

import time

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.func import entrypoint, task
from langgraph.graph import add_messages
from langgraph.types import interrupt


# ---------------------------------------------------------------------------
# 练习 12.1 先全部发出，再统一等结果（教程练习 1）
# slow_double 每次要 0.2 秒。parallel 要让 4 个调用同时进行，总耗时约 0.2 秒而不是 0.8 秒。
# 提示：先用列表推导式拿到所有 future，再逐个 .result()。
# ---------------------------------------------------------------------------
@task
def slow_double(x: int) -> int:
    time.sleep(0.2)
    return x * 2


@entrypoint()
def parallel(nums: list[int]) -> list[int]:
    futures = [slow_double(n) for n in nums]
    return [f.result() for f in futures]


# ---------------------------------------------------------------------------
# 练习 12.2 entrypoint.final：返回一个值，保存另一个值
# 每次调用传入 n。返回"上一次的总数"，保存"新的总数"。
#   依次 invoke 1、2、3 -> 返回 0、1、3；保存的总数最后是 6
# ---------------------------------------------------------------------------
@entrypoint(checkpointer=InMemorySaver())
def accumulate(n: int, *, previous: int | None = None) -> entrypoint.final[int, int]:
    previous = previous or 0
    return entrypoint.final(value=previous, save=previous + n)


# ---------------------------------------------------------------------------
# 练习 12.3 带对话历史和自动摘要的聊天机器人（教程练习 4）
# build_chatbot(model) 返回一个 entrypoint（带 InMemorySaver）：
#   1. history = add_messages(previous or [], inputs)
#   2. 如果 len(history) > 6：
#        summary = summarize(history).result()   （summarize 是一个 task，已写好）
#        history = [summary] + history[-2:]       （摘要 + 最近两条）
#   3. reply = call_model(history).result()
#   4. history = add_messages(history, [reply])
#   5. return entrypoint.final(value=reply, save=history)
# ---------------------------------------------------------------------------
def build_chatbot(model):
    @task
    def call_model(messages: list[BaseMessage]):
        return model.invoke(messages)

    @task
    def summarize(messages: list[BaseMessage]) -> SystemMessage:
        text = model.invoke(messages + [HumanMessage("Summarize the conversation above.")]).text
        return SystemMessage(f"Summary of earlier conversation: {text}")

    @entrypoint(checkpointer=InMemorySaver())
    def chatbot(inputs: list[BaseMessage], *, previous: list[BaseMessage] | None = None):
        history = add_messages(previous or [], inputs)
        if len(history) > 6:
            summary = summarize(history).result()
            history = [summary] + history[-2:]
        reply = call_model(history).result()
        history = add_messages(history, [reply])
        return entrypoint.final(value=reply, save=history)

    return chatbot


# ---------------------------------------------------------------------------
# 练习 12.4 函数式的评估者-优化者 + 人来打分（教程练习 3）
# 循环：
#   joke = generate(topic, feedback).result()
#   review = interrupt({"joke": joke})        # {"grade": "funny"} 或 {"grade": "not funny", "feedback": "..."}
#   funny 就 return joke；否则 feedback = review["feedback"]，继续循环
# 恢复执行时，已经完成的 task 会直接用保存的结果，模型不会被重复调用。
# ---------------------------------------------------------------------------
def build_joke_workflow(model):
    @task
    def generate(topic: str, feedback: str | None) -> str:
        prompt = f"Write a joke about {topic}" + (f". Feedback: {feedback}" if feedback else "")
        return model.invoke([HumanMessage(prompt)]).text

    @entrypoint(checkpointer=InMemorySaver())
    def workflow(topic: str) -> str:
        feedback = None
        while True:
            joke = generate(topic, feedback).result()
            review = interrupt({"joke": joke})
            if review["grade"] == "funny":
                return joke
            feedback = review.get("feedback")

    return workflow


def main():
    t0 = time.time()
    print(parallel.invoke([1, 2, 3, 4]), f"耗时 {time.time() - t0:.2f}s")
    cfg = {"configurable": {"thread_id": "a"}}
    print([accumulate.invoke(n, cfg) for n in (1, 2, 3)], "下次拿到的 previous：", accumulate.invoke(0, cfg))


if __name__ == "__main__":
    main()
