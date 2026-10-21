# 🧪 LangGraph 配套练手程序

LangGraph 中文教程每一章读完，就来这里动手写一遍。
一共 **16 章、56 道小练习**，最后一章是邮件助理综合项目。每道题都有：

- 📝 **起始代码** `exercise.py`：骨架已经搭好，你只需要把标着 `TODO` 的地方补上；
- ✅ **自动检查** `test_chNN.py`：一条命令告诉你哪里对、哪里错（中文提示）；
- 💡 **参考答案** `solution.py`：卡住了再看。

> 自动检查**完全离线**：不用 API Key、不花钱、结果每次都一样。
> 写对之后，想看真模型的效果？设置一个环境变量就能切换（见下文）。

---

## 一、三步上手

**① 装环境**（在仓库根目录执行，Python 3.11+；和 `exercises/` 是两套独立的环境配置）

```bash
cd exercises-langgraph
python -m venv .venv
source .venv/bin/activate          # Windows：.venv\Scripts\activate
pip install -r requirements.txt
```

**② 确认环境没问题**：检查参考答案，应该全部通过

```bash
pytest --solution
```

**③ 开始做题**：打开某一章的 `exercise.py`，搜索 `TODO`，写完后运行检查

```bash
pytest ch03_agent_from_scratch     # 只检查第 3 章
pytest                             # 检查全部章节
```

最后会打印一张成绩单：

```
==================== 📋 成绩单（检查对象：你的 exercise.py） ====================
✅ ch00_setup                 4/4 通过
🟡 ch01_thinking_in_graphs    2/4 通过
      ✗ 1.3 三种邮件各走各的路
      ✗ 1.4 draft 等两路都到齐，只运行一次
⬜ ch02_first_graph           0/5 通过
```

✗ 后面就是没通过的检查项，往上翻能看到具体的中文提示，比如
`draft 应该只在第 4 步运行一次，实际是 ['draft@3', 'draft@4']`。

有几道题是"先预测，再验证"：把你的预测填进 `PREDICTED_...` 常量，检查会告诉你猜得对不对。

---

## 二、章节目录

| 文件夹 | 对应教程 | 练什么 |
|---|---|---|
| [`ch00_setup`](ch00_setup/exercise.py) | 第 0 章 环境准备 | 第一张小图、`stream` 逐步观察、写 `langgraph.json` |
| [`ch01_thinking_in_graphs`](ch01_thinking_in_graphs/exercise.py) | 第 1 章 用图来思考 | 客服邮件分类规则、加跟进节点、预测路径、super-step 等待汇合 |
| [`ch02_first_graph`](ch02_first_graph/exercise.py) | 第 2 章 第一张图 | 条件边 + `path_map`、用 reducer 累加计数、Router |
| [`ch03_agent_from_scratch`](ch03_agent_from_scratch/exercise.py) | 第 3 章 从零造一个 Agent | 回边、`handle_tool_errors`、`RemainingSteps` 优雅降级、预测检查点数量 |
| [`ch04_state_design`](ch04_state_design/exercise.py) | 第 4 章 状态设计 | 并行写入、自定义 reducer、`Overwrite`、输出过滤、`Command` + `context_schema` |
| [`ch05_messages_memory`](ch05_messages_memory/exercise.py) | 第 5 章 消息管理与短期记忆 | `RemoveMessage`、`trim_messages` 安全裁剪、按 token 摘要、`AsyncSqliteSaver` |
| [`ch06_persistence`](ch06_persistence/exercise.py) | 第 6 章 持久化与时间旅行 | `as_node` 分叉、`RetryPolicy` + `error_handler`、`CachePolicy` |
| [`ch07_streaming`](ch07_streaming/exercise.py) | 第 7 章 流式输出 | `version="v2"`、自定义进度条、`nostream` 标签 |
| [`ch08_human_in_loop`](ch08_human_in_loop/exercise.py) | 第 8 章 人在回路 | 带理由的拒绝、副作用放在 `interrupt` 之后、`response_schema`、逐个审核工具调用 |
| [`ch09_parallel_mapreduce`](ch09_parallel_mapreduce/exercise.py) | 第 9 章 并行与 MapReduce | `defer=True`、`Send` 带参数、长文分段总结 |
| [`ch10_subgraphs`](ch10_subgraphs/exercise.py) | 第 10 章 子图 | 共享键挂载、不同 schema 手动转换、`Command.PARENT` 交接 |
| [`ch11_workflows_multiagent`](ch11_workflows_multiagent/exercise.py) | 第 11 章 工作流模式与多智能体 | 带关卡的提示链、人来当评估者、子 Agent 当工具 |
| [`ch12_functional_api`](ch12_functional_api/exercise.py) | 第 12 章 函数式 API | 并行 `task`、`entrypoint.final`、带摘要的聊天机器人、中断后不重算 |
| [`ch13_long_term_memory`](ch13_long_term_memory/exercise.py) | 第 13 章 长期记忆 | 前缀搜索、`runtime.store` + 结构化画像、离线语义检索 |
| [`ch14_deployment`](ch14_deployment/exercise.py) | 第 14 章 部署与平台 | 带 context 的可部署图、测试三板斧、SDK 人在回路、清理悬空工具调用 |
| [`ch15_email_assistant`](ch15_email_assistant/exercise.py) | 第 15 章 综合项目：邮件助理 | 只审核高风险工具、按优先级分诊、处理 edit / response 并记住偏好 |

题目大多来自每章末尾的「动手练习」，题号旁边会注明，比如 `（教程练习 2）`。

---

## 三、换成真模型试试

自动检查永远用假模型。但每个 `exercise.py` 最后都有一个 `main()` 演示，
用到模型的演示可以换成真模型跑：

```bash
cp .env.example .env
# 编辑 .env，填两行，例如：
#   LC_MODEL=openai:gpt-5-mini
#   OPENAI_API_KEY=sk-...
pip install langchain-openai        # 用 Claude 就装 langchain-anthropic

python ch03_agent_from_scratch/exercise.py
```

没设置 `LC_MODEL` 时，演示会用离线剧本跑，并提示 `📴 使用离线假模型`。

第 0、14 章的演示还会在本章目录写出 `langgraph.json`，装好 `pip install "langgraph-cli[inmem]"`
后在那个目录运行 `langgraph dev`，就能在 Studio 里打开你写的图。

---

## 四、假模型是怎么回事？

真模型每次回答都不一样，没法做自动检查。所以检查里用的是 [`kit/fake.py`](kit/fake.py)
里的 `ScriptedChatModel`：它**按剧本说话**，同时记下自己"看到"的每一条消息。

```python
from kit import ScriptedChatModel, ai, call

model = ScriptedChatModel([
    call("add", {"a": 3, "b": 4}),   # 第 1 次被调用：说"我要调 add 工具"
    ai("答案是 7"),                   # 第 2 次：给出最终回答
])
```

它支持 `bind_tools`、`with_structured_output`，所以能直接塞进你搭的图、`create_agent`
以及邮件助理里。测试通过 `model.calls`、`model.system_prompts()` 检查你的代码到底给模型发了什么。
这和教程 14.10 节、15.5 节"用假模型测试图"是同一个思路。

---

## 五、常见问题

**Q：`pytest` 全是红的？**
正常！还没做题时，`exercise.py` 里的 `TODO` 会抛出 `NotImplementedError`。先跑一次
`pytest --solution` 确认环境没问题，然后一章一章做。

**Q：提示 `假模型的剧本用完了`？**
说明模型被调用的次数比预期多：可能少连了一条边、多调了一次模型，或者图进入了死循环。

**Q：版本？**
和教程正文一样，基于 `langgraph 1.2.16`、`langchain 1.4.6` 验证。
