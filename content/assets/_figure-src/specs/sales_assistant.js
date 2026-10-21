module.exports = {
  title: '综合项目：Chinook 销售助理（少量代码 + 大量文字）', width: 1100, height: 500,
  caption: '代码只负责工具、子智能体和一次 create_deep_agent 调用；行为大多写在 AGENTS.md 和 skills/ 这些文字文件里',
  groups: [
    { id: 'dev', x: 230, y: 0, w: 870, h: 500, label: '🚀 langgraph dev（http://localhost:2024）', fill: 'rgba(241,245,249,.7)' },
  ],
  nodes: [
    { id: 'ui', kind: 'human', x: 10, y: 180, w: 190, h: 110, label: '🧑 聊天界面', sub: 'Studio /\nagent-chat-ui\n审批卡片' },
    { id: 'main', kind: 'llm', x: 260, y: 170, w: 250, h: 130, label: '🤖 销售助理（主 Agent）', sub: 'markdown_to_html · 画图\n邮件 MCP 工具\neval（报价算账）' },
    { id: 'txt', kind: 'note', x: 260, y: 40, w: 250, h: 100, label: '📄 AGENTS.md + skills/', sub: '操作手册（记忆）\nrfq-quote · weekly-newsletter\nterritory-report' },
    { id: 'an', kind: 'tool', x: 580, y: 40, w: 240, h: 90, label: '👥 chinook-analyst', sub: '查库 · add_customer ⏸' },
    { id: 'rv', kind: 'tool', x: 580, y: 150, w: 240, h: 80, label: '👥 quote-reviewer', sub: '强模型复核报价' },
    { id: 'ib', kind: 'tool', x: 580, y: 250, w: 240, h: 90, label: '👥 inbox-manager', sub: '读信 · mail_create_draft ⏸' },
    { id: 'gr', kind: 'tool', x: 580, y: 360, w: 240, h: 90, label: '👥 genre-researcher', sub: '联网搜索（有 Tavily Key 才启用）' },
    { id: 'db', kind: 'store', x: 860, y: 40, w: 220, h: 90, label: '🗄 chinook.db', sub: 'Jane 的客户\nSupportRepId = 3' },
    { id: 'mail', kind: 'store', x: 860, y: 250, w: 220, h: 90, label: '📁 模拟邮箱', sub: 'MCP 服务器 :5002' },
    { id: 'out', kind: 'store', x: 260, y: 350, w: 250, h: 100, label: '📁 outputs/', sub: '报价台账 · 通讯 HTML\n区域报告 + 图表' },
  ],
  edges: [
    { from: 'ui', to: 'main', both: true }, { from: 'txt', to: 'main', dashed: true },
    { from: 'main', to: 'an' }, { from: 'main', to: 'rv' }, { from: 'main', to: 'ib' }, { from: 'main', to: 'gr' },
    { from: 'an', to: 'db', both: true }, { from: 'ib', to: 'mail', both: true }, { from: 'main', to: 'out' },
  ],
};
