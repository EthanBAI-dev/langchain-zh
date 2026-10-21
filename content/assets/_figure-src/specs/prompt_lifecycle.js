module.exports = {
  title: '提示工程生命周期：提示词不再写死在代码里', width: 1180, height: 440, dur: 2400,
  nodes: [
    { id: 'tr', kind: 'node', x: 10, y: 40, w: 220, h: 100, label: '🔍 看 trace', sub: '找到答得不好的\n那次 llm 调用' },
    { id: 'ds', kind: 'store', x: 280, y: 40, w: 220, h: 100, label: '🗂 建数据集', sub: 'inputs: question + context\n只测"生成"这一步' },
    { id: 'pg', kind: 'llm', x: 550, y: 40, w: 220, h: 100, label: '🎛 Playground', sub: '改提示词 · 换模型\n在数据集上跑实验' },
    { id: 'hub', kind: 'note', x: 550, y: 250, w: 220, h: 110, label: '📚 Prompt Hub', sub: '每次保存 = 一个 commit\nrag-prompt:abc1234' },
    { id: 'app', kind: 'tool', x: 140, y: 250, w: 280, h: 110, label: '🚀 应用', sub: 'client.pull_prompt("rag-prompt")\n改提示词不用重新部署' },
  ],
  edges: [
    { from: 'tr', to: 'ds', id: 'td' }, { from: 'ds', to: 'pg', id: 'dp' },
    { from: 'pg', to: 'hub', id: 'ph', label: '满意就保存' }, { from: 'hub', to: 'app', id: 'ha', label: 'pull_prompt' },
    { from: 'app', to: 'tr', id: 'at', dashed: true, fs: [0.2, 0], ts: [0.5, 1], label: '新 trace' },
  ],
  panels: [{ id: 'p', x: 820, y: 0, w: 360, h: 440, title: '提示词', mono: true }],
  frames: [
    { hl: ['tr'], panels: { p: '# 代码里写死的\nRAG_SYSTEM_PROMPT = """\nYou are an assistant for\nquestion-answering tasks.\n…three sentences maximum\n"""' }, caption: '① 提示词写死在代码里，trace 里发现有的回答不够好' },
    { hl: ['tr', 'td', 'ds', 'dp', 'pg'], panels: { p: '# Playground\n- v1：three sentences maximum\n+ v2：先给结论，再给代码示例\n+     不知道就说不知道\n\n实验：v1 0.62 → v2 0.81' }, caption: '② 只针对"生成回答"建数据集，在 Playground 里一版一版改，用实验分数说话', dur: 3200 },
    { hl: ['pg', 'ph', 'hub'], panels: { p: '# Prompt Hub · rag-prompt\n  abc1234  v2（当前）\n~ 9f8e7d6  v1' }, caption: '③ 满意的版本存进 Prompt Hub，每次保存都是一个可回退的 commit' },
    { hl: ['hub', 'ha', 'app', 'at'], panels: { p: '# 应用里\nprompt = client.pull_prompt(\n    "rag-prompt")\nhydrated = prompt.invoke({…})\nmessages = convert_prompt_to_\n  openai_format(hydrated)\n  ["messages"]' }, caption: '④ 应用改成按名字拉取：以后改提示词只要存个新版本，产生的新 trace 又回到第 ① 步', dur: 3600 },
  ],
};
