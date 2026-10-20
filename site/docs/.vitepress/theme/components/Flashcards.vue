<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import glossary from '../data/glossary.json'
import { progress } from '../progress'

const filter = ref<'all' | 'todo'>('todo')
const order = ref(glossary.map((_, k) => k))
const pos = ref(0)
const flipped = ref(false)

const deck = computed(() => order.value
  .map((k) => glossary[k])
  .filter((g) => filter.value === 'all' || !progress.cards[g.en]))
const card = computed(() => deck.value[Math.min(pos.value, deck.value.length - 1)])
const mastered = computed(() => glossary.filter((g) => progress.cards[g.en]).length)

watch(filter, () => { pos.value = 0; flipped.value = false })

function go(d: number) {
  if (!deck.value.length) return
  pos.value = (pos.value + d + deck.value.length) % deck.value.length
  flipped.value = false
}
function know(yes: boolean) {
  if (!card.value) return
  if (yes) {
    progress.cards[card.value.en] = true
    // "未掌握"模式下当前卡会从牌堆消失，pos 不动就自然指向下一张
    if (filter.value === 'all') go(1)
    else { flipped.value = false; if (pos.value >= deck.value.length) pos.value = 0 }
  } else {
    delete progress.cards[card.value.en]
    go(1)
  }
}
function shuffle() {
  const a = [...order.value]
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]]
  }
  order.value = a; pos.value = 0; flipped.value = false
}
function clearCards() { progress.cards = {} }
</script>

<template>
  <div class="cards">
    <div class="cards-bar">
      <div class="seg">
        <button :class="{ on: filter === 'todo' }" @click="filter = 'todo'">未掌握</button>
        <button :class="{ on: filter === 'all' }" @click="filter = 'all'">全部 {{ glossary.length }}</button>
      </div>
      <span class="muted">已掌握 {{ mastered }} / {{ glossary.length }}</span>
      <button class="btn ghost" @click="shuffle">🔀 洗牌</button>
    </div>

    <div v-if="card" class="card-wrap" @click="flipped = !flipped">
      <div :class="['card', { flipped }]">
        <div class="face front">
          <span class="card-tag">{{ card.first }}</span>
          <div class="card-zh">{{ card.zh }}</div>
          <div class="card-en">{{ card.en }}</div>
          <div class="card-hint">点击卡片看解释</div>
        </div>
        <div class="face back">
          <span class="card-tag">{{ card.zh }} · {{ card.en }}</span>
          <div class="card-desc">{{ card.desc }}</div>
          <div class="card-hint">首次出现：{{ card.first }}</div>
        </div>
      </div>
    </div>
    <div v-else class="card-empty">
      🎉 全部 {{ glossary.length }} 个术语都掌握了！
      <button class="btn" @click="filter = 'all'">再复习一遍</button>
      <button class="btn ghost" @click="clearCards">清空记录</button>
    </div>

    <div v-if="card" class="cards-ctrl">
      <button class="btn" @click="go(-1)">← 上一张</button>
      <span class="muted">{{ pos + 1 }} / {{ deck.length }}</span>
      <button class="btn" @click="go(1)">下一张 →</button>
    </div>
    <div v-if="card" class="cards-ctrl">
      <button class="btn" @click="know(false)">还不熟</button>
      <button class="btn primary" @click="know(true)">我记住了 ✓</button>
    </div>
  </div>
</template>
