module.exports = {
  title: 'LangChain 生态全景：三层框架 + 一个平台', width: 1100, height: 440, noCaption: false,
  caption: '越往上越"开箱即用"，越往下越"可定制"；LangSmith 贯穿开发、调试、评估与上线',
  nodes: [
    { id: 'app', kind: 'plain', x: 40, y: 10, w: 640, h: 64, label: '🚀 你的 AI 应用', sub: '客服助手 · SQL 分析师 · 深度研究 · 编程助手 …' },
    { id: 'deep', kind: 'human', x: 40, y: 110, w: 640, h: 80, label: 'Deep Agents（deepagents）', sub: '开箱即用的 Agent 套件：任务规划 TODO · 虚拟文件系统 · 子智能体 · 上下文压缩 · Skills' },
    { id: 'lc', kind: 'llm', x: 40, y: 220, w: 640, h: 80, label: 'LangChain（create_agent）', sub: '轻量 Agent 骨架：模型 + 工具 + 提示词 + 中间件 Middleware；统一的模型/消息/工具接口' },
    { id: 'lg', kind: 'node', x: 40, y: 330, w: 640, h: 80, label: 'LangGraph（StateGraph）', sub: '底层图运行时：状态 · 节点 · 边 · 持久化 Checkpointer · 流式 · 中断/人在回路' },
    { id: 'ls', kind: 'store', x: 800, y: 10, w: 270, h: 400, label: '🔭 LangSmith 平台', sub: '\n追踪 Tracing\n评估 Evaluation\n提示工程 Prompt Hub\nStudio 可视化调试\n部署 Deployment\n线上监控 Insights' },
  ],
  edges: [
    { from: 'deep', to: 'app', label: '构建' },
    { from: 'lc', to: 'deep', label: '基于' },
    { from: 'lg', to: 'lc', label: '基于' },
    { from: 'lc', to: 'ls', both: true, dashed: true, label: '观测' },
  ],
};
