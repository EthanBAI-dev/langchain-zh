# 第 11 章 LangSmith：看清、评估、改进你的 Agent

> **本章目标**：知道 LangSmith 能做什么，学会开启追踪、读懂一条 trace，了解离线评估、在线评估和提示工程的基本流程。
> **对应课程**：Quickstart: LangSmith Essentials、Intro to LangSmith（以及前面各章中穿插的 LangSmith 追踪链接）

[← 上一章](10-DeepAgents.md) ｜ [返回导读](README.md) ｜ [下一章 →](12-DeepAgents上手.md)

---

> 🧭 **这一章是地图**：想动手做一遍，接着读 [第 15 章 追踪与评估](15-LangSmith追踪与评估.md) 和 [第 16 章 提示工程与生产监控](16-LangSmith提示工程与生产监控.md)，那两章跟着官方课程的披萨店 Agent 从开发走到上线。

> 📎 **资料说明**：LangSmith 课程是视频 + 平台操作为主，没有公开的配套 notebook 仓库。本章的课程结构来自 Academy 课程页的公开信息；代码部分来自前面各门课程中实际使用 LangSmith 的方式，以及 LangSmith SDK 的通用用法。

## 11.1 LangSmith 是什么？

Agent 是"黑盒"：一个问题进去，中间调用了几次模型、几次工具、每次输入输出是什么、哪一步慢、哪一步错，光看最终答案完全不知道。**LangSmith 就是 Agent 的"行车记录仪 + 质检中心"**。

![LangSmith 循环](assets/figures/langsmith_loop.png)

根据 Academy 课程页，**LangSmith Essentials** 包含以下部分（官方估计 30 分钟以内学完）：

| 部分 | 内容 |
|---|---|
| Getting Started | 注册、创建 API Key、接入项目 |
| Tracing 追踪 | 记录每次运行的完整过程 |
| Online Evaluation & Insights 在线评估与洞察 | 对线上真实流量自动打分、发现问题模式 |
| Offline Evaluation 离线评估 | 用数据集 + 评估器做实验对比 |
| Prompt Engineering 提示工程 | Playground、Prompt Hub 管理与迭代提示词 |
| Deployment 部署 | 把 Agent 部署成服务（见第 9 章） |

更详细的 **Intro to LangSmith** 课程把追踪细分为：基础、Run 类型、其他追踪方式、对话线程（threads）；评估细分为：数据集、评估器、实验、分析结果；提示工程细分为：Playground、Prompt Hub、提示工程生命周期等。

## 11.2 开启追踪：只需要环境变量

对 LangChain / LangGraph 应用，不用改任何代码，设置环境变量即可：

```bash
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=langchain-academy        # 追踪记录归到哪个项目
# 欧盟区用户：LANGSMITH_ENDPOINT=https://eu.api.smith.langchain.com
```

课程的 notebook 里常这样写：

```python
import os
os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_PROJECT"] = "langchain-academy"
```

之后每次 `invoke` / `stream`，都会在 [smith.langchain.com](https://smith.langchain.com) 的对应项目下生成一条 **trace**。

非 LangChain 代码也能追踪，用 `@traceable` 装饰器：

```python
from langsmith import traceable

@traceable
def my_pipeline(question: str) -> str:
    ...
```

## 11.3 读懂一条 trace

一条 trace 是一棵树，每个节点叫一个 **run**：

```
▼ agent (chain)                        3.2s   1,240 tokens
  ▼ model (llm)                        1.1s   ← 点开能看到：系统提示词、工具说明、完整输入消息
      输出：AIMessage(tool_calls=[calculator(a=3.1125, b=4.1234, operation="multiply")])
  ▼ tools (tool)                       0.01s
      calculator → 12.83...
  ▼ model (llm)                        1.9s
      输出："3.1125 × 4.1234 ≈ 12.834"
```

课程在多处让你去看 trace 来理解问题，例如：

- **第 2 章 工具描述**：在 trace 里看模型实际收到的工具说明，理解为什么 `3 * 4` 时不调用计算器。
- **第 5 章 过滤消息**：状态里有全部消息，但 trace 显示模型调用时只收到了最后一条。
- **第 8 章 长期记忆**：trace 显示记忆从 Store 中取出并放进了系统提示词。
- **第 10 章 Deep Agents**：看主 Agent 和子智能体各自的上下文有多长。

> 💡 **调试 Agent 的第一反应应该是"去看 trace"**，而不是盯着最终输出猜。

## 11.4 离线评估：改了提示词，到底变好还是变坏？

改提示词、换模型、加工具之后，凭感觉试几个问题是不可靠的。离线评估的流程：

| 步骤 | 做什么 |
|---|---|
| 1. 建数据集 | 收集一批"输入 + 参考答案"（可以从 trace 中一键加入） |
| 2. 写评估器 | 判断输出好不好：精确匹配、正则、代码检查，或者让 LLM 当裁判（LLM-as-judge） |
| 3. 跑实验 | 用当前版本的 Agent 跑一遍数据集，自动打分 |
| 4. 对比 | 多个实验并排比较，看哪些样本变好、哪些变坏 |

用 SDK 的典型写法：

```python
from langsmith import Client
client = Client()

dataset = client.create_dataset("sql-agent-qa")
client.create_examples(
    dataset_id=dataset.id,
    examples=[
        {"inputs": {"question": "Which table has the largest number of entries?"},
         "outputs": {"answer": "PlaylistTrack"}},
        {"inputs": {"question": "Which genre on average has the longest tracks?"},
         "outputs": {"answer": "Sci Fi & Fantasy"}},
    ],
)

def correct(outputs: dict, reference_outputs: dict) -> bool:
    return reference_outputs["answer"].lower() in outputs["answer"].lower()

def target(inputs: dict) -> dict:
    result = agent.invoke({"messages": inputs["question"]}, context=RuntimeContext(db=db))
    return {"answer": result["messages"][-1].content}

client.evaluate(target, data="sql-agent-qa", evaluators=[correct], experiment_prefix="gpt-5-mini")
```

> 上面两个参考答案是我用课程自带的 Chinook.db 本地查询验证过的：`PlaylistTrack` 有 8,715 行，是最大的表；平均时长最长的流派是 `Sci Fi & Fantasy`（约 48.5 分钟）。

## 11.5 在线评估与洞察

上线后，真实用户的问题千奇百怪。**在线评估**会对线上 trace 自动运行评估器（比如"回答是否礼貌""是否调用了正确的工具"），**Insights** 帮你从大量 trace 中归纳出常见问题模式。发现的坏样本可以加入数据集，进入下一轮离线评估——形成持续改进的闭环。

## 11.6 提示工程：Playground 与 Prompt Hub

- **Playground**：在网页上直接修改提示词、换模型、重放某条 trace 的输入，立刻看效果。
- **Prompt Hub**：把提示词当作"代码"来管理——版本化、打标签、在代码里按名字拉取，改提示词不用重新部署应用。

## 11.7 Studio 与部署

前面多次用到的 **Studio**（`langgraph dev`）也是 LangSmith 的一部分：可视化图结构、逐步执行、修改状态、时间旅行。部署（LangSmith Deployment）见第 9 章。

## 📌 本章小结

- 开追踪：`LANGSMITH_TRACING=true` + API Key，零代码改动。
- 调试先看 trace：每次模型/工具调用的输入输出、耗时、token 一目了然。
- 离线评估：数据集 + 评估器 + 实验对比，用数据说话。
- 在线评估 + Insights：监控线上，发现问题回流数据集。
- Playground / Prompt Hub：迭代与管理提示词。

## 🧪 动手练习

1. 打开追踪，跑一次第 1 章的 SQL Agent，在 trace 里找到它第一次查询的 SQL。
2. 为 SQL Agent 建一个 5 条样本的数据集，分别用两个模型跑实验并对比。
3. 在 Playground 里修改 SQL Agent 的系统提示词，重放一条失败的 trace。

---

🎉 **恭喜完成全部课程！** 建议下一步：

1. 回到 [学习路线](README.md#四学习路线)，挑一个综合项目（研究助手 / task_mAIstro / Deep Research）自己从头实现一遍。
2. 去 [LangChain Academy](https://academy.langchain.com/) 看对应课程的视频，加深理解。
3. 有兴趣的话，参加 LangChain Certified Agent Engineer 认证考试。

[下一章：Deep Agents 上手 →](12-DeepAgents上手.md)
