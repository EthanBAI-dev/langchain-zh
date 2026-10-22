// 演示动画只在滚到眼前时播放：进入视口 30% 开始，离开就停。
// 系统设置了“减少动态效果”时 reduced 为 true，组件直接显示最终画面。
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export function useInView(el: Ref<Element | undefined>, threshold = 0.3) {
  const inView = ref(false)
  const reduced = ref(false)
  let io: IntersectionObserver | undefined
  onMounted(() => {
    reduced.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (!el.value || !('IntersectionObserver' in window)) { inView.value = true; return }
    io = new IntersectionObserver(([e]) => { inView.value = e.isIntersecting }, { threshold })
    io.observe(el.value)
  })
  onBeforeUnmount(() => io?.disconnect())
  return { inView, reduced }
}

// 按顺序执行一串 [等待毫秒, 动作]，跑完从头再来；stop() 立即停下
export function loop(steps: [number, () => void][], onReset: () => void) {
  let t: ReturnType<typeof setTimeout> | undefined
  let i = 0
  let alive = false
  const tick = () => {
    if (!alive) return
    if (i >= steps.length) { i = 0; onReset() }
    const [wait, fn] = steps[i++]
    t = setTimeout(() => { fn(); tick() }, wait)
  }
  return {
    start() { if (alive) return; alive = true; i = 0; onReset(); tick() },
    stop() { alive = false; clearTimeout(t) },
  }
}
