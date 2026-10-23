module.exports = {
  title: '开发环境：本课项目里有什么', width: 1100, height: 420,
  caption: 'VS Code 只负责编辑；运行代码需要的解释器和依赖包都装在 `.venv` 里，私密配置单独放在 `.env`',
  groups: [
    { id: 'proj', x: 270, y: 0, w: 830, h: 420, label: '本课项目文件夹', fill: 'rgba(241,245,249,.7)' },
    { id: 'venv', x: 560, y: 45, w: 520, h: 355, label: '.venv 虚拟环境（本课专用）', fill: 'rgba(227,242,253,.7)' },
  ],
  nodes: [
    { id: 'vs', kind: 'plain', x: 20, y: 95, w: 200, h: 90, label: '💻 VS Code', sub: '编辑器，不属于运行环境' },
    { id: 'code', kind: 'node', x: 295, y: 95, w: 230, h: 90, label: '📄 课程代码', sub: '.py 文件、练习与测试' },
    { id: 'env', kind: 'note', x: 295, y: 280, w: 230, h: 100, label: '🔒 .env（可选）', sub: 'API Key 等私密配置\n程序运行时读取' },
    { id: 'py', kind: 'llm', x: 590, y: 95, w: 460, h: 90, label: '🐍 Python 3.12 解释器', sub: '读取并执行 .py 文件' },
    { id: 'lc', kind: 'tool', x: 590, y: 280, w: 140, h: 100, label: '📦 LangChain', sub: '依赖包' },
    { id: 'lg', kind: 'tool', x: 750, y: 280, w: 140, h: 100, label: '📦 LangGraph', sub: '依赖包' },
    { id: 'pt', kind: 'tool', x: 910, y: 280, w: 140, h: 100, label: '📦 pytest', sub: '依赖包' },
  ],
  edges: [
    { from: 'vs', to: 'code', dashed: true, label: '编辑' },
    { from: 'py', to: 'code', label: '执行' },
    { from: 'py', to: 'lg', label: '调用' },
  ],
};
