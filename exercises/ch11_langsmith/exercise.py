"""第 11 章 LangSmith · 练手：从 trace 里找 SQL、建数据集、写评估器、对比实验。

对应教程：content/11-LangSmith.md
运行检查：pytest ch11_langsmith
运行演示：python ch11_langsmith/exercise.py

LangSmith 本身是在线服务。这里先在本地把"数据集 + 评估器 + 实验"的逻辑写对，
评估器的写法和 LangSmith 的 evaluate() 完全一样，之后填上 LANGSMITH_API_KEY 就能直接上传使用。
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # 直接运行本文件时也能 import kit

from langchain_core.messages import AIMessage


# ---------------------------------------------------------------------------
# 练习 11.1 在一条 trace 里找到第一次执行的 SQL（教程练习 1）
# 给定 Agent 运行后的 messages，返回第一个 execute_sql 工具调用的 query 参数；
# 没有就返回 None。
# ---------------------------------------------------------------------------
def find_first_sql(messages) -> str | None:
    raise NotImplementedError("TODO 11.1：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 11.2 建一个 5 条样本的数据集（教程练习 2）
# 每条样本的格式和 LangSmith 一致：
#   {"inputs": {"question": "..."}, "outputs": {"answer": "..."}}
# 内容自己想，围绕迷你 Chinook 数据库（kit/chinook.py）：有几种流派？AC/DC 有哪张专辑？……
# ---------------------------------------------------------------------------
DATASET: list[dict] = []  # TODO 11.2：写 5 条样本


# ---------------------------------------------------------------------------
# 练习 11.3 写一个评估器
# 签名和 LangSmith 一样：correct(outputs, reference_outputs) -> bool
# 规则：把两边都转成小写、去掉首尾空白后，参考答案出现在 outputs["answer"] 里就算对。
# ---------------------------------------------------------------------------
def correct(outputs: dict, reference_outputs: dict) -> bool:
    raise NotImplementedError("TODO 11.3：还没写，按上面的提示完成它")


# ---------------------------------------------------------------------------
# 练习 11.4 在本地跑一次"实验"
# 对数据集里每条样本：outputs = target(example["inputs"])，
# 再用每个评估器打分：evaluator(outputs, example["outputs"])。
# 返回 {"results": [每条样本的 {评估器名: 分数} 字典], "scores": {评估器名: 平均分}}
# 分数用 float（True -> 1.0）。评估器名用 evaluator.__name__。
# ---------------------------------------------------------------------------
def run_experiment(target, dataset: list[dict], evaluators: list) -> dict:
    raise NotImplementedError("TODO 11.4：还没写，按上面的提示完成它")


def main():
    def lazy_target(inputs):
        return {"answer": "I don't know"}

    def lookup_target(inputs):
        answers = {ex["inputs"]["question"]: ex["outputs"]["answer"] for ex in DATASET}
        return {"answer": f"The answer is {answers.get(inputs['question'], '?')}."}

    for target in (lazy_target, lookup_target):
        print(target.__name__, run_experiment(target, DATASET, [correct])["scores"])

    # 有 LangSmith 账号时，同样的评估器可以直接用：
    #   from langsmith import Client, evaluate
    #   Client().create_examples(dataset_name="chinook-qa", examples=DATASET)
    #   evaluate(lookup_target, data="chinook-qa", evaluators=[correct])


if __name__ == "__main__":
    main()
