module.exports = {
  title: '部署：LangGraph Server 把你的图变成一个服务', width: 1100, height: 420,
  caption: 'langgraph dev 本地起服务；docker compose 自托管；或者用 LangSmith Deployment 托管到云端',
  groups: [{ id: 'srv', x: 300, y: 0, w: 500, h: 410, label: 'LangGraph Server（Agent Server）' }],
  nodes: [
    { id: 'sdk', kind: 'human', x: 0, y: 40, w: 220, h: 70, label: 'Python/JS SDK', sub: 'get_client(url=...)' },
    { id: 'rg', kind: 'human', x: 0, y: 140, w: 220, h: 70, label: 'RemoteGraph', sub: '像本地图一样调用' },
    { id: 'st', kind: 'human', x: 0, y: 240, w: 220, h: 70, label: '🎨 Studio', sub: '可视化调试' },
    { id: 'api', kind: 'node', x: 330, y: 40, w: 440, h: 70, label: 'HTTP API', sub: 'Assistants · Threads · Runs · Store · Crons' },
    { id: 'q', kind: 'llm', x: 330, y: 150, w: 210, h: 80, label: 'Queue Worker', sub: '执行你的图' },
    { id: 'g', kind: 'tool', x: 560, y: 150, w: 210, h: 80, label: '你的图', sub: 'langgraph.json 指向' },
    { id: 'pg', kind: 'store', x: 330, y: 290, w: 210, h: 80, label: 'Postgres', sub: '检查点 · 线程 · Store' },
    { id: 'rd', kind: 'store', x: 560, y: 290, w: 210, h: 80, label: 'Redis', sub: '流式消息 · 任务队列' },
    { id: 'ls', kind: 'plain', x: 860, y: 120, w: 230, h: 170, label: '核心概念', sub: 'Assistant：图 + 一组配置\nThread：多轮会话\nRun：一次执行\n(后台/流式/阻塞)\nDouble-texting：\n用户连发消息的策略' },
  ],
  edges: [
    { from: 'sdk', to: 'api' }, { from: 'rg', to: 'api', fs: 'r', ts: 'l', via: [[262, 175], [262, 75]] }, { from: 'st', to: 'api', fs: 'r', ts: 'l', via: [[262, 275], [262, 75]] },
    { from: 'api', to: 'q', fs: [0.25, 1], ts: [0.5, 0] }, { from: 'q', to: 'g', both: true }, { from: 'q', to: 'pg', both: true }, { from: 'q', to: 'rd', both: true },
  ],
};
