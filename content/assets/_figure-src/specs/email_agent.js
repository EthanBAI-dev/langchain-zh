module.exports = {
  title: '邮件助手：先登录，再读信，发信要审批', width: 1180, height: 470, dur: 2400,
  nodes: [
    { id: 'u', kind: 'human', x: 10, y: 40, w: 220, h: 100, label: '🧑 Julie', sub: '账号 + 密码' },
    { id: 'mw', kind: 'note', x: 290, y: 20, w: 270, h: 140, label: '⚙️ 动态中间件', sub: '看 state["authenticated"]\n挑工具 · 挑提示词' },
    { id: 'm', kind: 'llm', x: 290, y: 210, w: 270, h: 100, label: '🧠 模型', sub: '手里的工具随登录状态变' },
    { id: 'h', kind: 'human', x: 10, y: 350, w: 220, h: 100, label: '✋ 审批', sub: 'send_email 前暂停' },
    { id: 't', kind: 'tool', x: 290, y: 350, w: 270, h: 100, label: '🔧 工具', sub: 'authenticate · check_inbox\nsend_email' },
  ],
  edges: [
    { from: 'u', to: 'mw', id: 'um' }, { from: 'mw', to: 'm', id: 'mm' }, { from: 'm', to: 't', id: 'mt' },
    { from: 'm', to: 'h', id: 'mh', label: '要发信', fs: [0, 0.8], ts: [0.5, 0] }, { from: 'h', to: 't', id: 'ht' },
  ],
  panels: [{ id: 'p', x: 610, y: 0, w: 570, h: 470, title: '每次调模型时', mono: true }],
  frames: [
    { hl: ['u', 'um', 'mw', 'mm', 'm'], panels: { p: '# 第 1 次 · authenticated: 没有\n工具：authenticate\n提示词：…can authenticate users.\n\nHuman: julie@example.com, password123\nAI: authenticate(email, password)\n+ Tool: Successfully authenticated' }, caption: '① 没登录：模型手里只有 authenticate，收件箱根本碰不到' },
    { hl: ['mw', 'mm', 'm', 'mt', 't'], panels: { p: '# 第 2 次 · authenticated: True\n工具：check_inbox, send_email\n提示词：…check the inbox and send\n emails. First step: check inbox.\n\nAI: check_inbox()\nTool: Hi Julie, … grab a coffee?\n - best, Jane' }, caption: '② 登录成功写进状态：工具和提示词立刻换成已登录版', dur: 3200 },
    { hl: ['m', 'mh', 'h'], panels: { p: 'Human: any draft is fine.\n don\'t check back.\nAI: send_email(to="jane@…",\n  body="That sounds great!…")\n\n> ⏸ __interrupt__\n> allowed: approve / edit /\n>          reject / respond' }, caption: '③ 要发信了：人在回路中间件让 Agent 停下，等你决定', dur: 3200 },
    { hl: ['h', 'ht', 't'], panels: { p: 'Command(resume={"decisions":\n  [{"type": "approve"}]})\n\n+ Tool: Email sent to\n+  jane@example.com …\n\n~ 拒绝：模型收到理由，改完再来\n~ 修改：用你改过的参数执行' }, caption: '④ 批准后才真正发出。密码错的话 authenticated=False，工具永远只有 authenticate', dur: 3800 },
  ],
};
