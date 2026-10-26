<script setup lang="ts">
import Icon from './Icon.vue'
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import chapters from '../../chapters.json'
import { progress } from '../progress'

const props = defineProps<{ slug: string }>()
const c = computed(() => chapters.find((x) => x.slug === props.slug))
const quiz = computed(() => progress.quiz[props.slug])
// 只有打开过编辑后台的浏览器才显示“编辑本页”
const editor = ref(false)
onMounted(() => { try { editor.value = localStorage.getItem('lczh-editor') === '1' } catch {} })
const editHref = computed(() => withBase(`/admin/#/collections/chapters/entries/${props.slug}`))
</script>

<template>
  <div v-if="c" class="chapter-badge">
    <span class="pill part"><b />{{ c.part }}</span>
    <span class="pill"><Icon name="clock" :size="14" />约 {{ c.minutes }} 分钟</span>
    <span v-if="progress.done[slug]" class="pill ok"><Icon name="circle-check" :size="14" />已完成</span>
    <span v-if="quiz" class="pill"><Icon name="pencil-line" :size="14" />测验 {{ quiz.best }}/{{ quiz.total }}</span>
    <a v-if="editor" class="pill edit" :href="editHref" target="_blank" rel="noopener"><Icon name="pencil-line" :size="14" />编辑本页</a>
  </div>
</template>
