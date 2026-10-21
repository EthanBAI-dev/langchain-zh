module.exports = {
  title: '动态子智能体：让代码去数，而不是让模型去记', width: 1100, height: 450, dur: 2800,
  groups: [
    { id: 'a', x: 0, y: 0, w: 520, h: 280, label: '数量少：模型自己列出 4 个 task', fill: 'rgba(227,242,253,.6)' },
    { id: 'b', x: 560, y: 0, w: 540, h: 280, label: '数量大：模型写一段循环，交给解释器跑', fill: 'rgba(232,245,233,.6)' },
  ],
  nodes: [
    { id: 'm1', kind: 'llm', x: 160, y: 40, w: 200, h: 70, label: '🧠 主 Agent', sub: '一步发出 4 个 task' },
    { id: 's1', kind: 'tool', x: 20, y: 190, w: 110, h: 70, label: '👥 1' },
    { id: 's2', kind: 'tool', x: 145, y: 190, w: 110, h: 70, label: '👥 2' },
    { id: 's3', kind: 'tool', x: 270, y: 190, w: 110, h: 70, label: '👥 3' },
    { id: 's4', kind: 'tool', x: 395, y: 190, w: 110, h: 70, label: '👥 4' },
    { id: 'm2', kind: 'llm', x: 580, y: 40, w: 200, h: 70, label: '🧠 主 Agent', sub: '写一次脚本' },
    { id: 'ev', kind: 'note', x: 830, y: 30, w: 250, h: 90, label: '🧠 eval 里的脚本', sub: 'for (const b of books)\n  await task(b)' },
    { id: 'd1', kind: 'tool', x: 580, y: 190, w: 110, h: 70, label: '👥 1' },
    { id: 'd2', kind: 'tool', x: 705, y: 190, w: 110, h: 70, label: '👥 2' },
    { id: 'd3', kind: 'plain', x: 830, y: 190, w: 110, h: 70, label: '……' },
    { id: 'd4', kind: 'tool', x: 955, y: 190, w: 130, h: 70, label: '👥 60' },
  ],
  edges: [
    { from: 'm1', to: 's1' }, { from: 'm1', to: 's2' }, { from: 'm1', to: 's3' }, { from: 'm1', to: 's4' },
    { from: 'm2', to: 'ev', id: 'me' },
    { from: 'ev', to: 'd1' }, { from: 'ev', to: 'd2' }, { from: 'ev', to: 'd3', dashed: true }, { from: 'ev', to: 'd4' },
  ],
  panels: [
    { id: 'l', x: 0, y: 290, w: 520, h: 145, title: '谁在记账', mono: true },
    { id: 'r', x: 560, y: 290, w: 540, h: 145, title: '谁在记账', mono: true },
  ],
  frames: [
    { hl: ['m1', 'm1->s1', 'm1->s2', 'm1->s3', 'm1->s4', 's1', 's2', 's3', 's4'], panels: { l: '模型：Rock、Latin、Metal、Alt…\n4 个，记得住，一步发完 ✅', r: '' }, caption: '左：只有 4 个流派，模型自己列、自己并行发出去就行' },
    { hl: ['m2'], panels: { l: '模型自己记 ✅', r: '如果让模型自己记 1000 份录音……\n· 直接说"做不了"\n· 自己切成 0-100、100-200 … 然后忘了进度\n· 做到第 75 份就说"完成了"' }, caption: '右：成百上千个时，让模型逐轮记账，迟早漏' },
    { hl: ['m2', 'me', 'ev', 'ev->d1', 'ev->d2', 'ev->d3', 'ev->d4', 'd1', 'd2', 'd4'], panels: { l: '模型自己记 ✅', r: 'for 循环在记账：\n60 本书，一本不落 ✅\n每次 task() 仍是独立、干净的子智能体\n主 Agent 只看到汇总后的结果' }, caption: '动态子智能体：模型只写一次脚本，循环保证每一项都被处理', dur: 3800 },
  ],
};
