module.exports = {
  title: '提示缓存：每轮都一样的开头，只在第一次付全价', width: 1100, height: 400, dur: 2600,
  nodes: [
    { id: 'a1', kind: 'note', x: 20, y: 40, w: 330, h: 70, label: '📄 系统提示词 + 工具说明', sub: '约 5,200 token · 每轮几乎不变' },
    { id: 'b1', kind: 'plain', x: 370, y: 40, w: 170, h: 70, label: '"早上好！"', sub: '+3 token' },
    { id: 'c1', kind: 'llm', x: 820, y: 40, w: 260, h: 70, label: '第 1 轮：全部按全价', sub: '缓存里还什么都没有' },
    { id: 'a2', kind: 'store', x: 20, y: 200, w: 330, h: 70, label: '🗄 系统提示词 + 工具说明', sub: '已缓存 · 按约一成价格读取' },
    { id: 'b2', kind: 'store', x: 370, y: 200, w: 170, h: 70, label: '"早上好！"', sub: '已缓存' },
    { id: 'n2', kind: 'plain', x: 560, y: 200, w: 200, h: 70, label: '"今天天气？"', sub: '新内容 · 全价' },
    { id: 'c2', kind: 'llm', x: 820, y: 200, w: 260, h: 70, label: '第 2 轮：大部分走缓存', sub: '只为新增的部分付全价' },
  ],
  edges: [{ from: 'b1', to: 'c1' }, { from: 'n2', to: 'c2' }, { from: 'c1', to: 'a2', dashed: true, label: '内容一字不差 → 命中' }],
  panels: [{ id: 'p', x: 20, y: 300, w: 1060, h: 90, title: '实测（官方评测集）：开启缓存后 token 成本', mono: true, text: 'claude-haiku-4-5  -77%    gpt-5.4-mini  -80%    gemini-3.5-flash  -49%\n对话越长省得越多：缓存的前缀在每一轮都会被复用' }],
  frames: [
    { hl: ['a1', 'b1', 'c1', 'b1->c1'], caption: '① 第一轮：系统提示词、工具说明和第一句话都是新内容，按全价计算' },
    { hl: ['c1->a2', 'a2', 'b2'], caption: '② 套件在系统消息末尾、最后一个工具说明上打了缓存标记；下一轮开头一字不差，就命中缓存' },
    { hl: ['a2', 'b2', 'n2', 'n2->c2', 'c2'], caption: '③ 第二轮：只有新问题按全价，前面几千 token 都按缓存价格读取' },
    { hl: ['p'], caption: '④ 缓存按内容认，不按会话认：同一个脚本连跑两次，第二次也能命中（5 分钟有效期内）', dur: 3500 },
  ],
};
