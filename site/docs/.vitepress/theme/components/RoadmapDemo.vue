<script setup lang="ts">
// 首页的路线图演示：节点依次出现、连线画出来 → 镜头移到一章 → 点开抽屉 → 小节列出来 → 勾掉两节。
// 时间轴：出现 1500 → 聚焦 1000 → 开抽屉 500 → 列小节 1500 → 打勾 → 停 2000 → 退场 1000，然后循环。
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import chapters from '../../chapters.json'
import outline from '../data/outline.json'
import { STAGE_COLORS } from '../data/roadmap'
import { useInView, loop } from '../inview'

const W = 640, H = 360, NW = 118, NH = 46
const FOCUS = 'ch07'
const LAYOUT: [string, number, number, string[]][] = [
  ['ch01', 16, 40, []], ['ch02', 156, 40, ['ch01']], ['ch03', 296, 40, ['ch02']], ['ch04', 436, 40, ['ch03']],
  ['ch06', 296, 146, ['ch03']], ['ch07', 436, 146, ['ch06']],
  ['ch13', 156, 252, ['ch01']], ['ch12', 436, 252, ['ch07']],
]
const bySlug = Object.fromEntries(chapters.map((c) => [c.slug, c]))
const nodes = LAYOUT.filter(([s]) => bySlug[s]).map(([slug, x, y, deps], i) => ({
  slug, x, y, deps, i, ch: bySlug[slug], color: STAGE_COLORS[bySlug[slug].part] ?? '#64748B',
}))
const at = Object.fromEntries(nodes.map((n) => [n.slug, n]))
const edges = nodes.flatMap((n) => n.deps.filter((d) => at[d]).map((d, k) => {
  const a = at[d]
  const path = a.y === n.y
    ? `M${a.x + NW} ${a.y + NH / 2} H${n.x - 4}`
    : `M${a.x + NW / 2} ${a.y + NH} C${a.x + NW / 2} ${n.y + NH / 2} ${a.x + NW / 2} ${n.y + NH / 2} ${n.x - 4} ${n.y + NH / 2}`
  return { key: d + n.slug, path, i: n.i + k, to: n.slug }
}))
const focus = at[FOCUS]
const lessons = computed(() => ((outline as any)[FOCUS]?.sections ?? []).slice(0, 4).map((s: any) => s.title))
const pct = (v: number, base: number) => `${(v / base) * 100}%`

const root = ref<HTMLElement>()
const { inView, reduced } = useInView(root)
const p = ref(0)
const checked = ref(0)
const show = () => { p.value = 4; checked.value = 2 }
const tl = loop([
  [300, () => { p.value = 1 }],
  [1500, () => { p.value = 2 }],
  [1000, () => { p.value = 3 }],
  [500, () => { p.value = 4 }],
  [1500, () => { checked.value = 1 }],
  [500, () => { checked.value = 2 }],
  [2000, () => { p.value = 5 }],
  [1000, () => {}],
], () => { p.value = 0; checked.value = 0 })

watch([inView, reduced], ([v, r]) => {
  if (r) { tl.stop(); show(); return }
  if (v) tl.start(); else tl.stop()
})
onBeforeUnmount(() => tl.stop())
</script>

<template>
  <div ref="root" class="rd" :data-p="p" :style="{ '--fc': focus?.color }">
    <div class="rd-bar"><span class="lights"><i /><i /><i /></span><span class="rd-addr">langchain 中文学堂 / 路线图</span></div>
    <div class="rd-stage">
      <div class="rd-graph">
        <svg class="rd-edges" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
          <path v-for="e in edges" :key="e.key" :d="e.path" pathLength="1" :class="{ hot: e.to === FOCUS }" :style="{ '--d': 200 + e.i * 110 + 'ms' }" />
        </svg>
        <div
          v-for="n in nodes"
          :key="n.slug"
          :class="['rd-node', { focus: n.slug === FOCUS, done: ['ch01', 'ch02', 'ch03', 'ch06'].includes(n.slug) }]"
          :style="{ left: pct(n.x, W), top: pct(n.y, H), width: pct(NW, W), height: pct(NH, H), '--c': n.color, '--d': n.i * 110 + 'ms' }"
        >
          <small>第 {{ n.ch.num }} 章</small><b>{{ n.ch.title }}</b>
        </div>
      </div>
      <svg class="rd-cursor" viewBox="0 0 24 24" aria-hidden="true" :style="{ left: pct(focus.x + NW * 0.62, W), top: pct(focus.y + NH * 0.6, H) }">
        <path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.6 L11.6 14 L18 14 Z" />
      </svg>
      <div class="rd-drawer">
        <span class="rd-pill"><i />{{ focus.ch.part }}</span>
        <b class="rd-dt">第 {{ focus.ch.num }} 章 · {{ focus.ch.title }}</b>
        <div class="rd-prog"><span :style="{ width: (checked / Math.max(lessons.length, 1)) * 100 + '%' }" /></div>
        <ul>
          <li v-for="(l, k) in lessons" :key="l" :class="{ on: k < checked }" :style="{ '--d': k * 160 + 'ms' }">
            <span class="cb"><svg viewBox="0 0 16 16"><path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" /></svg></span>{{ l }}
          </li>
        </ul>
        <span class="rd-go">开始阅读</span>
      </div>
    </div>
  </div>
</template>
