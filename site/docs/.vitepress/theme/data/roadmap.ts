// 路线图：每章在图上的位置和它依赖的前置章节。
// 坐标是网格（col 列、lane 泳道），渲染时换算成像素；章节号、标题都从 chapters.json 读。
export const STAGE_COLORS: Record<string, string> = {
  '开始之前': '#64748B',
  'LangChain 入门': '#B5643C',
  'LangGraph 进阶': '#2F5D8A',
  '高级专题': '#7A8CA3',
  'Deep Agents 实战': '#6E5A92',
  'LangSmith 实战': '#3E7C62',
  '附录': '#94A3B8',
}

export const LANES = ['LangChain', 'LangGraph', 'Deep Agents', 'LangSmith']

export interface RoadNode { slug: string; col: number; lane: number; deps: string[] }

export const NODES: RoadNode[] = [
  { slug: 'ch00', col: 0, lane: 0, deps: [] },
  { slug: 'ch01', col: 1, lane: 0, deps: ['ch00'] },
  { slug: 'ch02', col: 2, lane: 0, deps: ['ch01'] },
  { slug: 'ch03', col: 3, lane: 0, deps: ['ch02'] },
  { slug: 'ch04', col: 4, lane: 0, deps: ['ch03'] },
  { slug: 'ch05', col: 5, lane: 0, deps: ['ch04'] },
  { slug: 'ch06', col: 4, lane: 1, deps: ['ch03'] },
  { slug: 'ch07', col: 5, lane: 1, deps: ['ch06'] },
  { slug: 'ch08', col: 6, lane: 1, deps: ['ch07'] },
  { slug: 'ch09', col: 7, lane: 1, deps: ['ch08'] },
  { slug: 'ch10', col: 8, lane: 1, deps: ['ch09'] },
  { slug: 'ch11', col: 9, lane: 1, deps: ['ch10'] },
  { slug: 'ch12', col: 6, lane: 2, deps: ['ch07'] },
  { slug: 'ch14', col: 7, lane: 2, deps: ['ch12'] },
  { slug: 'ch15', col: 8, lane: 2, deps: ['ch14'] },
  { slug: 'ch16', col: 9, lane: 2, deps: ['ch15', 'ch11'] },
  { slug: 'ch13', col: 2, lane: 3, deps: ['ch01'] },
  { slug: 'ch17', col: 3, lane: 3, deps: ['ch13'] },
  { slug: 'ch18', col: 4, lane: 3, deps: ['ch17'] },
  { slug: 'appendix', col: 9, lane: 3, deps: [] },
]

// 首页的四个学习方向，一条泳道一张卡片。章节从 NODES 里按泳道取，不在这里写死
export const DIRECTIONS = [
  { lane: 0, name: 'LangChain 入门', icon: 'bot', from: '#B5643C', to: '#B5643C',
    desc: '用 create_agent 十几行代码造出会调工具的 Agent，再学记忆、中间件、多模态和多智能体。',
    tags: ['create_agent', '工具调用', '中间件', '多模态'] },
  { lane: 1, name: 'LangGraph 进阶', icon: 'workflow', from: '#2F5D8A', to: '#2F5D8A',
    desc: '把 Agent 拆成状态、节点和边，亲手加上记忆、人工审批、并行子图，最后部署上线。',
    tags: ['状态图', 'Reducer', '人在回路', '部署'] },
  { lane: 2, name: 'Deep Agents', icon: 'rocket', from: '#6E5A92', to: '#6E5A92',
    desc: '像 Claude Code 那样能连跑几十步的 Agent：任务规划、虚拟文件系统、子智能体委派。',
    tags: ['规划', '文件系统', '子智能体', 'Skills'] },
  { lane: 3, name: 'LangSmith', icon: 'telescope', from: '#3E7C62', to: '#3E7C62',
    desc: '看清 Agent 每一步在干什么：追踪、离线评估、提示工程和线上监控。',
    tags: ['Tracing', '评估', '提示工程', '监控'] },
]
