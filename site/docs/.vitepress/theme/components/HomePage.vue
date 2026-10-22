<script setup lang="ts">
// 首页：大标题 → 四个学习方向 → 左右交替的教学演示（路线图、ReAct 循环、Agent 终端、练手程序）→ 实验室 → 二选一。
// 只有演示区会动，而且只在滚到眼前时播放。章节链接全部从 chapters.json / roadmap.ts 推出来。
import { computed, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import chapters from '../../chapters.json'
import glossary from '../data/glossary.json'
import { quizzes } from '../data/quizzes'
import { DIRECTIONS, NODES } from '../data/roadmap'
import { progress } from '../progress'
import { useInView } from '../inview'
import Icon from './Icon.vue'
import HeroLoop from './HeroLoop.vue'
import RoadmapDemo from './RoadmapDemo.vue'
import TerminalDemo, { type TermLine } from './TerminalDemo.vue'

const REPO = 'https://github.com/EthanBAI-dev/langchain-zh'
const quizTotal = Object.values(quizzes).reduce((n, q) => n + q.length, 0)
const hours = Math.round(chapters.reduce((n, c) => n + c.minutes, 0) / 60)
const chapterCount = chapters.filter((c) => c.slug !== 'appendix').length
const bySlug = Object.fromEntries(chapters.map((c) => [c.slug, c]))

// 四个方向：每条泳道的章节（去掉环境准备和附录）
const directions = DIRECTIONS.map((d) => {
  const items = NODES.filter((n) => n.lane === d.lane && bySlug[n.slug] && n.slug !== 'ch00' && n.slug !== 'appendix')
    .map((n) => bySlug[n.slug])
  return { ...d, items, minutes: items.reduce((s, c) => s + c.minutes, 0), first: items[0]?.slug ?? 'ch01' }
})
const doneCount = computed(() => chapters.filter((c) => progress.done[c.slug]).length)
const nextUp = computed(() => chapters.find((c) => !progress.done[c.slug]) ?? chapters[0])
const first = (slug: string) => withBase(`/learn/${slug}`)

const agentLines: TermLine[] = [
  { kind: 'cmd', text: 'uv run python sql_agent.py "哪个国家的客户最多？"' },
  { kind: 'wait', ms: 1100 },
  { kind: 'tool', text: '→ 调用工具 list_tables()' },
  { kind: 'dim', text: '  Album, Artist, Customer, Invoice, Track …' },
  { kind: 'tool', text: '→ 调用工具 run_query()' },
  { kind: 'dim', text: '  SELECT Country, COUNT(*) FROM Customer GROUP BY Country …' },
  { kind: 'wait', ms: 900 },
  { kind: 'ai', text: 'AI：美国的客户最多，一共 13 位，其次是加拿大（8 位）。' },
]
const pytestLines: TermLine[] = [
  { kind: 'cmd', text: 'pytest ch01_sql_agent' },
  { kind: 'wait', ms: 900 },
  { kind: 'ok', text: '✓ 工具会返回表名列表' },
  { kind: 'ok', text: '✓ Agent 先查表结构再写 SQL' },
  { kind: 'out', text: '✗ 回答里要带上具体人数   提示：把查询结果交给模型总结' },
  { kind: 'dim', text: '2 passed, 1 failed · 用的是假模型，不花一分钱' },
]

// ReAct 动画（SMIL）滚出视口就暂停
const loopBox = ref<HTMLElement>()
const { inView: loopIn, reduced } = useInView(loopBox)
watch([loopIn, reduced], ([v, r]) => {
  const svg = loopBox.value?.querySelector('svg') as SVGSVGElement | null
  if (!svg?.pauseAnimations) return
  if (v && !r) svg.unpauseAnimations(); else svg.pauseAnimations()
})

const labs = [
  { link: '/lab/react', icon: 'refresh-cw', title: 'ReAct 循环模拟器', desc: '一步一步看 Agent 在模型和工具之间来回，消息列表怎么变长。', from: '#B5643C', to: '#B5643C' },
  { link: '/lab/reducer', icon: 'git-fork', title: 'Reducer 实验台', desc: '亲手试 operator.add 和 add_messages：新值是覆盖、追加还是替换。', from: '#2F5D8A', to: '#2F5D8A' },
  { link: '/lab/flashcards', icon: 'layers', title: '术语记忆卡片', desc: `${glossary.length} 个核心术语，正面中英文，翻面看解释，记住的自动移走。`, from: '#3E7C62', to: '#3E7C62' },
]
</script>

<template>
  <div class="home">
    <!-- 主视觉：两团会呼吸的光斑 + 点阵 -->
    <section class="hx">
      <div class="hx-bg" aria-hidden="true" /><div class="hx-wash" aria-hidden="true"><i /><i /></div>
      <div class="wrap hx-in">
        <a class="hx-chip" :href="withBase('/roadmap')"><img :src="withBase('/logo.svg')" alt="" width="20" height="20" />LangChain Academy 中文版 · 免费开源<Icon name="chevron-right" :size="14" /></a>
        <h1 class="hx-title">
          <span>LangChain 中文学堂</span>
          <span class="grad">Agent 开发学习指南</span>
        </h1>
        <p class="hx-sub">用中文图解和动画，一步步掌握 <u>LangChain</u>、<u>LangGraph</u> 和 <u>Agent 工程</u></p>
        <div class="hx-cta">
          <a class="hbtn primary" :href="first(nextUp.slug)"><Icon name="book-open" :size="17" />{{ doneCount ? '继续学习' : '开始学习' }}</a>
          <a class="hbtn ghost" :href="withBase('/roadmap')"><Icon name="route" :size="16" />查看路线图</a>
        </div>
        <p class="hx-meta"><span>{{ chapterCount }} 章图文</span><span>约 {{ hours }} 小时</span><span>{{ quizTotal }} 道小测验</span><span>3 个互动实验</span></p>

        <!-- 四个学习方向 -->
        <div class="dirs">
          <a v-for="d in directions" :key="d.name" class="dir" :href="first(d.first)" :style="{ '--a': d.from, '--b': d.to }">
            <span class="dir-ic"><Icon :name="d.icon" :size="24" /></span>
            <h3>{{ d.name }}</h3>
            <p>{{ d.desc }}</p>
            <div class="tags"><span v-for="t in d.tags" :key="t">{{ t }}</span></div>
            <span class="dir-go">{{ d.items.length }} 章 · {{ Math.round(d.minutes / 6) / 10 }} 小时<b>开始<Icon name="arrow-right" :size="15" /></b></span>
          </a>
        </div>
      </div>
    </section>

    <!-- 路线图 -->
    <section class="sx wrap" style="--pt:#2F5D8A">
      <div class="sx-text">
        <h2><span class="sx-ic" style="--a:#2F5D8A;--b:#2F5D8A"><Icon name="map" :size="20" /></span>学习路线图</h2>
        <p class="sub">二十章的先后关系画成一张图。点开任意一章，右边列出这一章讲什么、先学哪几章，学完打个勾。</p>
        <ul class="pts">
          <li><Icon name="git-fork" :size="16" />连线就是依赖，先学什么一目了然</li>
          <li><Icon name="circle-check" :size="16" />勾选进度存在浏览器里，下次回来接着学</li>
          <li><Icon name="list-checks" :size="16" />每章的小节直接跳转，想复习哪段点哪段</li>
        </ul>
        <a class="hbtn primary" :href="withBase('/roadmap')">打开路线图<Icon name="arrow-right" :size="16" /></a>
      </div>
      <div class="sx-demo glow-a"><RoadmapDemo /></div>
    </section>

    <!-- ReAct 循环 -->
    <section class="sx wrap flip" style="--pt:#6E5A92">
      <div class="sx-text">
        <h2><span class="sx-ic" style="--a:#6E5A92;--b:#6E5A92"><Icon name="refresh-cw" :size="20" /></span>看懂 Agent 的循环</h2>
        <p class="sub">Agent 的全部秘密，就是模型和工具之间的一个循环。教程里每个关键机制都画成了这样的动图。</p>
        <ul class="pts">
          <li><Icon name="brain" :size="16" />模型决定要不要调工具、调哪个</li>
          <li><Icon name="wrench" :size="16" />工具结果写回消息列表，再交给模型</li>
          <li><Icon name="flask-conical" :size="16" />想自己一步步点？去 ReAct 模拟器</li>
        </ul>
        <a class="hbtn ghost" :href="first(directions[0].first)">读第 1 章<Icon name="arrow-right" :size="16" /></a>
      </div>
      <div ref="loopBox" class="sx-demo glow-b"><HeroLoop /></div>
    </section>

    <!-- Agent 终端 -->
    <section class="sx wrap" style="--pt:#B5643C">
      <div class="sx-text">
        <h2><span class="sx-ic" style="--a:#B5643C;--b:#B5643C"><Icon name="terminal" :size="20" /></span>十几行代码，一个会查数据库的 Agent</h2>
        <p class="sub">第一个实战就造一个 SQL 助手：你用中文提问，它自己看表结构、写查询、读结果，再回答你。</p>
        <ul class="pts">
          <li><Icon name="bot" :size="16" />create_agent：模型 + 工具 + 提示词</li>
          <li><Icon name="database" :size="16" />真实的 Chinook 音乐商店数据库</li>
          <li><Icon name="telescope" :size="16" />每一步都能在 LangSmith 里追踪</li>
        </ul>
        <a class="hbtn primary" :href="first('ch01')">动手造一个<Icon name="arrow-right" :size="16" /></a>
      </div>
      <div class="sx-demo glow-c"><TerminalDemo title="sql_agent.py" :lines="agentLines" /></div>
    </section>

    <!-- 练手程序 -->
    <section class="sx wrap flip" style="--pt:#3E7C62">
      <div class="sx-text">
        <h2><span class="sx-ic" style="--a:#3E7C62;--b:#3E7C62"><Icon name="notebook-pen" :size="20" /></span>配套练手题，离线自动判分</h2>
        <p class="sub">每章读完补几行 TODO，一条命令就知道哪里对、哪里错。用假模型检查，不需要 API Key。</p>
        <ul class="pts">
          <li><Icon name="file-code" :size="16" />起始代码、自动检查、参考答案三件套</li>
          <li><Icon name="message-square" :size="16" />错了有中文提示，告诉你往哪改</li>
          <li><Icon name="zap" :size="16" />写对后设一个环境变量，换成真模型跑</li>
        </ul>
        <a class="hbtn ghost" :href="`${REPO}/tree/main/exercises`" target="_blank" rel="noopener">去 GitHub 做题<Icon name="arrow-right" :size="16" /></a>
      </div>
      <div class="sx-demo glow-d"><TerminalDemo title="exercises" :lines="pytestLines" /></div>
    </section>

    <!-- 互动实验室 -->
    <section class="lx wrap">
      <h2><span class="sx-ic" style="--a:#A07A2C;--b:#A07A2C"><Icon name="flask-conical" :size="20" /></span>互动实验室</h2>
      <p class="sub">最难懂的几个机制，做成了可以一步一步点的小实验。</p>
      <div class="labs">
        <a v-for="l in labs" :key="l.link" class="lab" :href="withBase(l.link)" :style="{ '--a': l.from, '--b': l.to }">
          <span class="dir-ic"><Icon :name="l.icon" :size="22" /></span>
          <h3>{{ l.title }}</h3>
          <p>{{ l.desc }}</p>
          <span class="lab-go">打开实验<Icon name="arrow-right" :size="15" /></span>
        </a>
      </div>
    </section>

    <!-- 结尾：二选一 -->
    <section class="wrap">
      <div class="endx">
        <span class="sx-ic big" style="--a:#2F5D8A;--b:#2F5D8A"><Icon name="rocket" :size="24" /></span>
        <h2>开始你的 Agent 学习之旅</h2>
        <p class="sub">零基础就从环境准备开始；已经用过 LangChain，直接打开路线图挑一章。</p>
        <div class="hx-cta">
          <a class="hbtn primary" :href="first(chapters[0].slug)"><Icon name="terminal" :size="16" />从第 0 章开始</a>
          <a class="hbtn ghost" :href="withBase('/roadmap')"><Icon name="route" :size="16" />打开路线图</a>
        </div>
      </div>
    </section>
  </div>
</template>
