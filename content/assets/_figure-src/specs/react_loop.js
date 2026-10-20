const base = '> 🧑 HumanMessage: 3 加 4，再乘以 2 是多少？';
module.exports = {
  title: 'ReAct 循环：模型思考 → 调用工具 → 观察结果 → 再思考',
  width: 1100, height: 430, dur: 2200,
  nodes: [
    { id: 'start', kind: 'start', x: 30, y: 63, w: 120, h: 46, label: 'START' },
    { id: 'model', kind: 'llm', x: 210, y: 40, w: 230, h: 92, label: '🧠 模型节点', sub: '决定：回答 or 调工具' },
    { id: 'tools', kind: 'tool', x: 210, y: 290, w: 230, h: 92, label: '🔧 工具节点', sub: '执行 tool_calls' },
    { id: 'end', kind: 'end', x: 490, y: 200, w: 110, h: 46, label: 'END' },
  ],
  edges: [
    { from: 'start', to: 'model' },
    { from: 'model', to: 'tools', fs: [0.25, 1], ts: [0.25, 0], label: '有 tool_calls', lt: 0.35 },
    { from: 'tools', to: 'model', fs: [0.75, 0], ts: [0.75, 1], label: 'ToolMessage', lt: 0.35 },
    { from: 'model', to: 'end', fs: 'r', ts: 't', via: [[545, 86]], label: '无 tool_calls', lt: 0.55 },
  ],
  panels: [{ id: 'msgs', x: 630, y: 0, w: 450, h: 420, title: 'state["messages"]（消息不断追加）', mono: true }],
  frames: [
    { hl: ['start', 'start->model'], tokens: [{ edge: 'start->model', t: 0.6 }], panels: { msgs: '+ ' + base.slice(2) }, caption: '① 用户的问题作为 HumanMessage 进入图，写入状态 messages' },
    { hl: ['model'], panels: { msgs: base + '\n+ 🤖 AIMessage: tool_calls=[add(a=3, b=4)]' }, caption: '② 模型读取对话 + 工具说明，决定先调用 add 工具（Reason → Act）' },
    { hl: ['model->tools', 'tools'], tokens: [{ edge: 'model->tools', t: 0.72 }], panels: { msgs: base + '\n🤖 AIMessage: tool_calls=[add(3, 4)]\n+ 🔧 ToolMessage: 7' }, caption: '③ 条件边发现有 tool_calls → 路由到工具节点执行，得到 7' },
    { hl: ['tools->model', 'model'], tokens: [{ edge: 'tools->model', t: 0.72 }], panels: { msgs: base + '\n🤖 AIMessage: tool_calls=[add(3, 4)]\n🔧 ToolMessage: 7\n+ 🤖 AIMessage: tool_calls=[multiply(a=7, b=2)]' }, caption: '④ 工具结果回到模型（Observe），模型继续推理，决定再调 multiply' },
    { hl: ['model->tools', 'tools'], tokens: [{ edge: 'model->tools', t: 0.72 }], panels: { msgs: base + '\n🤖 AIMessage: tool_calls=[add(3, 4)]\n🔧 ToolMessage: 7\n🤖 AIMessage: tool_calls=[multiply(7, 2)]\n+ 🔧 ToolMessage: 14' }, caption: '⑤ 再次执行工具，得到 14' },
    { hl: ['tools->model', 'model'], tokens: [{ edge: 'tools->model', t: 0.72 }], panels: { msgs: base + '\n🤖 AIMessage: tool_calls=[add(3, 4)]\n🔧 ToolMessage: 7\n🤖 AIMessage: tool_calls=[multiply(7, 2)]\n🔧 ToolMessage: 14\n+ 🤖 AIMessage: "答案是 14。"' }, caption: '⑥ 模型认为信息已足够，直接给出自然语言回答（没有 tool_calls）' },
    { hl: ['model->end', 'end'], tokens: [{ edge: 'model->end', t: 0.6 }], panels: { msgs: base + '\n🤖 AIMessage: tool_calls=[add(3, 4)]\n🔧 ToolMessage: 7\n🤖 AIMessage: tool_calls=[multiply(7, 2)]\n🔧 ToolMessage: 14\n> 🤖 AIMessage: "答案是 14。"  ← 最终结果' }, caption: '⑦ 没有工具调用 → 走向 END，返回完整的消息历史', dur: 3200 },
  ],
};
