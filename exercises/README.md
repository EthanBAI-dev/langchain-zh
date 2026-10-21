# 🧪 LangChain 配套练手程序

教程（[`content/`](../content/)）每一章读完，就来这里动手写一遍。
一共 **12 章、42 道小练习**，每道题都有：

- 📝 **起始代码** `exercise.py`：骨架已经搭好，你只需要把标着 `TODO` 的地方补上；
- ✅ **自动检查** `test_chNN.py`：一条命令告诉你哪里对、哪里错（中文提示）；
- 💡 **参考答案** `solution.py`：卡住了再看。

> 自动检查**完全离线**：不用 API Key、不花钱、结果每次都一样。
> 写对之后，想看真模型的效果？设置一个环境变量就能切换（见下文）。

---

## 一、三步上手

**① 装环境**（在仓库根目录执行，Python 3.11+）

```bash
cd exercises
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
pytest ch01_sql_agent       # 只检查第 1 章
pytest                      # 检查全部章节
```

最后会打印一张成绩单：

```
==================== 📋 成绩单（检查对象：你的 exercise.py） ====================
✅ ch00_setup                 3/3 通过
🟡 ch01_sql_agent             3/5 通过
      ✗ 1.2 写操作在工具层被拦下，数据库没被改
      ✗ 1.4 数清楚一共调用了几次工具
⬜ ch02_building_blocks       0/4 通过
```

✗ 后面就是没通过的检查项，往上翻能看到具体的中文提示，比如
`Invoice 表被删了！工具必须先检查再执行`。

---

## 二、章节目录

| 文件夹 | 对应教程 | 练什么 |
|---|---|---|
| [`ch00_setup`](ch00_setup/exercise.py) | 第 0 章 环境准备 | 查版本、拼消息、第一次调用模型 |
| [`ch01_sql_agent`](ch01_sql_agent/exercise.py) | 第 1 章 十分钟造一个 Agent | 只读 SQL 工具、`get_runtime` 注入数据库、`create_agent`、数工具调用 |
| [`ch02_building_blocks`](ch02_building_blocks/exercise.py) | 第 2 章 Agent 的积木 | 给计算器加幂运算、`get_stream_writer` 推进度、`updates` / `custom` 流式模式 |
| [`ch03_memory_middleware`](ch03_memory_middleware/exercise.py) | 第 3 章 记忆、结构化输出与中间件 | `thread_id` 短期记忆、提取 `Order`、`@dynamic_prompt`、带"改参数"的人工审批 |
| [`ch04_graph_basics`](ch04_graph_basics/exercise.py) | 第 4 章 LangGraph 图的基本功 | 条件边、`subtract` 工具、从零搭 ReAct 循环、并行工具调用 |
| [`ch05_state_memory`](ch05_state_memory/exercise.py) | 第 5 章 状态与短期记忆 | 自定义 reducer、`RemoveMessage`、滚动摘要机器人、SQLite 持久化 |
| [`ch06_human_in_loop`](ch06_human_in_loop/exercise.py) | 第 6 章 人在回路 | 断点审批、只对 `divide` 动态中断、时间旅行分叉 |
| [`ch07_parallel_subgraphs`](ch07_parallel_subgraphs/exercise.py) | 第 7 章 并行、子图与多智能体 | 三路并行检索、`Send` Map-Reduce 总结长文、子图当节点 |
| [`ch08_long_term_memory`](ch08_long_term_memory/exercise.py) | 第 8 章 长期记忆 | `Store` 存取、跨会话记住用户、扩展 `UserProfile` |
| [`ch09_deployment`](ch09_deployment/exercise.py) | 第 9 章 部署上线 | 可部署的图 + `langgraph.json`、两个 Assistant、轮询后台 Run |
| [`ch10_deep_agents`](ch10_deep_agents/exercise.py) | 第 10 章 Deep Agents | 工具返回 `Command`、从零写虚拟文件系统、`create_deep_agent` 读书笔记助手 |
| [`ch11_langsmith`](ch11_langsmith/exercise.py) | 第 11 章 LangSmith | 从 trace 找 SQL、建数据集、写评估器、本地对比实验 |

题目大多来自每章末尾的「🧪 动手练习」，题号旁边会注明，比如 `（教程练习 2）`。

---

## 三、换成真模型试试

自动检查永远用假模型。但每个 `exercise.py` 最后都有一个 `main()` 演示，
可以用真模型跑：

```bash
cp .env.example .env
# 编辑 .env，填两行，例如：
#   LC_MODEL=openai:gpt-5-mini
#   OPENAI_API_KEY=sk-...
pip install langchain-openai        # 用 Claude 就装 langchain-anthropic

python ch01_sql_agent/exercise.py   # 运行第 1 章的演示
```

没设置 `LC_MODEL` 时，演示会用离线剧本跑，并提示 `📴 使用离线假模型`。

---

## 四、假模型是怎么回事？

真模型每次回答都不一样，没法做自动检查。所以检查里用的是 [`kit/fake.py`](kit/fake.py)
里的 `ScriptedChatModel`：它**按剧本说话**，同时记下自己"看到"的每一条消息。

```python
from kit import ScriptedChatModel, ai, call

model = ScriptedChatModel([
    call("subtract", {"a": 10, "b": 3}),   # 第 1 次被调用：说"我要调 subtract 工具"
    call("multiply", {"a": 7, "b": 4}),    # 第 2 次：再调 multiply
    ai("答案是 28"),                        # 第 3 次：给出最终回答
])
```

这样检查的重点就是**你写的代码**：工具有没有被正确执行、状态有没有正确更新、
图有没有按预期流转。测试还能通过 `model.calls`、`model.system_prompts()` 检查
你的代码到底给模型发了什么。

你也可以用它给自己的代码写测试，想看更多用法就读读各章的 `test_chNN.py`。

---

## 五、常见问题

**Q：`pytest` 全是红的？**
正常！还没做题时，`exercise.py` 里的 `TODO` 会抛出 `NotImplementedError`。先跑一次
`pytest --solution` 确认环境没问题，然后一章一章做。

**Q：提示 `假模型的剧本用完了`？**
说明模型被调用的次数比预期多：可能少连了一条边、多调了一次模型，或者图进入了死循环。

**Q：第 2 章的 MCP、第 11 章的 LangSmith 线上功能怎么练？**
这两部分需要联网和账号，没法离线自动检查。第 11 章先在本地把"数据集 + 评估器 + 实验"
写对，评估器的签名和 LangSmith `evaluate()` 完全一样，有账号后可以直接拿去用
（`ch11_langsmith/exercise.py` 末尾有示例）。MCP 请按教程 2.4 节动手。

**Q：版本？**
和教程正文一样，基于 `langchain 1.4.6`、`langgraph 1.2.16`、`deepagents 0.7.28` 验证。
