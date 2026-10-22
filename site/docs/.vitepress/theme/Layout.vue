<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed, onMounted } from 'vue'
import ChapterEnd from './components/ChapterEnd.vue'
import ChapterBadge from './components/ChapterBadge.vue'
import ImageZoom from './components/ImageZoom.vue'
import { initProgress } from './progress'

const { frontmatter } = useData()
const chapter = computed(() => frontmatter.value.chapter as string | undefined)
onMounted(initProgress)
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <ChapterBadge v-if="chapter" :slug="chapter" />
    </template>
    <template #doc-after>
      <ChapterEnd v-if="chapter" :key="chapter" :slug="chapter" />
    </template>
    <template #layout-bottom>
      <ImageZoom />
    </template>
  </DefaultTheme.Layout>
</template>
