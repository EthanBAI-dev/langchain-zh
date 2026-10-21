module.exports = {
  title: '断点：在 tools 节点前停下来，等人确认', width: 1100, height: 380, dur: 2600,
  nodes: [
    { id: 's', kind: 'start', x: 20, y: 40, w: 110, h: 44, label: 'START' },
    { id: 'a', kind: 'llm', x: 180, y: 25, w: 190, h: 74, label: 'assistant', mono: true },
    { id: 'bp', kind: 'human', x: 180, y: 160, w: 190, h: 56, label: '⛔ interrupt_before', sub: '["tools"]' },
    { id: 't', kind: 'tool', x: 180, y: 270, w: 190, h: 74, label: 'tools', mono: true },
    { id: 'e', kind: 'end', x: 440, y: 40, w: 110, h: 44, label: 'END' },
  ],
  edges: [
    { from: 's', to: 'a' }, { from: 'a', to: 'bp', fs: [0.3, 1], ts: [0.3, 0] }, { from: 'bp', to: 't', fs: [0.3, 1], ts: [0.3, 0] },
    { from: 't', to: 'a', fs: [0.8, 0], ts: [0.8, 1], via: [[332, 135]] }, { from: 'a', to: 'e', dashed: true },
  ],
  panels: [{ id: 'c', x: 590, y: 0, w: 490, h: 370, mono: true, title: '代码' }],
  frames: [
    { hl: ['a'], panels: { c: 'graph = builder.compile(\n    interrupt_before=["tools"],\n    checkpointer=MemorySaver())\n\ngraph.stream({"messages": "Multiply 2 and 3"},\n             thread, stream_mode="values")\n+ 🤖 tool_calls=[multiply(a=2, b=3)]' }, caption: '① 模型提出工具调用' },
    { hl: ['bp'], panels: { c: 'state = graph.get_state(thread)\nstate.next\n+ (\'tools\',)   ← 下一步要执行 tools，但停住了' }, caption: '② 在 tools 之前暂停；状态已存进 checkpointer，可以随时查看' },
    { hl: ['bp', 't'], panels: { c: 'user_approval = input("要调用工具吗？(yes/no)")\nif user_approval == "yes":\n    # 传 None = 从上次的检查点继续\n    graph.stream(None, thread, ...)\n+ 🔧 ToolMessage: 6' }, caption: '③ 人确认后，用 stream(None, thread) 从断点继续执行' },
    { hl: ['t->a', 'a', 'e'], panels: { c: '+ 🤖 "2 乘以 3 等于 6。"\n\n~ 新写法：在节点里直接调用 interrupt(...)，\n~ 再用 Command(resume=...) 恢复（见下文）' }, caption: '④ 工具结果回到模型，得出答案', dur: 3400 },
  ],
};
