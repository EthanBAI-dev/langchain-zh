module.exports = {
  title: '上下文快满了怎么办：摘要压缩旧消息，超大内容直接存文件', width: 1200, height: 440, dur: 2600,
  nodes: [
    { id: 'h', kind: 'node', x: 20, y: 40, w: 250, h: 110, label: '🗂 完整消息历史', sub: 'state["messages"]\n从不删，一条不少' },
    { id: 's', kind: 'llm', x: 330, y: 40, w: 250, h: 110, label: '🧠 摘要中间件', sub: '超过上限的 85%\n另调一次模型写摘要' },
    { id: 'm', kind: 'llm', x: 640, y: 40, w: 200, h: 110, label: '🤖 主模型', sub: '只看到"摘要 + 最近几条"' },
    { id: 'f', kind: 'store', x: 330, y: 190, w: 250, h: 90, label: '📁 /conversation_history/', sub: '被压掉的旧消息原文' },
    { id: 't', kind: 'tool', x: 20, y: 320, w: 250, h: 90, label: '🔧 工具返回 3 万 token', sub: '比如整张表导出' },
    { id: 'l', kind: 'store', x: 640, y: 320, w: 220, h: 90, label: '📁 /large_tool_results/', sub: '超过 2 万 token 的工具结果' },
  ],
  edges: [
    { from: 'h', to: 's' }, { from: 's', to: 'm', id: 'sm' }, { from: 's', to: 'f', id: 'sf' },
    { from: 't', to: 'l', id: 'tl' }, { from: 'l', to: 'm', id: 'lm', label: '预览 + 路径', lt: 0.4 },
  ],
  panels: [{ id: 'p', x: 890, y: 0, w: 310, h: 440, title: '模型这一轮看到的', mono: true }],
  frames: [
    { hl: ['h'], panels: { p: 'System …\nHuman: 我叫 Alex\nAI: 你好\nHuman: 2+2?\nAI: 4\nHuman: 我在做分布式缓存\n…越来越长' }, caption: '① 每轮对话都在涨，像温度计一样往上爬' },
    { hl: ['h', 'h->s', 's', 'sf', 'f'], panels: { p: '超过 max_input_tokens\n的 85% 了！\n\n旧消息原文 →\n/conversation_history/\nsession_….md' }, caption: '② 越过 85% 线：中间件另调一次模型写摘要，旧消息原文存成文件' },
    { hl: ['s', 'sm', 'm'], panels: { p: 'System …\nHuman: You are in the\n middle of a conversation\n that has been summarized.\n 意图 / 关键事实 /\n 产出文件 / 下一步\n 原文见 /conversation_history/…\nHuman: 我记得你什么？' }, caption: '③ 模型看到"一条摘要 + 最近几条"。原始历史在状态里一条没删', dur: 3200 },
    { hl: ['t', 'tl', 'l', 'lm', 'm'], panels: { p: 'Tool: Tool result too large,\n saved at /large_tool_results/…\n 预览（头 5 行 + 尾 5 行）\n     1 | id, name …\n … [1823 lines truncated] …\n→ 需要时 read_file 分页读' }, caption: '④ 卸载：单条工具结果超过约 2 万 token（用户消息约 5 万），整块存文件，只留预览和路径', dur: 3600 },
  ],
};
