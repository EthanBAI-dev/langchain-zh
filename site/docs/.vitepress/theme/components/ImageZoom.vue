<script setup lang="ts">
// 点击正文里的图片，全屏放大查看（SVG 矢量图放大也清晰）
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Icon from './Icon.vue'

const src = ref('')
const alt = ref('')

function onClick(e: MouseEvent) {
  const img = (e.target as HTMLElement).closest?.('.vp-doc img') as HTMLImageElement | null
  if (!img || img.closest('a')) return
  src.value = img.currentSrc || img.src
  alt.value = img.alt
}
function close() { src.value = '' }
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }

onMounted(() => {
  document.addEventListener('click', onClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Transition name="zoom">
    <div v-if="src" class="zoom" role="dialog" aria-modal="true" @click="close">
      <img :src="src" :alt="alt" @click.stop />
      <div class="zoom-bar">
        <span>{{ alt }}</span>
        <button aria-label="关闭" @click="close"><Icon name="x" :size="18" /></button>
      </div>
    </div>
  </Transition>
</template>
