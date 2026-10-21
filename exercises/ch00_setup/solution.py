# 参考答案。先自己在 exercise.py 里做，卡住了再来看。
"""第 0 章 环境准备 · 练手：确认环境装好了，再和模型说第一句话。

对应教程：content/00-环境准备.md
运行检查：pytest ch00_setup
运行演示：python ch00_setup/exercise.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from langchain_core.messages import HumanMessage, SystemMessage


# ---------------------------------------------------------------------------
# 练习 0.1 查看版本
# 返回一个字典：{"langchain": "1.x.x", "langgraph": "1.x.x"}。
# 提示：from importlib.metadata import version；version("langchain")
# ---------------------------------------------------------------------------
def installed_versions() -> dict[str, str]:
    from importlib.metadata import version

    return {"langchain": version("langchain"), "langgraph": version("langgraph")}


# ---------------------------------------------------------------------------
# 练习 0.2 拼消息
# 返回两条消息组成的列表：
#   1. SystemMessage，内容是 f"你是{persona}。"
#   2. HumanMessage，内容是 question
# ---------------------------------------------------------------------------
def build_messages(question: str, persona: str = "一位耐心的中文老师") -> list:
    return [SystemMessage(f"你是{persona}。"), HumanMessage(question)]


# ---------------------------------------------------------------------------
# 练习 0.3 第一次调用模型
# 用 build_messages 拼好消息，调用 model.invoke(...)，返回回复的纯文本。
# 提示：回复是一条 AIMessage，它的 .text 就是纯文本。
# ---------------------------------------------------------------------------
def ask(model, question: str) -> str:
    reply = model.invoke(build_messages(question))
    return reply.text


def main():
    from kit import get_model

    print(installed_versions())
    model = get_model(["你好！我是离线假模型。设置 LC_MODEL 之后，我就会变成真模型来回答你。"])
    print(ask(model, "用一句话介绍一下 LangChain。"))


if __name__ == "__main__":
    main()
