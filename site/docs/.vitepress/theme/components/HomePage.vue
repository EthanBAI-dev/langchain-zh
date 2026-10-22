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
// 每个阶段一种强调色，让目录一眼能分清
const PALETTE = ['#64748B', '#1A73E8', '#7C3AED', '#0D9488', '#DB2777', '#EA580C', '#059669', '#4F46E5']
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
    color: PALETTE[i % PALETTE.length],
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
// 课程目录默认只展开第一个还没学完的阶段
const doneIn = (p: { items: { slug: string }[] }) => p.items.filter((c) => progress.done[c.slug]).length
const openIndex = computed(() => {
  const i = parts.value.findIndex((p) => doneIn(p) < p.items.length)
  return i < 0 ? -1 : i
})
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
    <div class="hero-bg" aria-hidden="true">
      <svg viewBox="0 0 1440 760" preserveAspectRatio="xMidYMin slice">
        <defs>
          <radialGradient id="hb1" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#1A73E8" stop-opacity=".22" /><stop offset="1" stop-color="#1A73E8" stop-opacity="0" /></radialGradient>
          <radialGradient id="hb2" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7C3AED" stop-opacity=".18" /><stop offset="1" stop-color="#7C3AED" stop-opacity="0" /></radialGradient>
          <radialGradient id="hb3" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#14B8A6" stop-opacity=".16" /><stop offset="1" stop-color="#14B8A6" stop-opacity="0" /></radialGradient>
          <radialGradient id="hb4" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F59E0B" stop-opacity=".14" /><stop offset="1" stop-color="#F59E0B" stop-opacity="0" /></radialGradient>
          <pattern id="hbgrid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" class="grid" /></pattern>
          <linearGradient id="hbfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" /><stop offset=".7" stop-color="#fff" stop-opacity=".6" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></linearGradient>
          <mask id="hbmask"><rect width="1440" height="760" fill="url(#hbfade)" /></mask>
        </defs>
        <g mask="url(#hbmask)"><rect width="1440" height="760" fill="url(#hbgrid)" /></g>
        <ellipse cx="300" cy="180" rx="420" ry="300" fill="url(#hb1)" />
        <ellipse cx="1150" cy="140" rx="440" ry="300" fill="url(#hb2)" />
        <ellipse cx="1220" cy="560" rx="380" ry="260" fill="url(#hb3)" />
        <ellipse cx="180" cy="600" rx="360" ry="240" fill="url(#hb4)" />
        <!-- 两侧漂浮的小图：节点和连线 -->
        <g class="float f1" transform="translate(150 250)">
          <path d="M28 22 C80 22 80 92 132 92" class="ln" />
          <rect x="0" y="0" width="56" height="44" rx="12" class="nd blue" />
          <rect x="132" y="70" width="56" height="44" rx="12" class="nd amber" />
          <circle cx="80" cy="57" r="5" class="dt" />
        </g>
        <g class="float f2" transform="translate(1160 300)">
          <circle cx="30" cy="30" r="26" class="nd violet" />
          <circle cx="130" cy="20" r="18" class="nd teal" />
          <circle cx="100" cy="110" r="22" class="nd pink" />
          <path d="M56 30 L112 22 M48 50 L82 96 M122 38 L108 90" class="ln" />
        </g>
        <g class="float f3" transform="translate(240 470)">
          <rect x="0" y="0" width="120" height="26" rx="8" class="nd green" />
          <rect x="0" y="34" width="90" height="26" rx="8" class="nd blue" />
          <rect x="0" y="68" width="104" height="26" rx="8" class="nd violet" />
        </g>
      </svg>
    </div>
    <section class="h-hero wrap">
      <div class="brand-mark">
        <svg class="brand-halo" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="70" />
          <circle cx="100" cy="100" r="94" />
        </svg>
        <img :src="withBase('/logo.svg')" alt="LangChain 中文学堂" width="88" height="88" />
      </div>
      <a class="eyebrow" :href="withBase('/learn/')"><b />LangChain Academy 中文图文教程 · 免费开源</a>
      <h1 class="h-title">LangChain 中文学堂<span class="soft">从第一个 Agent 到多智能体系统</span></h1>
      <p class="lede">用中文图解、动图和互动练习，一步步学会 LangChain、LangGraph、Deep Agents 与 LangSmith。</p>
      <div class="cta-row">
        <a class="hbtn primary" :href="withBase('/learn/')"><Icon name="book-open" :size="17" />开始学习</a>
        <a class="hbtn ghost" href="#route"><Icon name="list-checks" :size="16" />查看课程目录</a>
      </div>
      <div class="stats">
        <div class="stat"><span class="st-ic"><Icon name="book-open" :size="18" /></span><b>{{ chapterCount }}<small>章</small></b><span>图文教程 + 附录</span></div>
        <div class="stat"><span class="st-ic"><Icon name="clock" :size="18" /></span><b>{{ hours }}<small>小时</small></b><span>完整学习时长</span></div>
        <div class="stat"><span class="st-ic"><Icon name="pencil-line" :size="18" /></span><b>{{ quizTotal }}<small>题</small></b><span>章末小测验</span></div>
        <div class="stat"><span class="st-ic"><Icon name="flask-conical" :size="18" /></span><b>3<small>个</small></b><span>互动实验室</span></div>
      </div>
      <HeroLoop />
      <p class="stage-cap"><b>这就是 Agent 的全部秘密：</b>模型和工具之间的一个循环。教程第一个实战就教你十几行代码造一个。</p>
    </section>

    <!-- 主题标签 -->
    <section class="h-topics wrap">
      <p>这些概念，教程里都画成了图</p>
      <div class="chips">
        <span v-for="(t, i) in topics" :key="t.name" class="chip" :style="{ '--accent': PALETTE[(i % (PALETTE.length - 1)) + 1] }"><span class="chip-ic"><Icon :name="t.icon" :size="14" /></span>{{ t.name }}</span>
      </div>
    </section>

    <!-- 四个名字 -->
    <section class="h-block wrap">
      <div class="center">
        <div class="kicker badge"><Icon name="compass" :size="14" />先建立全局观</div>
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
        <div class="kicker badge"><Icon name="route" :size="14" />学习路线</div>
        <h2>课程目录</h2>
        <p class="sub">{{ parts.length }} 个阶段，按顺序走就行。点开一个阶段看章节；每章都有学习目标、图解、代码、小结和小测验。</p>
      </div>
      <div class="syllabus">
        <details v-for="(p, i) in parts" :key="p.part" class="sg" :open="i === openIndex" :style="{ '--accent': p.color }">
          <summary>
            <span class="sg-num">{{ p.n }}</span>
            <span class="sg-ic"><Icon :name="p.icon" :size="20" /></span>
            <span class="sg-main">
              <b>{{ p.part }}</b>
              <small>{{ p.tag }}</small>
            </span>
            <span class="sg-meta">
              <span>{{ p.items.length }} 章</span>
              <span><Icon name="clock" :size="13" />{{ p.minutes }} 分钟</span>
              <span v-if="doneIn(p)" class="sg-done">{{ doneIn(p) }}/{{ p.items.length }} 完成</span>
            </span>
            <span class="sg-chev"><Icon name="chevron-right" :size="18" /></span>
          </summary>
          <ol class="sg-list">
            <li v-for="c in p.items" :key="c.slug" :class="{ done: progress.done[c.slug] }">
              <a :href="withBase(`/learn/${c.slug}`)">
                <span class="ck"><Icon v-if="progress.done[c.slug]" name="check" :size="12" :stroke="3" /><template v-else>{{ c.num === '附录' ? 'A' : c.num }}</template></span>
                <span class="t">{{ c.slug === 'appendix' ? c.title : c.title }}</span>
                <span class="m">{{ c.minutes }} 分钟</span>
                <Icon name="arrow-right" :size="15" class="go" />
              </a>
            </li>
          </ol>
        </details>
      </div>
    </section>

    <!-- 进度 -->
    <section class="wrap">
      <div class="band">
        <div>
          <div class="kicker badge dark"><Icon name="gauge" :size="14" />我的进度</div>
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
            <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8AB4F8" /><stop offset="1" stop-color="#C4B5FD" /></linearGradient></defs>
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
        <div class="kicker badge"><Icon name="flask-conical" :size="14" />互动实验室</div>
        <h2>不光看，还能上手点一点</h2>
        <p class="sub">最难懂的几个机制，做成了可以一步一步操作的小实验。</p>
      </div>
      <div class="labs">
        <a v-for="l in labs" :key="l.link" class="lab-card" :href="withBase(l.link)">
          <div :class="['lab-art', l.art]">
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
        <div class="kicker badge"><Icon name="circle-help" :size="14" />常见问题</div>
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
