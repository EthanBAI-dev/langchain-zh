module.exports = {
  title: '带"滚动摘要"的聊天机器人：省 token 又不失忆', width: 1100, height: 380,
  caption: '消息超过 6 条 → 让模型把旧对话压缩成 summary，并用 RemoveMessage 只保留最近 2 条',
  nodes: [
    { id: 's', kind: 'start', x: 20, y: 60, w: 110, h: 44, label: 'START' },
    { id: 'c', kind: 'llm', x: 190, y: 40, w: 220, h: 84, label: 'conversation', mono: true, sub: 'summary 放进 SystemMessage\n+ 最近消息 → 模型回答' },
    { id: 'sum', kind: 'node', x: 190, y: 230, w: 220, h: 90, label: 'summarize_conversation', mono: true, sub: '生成/扩写 summary\n删除旧消息（只留 2 条）' },
    { id: 'e', kind: 'end', x: 500, y: 60, w: 110, h: 44, label: 'END' },
  ],
  edges: [
    { from: 's', to: 'c' }, { from: 'c', to: 'e', dashed: true, label: '≤ 6 条' }, { from: 'c', to: 'sum', dashed: true, label: '> 6 条' },
    { from: 'sum', to: 'e', fs: 'r', ts: 'b' },
  ],
  panels: [{ id: 'st', x: 660, y: 0, w: 420, h: 370, mono: true, title: 'State = MessagesState + summary', text: '# 摘要前（7 条）\n🧑 hi! I\'m Lance\n🤖 Hello Lance!\n🧑 what\'s my name?\n🤖 Your name is Lance.\n🧑 i like the 49ers!\n🤖 That\'s great!…\n🧑 Nick Bosa is the highest paid…?\n# 摘要后\n+ summary: "Lance 介绍了自己，喜欢\n+  49ers，问到 Nick Bosa 的薪资…"\n~ messages: 只剩最近 2 条' }],
};
