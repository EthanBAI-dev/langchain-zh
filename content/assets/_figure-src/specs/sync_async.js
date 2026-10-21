module.exports = {
  title: '同步 vs 异步子智能体：要不要等结果？', width: 1100, height: 440, dur: 2600,
  groups: [
    { id: 'a', x: 0, y: 0, w: 520, h: 220, label: '同步：task，在同一进程里跑完才返回', fill: 'rgba(255,243,224,.6)' },
    { id: 'b', x: 560, y: 0, w: 540, h: 220, label: '异步：start_async_task，跑在另一个部署上', fill: 'rgba(232,245,233,.6)' },
  ],
  nodes: [
    { id: 'm1', kind: 'llm', x: 20, y: 60, w: 200, h: 90, label: '🧠 主 Agent', sub: '⏳ 卡住等结果' },
    { id: 's1', kind: 'tool', x: 300, y: 60, w: 200, h: 90, label: '👥 子智能体', sub: 'create_agent，进程内' },
    { id: 'm2', kind: 'llm', x: 580, y: 60, w: 200, h: 90, label: '🧠 主 Agent', sub: '拿到 task_id 继续聊' },
    { id: 's2', kind: 'tool', x: 880, y: 40, w: 200, h: 130, label: '🚀 远程部署', sub: 'langgraph dev --port 2025\ngraph_id="agent"\nanalyze_sales（很慢）' },
  ],
  edges: [
    { from: 'm1', to: 's1', both: true, id: 'ms' },
    { from: 'm2', to: 's2', id: 'st', label: 'start', fs: [1, 0.3], ts: [0, 0.3] },
    { from: 's2', to: 'm2', id: 'ck', label: 'check', fs: [0, 0.75], ts: [1, 0.75], dashed: true },
  ],
  panels: [
    { id: 'l', x: 0, y: 235, w: 520, h: 200, title: '对话', mono: true },
    { id: 'r', x: 560, y: 235, w: 540, h: 200, title: '对话', mono: true },
  ],
  frames: [
    { hl: ['m1', 'ms', 's1'], panels: { l: 'Human: 分析一下各区销售\nAI: task(...)\n⏳ ……20 秒里什么都回不了……', r: '' }, caption: '同步：主 Agent 要等子智能体做完，期间不能回应用户' },
    { hl: ['m2', 'st', 's2'], panels: { l: 'Human: 分析一下各区销售\nAI: task(...) → 结果', r: 'Human: 按地区、按产品各分析一份\nAI: start_async_task × 2\n→ 已在后台开始，task_id: a1、b2' }, caption: '异步：start_async_task 立刻返回 task_id，主 Agent 报告完就停下' },
    { hl: ['m2'], panels: { l: 'Human: 分析一下各区销售\nAI: task(...) → 结果', r: '…task_id: a1、b2\nHuman: 现在几点？\nAI: 下午 3 点\nHuman: 地区那份只看 West\nAI: update_async_task(a1, …)\nHuman: 产品那份不要了\nAI: cancel_async_task(b2)' }, caption: '后台在跑，用户照常聊天，还能改需求（update）或取消（cancel）' },
    { hl: ['m2', 'ck', 's2'], panels: { l: 'Human: 分析一下各区销售\nAI: task(...) → 结果', r: '…\nHuman: 好了吗？\nAI: check_async_task(a1)\n→ West: $78,500，2,050 件 ✅' }, caption: '用户问起时才调 check_async_task 取结果；不轮询，也不相信对话里旧的状态', dur: 3600 },
  ],
};
