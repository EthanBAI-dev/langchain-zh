module.exports = {
  title: '中间件 Middleware：在 Agent 循环的关键位置"插钩子"', width: 1100, height: 420,
  caption: '@dynamic_prompt 本质是 wrap_model_call；HumanInTheLoopMiddleware 在 after_model 暂停，等人审批工具调用',
  nodes: [
    { id: 's', kind: 'start', x: 20, y: 40, w: 110, h: 44, label: 'START' },
    { id: 'ba', kind: 'note', x: 170, y: 30, w: 170, h: 64, label: 'before_agent', mono: true, sub: '整次运行开始前' },
    { id: 'bm', kind: 'note', x: 380, y: 30, w: 170, h: 64, label: 'before_model', mono: true, sub: '每次调模型前' },
    { id: 'm', kind: 'llm', x: 590, y: 20, w: 220, h: 84, label: '🧠 模型调用', sub: 'wrap_model_call 包裹\n(改提示词/换模型/重试)' },
    { id: 'am', kind: 'note', x: 850, y: 30, w: 170, h: 64, label: 'after_model', mono: true, sub: '模型返回后' },
    { id: 't', kind: 'tool', x: 590, y: 200, w: 220, h: 84, label: '🔧 工具调用', sub: 'wrap_tool_call 包裹\n(重试/限流/错误处理)' },
    { id: 'aa', kind: 'note', x: 850, y: 320, w: 170, h: 64, label: 'after_agent', mono: true, sub: '整次运行结束后' },
    { id: 'e', kind: 'end', x: 590, y: 330, w: 110, h: 44, label: 'END' },
  ],
  edges: [
    { from: 's', to: 'ba' }, { from: 'ba', to: 'bm' }, { from: 'bm', to: 'm' }, { from: 'm', to: 'am' },
    { from: 'am', to: 't', fs: 'b', ts: 'r', via: [[935, 242]], label: '有 tool_calls' },
    { from: 't', to: 'bm', fs: 'l', ts: 'b', via: [[465, 242]], label: '循环' },
    { from: 'am', to: 'aa', fs: [0.85, 1], ts: [0.85, 0], label: '无' },
    { from: 'aa', to: 'e' },
  ],
  texts: [{ x: 20, y: 150, text: '内置中间件举例：', cls: 'big' }, { x: 20, y: 180, text: 'HumanInTheLoopMiddleware 人工审批' }, { x: 20, y: 205, text: 'SummarizationMiddleware 对话摘要' }, { x: 20, y: 230, text: 'ModelRetry / ToolRetry 自动重试' }, { x: 20, y: 255, text: 'ModelCallLimit / ToolCallLimit 限次' }, { x: 20, y: 280, text: 'PIIMiddleware 敏感信息脱敏' }, { x: 20, y: 305, text: 'TodoListMiddleware 任务清单' }],
};
