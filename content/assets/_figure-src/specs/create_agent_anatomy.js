module.exports = {
  title: 'create_agent 的"配方"：把几样东西交给它，得到一个可运行的 Agent', width: 1100, height: 430,
  caption: '前 3 项是核心；context_schema / checkpointer / middleware / response_format 按需添加',
  nodes: [
    { id: 'm', kind: 'llm', x: 20, y: 0, w: 300, h: 52, label: 'model', sub: '"openai:gpt-5-mini" 等任意聊天模型', mono: true },
    { id: 't', kind: 'tool', x: 20, y: 62, w: 300, h: 52, label: 'tools', sub: '[execute_sql, …] 模型可调用的函数', mono: true },
    { id: 'p', kind: 'note', x: 20, y: 124, w: 300, h: 52, label: 'system_prompt', sub: '角色设定与行为规则', mono: true },
    { id: 'c', kind: 'plain', x: 20, y: 196, w: 300, h: 52, label: 'context_schema', sub: '运行时依赖注入（如数据库连接）', mono: true },
    { id: 'k', kind: 'store', x: 20, y: 258, w: 300, h: 52, label: 'checkpointer', sub: '短期记忆：按 thread_id 保存对话', mono: true },
    { id: 'w', kind: 'human', x: 20, y: 320, w: 300, h: 52, label: 'middleware', sub: '动态提示词、人工审批、摘要…', mono: true },
    { id: 'r', kind: 'plain', x: 20, y: 382, w: 300, h: 44, label: 'response_format', sub: '结构化输出', mono: true },
    { id: 'ca', kind: 'node', x: 420, y: 160, w: 220, h: 90, label: 'create_agent( … )', mono: true, sub: 'langchain.agents' },
    { id: 'ag', kind: 'llm', x: 740, y: 120, w: 330, h: 170, label: '🤖 Agent', sub: '本质：一张编译好的 LangGraph 图\n（模型节点 ⇄ 工具节点 的 ReAct 循环）\n\n.invoke()  一次性拿结果\n.stream()  边跑边看\n.get_graph() 画出结构' },
  ],
  edges: [
    { fs: 'r', from: 'm', to: 'ca' }, { fs: 'r', from: 't', to: 'ca' }, { fs: 'r', from: 'p', to: 'ca' },
    { fs: 'r', from: 'c', to: 'ca', dashed: true }, { fs: 'r', from: 'k', to: 'ca', dashed: true }, { fs: 'r', from: 'w', to: 'ca', dashed: true }, { fs: 'r', from: 'r', to: 'ca', dashed: true },
    { from: 'ca', to: 'ag', label: '返回' },
  ],
};
