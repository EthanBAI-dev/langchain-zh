module.exports = {
  title: '技能的"渐进式披露"：先只看目录，用到才翻开', width: 1100, height: 420, dur: 2600,
  nodes: [
    { id: 'sk', kind: 'store', x: 20, y: 40, w: 260, h: 150, label: '📁 /skills/', sub: 'qualify-lead/SKILL.md\ndraft-pitch/SKILL.md\n（正文都在这里）' },
    { id: 'mw', kind: 'node', x: 20, y: 240, w: 260, h: 100, label: '🗂 SkillsMiddleware', sub: '启动时用代码读 frontmatter\n只取 name + description' },
    { id: 'm', kind: 'llm', x: 360, y: 140, w: 220, h: 100, label: '🧠 模型', sub: '先看目录，需要时才翻正文' },
    { id: 'rf', kind: 'tool', x: 360, y: 300, w: 220, h: 90, label: '🔧 read_file', sub: '打开匹配的 SKILL.md' },
  ],
  edges: [
    { from: 'sk', to: 'mw' }, { from: 'mw', to: 'm', id: 'mm' }, { from: 'm', to: 'rf', id: 'mr', both: true },
  ],
  panels: [{ id: 'p', x: 620, y: 0, w: 480, h: 410, title: '模型的上下文', mono: true }],
  frames: [
    { hl: ['sk', 'sk->mw', 'mw', 'mm', 'm'], panels: { p: 'System: You are a sales assistant.\n**Available Skills:**\n- qualify-lead: Use when the user\n  wants to qualify a sales lead.\n  -> Read /skills/qualify-lead/SKILL.md\n- draft-pitch: Use when …\n  -> Read /skills/draft-pitch/SKILL.md' }, caption: '① 发现：每次调用模型，系统提示词里只有技能的名字和"什么时候用"' },
    { hl: ['m', 'mr', 'rf', 'sk'], panels: { p: '…目录同上…\nHuman: 帮我评估 Acme 这条线索\nAI: read_file("/skills/qualify-lead/\n            SKILL.md")\nTool: # Qualify a Lead\n  用 BANT 框架：预算 / 决策人 /\n  需求 / 时间线 …' }, caption: '② 激活：问题和 qualify-lead 的描述对上了，模型自己 read_file 把正文读进来' },
    { hl: ['m'], panels: { p: '…\nTool: # Qualify a Lead …\nAI: 结论：Qualified\n  预算 $45k ✓ 决策人 ✓\n  需求清楚 ✓ Q3 前上线 ✓' }, caption: '③ 执行：照着正文一步步做。draft-pitch 的正文从头到尾没进过上下文', dur: 3400 },
  ],
};
