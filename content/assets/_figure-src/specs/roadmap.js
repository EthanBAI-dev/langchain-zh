const col = (i) => 20 + i * 400;
const W = 360, H = 54, STEP = 66, TOP = 52;
const row = (i) => TOP + i * STEP;
const n = (id, kind, c, r, label, sub) => ({ id, kind, x: col(c) + 20, y: row(r), w: W - 40, h: H, label, sub });
module.exports = {
  title: '本教程学习路线（对应 LangChain Academy 的课程）', width: 1220, height: 540,
  caption: '建议按 ①→③ 顺序学习：先会"用"Agent，再懂"图"的原理，最后上 Deep Agents 与 LangSmith',
  groups: [
    { id: 'g1', x: col(0), y: 0, w: W, h: 530, label: '阶段① LangChain 入门（第 1–5 章）', kind: 'group', fill: 'rgba(227,242,253,.6)' },
    { id: 'g2', x: col(1), y: 0, w: W, h: 530, label: '阶段② LangGraph 核心（第 6–11 章）', kind: 'group', fill: 'rgba(243,229,245,.6)' },
    { id: 'g3', x: col(2), y: 0, w: W, h: 530, label: '阶段③ Deep Agents 与 LangSmith（第 12–18 章）', kind: 'group', fill: 'rgba(252,228,236,.6)' },
  ],
  nodes: [
    n('c1', 'llm', 0, 0, '第1章 十分钟造 Agent', 'create_agent · SQL 智能体'),
    n('c2', 'llm', 0, 1, '第2章 Agent 的积木', '消息 · 流式 · 工具 · MCP'),
    n('c3', 'llm', 0, 2, '第3章 记忆与中间件', '短期记忆 · 结构化输出 · 人工审批'),
    n('c4', 'llm', 0, 3, '第4章 模型、多模态与多智能体', '私人厨师 · 婚礼策划两个项目'),
    n('c5', 'llm', 0, 4, '第5章 管理消息与动态 Agent', '摘要 · 删除消息 · 邮件助手项目'),
    n('c6', 'node', 1, 0, '第6章 图的基本功', '状态 · 节点 · 边 · ReAct'),
    n('c7', 'node', 1, 1, '第7章 状态与短期记忆', 'Reducer · 多 Schema · 摘要'),
    n('c8', 'node', 1, 2, '第8章 人在回路', '断点 · 改状态 · 时间旅行'),
    n('c9', 'node', 1, 3, '第9章 并行与多智能体', '扇出扇入 · 子图 · Map-Reduce'),
    n('c10', 'node', 1, 4, '第10章 长期记忆', 'Store · Profile · Collection'),
    n('c11', 'node', 1, 5, '第11章 部署上线', 'Server · SDK · Assistants'),
    n('c12', 'human', 2, 0, '第12章 Deep Agents 原理', '规划 · 文件系统 · 子智能体'),
    n('c13', 'human', 2, 1, '第13章 LangSmith 概览', '追踪 · 评估 · 提示工程'),
    n('c14', 'human', 2, 2, '第14章 Deep Agents 上手', '官方 deepagents 库'),
    n('c15', 'human', 2, 3, '第15章 运行环境与上下文', '后端 · 沙箱 · 技能 · 记忆'),
    n('c16', 'human', 2, 4, '第16章 委派与综合项目', '子智能体团队 · 部署'),
    n('c17', 'human', 2, 5, '第17章 追踪与评估', '数据集 · 评估器 · 实验'),
    n('c18', 'human', 2, 6, '第18章 提示工程与生产监控', 'Prompt Hub · 在线评估'),
  ],
  edges: [
    ...[1, 2, 3, 4].map((i) => ({ from: `c${i}`, to: `c${i + 1}` })),
    { from: 'c5', to: 'c6', fs: 'r', ts: 'l', via: [[col(1) - 20, row(4) + H / 2], [col(1) - 20, row(0) + H / 2]] },
    ...[6, 7, 8, 9, 10].map((i) => ({ from: `c${i}`, to: `c${i + 1}` })),
    { from: 'c11', to: 'c12', fs: 'r', ts: 'l', via: [[col(2) - 20, row(5) + H / 2], [col(2) - 20, row(0) + H / 2]] },
    ...[12, 13, 14, 15, 16, 17].map((i) => ({ from: `c${i}`, to: `c${i + 1}` })),
  ],
};
