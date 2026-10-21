module.exports = {
  title: '离线评估：数据集 × 应用 × 评估器 = 一次实验', width: 1180, height: 440, dur: 2400,
  nodes: [
    { id: 'ds', kind: 'store', x: 10, y: 60, w: 220, h: 120, label: '🗂 数据集', sub: 'inputs + 参考答案\n版本 · 切分' },
    { id: 'tg', kind: 'llm', x: 290, y: 60, w: 220, h: 120, label: '🤖 target 函数', sub: '当前版本的应用\n每条样本跑一遍' },
    { id: 'ev', kind: 'tool', x: 570, y: 60, w: 220, h: 120, label: '⚖️ 评估器', sub: '代码规则\n或 LLM 当裁判' },
    { id: 'ex', kind: 'node', x: 290, y: 260, w: 500, h: 110, label: '🧪 实验', sub: 'experiment_prefix="stock-fixed"\n每条样本一行：输入 · 输出 · 分数' },
  ],
  edges: [
    { from: 'ds', to: 'tg', id: 'dt', label: 'inputs' }, { from: 'tg', to: 'ev', id: 'te', label: 'outputs' },
    { from: 'ds', to: 'ev', id: 'de', label: 'reference_outputs', fs: [0.5, 0], ts: [0.5, 0], lt: 0.5 },
    { from: 'ev', to: 'ex', id: 'ee', fs: [0.5, 1], ts: [0.85, 0] },
  ],
  panels: [{ id: 'p', x: 830, y: 0, w: 350, h: 440, title: '实验对比', mono: true }],
  frames: [
    { hl: ['ds'], panels: { p: '# 数据集 langslice-dataset\n1 Paul：意式香肠+菠萝\n2 Mia：菠菜+里科塔\n3 Leo：玛格丽特' }, caption: '① 把能复现问题的对话存成样本（可以直接从 trace 一键加入）' },
    { hl: ['ds', 'dt', 'tg', 'te', 'ev', 'de'], panels: { p: '# 实验 1（修复前）\n  样本    库存分\n> 1 Paul     0  pineapple\n> 2 Mia      0  spinach…\n  3 Leo      1' }, caption: '② 修复前跑一次：每条样本新开 thread_id，跑完交给库存评估器打分', dur: 3200 },
    { hl: ['ev', 'ee', 'ex'], panels: { p: '# 实验 2（stock-fixed）\n  样本    库存分\n+ 1 Paul     1\n+ 2 Mia      1\n  3 Leo      1' }, caption: '③ 取消三段 FIX 注释，再跑一次', dur: 3000 },
    { hl: ['ex'], panels: { p: '# 并排对比\n  样本   修复前 → 修复后\n+ 1 Paul    0 → 1\n+ 2 Mia     0 → 1\n  3 Leo     1 → 1\n\n> 平均 0.33 → 1.00' }, caption: '④ 两个实验并排放：哪几条变好、有没有哪条变坏，一眼看清（示意数据）', dur: 3800 },
  ],
};
