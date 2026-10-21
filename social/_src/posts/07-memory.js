const { h, p, tip, warn, card, cover, outro, item, list, checks, eq, code, bubble, chat } = require('../lib');

module.exports = {
  id: '07',
  slug: '短期记忆',
  theme: { accent: '#F0568C', soft: '#FFDDE8', deep: '#B42A5E', hl: '#FFE066' },
  cards: [
    cover({
      kicker: '让 Agent 记住你',
      title: '为什么 AI\n总是==记不住==\n上一句？',
      sub: '加一行代码就能治',
      art: `<div class="art-row"><span class="sticker t1">🐟</span><span class="plus">→</span><span class="sticker c t2">🧠</span><span class="plus">+</span><span class="sticker y t3">💾</span></div>`,
      tags: ['短期记忆', 'checkpointer', 'LangChain', 'AI Agent'],
    }),
    card(
      h('问题重现'),
      chat(
        bubble('user', '我是 Frank，我上一张发票多少钱？'),
        bubble('ai', '查到了，是 **$5.94**。'),
        bubble('user', '那里面都有哪些歌？'),
        bubble('ai', '……什么歌？🤔\n你说的是哪张发票？')
      ),
      `<div class="mt">${tip('第二句它就"失忆"了。', '🐟')}</div>`
    ),
    card(
      h('原因很简单', '每次调用 Agent，都是一次==全新的开始=='),
      `<div class="paper soft tilt" style="text-align:center"><div style="font-size:120px">🎧 🔄 🎧</div><div style="font-size:42px;font-weight:800;margin-top:20px;line-height:1.5">就像每打一次客服电话<br>都换了一个<mark>新客服</mark></div></div>`,
      `<div class="mt">${tip('之前说过的话，新客服一句都不知道。')}</div>`
    ),
    card(
      h('解决：加 2 处'),
      code(
        `
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model="openai:gpt-5",
    tools=[execute_sql],
    checkpointer=InMemorySaver(),
)

config = {"configurable": {"thread_id": "1"}}
agent.invoke({"messages": "..."}, config)
`,
        { small: true, mark: [6, 9], notes: { 6: '① 存聊天记录', 9: '② 对话编号' } }
      ),
      `<div class="mt">${tip('这次再问"里面都有哪些歌"，它就能列出那张发票里的曲目了。')}</div>`
    ),
    card(
      h('用聊天软件来理解'),
      eq([
        ['checkpointer', '聊天记录服务器', '💾', '☁️'],
        ['thread_id', '聊天窗口的编号', '🔢', '💬'],
      ]),
      `<div style="height:36px"></div>`,
      list([item('➡️', '同一个 thread_id', '接着上次聊'), item('🆕', '换一个 thread_id', '开一个全新的对话')])
    ),
    card(
      h('上线前注意'),
      list([
        item('⚠️', '`InMemorySaver` 存在内存里', '程序一重启，记忆就没了'),
        item('🗄️', '正式环境换成数据库', '比如 `SqliteSaver`、`PostgresSaver`', 'hl'),
        item('🧭', '这叫"短期记忆"', '只在==同一个对话==里有效。跨对话记住你，要用"长期记忆"'),
      ])
    ),
    outro({
      body: checks(['默认每次调用都是新开始，所以会"失忆"', '`checkpointer` 负责==保存聊天记录==', '`thread_id` 是==对话编号==，同号接着聊', '正式上线用数据库版的 checkpointer']),
      next: '让 AI 交**表格**，别交作文',
    }),
  ],
};
