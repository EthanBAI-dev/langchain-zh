module.exports = {
  title: 'CompositeBackend 按路径前缀分流，权限规则先于后端检查', width: 1100, height: 420, dur: 2600,
  nodes: [
    { id: 'm', kind: 'llm', x: 20, y: 150, w: 200, h: 90, label: '🧠 模型', sub: '只管调工具' },
    { id: 'p', kind: 'human', x: 280, y: 150, w: 220, h: 90, label: '⛔ 权限检查', sub: 'FilesystemPermission\n第一条匹配的规则生效' },
    { id: 'c', kind: 'tool', x: 560, y: 150, w: 200, h: 90, label: '🔀 CompositeBackend', sub: '看路径前缀' },
    { id: 'r', kind: 'store', x: 840, y: 40, w: 240, h: 90, label: '📁 /reference/', sub: 'FilesystemBackend\n本地磁盘，真文件' },
    { id: 's', kind: 'node', x: 840, y: 260, w: 240, h: 90, label: '📄 其他所有路径', sub: 'StateBackend\n本线程的草稿' },
  ],
  edges: [
    { from: 'm', to: 'p' }, { from: 'p', to: 'c' },
    { from: 'c', to: 'r', label: '/reference/**' }, { from: 'c', to: 's', label: 'default' },
  ],
  panels: [{ id: 'log', x: 20, y: 290, w: 740, h: 120, title: '工具调用', mono: true }],
  frames: [
    { hl: ['m', 'm->p', 'p', 'p->c', 'c', 'c->r', 'r'], panels: { log: 'read_file("/reference/chinook-sales.md")\n→ 规则只禁写，读放行 → 路由到本地磁盘\n→ @@ lines 1-2 of 2 @@ # Chinook 销售手册 …' }, caption: '① 读 /reference/ 下的文件：权限放行，Composite 把它路由到本地磁盘' },
    { hl: ['m', 'm->p', 'p'], panels: { log: 'edit_file("/reference/chinook-sales.md", …)\n→ 命中 deny 规则，根本到不了后端\n→ Error: permission denied for write on /reference/…' }, caption: '② 想改 /reference/：命中 deny 规则，在代码层就被拦下，模型绕不过去' },
    { hl: ['m', 'm->p', 'p', 'p->c', 'c', 'c->s', 's'], panels: { log: 'write_file("/notes.md", "折扣：爵士专辑 8 折")\n→ 没有规则匹配，默认放行 → 走 default\n→ Updated file /notes.md（只存在本线程状态里）' }, caption: '③ 其他路径不受影响：写进 StateBackend，磁盘上什么都不会多', dur: 3400 },
  ],
};
