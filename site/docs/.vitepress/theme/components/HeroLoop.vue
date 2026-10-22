<script setup lang="ts">
// 首页主视觉：一个自己会动的 ReAct 循环。纯 SVG + SMIL，所有元素共用 10 秒的时间轴。
const DUR = '10s'
// 每条边上跑一个小圆点：[路径, 出发时刻, 到达时刻]（占时间轴的比例）
const tokens = [
  ['M170 58 V100', 0.02, 0.1],
  ['M120 176 V252', 0.25, 0.35],
  ['M220 252 V176', 0.45, 0.55],
  ['M290 138 H352', 0.65, 0.75],
] as const
const kt = (a: number, b: number) => `0;${a};${b};1`
// 某段时间里亮起：values 0 → 1 → 1 → 0
const on = (a: number, b: number) => ({
  values: '0;0;1;1;0;0',
  keyTimes: `0;${Math.max(a - 0.02, 0.001)};${a};${b};${Math.min(b + 0.02, 0.999)};1`,
})
// 从某一刻出现，到循环末尾淡出
const show = (a: number) => ({ values: '0;0;1;1;0', keyTimes: `0;${a};${a + 0.03};0.94;1` })

const msgs = [
  { y: 70, at: 0.04, kind: 'human', who: 'HumanMessage', text: '哪种音乐流派的曲目平均最长？' },
  { y: 140, at: 0.24, kind: 'ai', who: 'AIMessage · tool_calls', text: 'execute_sql("SELECT …")' },
  { y: 210, at: 0.42, kind: 'tool', who: 'ToolMessage', text: "[('Sci Fi', 48.5), …]" },
  { y: 280, at: 0.62, kind: 'final', who: 'AIMessage', text: '平均最长的是 Sci Fi & Fantasy。' },
]
const steps = [
  { a: 0.0, b: 0.22, text: '① 用户提问，消息进入 state' },
  { a: 0.22, b: 0.42, text: '② 模型决定调用工具' },
  { a: 0.42, b: 0.62, text: '③ 工具执行，结果回到模型' },
  { a: 0.62, b: 0.96, text: '④ 不再调工具，直接回答' },
]
</script>

<template>
  <div class="hero-stage">
    <div class="stage-bar">
      <span class="lights"><i /><i /><i /></span>
      <span class="addr">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        agent = create_agent(model, tools=[execute_sql])
      </span>
    </div>
    <svg class="stage-svg" viewBox="0 0 720 380" role="img" aria-label="ReAct 循环动画：模型和工具之间来回运行">
      <defs>
        <pattern id="hl-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" class="dot" /></pattern>
        <marker id="hl-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,1 L9,5 L0,9 z" class="arrow" />
        </marker>
        <filter id="hl-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <rect width="720" height="380" fill="url(#hl-dots)" />

      <!-- 边 -->
      <g class="edges" marker-end="url(#hl-ah)">
        <path d="M170 58 V98" />
        <path d="M120 176 V250" />
        <path d="M220 252 V178" />
        <path d="M290 138 H350" class="dash" />
      </g>
      <g class="elabels">
        <rect x="58" y="200" width="90" height="24" rx="12" /><text x="103" y="216">tool_calls</text>
        <rect x="196" y="200" width="70" height="24" rx="12" /><text x="231" y="216">结果</text>
        <text x="320" y="128">回答</text>
      </g>

      <!-- 节点 -->
      <g class="pill-node">
        <rect x="120" y="24" width="100" height="34" rx="17" /><text x="170" y="46">START</text>
      </g>
      <g class="node llm">
        <rect class="glow" x="50" y="100" width="240" height="76" rx="16" filter="url(#hl-glow)" opacity="0">
          <animate attributeName="opacity" :dur="DUR" repeatCount="indefinite" calcMode="linear" v-bind="on(0.1, 0.25)" />
        </rect>
        <rect class="box" x="50" y="100" width="240" height="76" rx="16" />
        <rect class="hl-ring" x="50" y="100" width="240" height="76" rx="16" opacity="0">
          <animate attributeName="opacity" :dur="DUR" repeatCount="indefinite" values="0;0;1;1;0;0;1;1;0;0" keyTimes="0;0.08;0.1;0.25;0.27;0.53;0.55;0.65;0.67;1" />
        </rect>
        <rect class="tile" x="68" y="118" width="40" height="40" rx="10" />
        <g transform="translate(76 126)" class="ic"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></g>
        <text x="122" y="134" class="t">模型 model</text>
        <text x="122" y="156" class="s">决定：直接回答，还是调工具</text>
      </g>
      <g class="node tool">
        <rect class="box" x="50" y="252" width="240" height="76" rx="16" />
        <rect class="hl-ring" x="50" y="252" width="240" height="76" rx="16" opacity="0">
          <animate attributeName="opacity" :dur="DUR" repeatCount="indefinite" calcMode="linear" v-bind="on(0.35, 0.45)" />
        </rect>
        <rect class="tile" x="68" y="270" width="40" height="40" rx="10" />
        <g transform="translate(76 278)" class="ic"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></g>
        <text x="122" y="286" class="t">工具 tools</text>
        <text x="122" y="308" class="s">真正执行 SQL、搜索、计算</text>
      </g>
      <g class="pill-node end">
        <rect x="352" y="121" width="76" height="34" rx="17" /><text x="390" y="143">END</text>
        <rect class="hl-ring" x="352" y="121" width="76" height="34" rx="17" opacity="0">
          <animate attributeName="opacity" :dur="DUR" repeatCount="indefinite" calcMode="linear" v-bind="on(0.75, 0.94)" />
        </rect>
      </g>

      <!-- 沿边移动的小圆点 -->
      <g v-for="([d, a, b], k) in tokens" :key="k">
        <circle r="6" class="token" opacity="0">
          <animateMotion :path="d" :dur="DUR" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" :keyTimes="kt(a, b)" />
          <animate attributeName="opacity" :dur="DUR" repeatCount="indefinite" v-bind="on(a, b)" />
        </circle>
      </g>

      <!-- 底部的步骤说明 -->
      <g class="caption">
        <text v-for="s in steps" :key="s.text" x="50" y="364" opacity="0">
          {{ s.text }}
          <animate attributeName="opacity" :dur="DUR" repeatCount="indefinite" v-bind="on(s.a + 0.025, s.b - 0.005)" />
        </text>
      </g>

      <!-- 右侧：state["messages"] -->
      <g class="panel">
        <rect x="452" y="20" width="248" height="340" rx="14" class="pbox" />
        <text x="470" y="48" class="phead">state["messages"]</text>
        <g v-for="m in msgs" :key="m.who + m.y" :class="['hl-msg', m.kind]" opacity="0">
          <animate attributeName="opacity" :dur="DUR" repeatCount="indefinite" v-bind="show(m.at)" />
          <rect x="466" :y="m.y" width="220" height="58" rx="10" class="mbox" />
          <rect x="466" :y="m.y" width="4" height="58" rx="2" class="bar" />
          <text x="482" :y="m.y + 22" class="who">{{ m.who }}</text>
          <text x="482" :y="m.y + 43" class="mt">{{ m.text }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>
