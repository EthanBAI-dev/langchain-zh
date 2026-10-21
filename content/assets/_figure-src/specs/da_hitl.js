module.exports = {
  title: '人在回路：敏感工具执行前暂停，人来做四选一', width: 1100, height: 420, dur: 2600,
  nodes: [
    { id: 'm', kind: 'llm', x: 20, y: 30, w: 210, h: 80, label: '🧠 模型', sub: '想调用 send_email' },
    { id: 'p', kind: 'human', x: 300, y: 30, w: 230, h: 80, label: '⏸ 暂停', sub: 'interrupt_on 拦截\ncheckpointer 存档' },
    { id: 'h', kind: 'human', x: 300, y: 190, w: 230, h: 80, label: '🧑 人来决定', sub: 'Command(resume=\n{"decisions": [...]})' },
    { id: 'ap', kind: 'store', x: 620, y: 0, w: 200, h: 64, label: '✅ approve', sub: '原样执行' },
    { id: 'ed', kind: 'tool', x: 620, y: 92, w: 200, h: 64, label: '🔧 edit', sub: '改参数再执行' },
    { id: 'rj', kind: 'human', x: 620, y: 184, w: 200, h: 64, label: '⛔ reject', sub: '不执行，告诉模型原因' },
    { id: 'rs', kind: 'note', x: 620, y: 276, w: 200, h: 64, label: '🧑 respond', sub: '不执行，人的话当结果' },
    { id: 'r', kind: 'llm', x: 880, y: 140, w: 200, h: 80, label: '🧠 模型继续', sub: '读到工具结果' },
  ],
  edges: [
    { from: 'm', to: 'p', label: 'tool_call' }, { from: 'p', to: 'h', label: 'result.interrupts' },
    { from: 'h', to: 'ap', id: 'a' }, { from: 'h', to: 'ed', id: 'e' }, { from: 'h', to: 'rj', id: 'j' }, { from: 'h', to: 'rs', id: 's' },
    { from: 'ap', to: 'r', id: 'a2' }, { from: 'ed', to: 'r', id: 'e2' }, { from: 'rj', to: 'r', id: 'j2' }, { from: 'rs', to: 'r', id: 's2' },
  ],
  frames: [
    { hl: ['m', 'm->p', 'p'], caption: '① 模型决定调用 send_email；工具还没执行，Agent 就暂停并把状态存进检查点' },
    { hl: ['p', 'p->h', 'h'], caption: '② invoke(..., version="v2") 返回 .interrupts：里面有工具名、参数和允许的决定' },
    { hl: ['h', 'a', 'ap', 'a2', 'r'], caption: '③ 选 approve：按模型给的参数执行，结果 status=success' },
    { hl: ['h', 'e', 'ed', 'e2', 'r'], caption: '④ 选 edit：用改过的参数执行，并提醒模型"别再按原参数调用一次"' },
    { hl: ['h', 'j', 'rj', 'j2', 'r'], caption: '⑤ 选 reject：不执行，把拒绝理由作为 status=error 的工具结果交给模型' },
    { hl: ['h', 's', 'rs', 's2', 'r'], caption: '⑥ 选 respond：不执行，人的回答直接当成工具结果。只给 ask_user 这类工具用，别用来拦发邮件', dur: 3600 },
  ],
};
