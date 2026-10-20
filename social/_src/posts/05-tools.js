const { h, p, tip, card, cover, outro, item, list, checks, vs, result, code } = require('../lib');

module.exports = {
  id: '05',
  slug: '工具说明书',
  theme: { accent: '#FF8A1F', soft: '#FFE8CC', deep: '#B45700', hl: '#A8EBD0' },
  cards: [
    cover({
      kicker: '写好工具的秘诀',
      title: 'AI 怎么知道\n该用哪个==工具==？',
      size: 106,
      sub: '答案：靠你写的"说明书"',
      art: `<div class="art-row"><span class="sticker t1">🛠️</span><span class="plus">+</span><span class="sticker c t2">📖</span><span class="plus">=</span><span class="sticker y t3">🎯</span></div>`,
      tags: ['@tool', '工具调用', 'LangChain', '提示词'],
    }),
    card(
      h('模型==看不到==你的代码', '它只能看到工具的 3 样东西'),
      list([
        item('🏷️', '名字', '比如 `calculator`', 'hl'),
        item('📖', '说明', '就是函数下面那段 docstring'),
        item('🔢', '参数', '要填哪些、分别是什么类型'),
      ]),
      `<div class="mt">${tip('所以工具的说明书，本质上就是==写给 AI 看的提示词==。')}</div>`
    ),
    card(
      h('一个真实的小实验', '计算器的说明写的是："对两个**实数**做运算"'),
      list([
        item('✅', '3.1125 × 4.1234', '有小数 → 乖乖调用计算器'),
        item('🤔', '3 × 4', '常常==不调用==：以为整数不归它管'),
        item('😏', '3.0 × 4.0', '常常==不调用==：太简单，自己心算了'),
      ]),
      `<div class="mt">${tip('同一个工具，只因为说明写得含糊，模型就"不敢用"或"懒得用"。', '🧪')}</div>`
    ),
    card(
      h('改一句说明就好了'),
      vs(
        { icon: '😕', title: '改之前', body: `<div>"对两个实数做运算。"</div><div>只说了它==能做什么==</div>` },
        { icon: '😎', title: '改之后', body: `<div>"对数字做运算时都用它，==整数也算==。"</div><div>还说清了==什么时候该用==</div>` }
      ),
      `<div class="mt">${tip('改完以后，`3 × 4` 也会稳定地调用工具了。')}</div>`
    ),
    card(
      h('写工具的 3 条经验'),
      list([
        item('1️⃣', '写清"什么时候用"', '不只写它能干嘛', 'hl'),
        item('2️⃣', '参数类型写死', '只能选几个值的，就用 `Literal` 列出来'),
        item('3️⃣', '出错别崩溃', '返回一句看得懂的错误，让模型自己改'),
      ]),
      `<div style="height:30px"></div>`,
      code(`
operation: Literal[
    "add", "subtract", "multiply", "divide"
]`, { small: true, title: '经验 2 的写法' })
    ),
    outro({
      body: checks(['模型只看 ==名字 + 说明 + 参数==，看不到代码', '说明含糊，模型就会"不敢用"或"懒得用"', '说明里写清==什么时候该用==', '参数用明确类型，出错返回可读信息']),
      next: '**MCP**：AI 界的 USB-C 接口',
    }),
  ],
};
