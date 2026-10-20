const L = require('../lib');
const { h, p, tip, card, cover, outro, item, list, checks, flow, chips } = L;

// 分层示意图：底下是 LangGraph，往上叠，LangSmith 竖在旁边
const layers = `<div style="display:flex;gap:26px;align-items:stretch">
  <div style="flex:1;display:flex;flex-direction:column;gap:18px">
    ${[
      ['🛻', 'Deep Agents', '改装好的越野车', '#F0DEFA'],
      ['🚗', 'LangChain', '整车底盘', 'var(--soft)'],
      ['⚙️', 'LangGraph', '发动机', '#FFE9B8'],
    ]
      .map(
        ([e, n, d, c], i) => `<div style="background:${c};border:3px solid var(--ink);border-radius:28px;padding:26px 30px;display:flex;align-items:center;gap:24px;box-shadow:6px 6px 0 var(--ink);margin:0 ${i * 0}px">
        <span style="font-size:72px">${e}</span><div><div style="font-size:44px;font-weight:900">${n}</div><div style="font-size:30px;color:var(--ink2);font-weight:600">${d}</div></div></div>`
      )
      .join('')}
  </div>
  <div style="width:250px;background:#1D2327;color:#fff;border-radius:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px;text-align:center;box-shadow:6px 6px 0 var(--accent)">
    <span style="font-size:72px">📊</span><div style="font-size:38px;font-weight:900;line-height:1.2">Lang<br>Smith</div><div style="font-size:28px;color:#C9D1D6">仪表盘<br>+ 4S 店</div>
  </div></div>`;

module.exports = {
  id: '01',
  slug: 'langchain全家桶',
  theme: { accent: '#14A38B', soft: '#D2F2EA', deep: '#0B6B5C', hl: '#FFD966' },
  cards: [
    cover({
      kicker: 'AI 应用开发 · 零基础',
      title: '一张图看懂\n==LangChain==\n全家桶',
      sub: '4 个名字，再也不搞混',
      art: `<div class="art-row"><span class="sticker t1">⚙️</span><span class="sticker c t2">🚗</span><span class="sticker t3">🛻</span><span class="sticker y t2">📊</span></div>`,
      tags: ['LangGraph', 'LangChain', 'Deep Agents', 'LangSmith'],
    }),
    card(h('先记住一句话', '它们是==一层叠一层==的，像造一辆车'), layers, `<div class="mt">${tip('越往上越省事，越往下越灵活。')}</div>`),
    card(
      `<div class="label">第 1 层 · 最底下</div>`,
      h('⚙️ LangGraph\n= 发动机'),
      p('把一件事拆成一张"流程图"：'),
      list([item('🟣', '节点', '每个节点干一件小事'), item('➡️', '连线', '决定下一步去哪'), item('💾', '自带存档', '能暂停、能回退、能接着跑')]),
      `<div class="mt">${tip('**什么时候用**：流程很特别，需要自己精细控制每一步。')}</div>`
    ),
    card(
      `<div class="label">第 2 层 · 中间</div>`,
      h('🚗 LangChain\n= 整车底盘'),
      p('不用自己画图，==几行代码==就能造出一个"会用工具的 AI 助手"。'),
      `<div class="paper soft" style="text-align:center"><div style="font-size:34px;color:var(--ink2);font-weight:600;margin-bottom:16px">核心就一个函数</div><div class="mono" style="font-size:64px;font-weight:800;color:var(--deep)">create_agent()</div></div>`,
      `<div class="mt">${tip('**什么时候用**：大多数情况。新手==从这里开始==。')}</div>`
    ),
    card(
      `<div class="label">第 3 层 · 最上面</div>`,
      h('🛻 Deep Agents\n= 改装越野车'),
      p('在 LangChain 上加满装备，专门跑"长途"：'),
      list([item('📝', '会列计划', '先写待办清单，做一项勾一项'), item('🗂️', '会记笔记', '资料存进文件，脑子不塞满'), item('👥', '会派小弟', '把子任务交给子智能体')]),
      `<div class="mt">${tip('**什么时候用**：要连续干几十步的长任务，比如深度调研、写代码。')}</div>`
    ),
    card(
      `<div class="label">贯穿全程</div>`,
      h('📊 LangSmith\n= 仪表盘 + 4S 店'),
      p('Agent 跑起来像个黑盒，LangSmith 帮你：'),
      list([item('🔍', '看清每一步', '调了几次模型、用了什么工具'), item('🧪', '打分评估', '改了提示词，到底变好没'), item('🚀', '部署上线', '把 Agent 变成线上服务')]),
      `<div class="mt">${tip('**什么时候用**：==从写第一行代码就打开==。')}</div>`
    ),
    outro({
      title: '怎么选？一张卡说清',
      body: flow(
        [
          ['1', '刚入门', '先学 **LangChain** 的 `create_agent`', 'hl'],
          ['2', '流程要自己设计', '往下学 **LangGraph**'],
          ['3', '要干长任务', '往上用 **Deep Agents**'],
          ['∞', '任何时候', '打开 **LangSmith** 看看它在干嘛'],
        ],
        { compact: true }
      ),
      next: '**Agent** 到底是什么？',
    }),
  ],
};
