const { h, p, tip, card, cover, outro, item, list, checks, flow, bubble, chat } = require('../lib');

// 三步循环图（SVG），中间放一个"直到答完"的出口
const loop = `<svg viewBox="0 0 920 780" width="920" height="780" style="display:block;margin:0 auto;font-family:'Noto Sans SC','Noto Color Emoji',sans-serif">
  <defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#1D2327"/></marker></defs>
  <path d="M 540 150 A 300 300 0 0 1 735 470" fill="none" stroke="#1D2327" stroke-width="8" marker-end="url(#ah)"/>
  <path d="M 640 640 A 300 300 0 0 1 280 640" fill="none" stroke="#1D2327" stroke-width="8" marker-end="url(#ah)"/>
  <path d="M 185 470 A 300 300 0 0 1 380 150" fill="none" stroke="#1D2327" stroke-width="8" marker-end="url(#ah)"/>
  <g transform="translate(460 130)"><rect x="-170" y="-90" width="340" height="180" rx="40" fill="#E6E0FF" stroke="#1D2327" stroke-width="5"/><text y="-12" text-anchor="middle" font-size="60">🧠</text><text y="58" text-anchor="middle" font-size="44" font-weight="900" fill="#1D2327">① 想</text></g>
  <g transform="translate(730 560)"><rect x="-170" y="-90" width="340" height="180" rx="40" fill="#fff" stroke="#1D2327" stroke-width="5"/><text y="-12" text-anchor="middle" font-size="60">🛠️</text><text y="58" text-anchor="middle" font-size="44" font-weight="900" fill="#1D2327">② 做</text></g>
  <g transform="translate(190 560)"><rect x="-170" y="-90" width="340" height="180" rx="40" fill="#FFE066" stroke="#1D2327" stroke-width="5"/><text y="-12" text-anchor="middle" font-size="60">👀</text><text y="58" text-anchor="middle" font-size="44" font-weight="900" fill="#1D2327">③ 看</text></g>
  <text x="460" y="410" text-anchor="middle" font-size="40" font-weight="900" fill="#4B32C8">ReAct 循环</text>
  <text x="460" y="462" text-anchor="middle" font-size="30" font-weight="600" fill="#4A555C">转到不需要工具为止</text>
</svg>`;

module.exports = {
  id: '03',
  slug: 'react循环',
  theme: { accent: '#7C5CFF', soft: '#E6E0FF', deep: '#4B32C8', hl: '#FFD966' },
  cards: [
    cover({
      kicker: 'Agent 的大脑回路',
      title: '边想边做\n==想→做→看==',
      sub: '一张图看懂 ReAct 循环',
      art: `<div class="art-row"><span class="sticker c t1">🧠</span><span class="plus">→</span><span class="sticker t2">🛠️</span><span class="plus">→</span><span class="sticker y t3">👀</span></div>`,
      tags: ['ReAct', 'AI Agent', 'LangChain', '图解'],
    }),
    card(h('ReAct = 推理 + 行动', '**Re**ason 想一想，**Act** 动动手'), loop),
    card(
      h('像不像你找钥匙？'),
      flow(
        [
          ['🧠', '想：可能在包里', ''],
          ['🛠️', '做：翻包', ''],
          ['👀', '看：没有……', '', 'bad'],
          ['🧠', '想：可能在门口鞋柜上', ''],
          ['🛠️', '做：去鞋柜看', ''],
          ['🎉', '看：找到了！不用再找', '循环结束', 'hl'],
        ],
        { compact: true }
      )
    ),
    card(
      h('换成 Agent 是这样', '每一步都是一条"消息"'),
      chat(
        bubble('user', '哪张表的数据最多？', '你的问题'),
        bubble('ai', '我要用 `execute_sql`\n先查一下有哪些表', '🧠 想 + 下单'),
        bubble('tool', "Album, Artist, Track, ...", '🛠️ 工具执行结果'),
        bubble('ai', '再数一数每张表的行数……', '🧠 接着想'),
        bubble('ai', '数据最多的是 **PlaylistTrack**', '✅ 不用工具了 → 回答')
      )
    ),
    card(
      h('什么时候停下来？'),
      list([
        item('🛑', '模型觉得够了', '不再要求用工具，直接给出答案 → 结束', 'hl'),
        item('🔁', '出错不会卡死', '错误信息作为"观察结果"送回去，模型自己改'),
        item('🧾', '全程留痕', '每一步的想法、工具、结果都记在消息列表里'),
      ]),
      `<div class="mt">${tip('好消息：这个循环 LangChain 的 `create_agent` 已经帮你写好了，==你只需要给它工具==。')}</div>`
    ),
    outro({
      body: checks([
        'ReAct = ==想 → 做 → 看==，一直循环',
        '直到模型觉得不需要工具了，才给出答案',
        '错误也是"观察结果"，Agent 能==自我修正==',
        '`create_agent` 里已经内置了这个循环',
      ]),
      next: '**10 来行代码**，亲手造一个 Agent',
    }),
  ],
};
