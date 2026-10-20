<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import chapters from '../../chapters.json'
import glossary from '../data/glossary.json'
import { quizzes } from '../data/quizzes'
import { progress, resetProgress } from '../progress'

const props = defineProps<{ compact?: boolean }>()

const doneCount = computed(() => chapters.filter((c) => progress.done[c.slug]).length)
const pct = computed(() => Math.round((doneCount.value / chapters.length) * 100))
const quizTotal = computed(() => Object.values(quizzes).reduce((n, q) => n + q.length, 0))
const quizBest = computed(() => Object.values(progress.quiz).reduce((n, r) => n + r.best, 0))
const cards = computed(() => glossary.filter((g) => progress.cards[g.en]).length)
const nextUp = computed(() => chapters.find((c) => !progress.done[c.slug]))
const minutesLeft = computed(() => chapters.filter((c) => !progress.done[c.slug]).reduce((n, c) => n + c.minutes, 0))

function reset() {
  if (confirm('确定清空所有学习进度、测验成绩和卡片记录吗？')) resetProgress()
}
</script>

<template>
  <div :class="['board', { compact: props.compact }]">
    <div class="board-top">
      <div class="ring" :style="{ '--p': pct }">
        <span>{{ pct }}%</span>
      </div>
      <div class="board-stats">
        <div><strong>{{ doneCount }}</strong> / {{ chapters.length }} 章已完成</div>
        <div><strong>{{ quizBest }}</strong> / {{ quizTotal }} 道测验题答对</div>
        <div><strong>{{ cards }}</strong> / {{ glossary.length }} 个术语已掌握</div>
        <div v-if="nextUp" class="muted">剩余约 {{ Math.ceil(minutesLeft / 6) / 10 }} 小时</div>
      </div>
      <a v-if="nextUp" class="btn primary board-cta" :href="withBase(`/learn/${nextUp.slug}`)">
        {{ doneCount ? '继续学习' : '从这里开始' }}：{{ nextUp.slug === 'appendix' ? nextUp.title : `第 ${nextUp.num} 章 ${nextUp.title}` }} →
      </a>
      <span v-else class="board-cta">🎓 全部学完了！</span>
    </div>

    <ol v-if="!props.compact" class="board-list">
      <li v-for="c in chapters" :key="c.slug" :class="{ done: progress.done[c.slug] }">
        <span class="dot">{{ progress.done[c.slug] ? '✓' : c.num }}</span>
        <a :href="withBase(`/learn/${c.slug}`)">{{ c.title }}</a>
        <span class="muted">{{ c.part }} · {{ c.minutes }} 分钟</span>
        <span v-if="progress.quiz[c.slug]" class="pill">测验 {{ progress.quiz[c.slug].best }}/{{ progress.quiz[c.slug].total }}</span>
        <span v-else-if="quizzes[c.slug]" class="pill dim">测验未做</span>
      </li>
    </ol>
    <div v-if="!props.compact" class="board-foot">
      <span class="muted">进度只保存在当前浏览器，换设备或清除浏览器数据会丢失。</span>
      <button class="btn ghost" @click="reset">清空进度</button>
    </div>
  </div>
</template>
