const { h, p, tip, card, cover, outro, item, list, checks, flow, vs, bubble, chat, grid, tile } = require('../lib');

module.exports = {
  id: '02',
  slug: 'agent是什么',
  theme: { accent: '#FF6B4A', soft: '#FFE0D6', deep: '#C2412A', hl: '#FFE066' },
  cards: [
    cover({
      kicker: '3 分钟搞懂 AI Agent',
      title: 'ChatGPT 会聊天\nAgent 会==干活==',
      size: 100,
      sub: '它们到底差在哪？',
      art: `<div class="art-row"><span class="sticker t1">💬</span><span class="plus">→</span><span class="sticker c t2">🤖</span><span class="plus">+</span><span class="sticker y t3">🛠️</span></div>`,
      tags: ['AI Agent', '大模型', 'LangChain', '零基础'],
    }),
    card(
      h('同一个问题\n两种回答'),
      bubble('user', '我们店上个月哪种音乐卖得最好？'),
      `<div style="height:30px"></div>`,
      vs(
        { icon: '💬', title: '普通聊天 AI', body: `<div>"抱歉，我看不到你的数据库……"</div><div>只能凭记忆==瞎猜==或者==拒绝==</div>` },
        { icon: '🤖', title: 'Agent', body: `<div>自己去查数据库 → 看结果 → 算出答案</div><div>给你==真实数据==</div>` }
      )
    ),
    card(
      h('Agent = 3 样东西', '少一样都不行'),
      list([
        item('🧠', '大模型 = 大脑', '负责思考：下一步该干嘛', 'hl'),
        item('🛠️', '工具 = 手脚', '查数据库、搜网页、算数、发邮件……'),
        item('📜', '提示词 = 规则', '你是谁、能做什么、不能做什么'),
      ]),
      `<div class="mt">${tip('把它想成一个==新来的实习生==：聪明（大脑），有电脑权限（工具），也拿到了员工手册（规则）。')}</div>`
    ),
    card(
      h('一个反直觉的真相', '模型其实==从不亲自动手=='),
      chat(
        bubble('ai', '我想用 **查数据库** 工具\n参数：`SELECT ...`', '🤖 模型：只"说"'),
        bubble('tool', '框架去真正执行，\n把结果交回给模型', '⚙️ 框架：真"做"')
      ),
      `<div class="mt">${tip('模型只会输出一句"我想调用哪个工具、传什么参数"。真正去执行的，是 LangChain 这样的框架。')}</div>`
    ),
    card(
      h('看它怎么干活', '一个查数据库的 Agent'),
      flow(
        [
          ['🙋', '你提问', '"哪张表数据最多？"'],
          ['🔍', '先看看有哪些表', '它一开始也不知道表结构'],
          ['✍️', '写 SQL 去查', '一次查一条'],
          ['❌', '写错了？自己改', '错误信息会发回给它，改完再查', 'bad'],
          ['✅', '用人话回答你', '', 'hl'],
        ],
        { compact: true }
      )
    ),
    outro({
      body: checks([
        'Agent 不只会聊，还会==调用工具去干活==',
        'Agent = **大脑**（模型）+ **手脚**（工具）+ **规则**（提示词）',
        '模型只"说"要用什么工具，==框架负责"做"==',
        '出错了也不怕，错误会送回给它==自己改==',
      ]),
      next: 'Agent 的大脑回路：**想 → 做 → 看**',
    }),
  ],
};
