<script setup lang="ts">
import Icon from './Icon.vue'
import { computed } from 'vue'
import { withBase } from 'vitepress'
import chapters from '../../chapters.json'
import { quizzes } from '../data/quizzes'
import { labsFor } from '../data/labs'
import { progress, toggleDone } from '../progress'
import Quiz from './Quiz.vue'

const props = defineProps<{ slug: string }>()

const idx = computed(() => chapters.findIndex((c) => c.slug === props.slug))
const next = computed(() => chapters[idx.value + 1])
const questions = computed(() => quizzes[props.slug])
const labs = computed(() => labsFor(props.slug))
const done = computed(() => !!progress.done[props.slug])
</script>

<template>
  <div class="chapter-end">
    <div v-if="labs.length" class="lab-callout">
      <span class="lab-callout-label"><span class="tile"><Icon name="flask-conical" :size="16" /></span>配套互动实验</span>
      <a v-for="l in labs" :key="l.link" :href="withBase(l.link)" class="lab-chip">{{ l.title }}<Icon name="arrow-right" :size="13" /></a>
    </div>

    <Quiz v-if="questions" :slug="slug" :questions="questions" />

    <div :class="['done-box', { done }]">
      <div>
        <strong v-if="done"><Icon name="circle-check" :size="18" />你已完成本章</strong>
        <strong v-else>读完了吗？</strong>
        <p class="muted">进度只保存在你的浏览器里，可以在“我的进度”页查看。</p>
      </div>
      <div class="done-actions">
        <button :class="['btn', done ? '' : 'primary']" @click="toggleDone(slug)">
          {{ done ? '标记为未完成' : '标记本章已完成' }}
        </button>
        <a v-if="next && done" class="btn primary" :href="withBase(`/learn/${next.slug}`)">
          继续：{{ next.slug === 'appendix' ? next.title : `第 ${next.num} 章 ${next.title}` }}<Icon name="arrow-right" :size="15" />
        </a>
      </div>
    </div>
  </div>
</template>
