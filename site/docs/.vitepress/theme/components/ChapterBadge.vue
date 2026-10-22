<script setup lang="ts">
import Icon from './Icon.vue'
import { computed } from 'vue'
import chapters from '../../chapters.json'
import { progress } from '../progress'

const props = defineProps<{ slug: string }>()
const c = computed(() => chapters.find((x) => x.slug === props.slug))
const quiz = computed(() => progress.quiz[props.slug])
</script>

<template>
  <div v-if="c" class="chapter-badge">
    <span class="pill part"><b />{{ c.part }}</span>
    <span class="pill"><Icon name="clock" :size="14" />约 {{ c.minutes }} 分钟</span>
    <span v-if="progress.done[slug]" class="pill ok"><Icon name="circle-check" :size="14" />已完成</span>
    <span v-if="quiz" class="pill"><Icon name="pencil-line" :size="14" />测验 {{ quiz.best }}/{{ quiz.total }}</span>
  </div>
</template>
