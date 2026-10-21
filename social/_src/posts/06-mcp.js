const { h, p, tip, warn, card, cover, outro, item, list, checks, vs, grid, tile, code } = require('../lib');

module.exports = {
  id: '06',
  slug: 'mcp是什么',
  theme: { accent: '#13A7C7', soft: '#D3F1F8', deep: '#0A6A80', hl: '#FFD966' },
  cards: [
    cover({
      kicker: '一个词搞懂 MCP',
      title: 'MCP：\nAI 界的\n==USB-C 接口==',
      sub: '工具即插即用',
      art: `<div class="art-row"><span class="sticker t1">🤖</span><span class="plus">⟷</span><span class="sticker y t2">🔌</span><span class="plus">⟷</span><span class="sticker c t3">🧰</span></div>`,
      tags: ['MCP', 'AI Agent', 'LangChain', '工具'],
    }),
    card(
      h('以前 vs 现在'),
      vs(
        { icon: '🍝', title: '以前：一个工具一种接法', body: `<div>每接一个新工具，都要单独写一遍对接代码</div><div>就像以前每台手机一种充电线</div>` },
        { icon: '🔌', title: '现在：统一用 MCP', body: `<div>工具做成 ==MCP 服务器==，AI 应用用==同一种方式==接上</div><div>就像现在一根 USB-C 走天下</div>` }
      )
    ),
    card(
      h('MCP 全名是什么？', '**M**odel **C**ontext **P**rotocol\n模型上下文协议'),
      p('一个==开放协议==，规定"工具提供方"和"AI 应用"怎么对话。'),
      p('社区已经做好了一大堆现成的：', 'muted'),
      grid([tile('🕒', '时间', ''), tile('📁', '文件系统', ''), tile('🐙', 'GitHub', ''), tile('🗄️', '数据库', ''), tile('🔎', '搜索', ''), tile('➕', '还有很多', '')], 3)
    ),
    card(
      h('在 LangChain 里接上', '用 `langchain-mcp-adapters`'),
      code(
        `
from langchain_mcp_adapters.client import (
    MultiServerMCPClient)

client = MultiServerMCPClient({
    "time": {
        "transport": "stdio",
        "command": "uvx",
        "args": ["--with", "mcp<2", "mcp-server-time"],
    }
})
tools = await client.get_tools()
agent = create_agent(model, tools=tools)
`,
        { small: true, mark: [11, 12], notes: { 11: '拿到工具', 12: '交给 Agent' } }
      ),
      `<div class="mt">${tip('`stdio` = 在本机启动一个小程序；远程服务器用 `streamable_http` + 网址。')}</div>`
    ),
    card(
      h('两个小提醒'),
      list([
        item('⏳', 'MCP 工具通常是"异步"的', '调用 Agent 时用 `ainvoke` / `astream`'),
        item('🔐', '只连你信得过的服务器', '工具能做什么，Agent 就能做什么'),
      ]),
      `<div class="mt">${tip('课程里用的是"时间"服务器：问它"旧金山现在几点"，它会调用 MCP 工具去查。', '🕒')}</div>`
    ),
    outro({
      body: checks(['MCP = 工具和 AI 应用之间的==统一接口==', '社区有大量==现成的== MCP 服务器', '`MultiServerMCPClient` 拿到工具，直接交给 Agent', '记得用 `ainvoke`，并且只连可信的服务器']),
      next: '为什么 AI 总是**记不住**上一句？',
    }),
  ],
};
