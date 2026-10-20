module.exports = {
  title: '人工审批（Human-in-the-Loop）：危险操作先问人', width: 1100, height: 400, dur: 2600,
  nodes: [
    { id: 'm', kind: 'llm', x: 20, y: 40, w: 200, h: 80, label: '🧠 模型', sub: '想执行 SQL' },
    { id: 'h', kind: 'human', x: 300, y: 40, w: 220, h: 80, label: '⏸ HITL 中间件', sub: 'after_model：暂停！' },
    { id: 'p', kind: 'human', x: 300, y: 250, w: 220, h: 80, label: '🧑 人类审核', sub: 'approve / reject' },
    { id: 't', kind: 'tool', x: 600, y: 40, w: 200, h: 80, label: '🔧 execute_sql', sub: '真正查库' },
    { id: 'r', kind: 'llm', x: 600, y: 250, w: 200, h: 80, label: '🧠 模型', sub: '收到拒绝说明' },
  ],
  edges: [
    { from: 'm', to: 'h', label: 'tool_call' },
    { from: 'h', to: 'p', label: '__interrupt__', lt: 0.45 },
    { from: 'p', to: 't', id: 'ok', label: 'approve' },
    { from: 'p', to: 'r', id: 'no', label: 'reject' },
  ],
  panels: [{ id: 'c', x: 840, y: 0, w: 240, h: 330, title: '代码视角', mono: true }],
  frames: [
    { hl: ['m', 'm->h'], panels: { c: 'agent.invoke(\n {"messages": [问题]},\n config={thread_id:"1"})' }, caption: '① 模型决定调用 execute_sql（还没执行）' },
    { hl: ['h', 'h->p'], panels: { c: 'result["__interrupt__"]\n→ action_requests:\n  name: execute_sql\n  args: {query: …}\n  description: …' }, caption: '② 中间件拦截：返回结果里出现 __interrupt__，图状态已被 checkpointer 保存' },
    { hl: ['p', 'ok', 't'], panels: { c: 'agent.invoke(\n Command(resume={\n  "decisions": [\n   {"type": "approve"}]}),\n config=同一个thread)' }, caption: '③a 批准：用 Command(resume=...) 恢复，同一个 thread_id，工具正常执行' },
    { hl: ['p', 'no', 'r'], panels: { c: 'Command(resume={\n "decisions": [{\n  "type": "reject",\n  "message":\n  "the database is offline."\n }]})' }, caption: '③b 拒绝：附带说明，模型据此回复"数据库离线，请稍后再试"', dur: 3500 },
  ],
};
