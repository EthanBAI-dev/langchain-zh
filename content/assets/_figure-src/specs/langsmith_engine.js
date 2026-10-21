module.exports = {
  title: 'LangSmith Engine：把"看 trace → 找问题 → 修 → 加测试"自动化', width: 1100, height: 440,
  caption: 'Engine 读 trace、反馈和（可选的）代码仓库，产出排好序的问题、草稿 PR 和回归数据集。合不合并永远由你决定',
  groups: [
    { id: 'in', x: 0, y: 0, w: 260, h: 440, label: '输入', fill: 'rgba(241,245,249,.7)' },
    { id: 'out', x: 640, y: 0, w: 460, h: 440, label: '产出', fill: 'rgba(232,245,233,.6)' },
  ],
  nodes: [
    { id: 't', kind: 'store', x: 20, y: 50, w: 220, h: 90, label: '🗂 trace 与反馈', sub: '比如 sentiment = 0 的线程' },
    { id: 'g', kind: 'store', x: 20, y: 175, w: 220, h: 90, label: '💻 GitHub 仓库', sub: '可选：让它读代码' },
    { id: 'pref', kind: 'note', x: 20, y: 300, w: 220, h: 100, label: '📝 User Preferences', sub: '你关心什么、\n不关心什么' },
    { id: 'e', kind: 'llm', x: 330, y: 150, w: 240, h: 140, label: '🧠 LangSmith Engine', sub: '分析深度：Reduced /\nStandard / Expanded\n按 LSU 计费' },
    { id: 'is', kind: 'node', x: 670, y: 40, w: 400, h: 110, label: '🐞 问题（issues）', sub: '相似的聚成一类 · 按严重程度排序\n关闭或标为误报 → 这类优先级降低' },
    { id: 'pr', kind: 'tool', x: 670, y: 175, w: 400, h: 90, label: '🔀 修复建议', sub: '草稿 PR，从不自动合并' },
    { id: 'ds', kind: 'store', x: 670, y: 300, w: 400, h: 100, label: '🧪 数据集', sub: '把相关 trace 存成样本 → 回归测试\n（Beta：修复验证、红队测试）' },
  ],
  edges: [
    { from: 't', to: 'e' }, { from: 'g', to: 'e' }, { from: 'pref', to: 'e' },
    { from: 'e', to: 'is' }, { from: 'e', to: 'pr' }, { from: 'e', to: 'ds' },
  ],
};
