module.exports = {
  title: '管理消息：压缩成摘要，或者干脆删掉', width: 1180, height: 450, dur: 2400,
  nodes: [
    { id: 'h', kind: 'store', x: 20, y: 40, w: 250, h: 110, label: '🗂 状态里的消息', sub: 'state["messages"]' },
    { id: 's', kind: 'llm', x: 330, y: 40, w: 260, h: 110, label: '🧠 SummarizationMiddleware', sub: 'trigger=("tokens", 100)\nkeep=("messages", 1)' },
    { id: 'b', kind: 'note', x: 330, y: 230, w: 260, h: 110, label: '✂️ @before_agent', sub: 'RemoveMessage(id=…)\n删掉所有 ToolMessage' },
    { id: 'm', kind: 'llm', x: 650, y: 130, w: 200, h: 110, label: '🤖 主模型', sub: '这一次看到什么？' },
  ],
  edges: [
    { from: 'h', to: 's', id: 'hs' }, { from: 's', to: 'm', id: 'sm' },
    { from: 'h', to: 'b', id: 'hb', fs: [0.5, 1], ts: [0, 0.5] }, { from: 'b', to: 'm', id: 'bm' },
  ],
  panels: [{ id: 'p', x: 890, y: 0, w: 290, h: 450, title: '模型看到的', mono: true }],
  frames: [
    { hl: ['h'], panels: { p: 'Human: 月球首都？\nAI: Lunapolis\nHuman: 天气？\nAI: 最高 120C…\nHuman: 多少奶酪矿工？\nAI: 10 万\nHuman: 会罢工吗？\nAI: 会\nHuman: 你当总统怎么回应？' }, caption: '① 9 条消息的长对话，超过了 100 token 的阈值' },
    { hl: ['h', 'hs', 's', 'sm', 'm'], panels: { p: '+ Human: Here is a summary\n+  of the conversation to\n+  date: 月球首都 Lunapolis、\n+  天气、奶酪矿工与罢工…\nHuman: 你当总统怎么回应？\n\n~ 状态里 9 条 → 3 条' }, caption: '② 摘要：旧消息被一条摘要替换（原文不保留），只留最近 1 条', dur: 3600 },
    { hl: ['h', 'hb', 'b'], panels: { p: 'Human: 设备开不了机\n- Tool: blorp-x7 ping…\nAI: 插电了吗？\nHuman: 插了\n- Tool: temp=42C …\nAI: 有指示灯吗？\nHuman: 设备温度多少？' }, caption: '③ 另一种做法：每次调用开始时，用 RemoveMessage 删掉所有工具消息', dur: 3200 },
    { hl: ['b', 'bm', 'm'], panels: { p: 'Human: 设备开不了机\nAI: 插电了吗？\nHuman: 插了\nAI: 有指示灯吗？\nHuman: 设备温度多少？\n\n> 42°C 在被删的消息里\n> 模型答不出来' }, caption: '④ 删消息有代价：温度读数被一起删了。删之前想清楚以后还用不用得到', dur: 3600 },
  ],
};
