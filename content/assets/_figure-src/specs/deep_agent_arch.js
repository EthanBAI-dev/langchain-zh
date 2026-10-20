module.exports = {
  title: 'Deep Agent = ReAct 循环 + 三件"法宝"', width: 1100, height: 420,
  caption: '普通 Agent 擅长短任务；长任务（平均几十次工具调用）需要：计划不跑偏、上下文不爆炸、子任务不互相干扰',
  nodes: [
    { id: 'core', kind: 'llm', x: 400, y: 150, w: 300, h: 110, label: '🧠 主 Agent（ReAct 循环）', sub: 'create_agent / create_deep_agent\n+ 详细的系统提示词' },
    { id: 'todo', kind: 'note', x: 20, y: 10, w: 330, h: 110, label: '📝 任务规划 TODO', sub: 'write_todos / read_todos\n把计划写下来并不断"复述"\n→ 对抗长上下文中的"走神"' },
    { id: 'fs', kind: 'store', x: 20, y: 290, w: 330, h: 110, label: '📁 虚拟文件系统', sub: 'ls / read_file / write_file / edit_file\n把大段资料"卸载"到文件\n→ 上下文只留文件名' },
    { id: 'sub', kind: 'human', x: 750, y: 10, w: 330, h: 110, label: '👥 子智能体', sub: 'task(description, subagent_type)\n子任务在干净的上下文里完成\n→ 上下文隔离，只回传结论' },
    { id: 'more', kind: 'plain', x: 750, y: 290, w: 330, h: 110, label: '🧰 deepagents 库还带', sub: '上下文摘要/压缩 · Skills\n沙箱 Shell · 人工审批\n可插拔后端（内存/本地/远程）' },
  ],
  edges: [{ from: 'core', to: 'todo', both: true }, { from: 'core', to: 'fs', both: true }, { from: 'core', to: 'sub', both: true }, { from: 'core', to: 'more', both: true, dashed: true }],
};
