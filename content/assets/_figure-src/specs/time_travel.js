const cp = (x, id, label, sub) => ({ id, kind: 'store', x, y: 60, w: 150, h: 76, label, sub });
module.exports = {
  title: '时间旅行：浏览历史 → 回放 → 分叉', width: 1100, height: 380, dur: 2800,
  nodes: [
    cp(10, 'c0', '检查点 0', '输入前'), cp(190, 'c1', '检查点 1', 'Human: 2×3'), cp(370, 'c2', '检查点 2', 'AI: tool_call'), cp(550, 'c3', '检查点 3', 'Tool: 6'), cp(730, 'c4', '检查点 4', 'AI: 答案是 6'),
    { id: 'f1', kind: 'human', x: 190, y: 250, w: 150, h: 76, label: '分叉检查点', sub: 'Human: 5×3' },
    { id: 'f2', kind: 'llm', x: 400, y: 250, w: 380, h: 76, label: '新的执行分支', sub: 'AI: tool_call → Tool: 15 → "答案是 15"' },
  ],
  edges: [
    { from: 'c0', to: 'c1' }, { from: 'c1', to: 'c2' }, { from: 'c2', to: 'c3' }, { from: 'c3', to: 'c4' },
    { from: 'c1', to: 'f1', id: 'fork', dashed: true, label: 'update_state' }, { from: 'f1', to: 'f2', id: 'run' },
  ],
  panels: [{ id: 'c', x: 900, y: 0, w: 190, h: 370, mono: true, title: 'API' }],
  frames: [
    { hl: ['c0', 'c1', 'c2', 'c3', 'c4'], hide: ['f1', 'f2', 'fork', 'run'], panels: { c: 'graph.get_state_history(thread)\n\n每一步都存了一个检查点（倒序返回）' }, caption: '① 每执行一步，checkpointer 就存一个快照；get_state_history 可以把它们全列出来' },
    { hl: ['c1', 'c1->c2', 'c2', 'c2->c3', 'c3', 'c3->c4', 'c4'], hide: ['f1', 'f2', 'fork', 'run'], panels: { c: 'to_replay = all_states[-2]\ngraph.stream(None,\n  to_replay.config)\n\n~ 已执行过的步骤：直接回放' }, caption: '② 回放（Replay）：把某个历史检查点的 config 传回去，从那里重新跑' },
    { hl: ['c1', 'fork', 'f1'], hide: ['f2', 'run'], panels: { c: 'fork_config =\n graph.update_state(\n  to_fork.config,\n  {"messages": [Human(\n   "Multiply 5 and 3",\n   id=原消息id)]})' }, caption: '③ 分叉（Fork）：在历史检查点上改状态（用相同 id 覆盖原消息），生成一个新检查点' },
    { hl: ['f1', 'run', 'f2'], panels: { c: 'graph.stream(None,\n  fork_config)\n\n+ 新分支从未执行过\n+ → 真正重新运行' }, caption: '④ 从分叉点继续：原历史保留，新分支得到不同结果。调试 Agent 的利器', dur: 3600 },
  ],
};
