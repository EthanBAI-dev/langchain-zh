module.exports = {
  title: 'Reducer：多个节点写同一个 key 时，值怎么合并？', width: 1100, height: 400, dur: 2800,
  nodes: [
    { id: 'n1', kind: 'node', x: 20, y: 150, w: 130, h: 60, label: 'node_1', mono: true },
    { id: 'n2', kind: 'node', x: 230, y: 50, w: 130, h: 60, label: 'node_2', mono: true },
    { id: 'n3', kind: 'node', x: 230, y: 250, w: 130, h: 60, label: 'node_3', mono: true },
    { id: 'k', kind: 'store', x: 440, y: 140, w: 150, h: 80, label: 'foo', mono: true, sub: '状态里的一个 key' },
  ],
  edges: [
    { from: 'n1', to: 'n2' }, { from: 'n1', to: 'n3' },
    { from: 'n2', to: 'k', id: 'w2', dashed: true, label: '写' }, { from: 'n3', to: 'k', id: 'w3', dashed: true, label: '写' },
  ],
  panels: [{ id: 'p', x: 630, y: 0, w: 450, h: 390, mono: true, title: '代码与结果（本地实测）' }],
  frames: [
    { hl: ['n1'], panels: { p: '# 写法 A：没有 reducer\nclass State(TypedDict):\n    foo: int\n\ninvoke({"foo": 1})\nnode_1 → foo = 2  （单线：直接覆盖，没问题）' }, caption: '默认规则：节点返回的值"覆盖"旧值' },
    { hl: ['w2', 'w3', 'k'], panels: { p: '# 写法 A：node_1 之后分叉\nnode_2 → foo = 3\nnode_3 → foo = 3   （同一步，同时写！）\n\n- InvalidUpdateError: At key \'foo\':\n- Can receive only one value per step.\n- Use an Annotated key to handle\n- multiple values.' }, caption: '并行的 node_2、node_3 在同一步写 foo → LangGraph 不知道听谁的，直接报错' },
    { hl: ['w2', 'w3', 'k'], panels: { p: '# 写法 B：用 Annotated 指定 reducer\nfrom operator import add\nclass State(TypedDict):\n    foo: Annotated[list[int], add]\n\ninvoke({"foo": [1]})\n+ → {"foo": [1, 2, 3, 3]}\n\n~ node_1 追加 2；node_2、node_3 各追加 3' }, caption: 'reducer 告诉图"怎么合并"：operator.add 对列表就是拼接，并行写入也不冲突' },
    { hl: ['k'], panels: { p: '# 写法 C：自定义 reducer\ndef reduce_list(left, right):\n    left = left or []\n    right = right or []\n    return left + right\n\nfoo: Annotated[list[int], reduce_list]\n+ 传 None 也不会 TypeError' }, caption: 'reducer 就是一个 (旧值, 新值) → 合并结果 的函数，可以按需自己写', dur: 3600 },
  ],
};
