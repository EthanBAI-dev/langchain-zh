module.exports = {
  title: 'Agent 看到的"环境" vs 背后真正干活的"后端"', width: 1100, height: 470,
  caption: '工具名永远一样；换后端只改变"文件存哪、命令在哪跑"。解释器不属于后端，是单独加进循环的一个工具',
  groups: [
    { id: 'env', x: 0, y: 0, w: 1100, h: 150, label: '🧰 环境：模型看到的工具', fill: 'rgba(227,242,253,.7)' },
    { id: 'be', x: 0, y: 190, w: 760, h: 280, label: '🗂 后端（backend=…）：上排只管文件，下排还多一个 execute', fill: 'rgba(241,245,249,.7)' },
  ],
  nodes: [
    { id: 'fs', kind: 'store', x: 20, y: 40, w: 420, h: 90, label: '📁 文件系统（总是有）', sub: 'ls · read_file · write_file · edit_file\ndelete · glob · grep' },
    { id: 'sh', kind: 'tool', x: 460, y: 40, w: 280, h: 90, label: '🔧 shell（可选）', sub: 'execute("python fib.py")' },
    { id: 'it', kind: 'llm', x: 800, y: 40, w: 280, h: 90, label: '🧠 解释器（可选）', sub: 'eval("…JavaScript…")\nCodeInterpreterMiddleware' },
    { id: 'st', kind: 'node', x: 20, y: 240, w: 230, h: 90, label: '📄 StateBackend', sub: '默认 · 存在本线程状态里' },
    { id: 'fb', kind: 'node', x: 265, y: 240, w: 230, h: 90, label: '📁 FilesystemBackend', sub: '本地磁盘 root_dir 下' },
    { id: 'sb', kind: 'node', x: 510, y: 240, w: 230, h: 90, label: '🗄 StoreBackend', sub: '跨线程的 Store（长期记忆）' },
    { id: 'ls', kind: 'human', x: 20, y: 360, w: 350, h: 90, label: '⛔ LocalShellBackend', sub: '文件 + execute，直接跑在你电脑上' },
    { id: 'sx', kind: 'human', x: 390, y: 360, w: 350, h: 90, label: '🚀 沙箱后端（LangSmithSandbox…）', sub: '文件 + execute，跑在隔离环境里' },
    { id: 'qj', kind: 'note', x: 800, y: 240, w: 280, h: 210, label: '🧠 QuickJS 运行时', sub: '嵌在 Agent 进程里\n只有 JS 标准库\n没有文件 / 网络\n只能调你允许的工具（PTC）' },
  ],
  edges: [
    { from: 'it', to: 'qj' },
  ],
};
