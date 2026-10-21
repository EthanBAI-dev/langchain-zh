module.exports = {
  title: '子智能体团队：主编派活，四个记者并行调研，只交回成稿', width: 1100, height: 470, dur: 2600,
  nodes: [
    { id: 'u', kind: 'human', x: 20, y: 30, w: 180, h: 80, label: '🧑 用户', sub: '出本周的通讯' },
    { id: 'ed', kind: 'llm', x: 260, y: 30, w: 240, h: 80, label: '🧠 主编（强模型）', sub: '只派活、拼稿，不亲自查' },
    { id: 'r1', kind: 'tool', x: 20, y: 190, w: 160, h: 90, label: '👥 Rock', sub: 'genre-researcher' },
    { id: 'r2', kind: 'tool', x: 195, y: 190, w: 160, h: 90, label: '👥 Latin', sub: 'genre-researcher' },
    { id: 'r3', kind: 'tool', x: 370, y: 190, w: 160, h: 90, label: '👥 Metal', sub: 'genre-researcher' },
    { id: 'r4', kind: 'tool', x: 545, y: 190, w: 160, h: 90, label: '👥 Alt & Punk', sub: 'genre-researcher' },
    { id: 'fs', kind: 'store', x: 20, y: 350, w: 685, h: 90, label: '📁 /research/<流派>/sources.md', sub: '原始搜索结果全堆在这里，主编从不读进上下文（主编对这里只读）' },
    { id: 'out', kind: 'note', x: 560, y: 30, w: 145, h: 80, label: '📄 成品', sub: '/output/\nnewsletter.html' },
  ],
  edges: [
    { from: 'u', to: 'ed' }, { from: 'ed', to: 'out', id: 'eo' },
    { from: 'ed', to: 'r1', id: 'e1' }, { from: 'ed', to: 'r2', id: 'e2' }, { from: 'ed', to: 'r3', id: 'e3' }, { from: 'ed', to: 'r4', id: 'e4' },
    { from: 'r1', to: 'fs', id: 'f1', dashed: true }, { from: 'r2', to: 'fs', id: 'f2', dashed: true }, { from: 'r3', to: 'fs', id: 'f3', dashed: true }, { from: 'r4', to: 'fs', id: 'f4', dashed: true },
  ],
  panels: [{ id: 'c', x: 740, y: 0, w: 360, h: 460, title: '主编的上下文', mono: true }],
  frames: [
    { hl: ['u', 'u->ed', 'ed'], panels: { c: 'Human: 写本周的\n  "This Week in Music"' }, caption: '① 主编知道要做哪四个流派，但不自己去搜' },
    { hl: ['ed', 'e1', 'e2', 'e3', 'e4', 'r1', 'r2', 'r3', 'r4'], panels: { c: 'Human: 写本周的通讯\nAI: task(genre-researcher,\n      "Research Rock …")\n    task(…"Latin"…)\n    task(…"Metal"…)\n    task(…"Alt & Punk"…)\n（同一步发出 4 个，并行）' }, caption: '② 同一种子智能体，一步里调 4 次 task，四个记者同时开工' },
    { hl: ['r1', 'r2', 'r3', 'r4', 'f1', 'f2', 'f3', 'f4', 'fs'], panels: { c: '（这期间主编在等最慢的那个）\n\n每个记者只收到 1 条任务消息，\n看不到主编的对话历史' }, caption: '③ 每个记者在自己干净的上下文里搜索，把原始结果全文写进 /research/ 下的文件' },
    { hl: ['e1', 'e2', 'e3', 'e4', 'ed'], panels: { c: 'AI: task × 4\n+ Tool: ## Rock …（约 150 字）\n+ Tool: ## Latin …\n+ Tool: ## Metal …\n+ Tool: ## Alt & Punk …\n\n原始搜索结果：0 条进来' }, caption: '④ 回到主编的只有四段成稿；乱七八糟的搜索结果留在文件里' },
    { hl: ['ed', 'eo', 'out'], panels: { c: '…四段成稿\nAI: markdown_to_html(…)\nAI: write_file(\n  "/output/newsletter.html")\nAI: 本期通讯已生成 ✅' }, caption: '⑤ 主编拼成 Markdown，转成 HTML，写到 /output/', dur: 3400 },
  ],
};
