const { h, p, tip, warn, card, cover, outro, item, list, checks, code, flow, grid, tile } = require('../lib');

const todo = `<div class="paper tilt" style="padding:36px 44px">
  <div style="font-size:34px;font-weight:900;margin-bottom:18px">📝 TODO</div>
  ${[
    ['✅', '把问题存进文件', 'line-through;color:var(--muted)'],
    ['🔄', '派小弟调研资料', 'none;font-weight:800'],
    ['⏳', '读资料、写报告', 'none'],
  ]
    .map(([e, t, d]) => `<div style="font-size:38px;line-height:1.9;text-decoration:${d}">${e} ${t}</div>`)
    .join('')}
</div>`;

module.exports = {
  id: '11',
  slug: 'deepagents三件法宝',
  theme: { accent: '#9B4DCA', soft: '#F0DEFA', deep: '#6A2A92', hl: '#FFE066' },
  cards: [
    cover({
      kicker: '能干"长活"的 Agent',
      title: '==Deep Agents==\n的三件法宝',
      sub: 'Claude Code、Manus 都在用的套路',
      art: `<div class="art-row"><span class="sticker t1">📝</span><span class="sticker c t2">🗂️</span><span class="sticker y t3">👥</span></div>`,
      tags: ['Deep Agents', '长任务', '上下文工程', 'LangChain'],
    }),
    card(
      h('长任务有多长？', '课程引用 Manus 的数据：\n平均每个任务约 ==50 次==工具调用'),
      list([
        item('🌀', '跑偏', '聊得越久，越容易忘了最初要干嘛'),
        item('💥', '脑子塞爆', '网页原文动不动几千字，把上下文挤满'),
        item('🤯', '信息打架', '几个子任务的资料混在一起，互相干扰'),
      ])
    ),
    card(
      `<div class="label">法宝一 · 治"跑偏"</div>`,
      h('📝 先列待办清单'),
      todo,
      `<div class="mt">${tip('每做完一步，就==把整张清单重写一遍==。相当于不停提醒自己：我要干啥、干到哪了。')}</div>`
    ),
    card(
      `<div class="label">法宝二 · 治"脑子塞爆"</div>`,
      h('🗂️ 大段资料存文件'),
      flow(
        [
          ['🔎', '搜到一篇长网页', '几千字原文'],
          ['💾', '原文写进文件', '`write_file("notes.md", ...)`', 'hl'],
          ['🧠', '脑子里只留文件名 + 一句摘要', '要细节时再 `read_file`'],
        ],
        { compact: true }
      )
    ),
    card(
      `<div class="label">法宝三 · 治"信息打架"</div>`,
      h('👥 派小弟去干'),
      list([
        item('📨', '主 Agent 只交代任务', '小弟==看不到==主 Agent 的聊天记录'),
        item('🧹', '小弟在干净的环境里干活', '不受别的任务干扰', 'hl'),
        item('📬', '干完只交一句结论', '详细资料写进共享文件'),
        item('⚡', '可以同时派好几个', '并行调研，更快'),
      ])
    ),
    card(
      h('官方库一步到位', '`pip install deepagents`'),
      code(
        `
from deepagents import create_deep_agent

agent = create_deep_agent(
    tools=[internet_search],
    system_prompt="你是一个研究专家",
)
agent.invoke({"messages": "调研 LangGraph 并写总结"})
`,
        { small: true, mark: [3] }
      ),
      `<div class="mt">${tip('自带读写文件、派子智能体（`task`）等工具。需要待办清单时，加上 `TodoListMiddleware`。')}</div>`
    ),
    outro({
      body: checks(['长任务三大难：==跑偏、塞爆、打架==', '📝 待办清单：反复提醒目标', '🗂️ 文件系统：大段资料存文件', '👥 子智能体：干净环境，只交结论']),
      next: 'Agent 出错了？先看**行车记录**',
    }),
  ],
};
