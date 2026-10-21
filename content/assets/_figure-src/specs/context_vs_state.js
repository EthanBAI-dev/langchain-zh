module.exports = {
  title: '运行时上下文 vs 自定义状态：谁给的？能不能改？', width: 1100, height: 440,
  caption: '上下文：调用时从外面递进来，只读，不会自动进提示词。状态：对话中由工具写入，可改，随检查点保存',
  groups: [
    { id: 'gc', x: 0, y: 0, w: 520, h: 440, label: '运行时上下文 context', fill: 'rgba(239,246,255,.7)' },
    { id: 'gs', x: 580, y: 0, w: 520, h: 440, label: '自定义状态 state', fill: 'rgba(240,253,244,.7)' },
  ],
  nodes: [
    { id: 'you', kind: 'human', x: 30, y: 50, w: 200, h: 100, label: '🧑 你的代码', sub: 'invoke(…, context=\n ColourContext(…))' },
    { id: 'ctx', kind: 'note', x: 290, y: 50, w: 200, h: 100, label: '📋 @dataclass', sub: 'favourite_colour\n= "green"' },
    { id: 'tc', kind: 'tool', x: 160, y: 260, w: 220, h: 110, label: '🔧 工具', sub: 'runtime.context\n.favourite_colour\n（只读）' },
    { id: 'user', kind: 'human', x: 610, y: 50, w: 200, h: 100, label: '🧑 用户', sub: '"我最喜欢绿色"' },
    { id: 'w', kind: 'tool', x: 870, y: 50, w: 200, h: 100, label: '🔧 update_…', sub: 'Command(update={\n "favourite_colour": …})' },
    { id: 'st', kind: 'store', x: 870, y: 260, w: 200, h: 110, label: '🗂 状态', sub: 'AgentState 子类\n检查点保存' },
    { id: 'r', kind: 'tool', x: 610, y: 260, w: 200, h: 110, label: '🔧 read_…', sub: 'runtime.state\n["favourite_colour"]' },
  ],
  edges: [
    { from: 'you', to: 'ctx' }, { from: 'ctx', to: 'tc' },
    { from: 'user', to: 'w' }, { from: 'w', to: 'st' }, { from: 'st', to: 'r' },
  ],
};
