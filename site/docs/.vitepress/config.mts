import { defineConfig } from 'vitepress'
import chapters from './chapters.json'
import { tokenize } from './tokenize'

const parts = [...new Set(chapters.map((c) => c.part))]
const learnSidebar = [
  { text: '总导读', link: '/learn/' },
  ...parts.map((part) => ({
    text: part,
    collapsed: false,
    items: chapters
      .filter((c) => c.part === part)
      .map((c) => ({
        text: c.slug === 'appendix' ? c.title : `${c.num}. ${c.title}`,
        link: `/learn/${c.slug}`,
      })),
  })),
]

export default defineConfig({
  lang: 'zh-CN',
  title: 'LangChain 中文学堂',
  description: '跟着 LangChain Academy，用图文、动图和互动练习学会 LangChain、LangGraph 与 Deep Agents',
  base: process.env.BASE || '/',
  cleanUrls: true,
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: `${process.env.BASE || '/'}logo.svg` }]],
  markdown: {
    lineNumbers: false,
    image: { lazyLoading: true },
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '开始学习', link: '/learn/' },
      { text: '互动实验室', items: [
        { text: 'ReAct 循环模拟器', link: '/lab/react' },
        { text: 'Reducer 实验台', link: '/lab/reducer' },
        { text: '术语记忆卡片', link: '/lab/flashcards' },
      ] },
      { text: '我的进度', link: '/progress' },
    ],
    sidebar: {
      '/learn/': learnSidebar,
      '/lab/': [
        { text: '互动实验室', items: [
          { text: 'ReAct 循环模拟器', link: '/lab/react' },
          { text: 'Reducer 实验台', link: '/lab/reducer' },
          { text: '术语记忆卡片', link: '/lab/flashcards' },
        ] },
      ],
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一章', next: '下一章' },
    lastUpdated: { text: '最后更新' },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色',
    darkModeSwitchTitle: '切换到深色',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    footer: {
      message: '内容整理自 LangChain Academy 官方课程与配套仓库（MIT 许可），仅供学习交流。',
    },
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: { tokenize, processTerm: (t: string) => t.toLowerCase() },
          searchOptions: { tokenize, prefix: true, fuzzy: 0.1, combineWith: 'AND' },
        },
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '没有找到相关内容',
            resetButtonTitle: '清除',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
  },
})
