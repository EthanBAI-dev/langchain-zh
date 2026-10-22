<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import chapters from '../../chapters.json'
import glossary from '../data/glossary.json'
import { quizzes } from '../data/quizzes'
import { progress } from '../progress'
import Icon from './Icon.vue'
import HeroLoop from './HeroLoop.vue'

const quizTotal = Object.values(quizzes).reduce((n, q) => n + q.length, 0)
const hours = Math.round(chapters.reduce((n, c) => n + c.minutes, 0) / 60)
const chapterCount = chapters.filter((c) => c.slug !== 'appendix').length

// 学习路线：按 chapters.json 里的 part 分组，章节号和顺序都从数据里来
const PART_META: Record<string, { icon: string; tag: string }> = {
  '开始之前': { icon: 'terminal', tag: '装好 Python、uv、API Key 和 Studio，十五分钟准备好环境。' },
  'LangChain 入门': { icon: 'bot', tag: '用 create_agent 十几行代码造出会调工具的 Agent，再做三个完整小项目：多模态、多智能体、动态 Agent。' },
  '新版 LangChain 入门': { icon: 'sparkles', tag: 'LangChain 1.x 新课：多模态、多智能体、消息管理与动态 Agent。' },
  'LangGraph 进阶': { icon: 'workflow', tag: '把 Agent 拆成状态、节点和边，加上记忆、审批、并行与部署。' },
  '高级专题': { icon: 'layers', tag: '长任务 Agent 的原理，以及追踪评估平台 LangSmith 的全貌。' },
  'Deep Agents 实战': { icon: 'rocket', tag: '像 Claude Code 一样能跑几十步的 Agent：规划、文件系统、子智能体。' },
  'LangSmith 实战': { icon: 'chart-line', tag: '追踪、离线评估、提示工程和线上监控，一条龙。' },
  '附录': { icon: 'book-open', tag: '速查表和术语表，忘了就回来翻。' },
}
const parts = computed(() => {
  const seen: string[] = []
  for (const c of chapters) if (!seen.includes(c.part)) seen.push(c.part)
  return seen.map((part, i) => ({
    part,
    n: String(i + 1).padStart(2, '0'),
    icon: PART_META[part]?.icon ?? 'book-open',
    tag: PART_META[part]?.tag ?? '',
    items: chapters.filter((c) => c.part === part),
    minutes: chapters.filter((c) => c.part === part).reduce((n, c) => n + c.minutes, 0),
  }))
})
// 按标题找章节链接，章节重新编号也不受影响
const linkTo = (title: string) => {
  const c = chapters.find((x) => x.title === title)
  return withBase(c ? `/learn/${c.slug}` : '/learn/')
}
const label = (c: (typeof chapters)[number]) => (c.slug === 'appendix' ? c.title : `第 ${c.num} 章 · ${c.title}`)

const topics = [
  { icon: 'bot', name: 'create_agent' },
  { icon: 'workflow', name: 'LangGraph' },
  { icon: 'plug', name: 'MCP' },
  { icon: 'brain', name: '短期 / 长期记忆' },
  { icon: 'hand', name: '人在回路' },
  { icon: 'split', name: '并行与子图' },
  { icon: 'users', name: '多智能体' },
  { icon: 'list-checks', name: '结构化输出' },
  { icon: 'boxes', name: '中间件' },
  { icon: 'rocket', name: 'Deep Agents' },
  { icon: 'telescope', name: 'LangSmith' },
]

// 进度面板
const doneCount = computed(() => chapters.filter((c) => progress.done[c.slug]).length)
const pct = computed(() => Math.round((doneCount.value / chapters.length) * 100))
const quizBest = computed(() => Object.values(progress.quiz).reduce((n, r) => n + r.best, 0))
const cards = computed(() => glossary.filter((g) => progress.cards[g.en]).length)
const nextUp = computed(() => chapters.find((c) => !progress.done[c.slug]))
const minutesLeft = computed(() => chapters.filter((c) => !progress.done[c.slug]).reduce((n, c) => n + c.minutes, 0))
const R = 52
const C = 2 * Math.PI * R

const labs = [
  { link: '/lab/react', title: 'ReAct 循环模拟器', desc: '一步一步看 Agent 在 model 和 tools 之间来回，消息列表怎么变长。', art: 'react' },
  { link: '/lab/reducer', title: 'Reducer 实验台', desc: '亲手试 operator.add 和 add_messages：新值到底是覆盖、追加还是替换。', art: 'reducer' },
  { link: '/lab/flashcards', title: '术语记忆卡片', desc: `${glossary.length} 个核心术语，正面中英文，翻面看解释，记住的自动移走。`, art: 'cards' },
]

const faqs = [
  { q: '我只会一点 Python，能学吗？', a: '能。会写函数和类、知道什么是 API Key 就够了，不需要机器学习背景。每章开头有目标，结尾有小结和小测验。' },
  { q: '和官方 LangChain Academy 有什么关系？', a: '内容依据 LangChain Academy 的公开课程和官方课程仓库，用中文重新组织讲解，不是逐字翻译。图和动图都是重新画的。' },
  { q: '代码是哪个版本？', a: '全部按 LangChain / LangGraph 1.x 新版写（create_agent、中间件、新的消息内容块），关键输出在本地跑过。' },
  { q: '需要花钱吗？', a: '教程和网站免费。跑示例需要一个模型的 API Key；配套的练手题用假模型离线检查，不花钱。' },
  { q: '学习进度存在哪里？', a: '只存在你当前浏览器的本地存储里，不上传任何服务器。换设备或清除浏览器数据会丢失。' },
]
</script>

<template>
  <div class="home">
    <!-- 主视觉 -->
    <section class="h-hero wrap">
      <a class="eyebrow" :href="withBase('/learn/')"><b />基于 LangChain Academy 官方课程 · 免费开源</a>
      <h1 class="h-title">从第一个 Agent<span class="soft">到多智能体系统</span></h1>
      <p class="lede">用中文图解、动图和互动练习，一步步学会 LangChain、LangGraph、Deep Agents 与 LangSmith。</p>
      <div class="cta-row">
        <a class="hbtn primary" :href="withBase('/learn/')"><Icon name="book-open" :size="17" />开始学习</a>
        <a class="hbtn ghost" :href="withBase('/lab/react')"><Icon name="play" :size="15" />玩一下 ReAct 模拟器</a>
      </div>
      <div class="meta">
        <span>{{ chapterCount }} 章 + 附录</span><span>约 {{ hours }} 小时</span><span>{{ quizTotal }} 道小测验</span><span>代码按 1.x 新版</span>
      </div>
      <HeroLoop />
      <p class="stage-cap"><b>这就是 Agent 的全部秘密：</b>模型和工具之间的一个循环。教程第一个实战就教你十几行代码造一个。</p>
    </section>

    <!-- 主题标签 -->
    <section class="h-topics wrap">
      <p>这些概念，教程里都画成了图</p>
      <div class="chips">
        <span v-for="t in topics" :key="t.name" class="chip"><span class="chip-ic"><Icon :name="t.icon" :size="14" /></span>{{ t.name }}</span>
      </div>
    </section>

    <!-- 四个名字 -->
    <section class="h-block wrap">
      <div class="center">
        <div class="kicker">先建立全局观</div>
        <h2>四个名字，一张图看懂</h2>
        <p class="sub">越往上越开箱即用，越往下越可定制；LangSmith 横跨开发、调试、评估与上线。</p>
      </div>
      <div class="eco">
        <div class="eco-stack">
          <a class="eco-layer app" :href="withBase('/learn/')">
            <span class="eco-ic"><Icon name="target" :size="20" /></span>
            <div><b>你的 AI 应用</b><small>客服助手 · SQL 分析师 · 深度研究 · 编程助手</small></div>
          </a>
          <a class="eco-layer deep" :href="linkTo('Deep Agents 上手')">
            <span class="eco-ic"><Icon name="rocket" :size="20" /></span>
            <div><b>Deep Agents <em>改装好的越野车</em></b><small>任务规划 · 虚拟文件系统 · 子智能体 · 上下文压缩 · Skills</small></div>
          </a>
          <a class="eco-layer lc" :href="linkTo('十分钟造一个 Agent')">
            <span class="eco-ic"><Icon name="bot" :size="20" /></span>
            <div><b>LangChain <em>整车底盘</em></b><small>create_agent：模型 + 工具 + 提示词 + 中间件</small></div>
          </a>
          <a class="eco-layer lg" :href="linkTo('LangGraph 图的基本功')">
            <span class="eco-ic"><Icon name="workflow" :size="20" /></span>
            <div><b>LangGraph <em>发动机</em></b><small>状态 · 节点 · 边 · 持久化 · 流式 · 中断</small></div>
          </a>
        </div>
        <div class="eco-side">
          <span class="eco-ic"><Icon name="telescope" :size="20" /></span>
          <b>LangSmith</b>
          <em>仪表盘和 4S 店</em>
          <ul>
            <li><Icon name="search" :size="14" />追踪 Tracing</li>
            <li><Icon name="target" :size="14" />评估 Evaluation</li>
            <li><Icon name="pencil-line" :size="14" />提示工程</li>
            <li><Icon name="cpu" :size="14" />Studio 调试</li>
            <li><Icon name="rocket" :size="14" />部署</li>
            <li><Icon name="gauge" :size="14" />线上监控</li>
          </ul>
        </div>
        <svg class="eco-link" viewBox="0 0 40 200" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 100 H40" />
        </svg>
      </div>
    </section>

    <!-- 学习路线 -->
    <section class="h-block wrap" id="route">
      <div class="center">
        <div class="kicker">学习路线</div>
        <h2>{{ parts.length }} 个阶段，按顺序走就行</h2>
        <p class="sub">每章都有学习目标、图解、代码、小结和小测验。先会用，再懂原理，最后上生产。</p>
      </div>
      <div class="pillars">
        <div v-for="p in parts" :key="p.part" class="pillar">
          <div class="top">
            <span class="ico"><Icon :name="p.icon" :size="20" /></span>
            <span class="num">{{ p.n }}</span>
            <span class="mins"><Icon name="clock" :size="13" />{{ p.minutes }} 分钟</span>
          </div>
          <h3>{{ p.part }}</h3>
          <p class="tag">{{ p.tag }}</p>
          <ul>
            <li v-for="c in p.items" :key="c.slug" :class="{ done: progress.done[c.slug] }">
              <a :href="withBase(`/learn/${c.slug}`)">
                <span class="ck"><Icon v-if="progress.done[c.slug]" name="check" :size="11" :stroke="3" /></span>{{ label(c) }}
              </a>
            </li>
          </ul>
          <a class="see" :href="withBase(`/learn/${p.items[0].slug}`)">从这一段开始<Icon name="arrow-right" :size="15" /></a>
        </div>
      </div>
    </section>

    <!-- 进度 -->
    <section class="wrap">
      <div class="band">
        <div>
          <div class="kicker light">我的进度</div>
          <h2>学到哪了，一眼就知道</h2>
          <p class="sub">在章末点“标记本章已完成”，测验成绩和记住的术语都会记在这里。只存在你的浏览器里。</p>
          <div class="band-cta">
            <a v-if="nextUp" class="hbtn light" :href="withBase(`/learn/${nextUp.slug}`)">
              {{ doneCount ? '继续' : '从这里开始' }}：{{ label(nextUp) }}<Icon name="arrow-right" :size="16" />
            </a>
            <a class="hbtn line" :href="withBase('/progress')">查看全部进度</a>
          </div>
        </div>
        <div class="band-right">
          <svg class="ring-svg" viewBox="0 0 132 132" aria-hidden="true">
            <circle cx="66" cy="66" :r="R" class="track" />
            <circle cx="66" cy="66" :r="R" class="bar" :stroke-dasharray="`${(C * pct) / 100} ${C}`" transform="rotate(-90 66 66)" />
            <text x="66" y="64" class="pct">{{ pct }}%</text>
            <text x="66" y="86" class="lbl">已完成</text>
          </svg>
          <div class="facts">
            <div class="fact"><b>{{ doneCount }}<small>/{{ chapters.length }}</small></b><span>章已完成</span></div>
            <div class="fact"><b>{{ quizBest }}<small>/{{ quizTotal }}</small></b><span>道测验题答对</span></div>
            <div class="fact"><b>{{ cards }}<small>/{{ glossary.length }}</small></b><span>个术语已掌握</span></div>
            <div class="fact"><b>{{ Math.ceil(minutesLeft / 6) / 10 }}<small>小时</small></b><span>剩余学习时间</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 互动实验室 -->
    <section class="h-block wrap">
      <div class="center">
        <div class="kicker">互动实验室</div>
        <h2>不光看，还能上手点一点</h2>
        <p class="sub">最难懂的几个机制，做成了可以一步一步操作的小实验。</p>
      </div>
      <div class="labs">
        <a v-for="l in labs" :key="l.link" class="lab-card" :href="withBase(l.link)">
          <div class="lab-art">
            <svg v-if="l.art === 'react'" viewBox="0 0 240 120" aria-hidden="true">
              <rect x="20" y="20" width="84" height="34" rx="9" class="a-blue" /><text x="62" y="42">model</text>
              <rect x="20" y="78" width="84" height="34" rx="9" class="a-amber" /><text x="62" y="100">tools</text>
              <path d="M48 54 V76" class="a-edge" marker-end="url(#la)" /><path d="M76 78 V56" class="a-edge" marker-end="url(#la)" />
              <rect x="134" y="16" width="90" height="16" rx="5" class="a-msg h" /><rect x="134" y="38" width="90" height="16" rx="5" class="a-msg b" />
              <rect x="134" y="60" width="90" height="16" rx="5" class="a-msg o" /><rect x="134" y="82" width="70" height="16" rx="5" class="a-msg g" />
              <defs><marker id="la" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9 z" class="a-arrow" /></marker></defs>
            </svg>
            <svg v-else-if="l.art === 'reducer'" viewBox="0 0 240 120" aria-hidden="true">
              <rect x="16" y="18" width="64" height="26" rx="8" class="a-violet" /><text x="48" y="36">[1, 2]</text>
              <rect x="16" y="76" width="64" height="26" rx="8" class="a-violet" /><text x="48" y="94">[3]</text>
              <path d="M80 31 C110 31 110 60 130 60 M80 89 C110 89 110 60 130 60" class="a-edge" />
              <circle cx="140" cy="60" r="12" class="a-op" /><text x="140" y="65" class="op">+</text>
              <path d="M152 60 H168" class="a-edge" marker-end="url(#lb)" />
              <rect x="170" y="46" width="58" height="28" rx="8" class="a-green" /><text x="199" y="65">[1,2,3]</text>
              <defs><marker id="lb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9 z" class="a-arrow" /></marker></defs>
            </svg>
            <svg v-else viewBox="0 0 240 120" aria-hidden="true">
              <rect x="70" y="22" width="110" height="78" rx="12" class="a-card back2" transform="rotate(8 125 61)" />
              <rect x="64" y="20" width="110" height="78" rx="12" class="a-card back1" transform="rotate(-6 119 59)" />
              <rect x="64" y="20" width="110" height="78" rx="12" class="a-card" />
              <text x="119" y="56" class="big">Reducer</text><text x="119" y="76" class="small">归约函数</text>
            </svg>
          </div>
          <h3>{{ l.title }}</h3>
          <p>{{ l.desc }}</p>
          <span class="see">打开实验<Icon name="arrow-right" :size="15" /></span>
        </a>
      </div>
    </section>

    <!-- FAQ -->
    <section class="h-block wrap">
      <div class="center">
        <div class="kicker">常见问题</div>
        <h2>开始之前你可能想问</h2>
      </div>
      <div class="faq">
        <details v-for="f in faqs" :key="f.q">
          <summary>{{ f.q }}</summary>
          <p>{{ f.a }}</p>
        </details>
      </div>
    </section>

    <section class="final wrap">
      <img :src="withBase('/logo.svg')" alt="" width="64" height="64" />
      <h2>今天就造出你的第一个 Agent</h2>
      <p class="sub">先花十五分钟装好环境，再用十几行代码让它跑起来。</p>
      <div class="cta-row">
        <a class="hbtn primary" :href="withBase(`/learn/${chapters[0].slug}`)"><Icon name="terminal" :size="16" />从环境准备开始</a>
      </div>
    </section>
  </div>
</template>
