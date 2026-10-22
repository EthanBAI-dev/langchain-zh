<script setup lang="ts">
// 学习路线图：章节依赖图 + 右侧抽屉。点节点打开抽屉，地址栏同步成 ?selected=chNN，可以直接分享。
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import chapters from '../../chapters.json'
import outline from '../data/outline.json'
import { quizzes } from '../data/quizzes'
import { labsFor } from '../data/labs'
import { LANES, NODES, STAGE_COLORS } from '../data/roadmap'
import { progress, toggleDone } from '../progress'
import Icon from './Icon.vue'

const NW = 132
const NH = 62
const PX = 156
const PY = 112
const OX = 128
const OY = 40

const bySlug = Object.fromEntries(chapters.map((c) => [c.slug, c]))
const nodes = NODES.filter((n) => bySlug[n.slug]).map((n) => ({
  ...n,
  ch: bySlug[n.slug],
  x: OX + n.col * PX,
  y: OY + n.lane * PY,
  color: STAGE_COLORS[bySlug[n.slug].part] ?? '#64748B',
}))
const pos = Object.fromEntries(nodes.map((n) => [n.slug, n]))
const W = OX + Math.max(...nodes.map((n) => n.col)) * PX + NW + 40
const H = OY + (LANES.length - 1) * PY + NH + 40

const edges = nodes.flatMap((n) =>
  n.deps.filter((d) => pos[d]).map((d) => {
    const a = pos[d], b = n
    let path: string
    if (a.lane === b.lane) {
      path = `M${a.x + NW} ${a.y + NH / 2} H${b.x}`
    } else {
      const x1 = a.x + NW / 2, y1 = a.y + NH, x2 = b.x, y2 = b.y + NH / 2
      path = `M${x1} ${y1} C${x1} ${y2} ${x1} ${y2} ${x2 - 6} ${y2} H${x2}`
      if (x2 - 6 < x1) path = `M${x1} ${y1} V${y2 - NH / 2}`
    }
    return { from: d, to: n.slug, path }
  }),
)

const selected = ref<string | null>(null)
const sel = computed(() => (selected.value ? pos[selected.value] : null))
const info = computed(() => (selected.value ? (outline as any)[selected.value] : null))
const label = (c: any) => (c.slug === 'appendix' ? '附录' : `第 ${c.num} 章`)
const depsOf = (slug: string) => pos[slug]?.deps.filter((d) => pos[d]) ?? []
const nextOf = (slug: string) => nodes.filter((n) => n.deps.includes(slug))
const related = computed(() => {
  if (!selected.value) return new Set<string>()
  return new Set([selected.value, ...depsOf(selected.value), ...nextOf(selected.value).map((n) => n.slug)])
})

const doneCount = computed(() => nodes.filter((n) => progress.done[n.slug]).length)
const pct = computed(() => Math.round((doneCount.value / nodes.length) * 100))
const minutesLeft = computed(() => nodes.filter((n) => !progress.done[n.slug]).reduce((s, n) => s + n.ch.minutes, 0))
// "可以学了"：前置章节都完成、自己还没完成
const ready = (slug: string) => !progress.done[slug] && depsOf(slug).every((d) => progress.done[d])

function open(slug: string) {
  selected.value = selected.value === slug ? null : slug
}
function close() { selected.value = null }

// 画布按容器宽度缩放
const wrap = ref<HTMLElement>()
const scale = ref(1)
function fit() {
  if (!wrap.value) return
  scale.value = Math.max(0.72, Math.min(1, (wrap.value.clientWidth - 8) / W))
}
let ro: ResizeObserver | undefined

function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
onMounted(() => {
  const s = new URLSearchParams(location.search).get('selected')
  if (s && pos[s]) selected.value = s
  fit()
  ro = new ResizeObserver(fit)
  if (wrap.value) ro.observe(wrap.value)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => { ro?.disconnect(); document.removeEventListener('keydown', onKey) })
watch(selected, (s) => {
  const url = new URL(location.href)
  if (s) url.searchParams.set('selected', s)
  else url.searchParams.delete('selected')
  history.replaceState(history.state, '', url)
})

const stages = Object.entries(STAGE_COLORS)
</script>

<template>
  <div :class="['rm', { 'has-sel': !!sel }]">
    <div class="rm-head">
      <div>
        <div class="rm-kicker"><Icon name="route" :size="14" />学习路线图</div>
        <h1>先学什么，后学什么，一张图看清</h1>
        <p>连线表示前后依赖。点任意一章，右边会打开这一章的目标、小节和进度；带光圈的是你现在就可以学的章节。</p>
      </div>
      <div class="rm-legend">
        <span v-for="[name, c] in stages" :key="name"><i :style="{ background: c }" />{{ name }}</span>
      </div>
    </div>

    <div ref="wrap" class="rm-canvas-wrap">
      <div class="rm-canvas" :style="{ width: W * scale + 'px', height: H * scale + 'px' }">
        <div class="rm-scale" :style="{ width: W + 'px', height: H + 'px', transform: `scale(${scale})` }">
          <div v-for="(l, i) in LANES" :key="l" class="rm-lane" :style="{ top: OY + i * PY - 16 + 'px', height: NH + 32 + 'px', width: W - 8 + 'px' }">
            <span>{{ l }}</span>
          </div>
          <svg class="rm-edges" :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`">
            <defs>
              <marker id="rm-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0,1 L9,5 L0,9 z" fill="context-stroke" />
              </marker>
            </defs>
            <path
              v-for="e in edges"
              :key="e.from + e.to"
              :d="e.path"
              :class="['rm-edge', { done: progress.done[e.from], hot: selected && related.has(e.from) && related.has(e.to) && (e.from === selected || e.to === selected) }]"
              marker-end="url(#rm-ah)"
              pathLength="1"
            />
          </svg>
          <button
            v-for="(n, i) in nodes"
            :key="n.slug"
            :class="['rm-node', { done: progress.done[n.slug], ready: ready(n.slug), on: selected === n.slug, dim: selected && !related.has(n.slug) }]"
            :style="{ left: n.x + 'px', top: n.y + 'px', width: NW + 'px', height: NH + 'px', '--c': n.color, '--d': i * 40 + 'ms' }"
            @click="open(n.slug)"
          >
            <span class="rm-num">{{ label(n.ch) }}</span>
            <span class="rm-title">{{ n.ch.title }}</span>
            <span v-if="progress.done[n.slug]" class="rm-check"><Icon name="check" :size="11" :stroke="3.2" /></span>
          </button>
        </div>
      </div>
    </div>

    <div class="rm-progress">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="16" class="t" />
        <circle cx="20" cy="20" r="16" class="b" :stroke-dasharray="`${(2 * Math.PI * 16 * pct) / 100} 999`" transform="rotate(-90 20 20)" />
      </svg>
      <div><b>{{ doneCount }}/{{ nodes.length }}</b><span>已完成 · 剩余约 {{ Math.ceil(minutesLeft / 6) / 10 }} 小时</span></div>
    </div>

    <Transition name="drawer">
      <aside v-if="sel" class="rm-drawer" :style="{ '--c': sel.color }">
        <button class="rm-close" aria-label="关闭" @click="close"><Icon name="x" :size="18" /></button>
        <div class="rm-dhead">
          <span class="rm-stage"><i />{{ sel.ch.part }}</span>
          <span class="rm-mins"><Icon name="clock" :size="13" />约 {{ sel.ch.minutes }} 分钟</span>
        </div>
        <div class="rm-dnum">{{ label(sel.ch) }}</div>
        <h2>{{ sel.ch.title }}</h2>

        <label :class="['rm-done', { on: progress.done[sel.slug] }]">
          <input type="checkbox" :checked="!!progress.done[sel.slug]" @change="toggleDone(sel.slug)" />
          <span class="box"><Icon name="check" :size="13" :stroke="3" /></span>
          {{ progress.done[sel.slug] ? '已完成这一章' : '标记这一章已完成' }}
          <span v-if="progress.quiz[sel.slug]" class="rm-quiz">测验 {{ progress.quiz[sel.slug].best }}/{{ progress.quiz[sel.slug].total }}</span>
          <span v-else-if="quizzes[sel.slug]" class="rm-quiz dim">{{ quizzes[sel.slug].length }} 道测验题</span>
        </label>

        <p v-if="info?.goal" class="rm-goal">{{ info.goal }}</p>

        <div v-if="depsOf(sel.slug).length" class="rm-deps">
          <span>先学</span>
          <button v-for="d in depsOf(sel.slug)" :key="d" :class="{ done: progress.done[d] }" @click="open(d)">
            <Icon v-if="progress.done[d]" name="check" :size="12" :stroke="3" />{{ label(pos[d].ch) }} {{ pos[d].ch.title }}
          </button>
        </div>

        <h3>本章内容</h3>
        <ol class="rm-sections">
          <li v-for="(s, k) in info?.sections || []" :key="s.anchor">
            <a :href="withBase(`/learn/${sel.slug}#${s.anchor}`)"><span class="k">{{ k + 1 }}</span>{{ s.title }}</a>
          </li>
        </ol>

        <div v-if="labsFor(sel.slug).length" class="rm-labs">
          <a v-for="l in labsFor(sel.slug)" :key="l.link" :href="withBase(l.link)"><Icon name="flask-conical" :size="14" />{{ l.title }}</a>
        </div>

        <div class="rm-actions">
          <a class="btn primary" :href="withBase(`/learn/${sel.slug}`)"><Icon name="book-open" :size="15" />{{ progress.done[sel.slug] ? '再读一遍' : '开始阅读' }}</a>
          <button v-for="n in nextOf(sel.slug).slice(0, 2)" :key="n.slug" class="btn" @click="open(n.slug)">下一步：{{ n.ch.title }}<Icon name="arrow-right" :size="14" /></button>
        </div>
      </aside>
    </Transition>
  </div>
</template>
