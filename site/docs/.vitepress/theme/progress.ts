// 学习进度：只存在当前浏览器的 localStorage 里，不上传
import { reactive, watch } from 'vue'

interface QuizRecord { best: number; total: number; last: number }
interface Progress {
  done: Record<string, number>          // slug → 完成时间
  quiz: Record<string, QuizRecord>      // slug → 测验成绩
  cards: Record<string, boolean>        // 术语 → 已掌握
}

const KEY = 'lc-zh-progress-v1'
const empty = (): Progress => ({ done: {}, quiz: {}, cards: {} })

function load(): Progress {
  if (typeof window === 'undefined') return empty()
  try {
    return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return empty()
  }
}

export const progress = reactive<Progress>(empty())

let started = false
export function initProgress() {
  if (started || typeof window === 'undefined') return
  started = true
  Object.assign(progress, load())
  watch(progress, (v) => {
    try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })
  // 别的标签页改了进度，这里也同步
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) Object.assign(progress, load())
  })
}

export function toggleDone(slug: string) {
  if (progress.done[slug]) delete progress.done[slug]
  else progress.done[slug] = Date.now()
}

export function recordQuiz(slug: string, score: number, total: number) {
  const prev = progress.quiz[slug]
  progress.quiz[slug] = { best: Math.max(prev?.best ?? 0, score), total, last: score }
}

export function resetProgress() {
  Object.assign(progress, empty())
}
