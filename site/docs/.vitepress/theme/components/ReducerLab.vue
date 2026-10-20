<script setup lang="ts">
import { computed, ref } from 'vue'

/* ---------- 第一部分：并行写同一字段 ---------- */
type R = 'none' | 'add' | 'sorted'
const reducer = ref<R>('none')
const ran = ref(false)
const bVal = ref('B')
const cVal = ref('C')
// 框架决定的合并顺序：这里故意让 c 先到，演示"顺序不可控"
const order = ref<'bc' | 'cb'>('cb')

const stateDecl = computed(() => ({
  none: 'items: list',
  add: 'items: Annotated[list, operator.add]',
  sorted: 'items: Annotated[list, sorted_add]   # sorted_add = lambda a, b: sorted(a + b)',
}[reducer.value]))

const result = computed(() => {
  const updates = order.value === 'bc' ? [bVal.value, cVal.value] : [cVal.value, bVal.value]
  if (reducer.value === 'none') return { error: "InvalidUpdateError: At key 'items': Can receive only one value per step." }
  if (reducer.value === 'add') return { value: ['A', ...updates] }
  return { value: ['A', ...updates].sort() }
})
function run() {
  ran.value = true
  order.value = Math.random() < 0.5 ? 'bc' : 'cb'
}

/* ---------- 第二部分：add_messages ---------- */
interface M { id: string; role: 'human' | 'ai'; text: string; flash?: string }
const initial = (): M[] => [
  { id: '1', role: 'ai', text: 'So you said you were researching ocean mammals?' },
  { id: '2', role: 'human', text: 'Yes, I know about whales. But what others should I learn about?' },
]
const msgs = ref<M[]>(initial())
const op = ref<'append' | 'replace' | 'remove'>('append')
const target = ref('2')
const text = ref('')
const log = ref<string[]>([])
let nextId = 3

const code = computed(() => {
  const t = (text.value || '……').replace(/"/g, '\\"')
  if (op.value === 'append') return `return {"messages": [HumanMessage(content="${t}", id="${nextId}")]}`
  if (op.value === 'replace') return `return {"messages": [HumanMessage(content="${t}", id="${target.value}")]}`
  return `return {"messages": [RemoveMessage(id="${target.value}")]}`
})

function apply() {
  const list = msgs.value
  if (op.value === 'append') {
    const id = String(nextId++)
    list.push({ id, role: 'human', text: text.value || '（空消息）', flash: 'new' })
    log.value.unshift(`新 id="${id}" → 追加到末尾`)
  } else if (op.value === 'replace') {
    const m = list.find((x) => x.id === target.value)
    if (!m) return
    m.text = text.value || '（空消息）'
    m.flash = 'changed'
    log.value.unshift(`id="${target.value}" 已存在 → 原地覆盖`)
  } else {
    const k = list.findIndex((x) => x.id === target.value)
    if (k < 0) return
    list.splice(k, 1)
    log.value.unshift(`RemoveMessage(id="${target.value}") → 删除`)
    target.value = list[0]?.id ?? ''
  }
  text.value = ''
  setTimeout(() => list.forEach((m) => (m.flash = undefined)), 900)
}
function resetMsgs() {
  msgs.value = initial(); nextId = 3; log.value = []; target.value = '2'
}
</script>

<template>
  <div class="lab">
    <h3 class="lab-h">实验 1：两个并行节点写同一个字段</h3>
    <p class="muted">图：<code>a → (b, c) → d</code>。b、c 在同一个超步里并行，各自返回一个 <code>items</code> 更新。选一个 reducer 再点运行。</p>

    <div class="lab-row">
      <label v-for="(t, k) in { none: '不写 reducer（默认覆盖）', add: 'operator.add', sorted: '自定义：排序后拼接' }" :key="k" :class="['radio', { on: reducer === k }]">
        <input v-model="reducer" type="radio" :value="k" @change="ran = false" /> {{ t }}
      </label>
    </div>

    <pre class="lab-code"><code>class State(TypedDict):
    {{ stateDecl }}

def b(state): return {"items": ["<input v-model="bVal" class="inline-input" maxlength="6" @input="ran = false" />"]}
def c(state): return {"items": ["<input v-model="cVal" class="inline-input" maxlength="6" @input="ran = false" />"]}</code></pre>

    <div class="fan">
      <div class="fan-node">a<br /><small>items = ["A"]</small></div>
      <div class="fan-arrows">⇉</div>
      <div class="fan-col">
        <div :class="['fan-node', 'p', { pulse: ran }]">b → ["{{ bVal }}"]</div>
        <div :class="['fan-node', 'p', { pulse: ran }]">c → ["{{ cVal }}"]</div>
      </div>
      <div class="fan-arrows">⇉</div>
      <div :class="['fan-node', 'out', { err: ran && result.error }]">
        d 看到的 items<br />
        <small v-if="!ran">（还没运行）</small>
        <small v-else-if="result.error" class="err-text">{{ result.error }}</small>
        <small v-else><code>{{ JSON.stringify(result.value) }}</code></small>
      </div>
    </div>
    <div class="lab-row">
      <button class="btn primary" @click="run">▶ 运行一次</button>
      <span v-if="ran && reducer === 'add'" class="muted">多点几次：b、c 的合并顺序由框架决定，结果可能是 B 在前也可能是 C 在前。</span>
      <span v-if="ran && reducer === 'sorted'" class="muted">自定义 reducer 排序后，无论谁先到，结果都一样。</span>
      <span v-if="ran && reducer === 'none'" class="muted">同一超步里两个值写同一字段，又没有合并规则，LangGraph 只能报错。</span>
    </div>

    <h3 class="lab-h">实验 2：add_messages 的三条规则</h3>
    <p class="muted">节点返回 <code>{"messages": [...]}</code> 时，<code>add_messages</code> 看 <strong>id</strong> 决定怎么合并。</p>

    <div class="am-grid">
      <div>
        <div class="lab-row">
          <label :class="['radio', { on: op === 'append' }]"><input v-model="op" type="radio" value="append" /> 新 id → 追加</label>
          <label :class="['radio', { on: op === 'replace' }]"><input v-model="op" type="radio" value="replace" /> 同 id → 覆盖</label>
          <label :class="['radio', { on: op === 'remove' }]"><input v-model="op" type="radio" value="remove" /> RemoveMessage → 删除</label>
        </div>
        <div class="lab-row">
          <label v-if="op !== 'append'">目标 id
            <select v-model="target" class="select">
              <option v-for="m in msgs" :key="m.id" :value="m.id">{{ m.id }}</option>
            </select>
          </label>
          <input v-if="op !== 'remove'" v-model="text" class="text-input" placeholder="消息内容，例如：whales, specifically" @keyup.enter="apply" />
        </div>
        <pre class="lab-code"><code>{{ code }}</code></pre>
        <div class="lab-row">
          <button class="btn primary" :disabled="op !== 'append' && !msgs.length" @click="apply">应用这次更新</button>
          <button class="btn ghost" @click="resetMsgs">重置</button>
        </div>
        <ul class="am-log">
          <li v-for="(l, k) in log.slice(0, 5)" :key="k">{{ l }}</li>
        </ul>
      </div>
      <div class="sim-msgs">
        <div class="sim-msgs-head">state["messages"]</div>
        <TransitionGroup name="msg" tag="div">
          <div v-for="m in msgs" :key="m.id" :class="['msg', m.role, m.flash]">
            <div class="msg-title">{{ m.role === 'ai' ? 'AIMessage' : 'HumanMessage' }} · id="{{ m.id }}"</div>
            <code class="msg-body">{{ m.text }}</code>
          </div>
        </TransitionGroup>
        <p v-if="!msgs.length" class="muted">（空）</p>
      </div>
    </div>
  </div>
</template>
