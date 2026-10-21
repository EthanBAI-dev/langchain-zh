module.exports = {
  title: '婚礼策划团队：协调员先记状态，再派三位专家', width: 1180, height: 470, dur: 2400,
  nodes: [
    { id: 'u', kind: 'human', x: 10, y: 30, w: 230, h: 100, label: '🧑 用户', sub: '伦敦出发，巴黎办\n100 人，爵士风格' },
    { id: 'c', kind: 'llm', x: 300, y: 30, w: 240, h: 100, label: '💼 协调员', sub: 'create_agent\nstate_schema=WeddingState' },
    { id: 's', kind: 'store', x: 300, y: 190, w: 240, h: 100, label: '🗂 状态', sub: 'origin · destination\nguest_count · genre' },
    { id: 'f', kind: 'tool', x: 10, y: 350, w: 220, h: 100, label: '✈️ 旅行专家', sub: 'Kiwi MCP 工具\n+ 重试拦截器' },
    { id: 'v', kind: 'tool', x: 250, y: 350, w: 220, h: 100, label: '🏛 场地专家', sub: 'web_search\n最多 12 次' },
    { id: 'p', kind: 'tool', x: 490, y: 350, w: 220, h: 100, label: '🎵 歌单专家', sub: 'Chinook 数据库\n出错就改 SQL 重试' },
  ],
  edges: [
    { from: 'u', to: 'c', id: 'uc' }, { from: 'c', to: 's', id: 'cs', label: 'update_state（单独调用）' },
    { from: 's', to: 'f', id: 'sf' }, { from: 's', to: 'v', id: 'sv' }, { from: 's', to: 'p', id: 'sp' },
  ],
  panels: [{ id: 'q', x: 760, y: 0, w: 420, h: 470, title: '协调员的对话', mono: true }],
  frames: [
    { hl: ['u', 'uc', 'c'], panels: { q: "Human: I'm from London and I'd\n like a wedding in Paris for\n 100 guests, jazz-genre" }, caption: '① 用户一句话说清需求' },
    { hl: ['c', 'cs', 's'], panels: { q: 'AI: update_state(\n  origin="London",\n  destination="Paris",\n  guest_count="100",\n  genre="jazz")\n+ Tool: Successfully updated state' }, caption: '② 先把四个关键信息写进状态。这一步必须单独调用，写完才能派活', dur: 3200 },
    { hl: ['s', 'sf', 'sv', 'sp', 'f', 'v', 'p'], panels: { q: 'AI: search_flights()\n    search_venues()\n    suggest_playlist()\n~ 三个工具都没有参数\n~ 各自从 runtime.state 里读\n~ 子智能体只回最后一条消息' }, caption: '③ 三位专家并行开工：参数从状态里读，模型没机会传错', dur: 3400 },
    { hl: ['c'], panels: { q: '> 婚礼方案\n✈️ 伦敦 → 巴黎航班候选\n🏛 100 人场地候选\n🎵 爵士歌单 · 总时长 · 总价\n\n~ config: recursion_limit=40\n~         tags=["WP"]' }, caption: '④ 协调员汇总成一份方案。步数上限放宽到 40，打上标签方便在 LangSmith 里找', dur: 3600 },
  ],
};
