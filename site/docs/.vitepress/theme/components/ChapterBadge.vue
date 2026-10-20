<script setup lang="ts">
import { computed } from 'vue'
import chapters from '../../chapters.json'
import { progress } from '../progress'

const props = defineProps<{ slug: string }>()
const c = computed(() => chapters.find((x) => x.slug === props.slug))
const quiz = computed(() => progress.quiz[props.slug])
</script>

<template>
  <div v-if="c" class="chapter-badge">
    <span class="pill">{{ c.part }}</span>
    <span class="pill">⏱ 约 {{ c.minutes }} 分钟</span>
    <span v-if="progress.done[slug]" class="pill ok">✓ 已完成</span>
    <span v-if="quiz" class="pill">测验 {{ quiz.best }}/{{ quiz.total }}</span>
  </div>
</template>
