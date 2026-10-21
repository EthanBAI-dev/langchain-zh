module.exports = {
  title: '模型从不自己执行工具：它只"开单子"，执行器去跑', width: 1100, height: 380, dur: 2400,
  nodes: [
    { id: 'u', kind: 'human', x: 20, y: 40, w: 200, h: 80, label: '🧑 用户', sub: '哪五种流派曲目最多？' },
    { id: 'm', kind: 'llm', x: 300, y: 40, w: 220, h: 80, label: '🧠 模型', sub: '读问题 + 工具说明' },
    { id: 't', kind: 'tool', x: 300, y: 230, w: 220, h: 80, label: '🔧 工具执行器', sub: '真正运行 Python 函数' },
    { id: 'db', kind: 'store', x: 20, y: 230, w: 200, h: 80, label: '🗄 chinook.db', sub: 'read_sql 查询' },
  ],
  edges: [
    { from: 'u', to: 'm' },
    { from: 'm', to: 't', id: 'call', label: 'tool_calls', fs: [0.15, 1], ts: [0.15, 0], lt: 0.35 },
    { from: 't', to: 'db', both: true },
    { from: 't', to: 'm', id: 'back', label: 'ToolMessage', fs: [0.85, 0], ts: [0.85, 1], lt: 0.65 },
  ],
  panels: [{ id: 'c', x: 580, y: 0, w: 500, h: 320, title: '消息历史', mono: true }],
  frames: [
    { hl: ['u', 'u->m', 'm'], panels: { c: '+ Human: 哪五种流派曲目最多？' }, caption: '① 用户提问，模型同时看到问题和每个工具的说明（名字 + 文档字符串 + 参数）' },
    { hl: ['m', 'call', 't'], panels: { c: 'Human: 哪五种流派曲目最多？\n+ AI: tool_calls=[read_sql(\n+   query="SELECT g.Name, COUNT(*) …")]' }, caption: '② 模型只输出一张"调用单"：想调 read_sql，参数是一段 SQL' },
    { hl: ['t', 't->db', 'db'], panels: { c: 'Human: 哪五种流派曲目最多？\nAI: tool_calls=[read_sql(…)]\n~ 执行器运行 read_sql(…) 查库中……' }, caption: '③ 执行器真正运行你写的函数；多个互不相关的调用会同时执行' },
    { hl: ['back', 'm'], panels: { c: 'Human: 哪五种流派曲目最多？\nAI: tool_calls=[read_sql(…)]\n+ Tool: [("Rock", 1297), ("Latin", 579), …]' }, caption: '④ 结果包成 ToolMessage 回到模型' },
    { hl: ['m'], panels: { c: 'Human: 哪五种流派曲目最多？\nAI: tool_calls=[read_sql(…)]\nTool: [("Rock", 1297), …]\n+ AI: "最多的是 Rock（1297 首）……\n+      所用 SQL：SELECT …"' }, caption: '⑤ 模型根据工具结果写最终回答，没有新的 tool_calls，循环结束', dur: 3400 },
  ],
};
