module.exports = {
  title: 'Map-Reduce 与 Send：数量不固定的并行任务', width: 1100, height: 390, dur: 2500,
  nodes: [
    { id: 'g', kind: 'llm', x: 20, y: 150, w: 180, h: 70, label: 'generate_topics', mono: true, sub: '拆成 N 个子话题' },
    { id: 'j1', kind: 'tool', x: 320, y: 30, w: 190, h: 64, label: 'generate_joke', mono: true, sub: '{subject: "猫"}' },
    { id: 'j2', kind: 'tool', x: 320, y: 153, w: 190, h: 64, label: 'generate_joke', mono: true, sub: '{subject: "狗"}' },
    { id: 'j3', kind: 'tool', x: 320, y: 276, w: 190, h: 64, label: 'generate_joke', mono: true, sub: '{subject: "企鹅"}' },
    { id: 'b', kind: 'llm', x: 620, y: 150, w: 170, h: 70, label: 'best_joke', mono: true, sub: '选出最好的' },
  ],
  edges: [
    { from: 'g', to: 'j1', id: 's1', label: 'Send', lt: 0.35 }, { from: 'g', to: 'j2', id: 's2', label: 'Send', lt: 0.35 }, { from: 'g', to: 'j3', id: 's3', label: 'Send', lt: 0.35 },
    { from: 'j1', to: 'b', id: 'r1' }, { from: 'j2', to: 'b', id: 'r2' }, { from: 'j3', to: 'b', id: 'r3' },
  ],
  panels: [{ id: 'p', x: 820, y: 0, w: 260, h: 380, mono: true, title: 'OverallState' }],
  frames: [
    { hl: ['g'], panels: { p: 'topic: "animals"\n+ subjects:\n+  ["猫","狗","企鹅"]' }, caption: '① 先让模型把主题拆成若干子话题（数量运行时才知道）' },
    { hl: ['s1', 's2', 's3', 'j1', 'j2', 'j3'], tokens: [{ edge: 's1', t: 0.8 }, { edge: 's2', t: 0.8 }, { edge: 's3', t: 0.8 }], panels: { p: 'subjects: [...]\n\n[Send("generate_joke",\n  {"subject": s})\n for s in subjects]' }, caption: '② Map：条件边返回一组 Send，每个 Send 带着自己的小状态，启动一个并行的 generate_joke' },
    { hl: ['r1', 'r2', 'r3', 'b'], panels: { p: 'jokes (operator.add):\n+ 关于猫的笑话\n+ 关于狗的笑话\n+ 关于企鹅的笑话' }, caption: '③ 每个分支把结果写回 jokes，reducer 自动合并' },
    { hl: ['b'], panels: { p: 'jokes: [3 条]\n\n+ best_selected_joke:\n+  "关于猫的笑话"' }, caption: '④ Reduce：best_joke 汇总所有结果，选出最佳', dur: 3400 },
  ],
};
