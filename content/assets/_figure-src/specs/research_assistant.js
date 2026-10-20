module.exports = {
  title: '综合项目：多智能体研究助手（STORM 思路）', width: 1100, height: 400,
  caption: '人在回路（审核分析师）+ 子图（访谈）+ 并行（多源检索）+ Map-Reduce（并发访谈）+ 汇总写报告',
  nodes: [
    { id: 't', kind: 'human', x: 0, y: 10, w: 170, h: 56, label: '🧑 研究主题' },
    { id: 'ca', kind: 'llm', x: 0, y: 120, w: 170, h: 70, label: 'create_analysts', mono: true, sub: '生成 N 个分析师角色' },
    { id: 'hf', kind: 'human', x: 0, y: 250, w: 170, h: 80, label: 'human_feedback', mono: true, sub: '⏸ 人工修改/确认\n不满意可重来' },
    { id: 'i1', kind: 'node', x: 230, y: 0, w: 290, h: 120, label: '访谈子图 × 分析师1', sub: '提问 → 并行检索\n(Web/维基) → 专家回答\n→ 多轮 → 写成小节' },
    { id: 'i2', kind: 'node', x: 230, y: 150, w: 290, h: 80, label: '访谈子图 × 分析师2', sub: '同上（并行）' },
    { id: 'i3', kind: 'node', x: 230, y: 260, w: 290, h: 80, label: '访谈子图 × 分析师3', sub: '同上（并行）' },
    { id: 'sec', kind: 'store', x: 560, y: 140, w: 130, h: 90, label: 'sections', mono: true, sub: 'operator.add\n汇总各小节' },
    { id: 'w', kind: 'llm', x: 730, y: 20, w: 170, h: 60, label: 'write_report', mono: true },
    { id: 'in', kind: 'llm', x: 730, y: 155, w: 170, h: 60, label: 'write_introduction', mono: true },
    { id: 'co', kind: 'llm', x: 730, y: 290, w: 170, h: 60, label: 'write_conclusion', mono: true },
    { id: 'f', kind: 'store', x: 950, y: 150, w: 140, h: 70, label: '📄 最终报告', sub: 'finalize_report' },
  ],
  edges: [
    { from: 't', to: 'ca' }, { from: 'ca', to: 'hf' },
    { from: 'hf', to: 'i1', label: 'Send', lt: 0.3 }, { from: 'hf', to: 'i2', label: 'Send', lt: 0.4 }, { from: 'hf', to: 'i3', label: 'Send' },
    { from: 'i1', to: 'sec' }, { from: 'i2', to: 'sec' }, { from: 'i3', to: 'sec' },
    { from: 'sec', to: 'w' }, { from: 'sec', to: 'in' }, { from: 'sec', to: 'co' },
    { from: 'w', to: 'f' }, { from: 'in', to: 'f' }, { from: 'co', to: 'f' },
  ],
};
