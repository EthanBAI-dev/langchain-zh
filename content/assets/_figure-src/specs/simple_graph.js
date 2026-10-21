module.exports = {
  title: '最简单的图：3 个节点 + 1 条条件边', width: 1100, height: 380, dur: 2200,
  nodes: [
    { id: 's', kind: 'start', x: 20, y: 150, w: 110, h: 46, label: 'START' },
    { id: 'n1', kind: 'node', x: 190, y: 133, w: 150, h: 80, label: 'node_1', mono: true, sub: '+ " I am"' },
    { id: 'n2', kind: 'node', x: 450, y: 30, w: 150, h: 80, label: 'node_2', mono: true, sub: '+ " happy!"' },
    { id: 'n3', kind: 'node', x: 450, y: 240, w: 150, h: 80, label: 'node_3', mono: true, sub: '+ " sad!"' },
    { id: 'e', kind: 'end', x: 680, y: 150, w: 110, h: 46, label: 'END' },
  ],
  edges: [
    { from: 's', to: 'n1' }, { from: 'n1', to: 'n2', dashed: true, label: '50%' }, { from: 'n1', to: 'n3', dashed: true, label: '50%' },
    { from: 'n2', to: 'e' }, { from: 'n3', to: 'e' },
  ],
  panels: [{ id: 'st', x: 830, y: 60, w: 250, h: 230, title: 'State（graph_state）', mono: true }],
  frames: [
    { hl: ['s', 's->n1'], panels: { st: '+ "Hi, this is Lance."' }, caption: 'invoke({"graph_state": "Hi, this is Lance."})：初始状态从 START 进入' },
    { hl: ['n1'], panels: { st: '"Hi, this is Lance.\n+  I am"' }, caption: 'node_1 读取状态，返回新值（默认"覆盖"旧值）' },
    { hl: ['n1->n2', 'n2', 'n1->n3'], panels: { st: '"Hi, this is Lance. I am"\n~ decide_mood() 掷硬币…' }, caption: '条件边 decide_mood 返回下一个节点名：这次是 "node_2"' },
    { hl: ['n2'], panels: { st: '"Hi, this is Lance. I am\n+  happy!"' }, caption: 'node_2 追加 " happy!"' },
    { hl: ['n2->e', 'e'], panels: { st: '> 最终返回：\n{"graph_state":\n "Hi, this is Lance.\n  I am happy!"}' }, caption: '到达 END，invoke 返回最终状态（本地实测输出）', dur: 3200 },
  ],
};
