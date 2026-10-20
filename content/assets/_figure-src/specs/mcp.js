module.exports = {
  title: 'MCP：用统一协议"插上"外部工具', width: 1100, height: 380,
  caption: 'MultiServerMCPClient 把各个 MCP 服务器暴露的能力转成 LangChain 工具，直接塞进 create_agent(tools=...)',
  nodes: [
    { id: 'ag', kind: 'llm', x: 20, y: 140, w: 220, h: 90, label: '🤖 Agent', sub: 'create_agent(tools=mcp_tools)' },
    { id: 'cl', kind: 'node', x: 360, y: 130, w: 260, h: 110, label: 'MultiServerMCPClient', sub: 'langchain-mcp-adapters\nget_tools() → LangChain 工具' },
    { id: 's1', kind: 'tool', x: 760, y: 0, w: 320, h: 80, label: '⏰ time 服务器', sub: 'transport="stdio"（本地子进程）\nget_current_time / convert_time' },
    { id: 's2', kind: 'tool', x: 760, y: 145, w: 320, h: 80, label: '🗄️ 数据库服务器', sub: 'transport="streamable_http"（远程）' },
    { id: 's3', kind: 'tool', x: 760, y: 290, w: 320, h: 80, label: '📁 文件 / GitHub / 搜索…', sub: '社区现成的 MCP 服务器' },
  ],
  edges: [
    { from: 'ag', to: 'cl', both: true, label: '工具调用' },
    { from: 'cl', to: 's1', both: true, label: 'MCP' }, { from: 'cl', to: 's2', both: true, label: 'MCP' }, { from: 'cl', to: 's3', both: true, label: 'MCP' },
  ],
};
