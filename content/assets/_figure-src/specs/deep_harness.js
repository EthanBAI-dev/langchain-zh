module.exports = {
  title: 'Deep Agent = 模型 + 一层现成的"套件"（harness）', width: 1100, height: 430,
  caption: '最里面的模型和系统提示词是你最常改的；外面一圈装备开箱即用，按需打开或替换',
  groups: [
    { id: 'h', x: 0, y: 0, w: 1100, h: 430, label: '🧰 create_deep_agent(...) 套件', fill: 'rgba(241,245,249,.7)' },
    { id: 'core', x: 330, y: 120, w: 440, h: 200, label: '你最常改的两层', fill: 'rgba(227,242,253,.7)' },
  ],
  nodes: [
    { id: 'm', kind: 'llm', x: 360, y: 170, w: 180, h: 120, label: '🧠 模型', sub: 'model=\ninit_chat_model(\n"厂商:模型名")' },
    { id: 'sp', kind: 'note', x: 560, y: 170, w: 190, h: 120, label: '📄 系统提示词', sub: 'system_prompt=\n人设 · 领域 · 规矩\n每轮都会重新发送' },
    { id: 'fs', kind: 'store', x: 30, y: 60, w: 270, h: 100, label: '📁 文件系统工具', sub: 'ls · read_file · write_file\nedit_file · delete · glob · grep' },
    { id: 'sub', kind: 'human', x: 30, y: 200, w: 270, h: 90, label: '👥 子智能体 task', sub: '子任务在干净的上下文里做完' },
    { id: 'todo', kind: 'plain', x: 30, y: 320, w: 270, h: 90, label: '📝 任务清单（可选）', sub: 'TodoListMiddleware → write_todos' },
    { id: 'tools', kind: 'tool', x: 800, y: 60, w: 270, h: 100, label: '🔧 你的工具 / MCP 工具', sub: 'tools=[...]\n叠加在内置工具上，不替换' },
    { id: 'ctx', kind: 'node', x: 800, y: 200, w: 270, h: 90, label: '🗂 上下文管理', sub: '自动摘要 · 大结果存文件 · 提示缓存' },
    { id: 'hitl', kind: 'human', x: 800, y: 320, w: 270, h: 90, label: '⏸ 人工审批', sub: 'interrupt_on={...}' },
  ],
  edges: [
    { from: 'm', to: 'fs', both: true, dashed: true }, { from: 'm', to: 'sub', both: true, dashed: true }, { from: 'm', to: 'todo', both: true, dashed: true },
    { from: 'sp', to: 'tools', both: true, dashed: true }, { from: 'sp', to: 'ctx', both: true, dashed: true }, { from: 'sp', to: 'hitl', both: true, dashed: true },
  ],
};
