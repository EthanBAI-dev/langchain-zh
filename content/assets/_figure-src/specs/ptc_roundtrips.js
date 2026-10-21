module.exports = {
  title: '程序化工具调用（PTC）：4 次依赖查询，只要 2 次模型往返', width: 1100, height: 430, dur: 2400,
  groups: [
    { id: 'a', x: 0, y: 0, w: 530, h: 300, label: '没有解释器：每查一次都回模型', fill: 'rgba(255,243,224,.6)' },
    { id: 'b', x: 570, y: 0, w: 530, h: 300, label: '有解释器 + PTC：一段 JS 串起四次查询', fill: 'rgba(232,245,233,.6)' },
  ],
  nodes: [
    { id: 'm1', kind: 'llm', x: 30, y: 60, w: 200, h: 90, label: '🧠 模型', sub: '读结果 → 想下一条 SQL' },
    { id: 't1', kind: 'tool', x: 300, y: 60, w: 200, h: 90, label: '🔧 query_chinook', sub: '结果全回到上下文' },
    { id: 'm2', kind: 'llm', x: 600, y: 60, w: 200, h: 90, label: '🧠 模型', sub: '写一段 JS\n只收回最后一句话' },
    { id: 'e', kind: 'note', x: 870, y: 40, w: 210, h: 130, label: '🧠 eval（QuickJS）', sub: 'await tools.queryChinook ×4\n中间结果留在变量里' },
    { id: 't2', kind: 'tool', x: 870, y: 200, w: 210, h: 80, label: '🔧 query_chinook', sub: '在宿主机上真正查库' },
  ],
  edges: [
    { from: 'm1', to: 't1', id: 'a1', fs: [1, 0.3], ts: [0, 0.3] }, { from: 't1', to: 'm1', id: 'a2', fs: [0, 0.7], ts: [1, 0.7] },
    { from: 'm2', to: 'e', id: 'b1', fs: [1, 0.3], ts: [0, 0.3] }, { from: 'e', to: 'm2', id: 'b2', fs: [0, 0.75], ts: [1, 0.7] },
    { from: 'e', to: 't2', both: true, id: 'b3' },
  ],
  panels: [
    { id: 'l', x: 0, y: 310, w: 530, h: 110, title: '模型往返次数', mono: true },
    { id: 'r', x: 570, y: 310, w: 530, h: 110, title: '模型往返次数', mono: true },
  ],
  frames: [
    { hl: ['m1', 'a1', 't1', 'a2'], panels: { l: '① 查最畅销艺人 → Iron Maiden', r: '' }, caption: '左边：模型查一次、读一次结果、再决定下一条 SQL' },
    { hl: ['m1', 'a1', 't1', 'a2'], panels: { l: '① 艺人 → ② 专辑 → ③ 曲目 → ④ 客户数\n+ ⑤ 写最终回答\n= 5 次模型往返，4 份中间结果进上下文', r: '' }, caption: '每一步都依赖上一步的结果，所以要来回 5 趟' },
    { hl: ['m2', 'b1', 'e', 'b3', 't2'], panels: { l: '= 5 次模型往返', r: '① 模型一次写好整段 JS\n   const a = JSON.parse(await tools.queryChinook(…))\n   const b = …a[0].ArtistId…   // 四次接力' }, caption: '右边：模型写一段 JavaScript，四次查询在解释器里接力完成' },
    { hl: ['e', 'b2', 'm2'], panels: { l: '= 5 次模型往返', r: '① 写 JS（四次查询在 eval 里跑完）\n② 读那一句结果，写最终回答\n= 2 次模型往返，中间结果从没进上下文' }, caption: '只有最后拼好的一句话回到模型：更快、更省 token，长上下文也不容易乱', dur: 3600 },
  ],
};
