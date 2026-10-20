module.exports = {
  title: '从 Chain 到 Router 再到 Agent：只差"一条边"', width: 1100, height: 360,
  caption: 'Router 里工具结果直接结束；Agent 只是多加了一条 tools → 模型 的回边，就变成了可以多步推理的 ReAct 循环',
  groups: [
    { id: 'g1', x: 0, y: 0, w: 330, h: 350, label: '① Chain：模型 + 绑定工具' },
    { id: 'g2', x: 370, y: 0, w: 330, h: 350, label: '② Router：按输出分流' },
    { id: 'g3', x: 740, y: 0, w: 350, h: 350, label: '③ Agent：工具结果回给模型' },
  ],
  nodes: [
    { id: 'a1', kind: 'start', x: 110, y: 40, w: 110, h: 40, label: 'START' },
    { id: 'a2', kind: 'llm', x: 75, y: 140, w: 180, h: 64, label: 'tool_calling_llm', mono: true },
    { id: 'a3', kind: 'end', x: 110, y: 270, w: 110, h: 40, label: 'END' },
    { id: 'b1', kind: 'start', x: 480, y: 40, w: 110, h: 40, label: 'START' },
    { id: 'b2', kind: 'llm', x: 445, y: 110, w: 180, h: 60, label: 'tool_calling_llm', mono: true },
    { id: 'b3', kind: 'tool', x: 390, y: 210, w: 120, h: 50, label: 'tools', mono: true },
    { id: 'b4', kind: 'end', x: 480, y: 295, w: 110, h: 40, label: 'END' },
    { id: 'c1', kind: 'start', x: 860, y: 40, w: 110, h: 40, label: 'START' },
    { id: 'c2', kind: 'llm', x: 825, y: 120, w: 180, h: 60, label: 'assistant', mono: true },
    { id: 'c3', kind: 'tool', x: 770, y: 240, w: 120, h: 50, label: 'tools', mono: true },
    { id: 'c4', kind: 'end', x: 950, y: 245, w: 110, h: 40, label: 'END' },
  ],
  edges: [
    { from: 'a1', to: 'a2' }, { from: 'a2', to: 'a3' },
    { from: 'b1', to: 'b2' }, { from: 'b2', to: 'b3', dashed: true }, { from: 'b2', to: 'b4', dashed: true, fs: [0.75, 1], ts: [0.75, 0] }, { from: 'b3', to: 'b4' },
    { from: 'c1', to: 'c2' }, { from: 'c2', to: 'c3', dashed: true, fs: [0.2, 1], ts: [0.3, 0] }, { from: 'c3', to: 'c2', color: '#E65100', fs: [0.75, 0], ts: [0.45, 1], label: '回边!', lp: [905, 215] }, { from: 'c2', to: 'c4', dashed: true },
  ],
};
