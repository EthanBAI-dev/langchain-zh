<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { inline } from './inline'

type Kind = 'human' | 'ai' | 'tool' | 'final'
type Node = 'start' | 'model' | 'tools' | 'end'
interface Msg { kind: Kind; title: string; body: string }
interface Step { node: Node; msg?: Msg; edge?: string; note: string }

const scenarios: Record<string, { name: string; tools: string; steps: Step[] }> = {
  sql: {
    name: 'SQL 智能体（第 1 章）',
    tools: '`execute_sql(query)`',
    steps: [
      { node: 'start', note: '图从 `__start__` 开始，输入只有一条用户消息。',
        msg: { kind: 'human', title: 'HumanMessage', body: 'Which table has the largest number of entries?' } },
      { node: 'model', edge: 'start→model', note: '**思考（Reason）**：模型发现自己不知道有哪些表，于是决定先调用工具查表名。它只“说”要调用什么，并不执行。',
        msg: { kind: 'ai', title: 'AIMessage · tool_calls', body: "execute_sql(query=\"SELECT name FROM sqlite_master WHERE type='table';\")" } },
      { node: 'tools', edge: 'model→tools', note: '`tools_condition` 看到最后一条 AI 消息里有 `tool_calls`，于是走向 tools 节点。**行动（Act）**：框架真正执行 SQL。',
        msg: { kind: 'tool', title: 'ToolMessage', body: "[('Album',), ('Artist',), ('Customer',), ('Employee',), ('Genre',), ('Invoice',), ...]" } },
      { node: 'model', edge: 'tools→model', note: '**观察（Observe）**：工具结果作为 `ToolMessage` 回到模型。现在它知道表名了，决定统计每张表的行数。',
        msg: { kind: 'ai', title: 'AIMessage · tool_calls', body: "execute_sql(query=\"SELECT 'Album', COUNT(*) FROM Album UNION ALL ...\")" } },
      { node: 'tools', edge: 'model→tools', note: '又有 `tool_calls`，再去一次 tools 节点。',
        msg: { kind: 'tool', title: 'ToolMessage', body: "[('Album', 347), ('Artist', 275), ..., ('PlaylistTrack', 8715), ...]" } },
      { node: 'model', edge: 'tools→model', note: '模型看完结果，觉得信息够了，这次**不再调用工具**，直接用人话回答。',
        msg: { kind: 'final', title: 'AIMessage', body: 'The table with the most rows is PlaylistTrack (8,715 rows).' } },
      { node: 'end', edge: 'model→end', note: '最后一条 AI 消息没有 `tool_calls`，`tools_condition` 走向 `__end__`，循环结束。一共调用了 2 次工具。' },
    ],
  },
  calc: {
    name: '乘法 Agent（第 4 章）',
    tools: '`multiply(a, b)`',
    steps: [
      { node: 'start', note: '用户问一个需要工具的问题。',
        msg: { kind: 'human', title: 'HumanMessage', body: 'What is 2 multiplied by 3?' } },
      { node: 'model', edge: 'start→model', note: '绑定了工具的模型（`llm.bind_tools([multiply])`）决定调用 `multiply`。',
        msg: { kind: 'ai', title: 'AIMessage · tool_calls', body: "multiply(a=2, b=3)   id='call_1'" } },
      { node: 'tools', edge: 'model→tools', note: '`ToolNode` 执行工具，返回的 `ToolMessage.tool_call_id` 与上一条的 `id` 一一对应。',
        msg: { kind: 'tool', title: "ToolMessage · tool_call_id='call_1'", body: '6' } },
      { node: 'model', edge: 'tools→model', note: '因为有 `tools → assistant` 这条**回边**，结果回到模型，这就是 Router 升级成 Agent 的关键。',
        msg: { kind: 'final', title: 'AIMessage', body: '2 multiplied by 3 is 6.' } },
      { node: 'end', edge: 'model→end', note: '没有新的工具调用，结束。如果去掉回边，图会停在 tools 之后，用户只能看到数字 6。' },
    ],
  },
}

const which = ref<keyof typeof scenarios>('sql')
const i = ref(0)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const sc = computed(() => scenarios[which.value])
const step = computed(() => sc.value.steps[i.value])
const msgs = computed(() => sc.value.steps.slice(0, i.value + 1).filter((s) => s.msg).map((s) => s.msg!))
const last = computed(() => i.value === sc.value.steps.length - 1)
const toolCalls = computed(() => sc.value.steps.slice(0, i.value + 1).filter((s) => s.node === 'tools').length)

function next() { if (!last.value) i.value++; else stop() }
function prev() { if (i.value > 0) i.value-- }
function reset() { stop(); i.value = 0 }
function play() {
  if (last.value) i.value = 0
  playing.value = true
  timer = setInterval(next, 2200)
}
function stop() { playing.value = false; clearInterval(timer) }
watch(which, reset)
onBeforeUnmount(stop)

const active = (n: Node) => step.value.node === n
const edgeOn = (e: string) => step.value.edge === e
</script>

<template>
  <div class="sim">
    <div class="sim-tabs">
      <button v-for="(s, k) in scenarios" :key="k" :class="['tab', { on: which === k }]" @click="which = k as any">{{ s.name }}</button>
    </div>

    <div class="sim-grid">
      <div class="sim-graph">
        <svg viewBox="0 0 260 290" role="img" aria-label="ReAct 图结构">
          <defs>
            <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
            </marker>
          </defs>
          <line x1="100" y1="48" x2="100" y2="98" :class="['e', { on: edgeOn('start→model') }]" marker-end="url(#ah)" />
          <line x1="122" y1="146" x2="122" y2="216" :class="['e', { on: edgeOn('model→tools') }]" marker-end="url(#ah)" />
          <line x1="78" y1="218" x2="78" y2="148" :class="['e', { on: edgeOn('tools→model') }]" marker-end="url(#ah)" />
          <line x1="152" y1="122" x2="186" y2="122" :class="['e', 'dash', { on: edgeOn('model→end') }]" marker-end="url(#ah)" />
          <text x="130" y="178" class="lbl">有 tool_calls</text>
          <text x="130" y="192" class="lbl">tools_condition</text>
          <text x="70" y="186" class="lbl end">结果</text>
          <text x="158" y="112" class="lbl">无</text>

          <g :class="['n', 'gray', { on: active('start') }]"><rect x="55" y="14" width="90" height="34" rx="17" /><text x="100" y="36">__start__</text></g>
          <g :class="['n', 'blue', { on: active('model') }]"><rect x="50" y="100" width="100" height="44" rx="10" /><text x="100" y="127">model</text></g>
          <g :class="['n', 'orange', { on: active('tools') }]"><rect x="50" y="220" width="100" height="44" rx="10" /><text x="100" y="247">tools</text></g>
          <g :class="['n', 'gray', { on: active('end') }]"><rect x="188" y="106" width="68" height="32" rx="16" /><text x="222" y="127">__end__</text></g>
        </svg>
        <div class="sim-stats">
          <span>步骤 {{ i + 1 }} / {{ sc.steps.length }}</span>
          <span>工具调用 {{ toolCalls }} 次</span>
          <span>messages 共 {{ msgs.length }} 条</span>
        </div>
      </div>

      <div class="sim-right">
        <div class="sim-note" v-html="inline(step.note)" />
        <div class="sim-msgs">
          <div class="sim-msgs-head">state["messages"]</div>
          <TransitionGroup name="msg" tag="div">
            <div v-for="(m, k) in msgs" :key="which + k" :class="['msg', m.kind]">
              <div class="msg-title">{{ m.title }}</div>
              <code class="msg-body">{{ m.body }}</code>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <div class="sim-ctrl">
      <button class="btn" :disabled="i === 0" @click="prev">← 上一步</button>
      <button v-if="!playing" class="btn primary" @click="play">{{ last ? '↻ 重新播放' : '▶ 自动播放' }}</button>
      <button v-else class="btn primary" @click="stop">⏸ 暂停</button>
      <button class="btn" :disabled="last" @click="next">下一步 →</button>
      <button class="btn ghost" @click="reset">重置</button>
    </div>
  </div>
</template>
