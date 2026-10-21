module.exports = {
  title: 'Bug 1：证据在 trace 里，却从没进过模型的上下文', width: 1180, height: 460, dur: 2600,
  nodes: [
    { id: 'u', kind: 'human', x: 10, y: 30, w: 220, h: 90, label: '🧑 Paul', sub: '大号意式香肠\n+ 菠萝，自取' },
    { id: 'm', kind: 'llm', x: 290, y: 30, w: 220, h: 90, label: '🤖 Sal（模型）', sub: 'gpt-5-nano' },
    { id: 'add', kind: 'tool', x: 290, y: 190, w: 220, h: 90, label: '🔧 add_pizza_to_order', sub: 'toppings: [pepperoni,\n pineapple]' },
    { id: 'gi', kind: 'store', x: 290, y: 340, w: 220, h: 100, label: '🗄 get_ingredient ×3', sub: '@traceable 子 run\npineapple → stock_units: 0' },
  ],
  edges: [
    { from: 'u', to: 'm', id: 'um' }, { from: 'm', to: 'add', id: 'ma', fs: [0.3, 1], ts: [0.3, 0] },
    { from: 'add', to: 'm', id: 'am', fs: [0.7, 0], ts: [0.7, 1], label: 'status: added', lt: 0.5 },
    { from: 'add', to: 'gi', id: 'ag', both: true },
  ],
  panels: [
    { id: 'ctx', x: 560, y: 0, w: 290, h: 460, title: '模型看到的', mono: true },
    { id: 'tr', x: 880, y: 0, w: 300, h: 460, title: 'LangSmith trace 里的', mono: true },
  ],
  frames: [
    { hl: ['u', 'um', 'm'], panels: { ctx: 'Human: large hand tossed,\n pepperoni + pineapple,\n pickup', tr: '▼ pizza_agent\n  ▼ model' }, caption: '① Paul 点了一张带菠萝的披萨' },
    { hl: ['m', 'ma', 'add', 'ag', 'gi'], panels: { ctx: 'AI: add_pizza_to_order(\n  toppings=[pepperoni,\n           pineapple])', tr: '▼ add_pizza_to_order\n  ▼ get_ingredient(pepperoni)\n  ▼ get_ingredient(pineapple)\n> stock_units: 0 ← 缺货！\n  ▼ get_ingredient(mozzarella)' }, caption: '② 工具逐个查配料。查菠萝的子 run 里明明写着 stock_units: 0', dur: 3400 },
    { hl: ['add', 'am', 'm'], panels: { ctx: 'Tool: {"status": "added",\n  "pizza": {toppings: [\n   mozzarella, pepperoni,\n   pineapple]}}\n\n~ 里面没有任何库存数字', tr: '▼ add_pizza_to_order\n+ status: "added"\n  …子 run 里的 stock_units: 0\n  只进了 trace' }, caption: '③ 工具只把配料名传下去，还是返回 added。模型根本看不到库存', dur: 3400 },
    { hl: ['m', 'u'], panels: { ctx: 'AI: 好的 Paul！大号手抛饼底\n 意式香肠 + 菠萝已加上 🍍', tr: '> 看 trace 就能发现：\n> 工具查到了缺货\n> 却没有拦下来\n\n~ 修复：elif stock_units <= 0\n~ → out_of_stock 拒绝' }, caption: '④ Sal 高高兴兴地确认了。只看回复永远发现不了，要去 trace 里看子 run', dur: 3600 },
  ],
};
