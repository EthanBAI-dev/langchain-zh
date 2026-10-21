const { h, p, tip, warn, card, cover, outro, item, list, checks, code, flow, vs, grid, tile, bubble, chat } = require('../lib');

module.exports = {
  id: '10',
  slug: '中间件',
  theme: { accent: '#4F5BD5', soft: '#E0E3FF', deep: '#2E379A', hl: '#FFD966' },
  cards: [
    cover({
      kicker: '中间件 Middleware',
      title: '不改主流程\n给 Agent\n装==插件==',
      sub: '在关键位置"插个钩子"',
      art: `<div class="art-row"><span class="sticker t1">🤖</span><span class="plus">+</span><span class="sticker c t2">🧩</span><span class="plus">+</span><span class="sticker y t3">🪝</span></div>`,
      tags: ['Middleware', '中间件', 'LangChain 1.0', 'AI Agent'],
    }),
    card(
      h('钩子可以插在哪？', 'Agent 跑一圈，这些位置都能"插队"'),
      flow(
        [
          ['🚪', '`before_agent`', '整次运行开始前'],
          ['🧠', '`before_model` / `after_model`', '每次问模型之前 / 之后', 'hl'],
          ['🛠️', '`wrap_tool_call`', '把工具调用"包"起来'],
          ['🏁', '`after_agent`', '整次运行结束后'],
        ],
        { compact: true }
      ),
      `<div class="mt">${tip('还有 `wrap_model_call`：把整次模型调用包起来，能换提示词、换模型、失败重试。')}</div>`
    ),
    card(
      h('例 1：看人下菜碟', '同一个问题，顾客和员工权限不同'),
      chat(bubble('user', '查一下 Frank 最贵的一笔订单')),
      `<div style="height:30px"></div>`,
      vs(
        { icon: '🛍️', title: '顾客问', body: `<div>提示词里多一条："只能查专辑、歌手等公开表"</div><div>→ ==拒绝==查订单</div>` },
        { icon: '🧑‍💼', title: '员工问', body: `<div>没有限制</div><div>→ 查出来：==$13.86==</div>` }
      ),
      `<div class="mt">${tip('靠 `@dynamic_prompt` 中间件：每次调用前，按身份==现写==一份提示词。')}</div>`
    ),
    card(
      h('例 2：危险操作先审批', '`HumanInTheLoopMiddleware`'),
      flow(
        [
          ['🤖', 'Agent 想执行 SQL', '模型说：我要跑 `SELECT ...`'],
          ['⏸️', '自动暂停', '把要做的事交给人看', 'hl'],
          ['🧑‍💼', '你来拍板', '批准 ✅ / 拒绝 ❌（还能写原因）'],
          ['▶️', '接着跑', '用 `Command(resume=...)` 恢复'],
        ],
        { compact: true }
      ),
      `<div class="mt">${tip('暂停时要保存现场，所以==必须配 checkpointer==。')}</div>`
    ),
    card(
      h('现成的中间件', '拿来就用，不用自己写'),
      grid([tile('🧑‍⚖️', '人工审批', ''), tile('📝', '对话摘要', '太长自动压缩'), tile('🔁', '失败重试', ''), tile('🚦', '限制次数', '工具别调太多'), tile('🙈', '隐私打码', '手机号、邮箱等'), tile('✅', '待办清单', '让它先列计划')], 3)
    ),
    card(
      h('一个重要提醒'),
      `<div class="paper soft" style="font-size:42px;line-height:1.7;font-weight:700">用提示词限制权限，只是==软约束==。<br><br>模型有可能被"说服"绕过去。</div>`,
      `<div class="mt">${tip('真正的权限要在==工具和数据库==那一层卡死，比如只读账号、白名单。提示词只是第一道防线。', '🔐')}</div>`
    ),
    outro({
      body: checks(['中间件 = 在 Agent 流程里==插钩子==', '`@dynamic_prompt`：按身份动态改提示词', '`HumanInTheLoopMiddleware`：危险操作先审批', '很多现成中间件可直接用', '权限要在工具层面卡死']),
      next: '普通 Agent 干不了长活？**Deep Agents**',
    }),
  ],
};
