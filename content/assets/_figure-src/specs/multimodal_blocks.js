module.exports = {
  title: '多模态消息：content 从一个字符串变成一组内容块', width: 1100, height: 420,
  caption: '你按 LangChain 的标准块写，集成包负责翻译成各家的格式（实测 OpenAI 收到的是 image_url + data URL）',
  nodes: [
    { id: 'm', kind: 'human', x: 20, y: 110, w: 260, h: 200, label: '🧑 HumanMessage', sub: 'content=[\n  文字块,\n  图片块,\n  音频块,\n]' },
    { id: 't', kind: 'note', x: 360, y: 20, w: 330, h: 100, label: '📝 {"type": "text"}', sub: '"text": "Tell me about this capital"' },
    { id: 'i', kind: 'store', x: 360, y: 160, w: 330, h: 100, label: '🖼 {"type": "image"}', sub: '"base64": …, "mime_type": "image/png"' },
    { id: 'a', kind: 'tool', x: 360, y: 300, w: 330, h: 100, label: '🎤 {"type": "audio"}', sub: '"base64": …, "mime_type": "audio/wav"\n要换能听音频的模型' },
    { id: 'o', kind: 'llm', x: 780, y: 110, w: 300, h: 200, label: '🤖 模型集成包', sub: 'langchain-openai：\nimage → image_url\n(data:image/png;base64,…)\n其他家各自转换' },
  ],
  edges: [{ from: 'm', to: 't' }, { from: 'm', to: 'i' }, { from: 'm', to: 'a' }, { from: 't', to: 'o' }, { from: 'i', to: 'o' }, { from: 'a', to: 'o' }],
};
