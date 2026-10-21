module.exports = {
  title: '消息（Message）：Agent 内部各组件之间传递信息的"信封"', width: 1100, height: 450,
  caption: 'result["messages"] 就是这样一份完整的对话记录；最后一条通常就是最终答案',
  nodes: [
    { id: 's', kind: 'note', x: 20, y: 0, w: 560, h: 58, label: 'SystemMessage  系统设定', sub: '"You are a sports poet who only writes Haiku."（来自 system_prompt）' },
    { id: 'h', kind: 'human', x: 120, y: 78, w: 560, h: 58, label: 'HumanMessage  用户输入', sub: '"Please write me a poem"（字符串会被自动包装成它）' },
    { id: 'a1', kind: 'llm', x: 20, y: 156, w: 560, h: 66, label: 'AIMessage  模型回复（含 tool_calls）', sub: 'content=""  tool_calls=[{name:"check_haiku_lines", args:{text:…}, id:"call_1"}]' },
    { id: 't', kind: 'tool', x: 120, y: 242, w: 560, h: 66, label: 'ToolMessage  工具执行结果', sub: 'content="Correct, this haiku has 3 lines."  tool_call_id="call_1"' },
    { id: 'a2', kind: 'llm', x: 20, y: 328, w: 560, h: 58, label: 'AIMessage  最终回答', sub: '三行俳句正文…（没有 tool_calls → 循环结束）' },
  ],
  edges: [
    { from: 's', to: 'h', fs: [0.85, 1], ts: [0.7, 0] }, { from: 'h', to: 'a1', fs: [0.3, 1], ts: [0.45, 0] },
    { from: 'a1', to: 't', fs: [0.85, 1], ts: [0.7, 0], label: 'tool_call_id 对应', lp: [610, 230] }, { from: 't', to: 'a2', fs: [0.3, 1], ts: [0.45, 0] },
  ],
  panels: [{ id: 'f', x: 720, y: 0, w: 360, h: 386, title: '每条消息上还有哪些有用的字段？', text: '# content\n文本内容（也可以是多模态块）\n# tool_calls（AIMessage）\n模型想调用的工具名 + 参数 + id\n# tool_call_id（ToolMessage）\n告诉模型"这是哪个调用的结果"\n# usage_metadata\ninput/output token 用量\n# response_metadata\n模型名、结束原因等供应商信息\n# id / name\n唯一 ID（可用来覆盖或删除消息）' }],
};
