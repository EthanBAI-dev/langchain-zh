const { h, p, tip, card, cover, outro, item, list, checks, code, vs, grid, tile } = require('../lib');

module.exports = {
  id: '09',
  slug: '流式输出',
  theme: { accent: '#E8A500', soft: '#FFF0BF', deep: '#8A5A00', hl: '#A8D8FF' },
  cards: [
    cover({
      kicker: '用户体验 +100',
      title: 'AI 回答太慢？\n试试==流式输出==',
      size: 106,
      sub: '别让用户盯着空白干等',
      art: `<div class="art-row"><span class="sticker t1">⏳</span><span class="plus">→</span><span class="sticker c t2">⚡</span><span class="plus">→</span><span class="sticker y t3">💬</span></div>`,
      tags: ['Streaming', '流式', 'LangChain', 'AI 应用'],
    }),
    card(
      h('同样等 10 秒\n体验完全不同'),
      vs(
        { icon: '😴', title: '不流式', body: `<div>⏳ 空白……空白……空白……</div><div>10 秒后，答案==一下子==全出来</div>` },
        { icon: '🤩', title: '流式', body: `<div>⚡ 第 1 秒就开始==一个字一个字==往外蹦</div><div>还能看到"正在查天气…"这样的进度</div>` }
      ),
      `<div class="mt">${tip('Agent 一次可能要跑十几秒。流式 = 有什么先推什么。')}</div>`
    ),
    card(
      h('4 种流式，按需选', '`agent.stream(..., stream_mode=...)`'),
      list([
        item('📸', '`values`', '每走一步，给你==完整快照==。适合调试'),
        item('➕', '`updates`', '每走一步，只给==这一步的变化=='),
        item('⌨️', '`messages`', '模型==一个字一个字==地吐。适合聊天界面', 'hl'),
        item('📣', '`custom`', '你在工具里==自己喊话==，比如进度提示'),
      ])
    ),
    card(
      h('最常用：打字机效果'),
      code(
        `
for token, meta in agent.stream(
    {"messages": "写一首小诗"},
    stream_mode="messages",
):
    print(token.content, end="")
`,
        { mark: [3] }
      ),
      `<div class="mt">${tip('想同时要多种？传一个列表：`stream_mode=["values", "custom"]`。')}</div>`
    ),
    outro({
      body: checks(['`invoke` = 等全部跑完再给结果', '`stream` = ==边跑边给==，用户不用干等', '聊天界面用 `messages`，调试用 `values`', '工具里想报进度，用 `custom`']),
      next: '不改主流程，给 Agent 装**插件**',
    }),
  ],
};
