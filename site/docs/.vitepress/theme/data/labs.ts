export const labs = [
  { title: 'ReAct 循环模拟器', link: '/lab/react', chapters: ['ch01', 'ch02', 'ch06'] },
  { title: 'Reducer 实验台', link: '/lab/reducer', chapters: ['ch07', 'ch09'] },
  { title: '术语记忆卡片', link: '/lab/flashcards', chapters: ['appendix'] },
]

export function labsFor(slug: string) {
  return labs.filter((l) => l.chapters.includes(slug))
}
