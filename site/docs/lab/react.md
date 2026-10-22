---
title: ReAct 循环模拟器
aside: false
---

# ReAct 循环模拟器

Agent 不是一次性给出答案，而是在 **model** 和 **tools** 两个节点之间来回跑，每一步都往 `state["messages"]` 里追加一条消息。点 **下一步**，看左边哪个节点正在工作、右边的消息列表怎么变长。

<ReactSim />

## 看完想一想

1. 每一次进入 `tools` 节点之前，最后一条消息一定是什么类型？
2. 如果把 `tools → model` 这条回边删掉，图会在哪里停下来？用户能看到什么？
3. 模型“自己执行了 SQL”吗？

::: details 参考答案
1. 一定是带 `tool_calls` 的 `AIMessage`，这正是 `tools_condition` 的判断依据。
2. 会在 `tools` 之后直接结束，用户只能看到工具的原始结果（比如数字 6），这就是第 6 章里的 **Router**。
3. 没有。模型只输出“想调用什么工具、传什么参数”，真正执行的是框架里的工具节点。
:::

相关章节：[第 1 章 十分钟造一个 Agent](/learn/ch01) · [第 6 章 LangGraph 图的基本功](/learn/ch06)
