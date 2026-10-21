module.exports = {
  title: '中间件插在 Agent 循环的哪里', width: 1100, height: 440,
  caption: 'before_agent 每次 invoke 只跑一次；dynamic_prompt、摘要和 wrap_model_call 每次调模型都跑；人在回路卡在工具执行之前',
  nodes: [
    { id: 'in', kind: 'start', x: 20, y: 190, w: 110, h: 54, label: '开始' },
    { id: 'ba', kind: 'note', x: 170, y: 170, w: 190, h: 96, label: '✂️ @before_agent', sub: '删掉不要的消息' },
    { id: 'pre', kind: 'note', x: 410, y: 20, w: 260, h: 110, label: '🧾 调模型之前', sub: 'SummarizationMiddleware\n@dynamic_prompt 换提示词' },
    { id: 'm', kind: 'llm', x: 410, y: 170, w: 260, h: 96, label: '🧠 模型调用', sub: '@wrap_model_call\n换模型 · 换工具' },
    { id: 'h', kind: 'human', x: 720, y: 170, w: 180, h: 96, label: '✋ 人在回路', sub: '批准 / 拒绝 / 修改' },
    { id: 't', kind: 'tool', x: 720, y: 320, w: 180, h: 90, label: '🔧 工具', sub: '执行' },
    { id: 'out', kind: 'end', x: 420, y: 340, w: 110, h: 54, label: '结束' },
  ],
  edges: [
    { from: 'in', to: 'ba' }, { from: 'ba', to: 'm' }, { from: 'pre', to: 'm', dashed: true },
    { from: 'm', to: 'h', label: '要调工具' }, { from: 'h', to: 't' },
    { from: 't', to: 'm', label: '结果', fs: [0, 0.5], ts: [0.5, 1] },
    { from: 'm', to: 'out', fs: [0.25, 1], ts: [0.5, 0], label: '直接回答', lt: 0.5 },
  ],
};
