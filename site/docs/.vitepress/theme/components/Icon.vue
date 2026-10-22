<script setup lang="ts">
import { icons } from '../data/icons'

withDefaults(defineProps<{ name: string; size?: number | string; stroke?: number | string }>(), { size: 16, stroke: 2 })
</script>

<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="icons[name] || ''"
  />
</template>
