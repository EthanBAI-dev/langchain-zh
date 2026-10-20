const todo = (a, b, c) => `${a} 搜集 MCP 资料\n${b} 整理要点写入文件\n${c} 撰写最终回答`;
module.exports = {
  title: 'Deep Agent 工作过程：规划 → 委派 → 落盘 → 汇总', width: 1100, height: 430, dur: 2700,
  nodes: [
    { id: 'u', kind: 'human', x: 10, y: 20, w: 200, h: 64, label: '🧑 "介绍一下 MCP"' },
    { id: 'm', kind: 'llm', x: 10, y: 170, w: 200, h: 90, label: '🧠 主 Agent', sub: '协调者' },
    { id: 's', kind: 'human', x: 300, y: 320, w: 240, h: 90, label: '👥 research-agent', sub: '干净上下文\n只看到子任务描述' },
    { id: 'w', kind: 'tool', x: 300, y: 20, w: 240, h: 64, label: '🔎 web_search', sub: '大量原始网页' },
  ],
  edges: [
    { from: 'u', to: 'm' },
    { from: 'm', to: 's', id: 'task', label: 'task(...)' },
    { from: 's', to: 'w', id: 'srch', fs: [0.8, 0], ts: [0.8, 1], label: '搜索' },
    { from: 's', to: 'm', id: 'back', fs: 'l', ts: 'b', via: [[110, 365]], dashed: true, label: '只回传结论' },
  ],
  panels: [
    { id: 'todo', x: 590, y: 0, w: 490, h: 120, mono: true, title: '📝 state["todos"]' },
    { id: 'files', x: 590, y: 135, w: 490, h: 140, mono: true, title: '📁 state["files"]（虚拟文件系统）' },
    { id: 'ctx', x: 590, y: 290, w: 490, h: 130, mono: true, title: '🧠 主 Agent 上下文里实际有什么' },
  ],
  frames: [
    { hl: ['u', 'u->m', 'm', 'todo'], panels: { todo: '+ ' + todo('⏳', '⏳', '⏳').split('\n').join('\n+ '), files: '~ （空）', ctx: '用户问题\n+ write_todos(...)  ← 先列计划' }, caption: '① 先规划：write_todos 写下任务清单（Claude Code / Manus 都这么做）' },
    { hl: ['task', 's', 'todo'], tokens: [{ edge: 'task', t: 0.5 }], panels: { todo: todo('🔄', '⏳', '⏳'), files: '~ （空）', ctx: '用户问题 · TODO\n+ task("调研 MCP 是什么", "research-agent")' }, caption: '② 委派：用 task 工具把调研交给子智能体，它从零开始、只看到这个子任务' },
    { hl: ['srch', 'w', 's', 'files'], panels: { todo: todo('🔄', '⏳', '⏳'), files: '+ /mcp_raw_1.md  (8,000 tokens 网页原文)\n+ /mcp_raw_2.md  (6,500 tokens)', ctx: '用户问题 · TODO · task 调用\n~ （子智能体的搜索过程不会进来）' }, caption: '③ 子智能体搜索；大段原文写进文件系统，而不是塞进上下文' },
    { hl: ['back', 'm', 'todo', 'files'], panels: { todo: todo('✅', '✅', '🔄'), files: '/mcp_raw_1.md\n/mcp_raw_2.md\n+ /mcp_summary.md  (精炼要点)', ctx: '用户问题 · TODO · task 调用\n+ ToolMessage: "MCP 是…要点见 /mcp_summary.md"\n+ write_todos(更新状态) ← 复述计划' }, caption: '④ 子智能体只回传一段结论；主 Agent 更新 TODO（复述目标，防止跑偏）' },
    { hl: ['m', 'todo'], panels: { todo: todo('✅', '✅', '✅'), files: '/mcp_raw_1.md\n/mcp_raw_2.md\n/mcp_summary.md', ctx: '+ read_file("/mcp_summary.md")\n+ 🤖 最终回答：MCP（Model Context Protocol）是…' }, caption: '⑤ 需要细节时再 read_file 读回来，最后汇总作答。上下文始终保持精简', dur: 3800 },
  ],
};
