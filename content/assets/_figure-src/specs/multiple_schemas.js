module.exports = {
  title: '多 Schema：输入/输出"过滤器" + 节点私有状态', width: 1100, height: 330,
  caption: 'input_schema / output_schema 只决定"进出图的字段"；内部节点照样可以读写 OverallState 里的所有字段',
  nodes: [
    { id: 'in', kind: 'human', x: 0, y: 110, w: 170, h: 80, label: 'InputState', mono: true, sub: '{question}' },
    { id: 't', kind: 'node', x: 260, y: 110, w: 190, h: 80, label: 'thinking_node', mono: true, sub: '写 answer, notes' },
    { id: 'a', kind: 'node', x: 520, y: 110, w: 190, h: 80, label: 'answer_node', mono: true, sub: '写 answer' },
    { id: 'out', kind: 'human', x: 800, y: 110, w: 280, h: 80, label: 'OutputState', mono: true, sub: '{"answer": "bye Lance"}' },
  ],
  groups: [{ id: 'g', x: 230, y: 30, w: 510, h: 250, label: 'OverallState {question, answer, notes} —— 图内部共享' }],
  edges: [{ from: 'in', to: 't' }, { from: 't', to: 'a' }, { from: 'a', to: 'out', label: '过滤' }],
  texts: [{ x: 250, y: 255, text: '不加过滤时实测输出：{question, answer, notes} 全部返回' }],
};
