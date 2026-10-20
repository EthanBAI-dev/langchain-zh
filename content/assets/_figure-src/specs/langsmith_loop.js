module.exports = {
  title: 'LangSmith：让 Agent 可观测、可评估、可迭代', width: 1100, height: 400,
  caption: '核心循环：追踪看清每一步 → 用数据集做离线评估 → 调提示词 → 部署 → 线上评估与洞察反哺数据集',
  nodes: [
    { id: 'dev', kind: 'llm', x: 440, y: 0, w: 220, h: 76, label: '① 开发 Agent', sub: 'LangChain / LangGraph' },
    { id: 'tr', kind: 'node', x: 800, y: 90, w: 260, h: 86, label: '② 追踪 Tracing', sub: '每次模型/工具调用的输入输出\n耗时、token、报错' },
    { id: 'ev', kind: 'tool', x: 800, y: 260, w: 260, h: 86, label: '③ 离线评估', sub: '数据集 + 评估器 → 实验对比' },
    { id: 'pe', kind: 'note', x: 440, y: 310, w: 220, h: 80, label: '④ 提示工程', sub: 'Playground · Prompt Hub' },
    { id: 'dp', kind: 'store', x: 40, y: 260, w: 260, h: 86, label: '⑤ 部署 Deployment', sub: 'Agent Server · Studio' },
    { id: 'on', kind: 'human', x: 40, y: 90, w: 260, h: 86, label: '⑥ 线上评估与洞察', sub: '在线评估器 · Insights\n发现问题 → 回流数据集' },
  ],
  edges: [{ from: 'dev', to: 'tr' }, { from: 'tr', to: 'ev' }, { from: 'ev', to: 'pe' }, { from: 'pe', to: 'dp' }, { from: 'dp', to: 'on' }, { from: 'on', to: 'dev' }],
  texts: [{ x: 550, y: 190, text: '持续改进', cls: 'big', anchor: 'middle' }],
};
