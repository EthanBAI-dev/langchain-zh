module.exports = {
  title: '子图：每个"小团队"有自己的状态，通过同名 key 与父图通信', width: 1100, height: 400,
  caption: '子图并行返回时，同名 key 会冲突：要么给它加 reducer（processed_logs），要么用 output_schema 只输出必要字段',
  groups: [
    { id: 'p', x: 0, y: 0, w: 1090, h: 390, label: '父图 EntryGraphState {raw_logs, cleaned_logs, fa_summary, report, processed_logs(+)}' },
    { id: 'fa', x: 300, y: 40, w: 520, h: 140, label: '子图：失败分析 FailureAnalysisState', fill: 'rgba(255,243,224,.7)' },
    { id: 'qs', x: 300, y: 220, w: 520, h: 140, label: '子图：问题摘要 QuestionSummarizationState', fill: 'rgba(227,242,253,.7)' },
  ],
  nodes: [
    { id: 'c', kind: 'node', x: 40, y: 160, w: 180, h: 70, label: 'clean_logs', mono: true, sub: 'raw → cleaned_logs' },
    { id: 'f1', kind: 'tool', x: 330, y: 80, w: 200, h: 70, label: 'get_failures', mono: true },
    { id: 'f2', kind: 'tool', x: 590, y: 80, w: 200, h: 70, label: 'generate_summary', mono: true, sub: '→ fa_summary' },
    { id: 'q1', kind: 'llm', x: 330, y: 260, w: 200, h: 70, label: 'generate_summary', mono: true },
    { id: 'q2', kind: 'llm', x: 590, y: 260, w: 200, h: 70, label: 'send_to_slack', mono: true, sub: '→ report' },
    { id: 'e', kind: 'end', x: 900, y: 172, w: 110, h: 46, label: 'END' },
  ],
  edges: [
    { from: 'c', to: 'f1', fs: [0.5, 0], ts: 'l', via: [[130, 115]], label: 'cleaned_logs', lp: [190, 115] }, { from: 'c', to: 'q1', fs: [0.5, 1], ts: 'l', via: [[130, 295]], label: 'cleaned_logs', lp: [190, 295] },
    { from: 'f1', to: 'f2' }, { from: 'q1', to: 'q2' }, { from: 'f2', to: 'e', fs: 'r', ts: 't', via: [[955, 115]] }, { from: 'q2', to: 'e', fs: 'r', ts: 'b', via: [[955, 295]] },
  ],
};
