module.exports = {
  title: '一条 trace 就是一棵 run 树', width: 1100, height: 470,
  caption: '每个 @traceable 函数（或每次模型 / 工具调用）是一个 run；父子关系来自调用关系。run_type 决定界面怎么显示',
  nodes: [
    { id: 'root', kind: 'node', x: 20, y: 180, w: 240, h: 110, label: '⛓ langsmith_rag', sub: 'run_type = chain（根）\n输入：question\n输出：最终回答' },
    { id: 'ret', kind: 'store', x: 340, y: 30, w: 270, h: 100, label: '🗂 retrieve_documents', sub: 'run_type = retriever\n按文档卡片显示' },
    { id: 'gen', kind: 'node', x: 340, y: 190, w: 270, h: 90, label: '⛓ generate_response', sub: 'run_type = chain' },
    { id: 'llm', kind: 'llm', x: 690, y: 170, w: 280, h: 130, label: '🧠 call_openai', sub: 'run_type = llm\n按聊天气泡显示\nls_provider / ls_model_name\n→ 自动算 token 和费用' },
    { id: 'tool', kind: 'tool', x: 340, y: 340, w: 270, h: 100, label: '🔧 get_current_temperature', sub: 'run_type = tool\n显示成工具调用' },
    { id: 'meta', kind: 'note', x: 690, y: 340, w: 280, h: 100, label: '🏷 元数据 / 标签', sub: 'thread_id → 归进同一个线程\nlangsmith_extra={"run_id": …}' },
  ],
  edges: [
    { from: 'root', to: 'ret' }, { from: 'root', to: 'gen' }, { from: 'gen', to: 'llm' }, { from: 'root', to: 'tool', dashed: true },
    { from: 'meta', to: 'llm', dashed: true, fs: [0.5, 0], ts: [0.5, 1] },
  ],
};
