module.exports = {
  title: '新版 Introduction to LangChain：3 个模块，3 个项目', width: 1100, height: 430,
  caption: '每个模块最后都有一个综合项目；和 LangChain Essentials 重叠的部分在第 1–3 章，新内容在第 17–18 章',
  groups: [
    { id: 'g1', x: 0, y: 0, w: 350, h: 430, label: 'Module 1 · Create Agent（第 17 章上半）', fill: 'rgba(239,246,255,.7)' },
    { id: 'g2', x: 375, y: 0, w: 350, h: 430, label: 'Module 2 · Advanced Agent（第 17 章下半）', fill: 'rgba(255,247,237,.7)' },
    { id: 'g3', x: 750, y: 0, w: 350, h: 430, label: 'Module 3 · Context Engineering（第 18 章）', fill: 'rgba(240,253,244,.7)' },
  ],
  nodes: [
    { id: 'a', kind: 'llm', x: 20, y: 50, w: 310, h: 220, label: '🧠 基础', sub: '1.1 模型 · 提示词 · 结构化输出\n1.2 工具 · 联网搜索\n1.3 记忆\n1.4 多模态消息（图片 / 音频）' },
    { id: 'p1', kind: 'human', x: 20, y: 300, w: 310, h: 100, label: '🍳 项目：私人厨师', sub: '搜索 + 提示词 + 记忆' },
    { id: 'b', kind: 'tool', x: 395, y: 50, w: 310, h: 220, label: '🔧 进阶', sub: '2.1 MCP：工具 · 资源 · 提示词\n2.2 运行时上下文 vs 状态\n2.3 子智能体当工具\n附加：RAG · SQL' },
    { id: 'p2', kind: 'human', x: 395, y: 300, w: 310, h: 100, label: '💒 项目：婚礼策划', sub: '协调员 + 3 位专家' },
    { id: 'c', kind: 'node', x: 770, y: 50, w: 310, h: 220, label: '⚙️ 中间件', sub: '3.2 摘要 · 删除消息\n3.3 人在回路\n3.4 动态模型 · 提示词 · 工具' },
    { id: 'p3', kind: 'human', x: 770, y: 300, w: 310, h: 100, label: '📧 项目：邮件助手', sub: '登录 → 读信 → 审批发信' },
  ],
  edges: [{ from: 'a', to: 'p1' }, { from: 'b', to: 'p2' }, { from: 'c', to: 'p3' }],
};
