module.exports = {
  title: '线上监控：情绪评估器怎么把 Bug 2 揪出来', width: 1180, height: 470, dur: 2400,
  nodes: [
    { id: 'th', kind: 'human', x: 10, y: 40, w: 220, h: 100, label: '🧑 真实顾客的线程', sub: '部署后的每段对话\n（或 traces-2.json）' },
    { id: 'oe', kind: 'llm', x: 280, y: 40, w: 230, h: 100, label: '⚖️ 在线评估器', sub: 'sentiment · 按线程\n空闲 2 分钟后打分' },
    { id: 'rule', kind: 'tool', x: 560, y: 40, w: 220, h: 100, label: '⚙️ 自动化规则', sub: 'sentiment = 0\n→ 加入标注队列' },
    { id: 'aq', kind: 'node', x: 560, y: 220, w: 220, h: 100, label: '👀 标注队列', sub: '人工复核裁判\n找到 2 个假正面' },
    { id: 'v2', kind: 'note', x: 280, y: 220, w: 230, h: 100, label: '📝 裁判 Version 2', sub: '语气好 且 问题解决\n才给 1 分' },
    { id: 'bug', kind: 'store', x: 10, y: 330, w: 500, h: 110, label: '🐞 Bug 2：confirm_order', sub: '外送起送价只按小食算\norder_subtotal = 0.0 → 加了蒜香面包结 = 6.5' },
  ],
  edges: [
    { from: 'th', to: 'oe', id: 'to' }, { from: 'oe', to: 'rule', id: 'or' }, { from: 'rule', to: 'aq', id: 'ra' },
    { from: 'aq', to: 'v2', id: 'av' }, { from: 'v2', to: 'oe', id: 'vo', dashed: true, label: '更新裁判' },
    { from: 'aq', to: 'bug', id: 'ab', fs: [0.5, 1], ts: [1, 0.5], label: '过滤 0 分的外送线程' },
  ],
  panels: [{ id: 'p', x: 820, y: 0, w: 360, h: 470, title: '线程', mono: true }],
  frames: [
    { hl: ['th', 'to', 'oe'], panels: { p: 'Human: 三张大号意式香肠，外送\nAI: 已加上！\nHuman: 下单吧\nAI: 还差 $25 才够起送价…\nHuman: what?? 我都点了 $64 了\nHuman: forget it\n\n> sentiment = 0' }, caption: '① 线程静默 2 分钟后，在线评估器给整段对话打一个情绪分' },
    { hl: ['oe', 'or', 'rule', 'ra', 'aq'], panels: { p: 'Human: 外送，两张披萨\nAI: 还差 $25 才够起送价\nHuman: that\'s not right.\nHuman: no. just the pizzas.\n（没下单就走了）\n\n+ sentiment = 1 ← 裁判 v1\n> 人工复核：应该是 0' }, caption: '② 规则把 0 分线程送进标注队列；人工抽查又发现裁判 v1 漏判了"平静但没买成"', dur: 3400 },
    { hl: ['aq', 'av', 'v2', 'vo', 'oe'], panels: { p: '# 裁判 Version 2\n+ Also score 0 on outcome,\n+ whatever the tone:\n+ - problem remains unresolved\n+ - gives up on the request\n\n> 没有负面词 ≠ 体验好' }, caption: '③ 给裁判加上"结果"一块：评估器本身也要被评估', dur: 3200 },
    { hl: ['aq', 'ab', 'bug'], panels: { p: '# 打开 trace\nadd_pizza_to_order\n  subtotal: 64.75\nconfirm_order\n> order_subtotal: 0.0\n> short_by: 25.0\n（加蒜香面包结后）\n> order_subtotal: 6.5\n> 正好等于小食价格！' }, caption: '④ 过滤 0 分的外送线程、打开 trace：小计只算了小食。这个 Bug 只有真实流量才会带出来', dur: 3800 },
  ],
};
