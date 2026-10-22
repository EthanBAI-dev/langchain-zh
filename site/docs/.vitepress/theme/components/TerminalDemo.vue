<script setup lang="ts">
// 终端打字演示：命令一个字一个字敲出来（50ms/字），输出一行一行出现（700ms/行），
// 播完停 3 秒再从头来。只在滚到眼前时播放。
import { onBeforeUnmount, ref, watch } from 'vue'
import { useInView } from '../inview'

export interface TermLine { kind: 'cmd' | 'out' | 'ok' | 'dim' | 'ai' | 'tool' | 'wait'; text?: string; ms?: number }
const props = defineProps<{ title: string; lines: TermLine[] }>()

const root = ref<HTMLElement>()
const { inView, reduced } = useInView(root)
const shown = ref<{ kind: string; text: string }[]>([])
const typing = ref(false)
const waiting = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let run = 0

const sleep = (ms: number, id: number) => new Promise<boolean>((r) => { timer = setTimeout(() => r(id === run), ms) })

async function play() {
  const id = ++run
  while (id === run) {
    shown.value = []
    for (const l of props.lines) {
      if (l.kind === 'wait') {
        waiting.value = true
        if (!(await sleep(l.ms ?? 1200, id))) return
        waiting.value = false
        continue
      }
      if (l.kind === 'cmd') {
        const row = { kind: 'cmd', text: '' }
        shown.value.push(row)
        typing.value = true
        for (const ch of l.text ?? '') {
          if (!(await sleep(50, id))) return
          shown.value[shown.value.length - 1].text += ch
        }
        typing.value = false
        if (!(await sleep(400, id))) return
      } else {
        if (!(await sleep(l.ms ?? 700, id))) return
        shown.value.push({ kind: l.kind, text: l.text ?? '' })
      }
    }
    if (!(await sleep(3000, id))) return
  }
}
function stop() { run++; clearTimeout(timer); typing.value = false; waiting.value = false }
function still() { shown.value = props.lines.filter((l) => l.kind !== 'wait').map((l) => ({ kind: l.kind, text: l.text ?? '' })) }

watch([inView, reduced], ([v, r]) => {
  if (r) { stop(); still(); return }
  if (v) play(); else stop()
})
onBeforeUnmount(stop)
</script>

<template>
  <div ref="root" class="term">
    <div class="term-bar"><span class="lights"><i /><i /><i /></span><span class="term-title">{{ title }}</span></div>
    <div class="term-body">
      <div v-for="(l, i) in shown" :key="i" :class="['tl', l.kind]">
        <span v-if="l.kind === 'cmd'" class="ps">$</span>{{ l.text }}<span v-if="typing && i === shown.length - 1" class="caret" />
      </div>
      <div v-if="waiting" class="tl wait"><span class="bounce"><i /><i /><i /></span></div>
      <div v-if="!shown.length && !waiting" class="tl cmd"><span class="ps">$</span><span class="caret" /></div>
    </div>
  </div>
</template>
