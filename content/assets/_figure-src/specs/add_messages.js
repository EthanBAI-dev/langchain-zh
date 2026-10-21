module.exports = {
  title: 'add_messages：消息列表专用 reducer 的三种用法', width: 1100, height: 360, noStep: true,
  caption: 'MessagesState 自带 messages: Annotated[list[AnyMessage], add_messages]，所以节点只需返回"新消息"即可',
  panels: [
    { id: 'a', x: 0, y: 0, w: 355, h: 350, mono: true, title: '① 追加（新 id）', text: '旧：\n [AI#1 "Hello!"]\n [Human#2 "marine biology"]\n新：\n [AI#3 "Sure, what…"]\n\n结果：\n AI#1, Human#2,\n+ AI#3 "Sure, what…"' },
    { id: 'b', x: 372, y: 0, w: 355, h: 350, mono: true, title: '② 覆盖（相同 id）', text: '旧：\n [AI#1 "Hello!"]\n [Human#2 "marine biology"]\n新：\n [Human#2 "whales, specifically"]\n\n结果：\n AI#1,\n- Human#2 "marine biology"\n+ Human#2 "whales, specifically"' },
    { id: 'c', x: 744, y: 0, w: 355, h: 350, mono: true, title: '③ 删除（RemoveMessage）', text: '旧：\n [#1, #2, #3, #4]\n新：\n [RemoveMessage(id="1"),\n  RemoveMessage(id="2")]\n\n结果（实测）：\n- #1  - #2\n+ 剩下 ["3", "4"]' },
  ],
};
