<script setup lang="ts">
import Icon from './Icon.vue'
import { computed, ref } from 'vue'
import type { Question } from '../data/quizzes'
import { progress, recordQuiz } from '../progress'
import { inline } from './inline'

const props = defineProps<{ slug: string; questions: Question[] }>()

const picked = ref<(number | null)[]>(props.questions.map(() => null))
const submitted = ref(false)

const answeredAll = computed(() => picked.value.every((p) => p !== null))
const score = computed(() => picked.value.filter((p, i) => p === props.questions[i].answer).length)
const record = computed(() => progress.quiz[props.slug])

function pick(qi: number, oi: number) {
  if (submitted.value) return
  picked.value[qi] = oi
}
function submit() {
  submitted.value = true
  recordQuiz(props.slug, score.value, props.questions.length)
}
function retry() {
  picked.value = props.questions.map(() => null)
  submitted.value = false
}
function state(qi: number, oi: number) {
  if (!submitted.value) return picked.value[qi] === oi ? 'picked' : ''
  if (oi === props.questions[qi].answer) return 'right'
  if (picked.value[qi] === oi) return 'wrong'
  return 'dim'
}
const letters = 'ABCDEFG'
</script>

<template>
  <section class="quiz">
    <header class="quiz-head">
      <h2 class="quiz-title"><span class="tile"><Icon name="pencil-line" :size="17" /></span>本章小测验</h2>
      <span v-if="record" class="quiz-best">最好成绩 {{ record.best }} / {{ record.total }}</span>
    </header>
    <p class="quiz-tip">共 {{ questions.length }} 题，全部作答后提交，会显示每题的解析。</p>

    <ol class="quiz-list">
      <li v-for="(q, qi) in questions" :key="qi" class="quiz-q">
        <p class="quiz-stem" v-html="inline(q.q)" />
        <div class="quiz-opts" role="radiogroup">
          <button
            v-for="(o, oi) in q.options"
            :key="oi"
            type="button"
            role="radio"
            :aria-checked="picked[qi] === oi"
            :class="['quiz-opt', state(qi, oi)]"
            :disabled="submitted"
            @click="pick(qi, oi)"
          >
            <span class="quiz-letter">{{ letters[oi] }}</span>
            <span v-html="inline(o)" />
          </button>
        </div>
        <p v-if="submitted" :class="['quiz-explain', picked[qi] === q.answer ? 'ok' : 'bad']">
          <strong>{{ picked[qi] === q.answer ? '答对了。' : `正确答案是 ${letters[q.answer]}。` }}</strong>
          <span v-html="inline(q.explain)" />
        </p>
      </li>
    </ol>

    <footer class="quiz-foot">
      <template v-if="!submitted">
        <button class="btn primary" :disabled="!answeredAll" @click="submit">提交答案</button>
        <span v-if="!answeredAll" class="muted">还有 {{ picked.filter((p) => p === null).length }} 题没答</span>
      </template>
      <template v-else>
        <span class="quiz-score" :class="{ full: score === questions.length }">
          得分 {{ score }} / {{ questions.length }}
          <template v-if="score === questions.length"><Icon name="trophy" :size="16" /> 全对！</template>
          <template v-else-if="score >= questions.length / 2">不错，看看错题的解析吧。</template>
          <template v-else>建议回到正文再读一遍重点小节。</template>
        </span>
        <button class="btn" @click="retry">再做一次</button>
      </template>
    </footer>
  </section>
</template>
