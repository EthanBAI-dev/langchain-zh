module.exports = {
  title: '并行：扇出（fan-out）与扇入（fan-in）', width: 1100, height: 380, dur: 2400,
  nodes: [
    { id: 'a', kind: 'node', x: 20, y: 150, w: 110, h: 56, label: 'a', mono: true },
    { id: 'b', kind: 'node', x: 200, y: 50, w: 110, h: 56, label: 'b', mono: true },
    { id: 'b2', kind: 'node', x: 380, y: 50, w: 110, h: 56, label: 'b2', mono: true },
    { id: 'c', kind: 'node', x: 290, y: 250, w: 110, h: 56, label: 'c', mono: true },
    { id: 'd', kind: 'node', x: 560, y: 150, w: 110, h: 56, label: 'd', mono: true },
  ],
  edges: [
    { from: 'a', to: 'b' }, { from: 'a', to: 'c' }, { from: 'b', to: 'b2' },
    { from: 'b2', to: 'd' }, { from: 'c', to: 'd' },
  ],
  panels: [{ id: 'p', x: 710, y: 0, w: 370, h: 370, mono: true, title: 'state: Annotated[list, operator.add]' }],
  frames: [
    { hl: ['a'], panels: { p: '超步 1\n+ ["I\'m A"]' }, caption: '超步 1：a 执行' },
    { hl: ['a->b', 'a->c', 'b', 'c'], panels: { p: '超步 1\n["I\'m A"]\n超步 2（b、c 并行）\n+ ["I\'m A", "I\'m B", "I\'m C"]' }, caption: '超步 2：a 同时连向 b 和 c → 并行执行；两者都写 state，必须有 reducer' },
    { hl: ['b->b2', 'b2'], panels: { p: '超步 2\n["I\'m A", "I\'m B", "I\'m C"]\n超步 3\n+ [..., "I\'m B2"]' }, caption: '超步 3：b2 执行；d 用 add_edge(["b2", "c"], "d") 声明要等两条支路都完成' },
    { hl: ['b2->d', 'c->d', 'd'], panels: { p: '最终（本地实测）：\n> ["I\'m A", "I\'m B", "I\'m C",\n>  "I\'m B2", "I\'m D"]\n\n~ 同一超步内的写入顺序由框架决定；\n~ 需要固定顺序就自定义 reducer\n~ （例如排序）' }, caption: '超步 4：扇入 d。并行 = 同一超步多个节点；状态更新在超步结束时统一合并', dur: 3600 },
  ],
};
