import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import ProgressBoard from './components/ProgressBoard.vue'
import Flashcards from './components/Flashcards.vue'
import ReactSim from './components/ReactSim.vue'
import ReducerLab from './components/ReducerLab.vue'
import Quiz from './components/Quiz.vue'
import { tokenize } from '../tokenize'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, siteData }) {
    // 配置里的函数不会被序列化到浏览器端，这里把搜索用的切词函数补回去
    const ms = (siteData.value.themeConfig as any).search?.options?.miniSearch
    if (ms) {
      ms.options = { ...ms.options, tokenize, processTerm: (t: string) => t.toLowerCase() }
      ms.searchOptions = { ...ms.searchOptions, tokenize }
    }
    app.component('ProgressBoard', ProgressBoard)
    app.component('Flashcards', Flashcards)
    app.component('ReactSim', ReactSim)
    app.component('ReducerLab', ReducerLab)
    app.component('Quiz', Quiz)
  },
} satisfies Theme
