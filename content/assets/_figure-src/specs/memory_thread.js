const T1a = '🧑 This is Frank Harris, What was the total on my last invoice?\n🤖 …（查库）Your last invoice total was $5.94';
module.exports = {
  title: '短期记忆：checkpointer 按 thread_id 保存对话', width: 1100, height: 400, dur: 2600,
  nodes: [
    { id: 'u', kind: 'human', x: 20, y: 150, w: 150, h: 70, label: '🧑 用户' },
    { id: 'ag', kind: 'llm', x: 300, y: 140, w: 190, h: 90, label: '🤖 Agent', sub: 'checkpointer=\nInMemorySaver()' },
  ],
  edges: [{ from: 'u', to: 'ag', id: 'e', label: 'invoke' }, { from: 'ag', to: 'u', id: 'e2', fs: [0.5,1], ts: [0.5,1], via: [[395, 290], [95, 290]], dashed: true, label: '回答' }],
  panels: [
    { id: 't1', x: 520, y: 0, w: 560, h: 190, title: '🗂 thread_id = "1"', mono: true, text: '~ （空）' },
    { id: 't2', x: 520, y: 210, w: 560, h: 180, title: '🗂 thread_id = "2"', mono: true, text: '~ （空）' },
  ],
  frames: [
    { hl: ['e', 'ag', 't1'], tokens: [{ edge: 'e', t: 0.25 }], panels: { t1: '+ ' + T1a.split('\n')[0] + '\n+ ' + T1a.split('\n')[1] }, caption: '第 1 轮：带上 {"configurable": {"thread_id": "1"}} 调用，整段对话被存进 thread 1' },
    { hl: ['e', 'ag', 't1'], tokens: [{ edge: 'e', t: 0.25 }], panels: { t1: T1a + '\n+ 🧑 What were the titles?' }, caption: '第 2 轮：同一个 thread_id → Agent 先读出历史，知道"titles"指的是那张发票' },
    { hl: ['ag', 't1'], panels: { t1: T1a + '\n🧑 What were the titles?\n+ 🤖 发票里的曲目是：…（正确回答）' }, caption: '因为能看到上下文，模型能正确理解追问' },
    { hl: ['e', 'ag', 't2'], tokens: [{ edge: 'e', t: 0.25 }], panels: { t1: T1a + '\n🧑 What were the titles?\n🤖 发票里的曲目是：…', t2: '+ 🧑 What were the titles?\n+ 🤖 抱歉，你指的是哪些标题？' }, caption: '换一个 thread_id = 新对话，互不干扰；没有 checkpointer 时每次调用都是"失忆"状态', dur: 3500 },
  ],
};
