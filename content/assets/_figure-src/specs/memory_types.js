module.exports = {
  title: '短期记忆 vs 长期记忆', width: 1100, height: 400,
  caption: '调用时同时传 thread_id（找到这段对话）和 user_id（找到这个人的长期记忆）',
  groups: [
    { id: 'a', x: 0, y: 0, w: 530, h: 390, label: '短期记忆（线程内）', fill: 'rgba(243,229,245,.6)' },
    { id: 'b', x: 560, y: 0, w: 530, h: 390, label: '长期记忆（跨线程）', fill: 'rgba(224,242,241,.6)' },
  ],
  nodes: [
    { id: 'cp', kind: 'store', x: 30, y: 40, w: 470, h: 70, label: 'Checkpointer', sub: 'MemorySaver / SqliteSaver / PostgresSaver' },
    { id: 't1', kind: 'plain', x: 30, y: 150, w: 220, h: 100, label: 'thread "1"', sub: '这段对话的\n每一步状态快照' },
    { id: 't2', kind: 'plain', x: 280, y: 150, w: 220, h: 100, label: 'thread "2"', sub: '另一段对话\n（互相隔离）' },
    { id: 's', kind: 'store', x: 590, y: 40, w: 470, h: 70, label: 'Store', sub: 'InMemoryStore / PostgresStore（可带向量检索）' },
    { id: 'n1', kind: 'plain', x: 590, y: 150, w: 470, h: 100, label: 'namespace ("memory", "user_1")', sub: 'key "user_memory" → {"memory": "喜欢在旧金山骑车，爱吃可颂"}\n任何 thread 都能读到' },
  ],
  edges: [{ from: 'cp', to: 't1' }, { from: 'cp', to: 't2' }, { from: 's', to: 'n1' }],
  texts: [
    { x: 30, y: 290, text: '保存什么：对话历史、图的中间状态' }, { x: 30, y: 318, text: '怎么用：compile(checkpointer=...)' }, { x: 30, y: 346, text: '典型场景：多轮对话、中断恢复、时间旅行' },
    { x: 590, y: 290, text: '保存什么：用户画像、偏好、待办等事实' }, { x: 590, y: 318, text: '怎么用：compile(store=...)，节点参数里拿 store' }, { x: 590, y: 346, text: '典型场景：个性化助手、跨会话记住用户' },
  ],
};
