const { h, p, tip, card, cover, outro, item, list, checks, code, flow } = require('../lib');

const trace = `<div class="result" style="font-size:30px">
  <div class="rtitle">一条 trace 长这样 👇</div>
  ${[
    ['▼ agent', '3.2s', 0, 800],
    ['▼ 🧠 model', '1.1s', 1, 700],
    ['→ 我要用 calculator', '', 2, 500],
    ['▼ 🛠️ tools', '0.01s', 1, 700],
    ['→ 12.83', '', 2, 500],
    ['▼ 🧠 model', '1.9s', 1, 700],
    ['→ "答案约是 12.83"', '', 2, 500],
  ]
    .map(([t, s, d, w]) => `<div class="rl" style="display:flex;justify-content:space-between;padding-left:${d * 44}px;font-weight:${w}"><span>${t}</span><span style="color:var(--muted)">${s}</span></div>`)
    .join('')}
</div>`;

module.exports = {
  id: '12',
  slug: 'langsmith',
  theme: { accent: '#0F8F8F', soft: '#D0F0EE', deep: '#0A5F5F', hl: '#FFD966' },
  cards: [
    cover({
      kicker: 'LangSmith 入门',
      title: 'Agent 出错了？\n先看==行车记录==',
      size: 106,
      sub: '别再盯着最终答案瞎猜',
      art: `<div class="art-row"><span class="sticker t1">🕵️</span><span class="plus">+</span><span class="sticker c t2">📹</span><span class="plus">+</span><span class="sticker y t3">📊</span></div>`,
      tags: ['LangSmith', '调试', '评估', 'AI Agent'],
    }),
    card(h('Agent 是个黑盒', 'LangSmith 把每一步都录下来'), trace, `<div class="mt">${tip('点开任意一步，能看到模型==实际收到==的提示词、工具说明和消息。')}</div>`),
    card(
      h('打开它，不用改代码', '设置几个环境变量就行'),
      code(
        `
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=my-first-agent
`,
        { title: '.env', mark: [2] }
      ),
      `<div class="mt">${tip('之后每次运行 Agent，都会在 smith.langchain.com 留下一条记录。')}</div>`
    ),
    card(
      h('改完提示词\n变好了吗？', '别凭感觉，跑一遍"考试"'),
      flow(
        [
          ['📚', '建题库', '一批"问题 + 标准答案"'],
          ['🧑‍🏫', '写判分规则', '对比答案，或让 AI 当裁判'],
          ['🏃', '跑实验', '让 Agent 把题库做一遍', 'hl'],
          ['⚖️', '并排对比', '哪些题变好了、哪些变差了'],
        ],
        { compact: true }
      )
    ),
    card(
      h('上线以后呢？', '形成一个改进的闭环'),
      list([
        item('📡', '在线评估', '对真实用户的对话自动打分'),
        item('🧩', '归纳问题', '从大量记录里找出常见的坑'),
        item('🔁', '坏例子进题库', '下次改完，先考过再上线', 'hl'),
      ])
    ),
    outro({
      body: checks(['调试 Agent 的第一反应：==去看 trace==', '开追踪只要设环境变量', '改动之前先建题库、跑实验', '线上问题回流题库，持续改进']),
      next: '**LangGraph** 系列：亲手画一张 Agent 图',
    }),
  ],
};
