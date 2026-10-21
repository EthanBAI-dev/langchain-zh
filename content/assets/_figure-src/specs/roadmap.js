const col = (i) => 30 + i * 300;
module.exports = {
  title: '本教程学习路线（对应 LangChain Academy 的课程）', width: 1220, height: 430,
  caption: '建议按 ①→④ 顺序学习：先会"用"Agent，再懂"图"的原理，然后学编排与记忆，最后上 Deep Agents 与 LangSmith',
  groups: [
    { id: 'g1', x: col(0), y: 0, w: 270, h: 420, label: '阶段① LangChain 入门', kind: 'group', fill: 'rgba(227,242,253,.6)' },
    { id: 'g2', x: col(1), y: 0, w: 270, h: 420, label: '阶段② LangGraph 核心', kind: 'group', fill: 'rgba(243,229,245,.6)' },
    { id: 'g3', x: col(2), y: 0, w: 270, h: 420, label: '阶段③ 编排·记忆·部署', kind: 'group', fill: 'rgba(224,242,241,.6)' },
    { id: 'g4', x: col(3), y: 0, w: 270, h: 420, label: '阶段④ 深度 Agent 与平台', kind: 'group', fill: 'rgba(252,228,236,.6)' },
  ],
  nodes: [
    { id: 'c1', kind: 'llm', x: col(0) + 20, y: 50, w: 230, h: 70, label: '第1章 十分钟造 Agent', sub: 'create_agent · SQL 智能体' },
    { id: 'c2', kind: 'llm', x: col(0) + 20, y: 160, w: 230, h: 70, label: '第2章 Agent 的积木', sub: '消息 · 流式 · 工具 · MCP' },
    { id: 'c3', kind: 'llm', x: col(0) + 20, y: 270, w: 230, h: 90, label: '第3章 记忆与中间件', sub: '短期记忆 · 结构化输出\n动态提示词 · 人工审批' },
    { id: 'c4', kind: 'node', x: col(1) + 20, y: 50, w: 230, h: 70, label: '第4章 图的基本功', sub: '状态 · 节点 · 边 · ReAct' },
    { id: 'c5', kind: 'node', x: col(1) + 20, y: 160, w: 230, h: 70, label: '第5章 状态与短期记忆', sub: 'Reducer · 多 Schema · 摘要' },
    { id: 'c6', kind: 'node', x: col(1) + 20, y: 270, w: 230, h: 90, label: '第6章 人在回路', sub: '流式 · 断点 · 改状态\n时间旅行' },
    { id: 'c7', kind: 'store', x: col(2) + 20, y: 50, w: 230, h: 70, label: '第7章 并行与多智能体', sub: '扇出扇入 · 子图 · Map-Reduce' },
    { id: 'c8', kind: 'store', x: col(2) + 20, y: 160, w: 230, h: 70, label: '第8章 长期记忆', sub: 'Store · Profile · Collection' },
    { id: 'c9', kind: 'store', x: col(2) + 20, y: 270, w: 230, h: 90, label: '第9章 部署上线', sub: 'LangGraph Server · SDK\nAssistants · Runs/Threads' },
    { id: 'c10', kind: 'human', x: col(3) + 20, y: 50, w: 230, h: 110, label: '第10章 Deep Agents', sub: 'TODO 规划 · 文件系统\n子智能体 · deepagents 库' },
    { id: 'c11', kind: 'human', x: col(3) + 20, y: 200, w: 230, h: 110, label: '第11章 LangSmith', sub: '追踪 · 评估 · 提示工程\nStudio · 部署' },
  ],
  edges: [
    { from: 'c1', to: 'c2' }, { from: 'c2', to: 'c3' },
    { from: 'c3', to: 'c4', fs: 'r', ts: 'l', via: [[col(1) - 15, 315], [col(1) - 15, 85]] },
    { from: 'c4', to: 'c5' }, { from: 'c5', to: 'c6' },
    { from: 'c6', to: 'c7', fs: 'r', ts: 'l', via: [[col(2) - 15, 315], [col(2) - 15, 85]] },
    { from: 'c7', to: 'c8' }, { from: 'c8', to: 'c9' },
    { from: 'c9', to: 'c10', fs: 'r', ts: 'l', via: [[col(3) - 15, 315], [col(3) - 15, 105]] },
    { from: 'c10', to: 'c11' },
  ],
};
