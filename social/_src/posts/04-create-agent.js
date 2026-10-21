const { h, p, tip, card, cover, outro, item, list, checks, code, bubble, chat, result } = require('../lib');

// create_agent 返回的图：开始 → 模型 ⇄ 工具 → 结束
const graph = `<div style="display:flex;flex-direction:column;align-items:center;gap:0;font-weight:900">
  ${[
    ['▶ 开始', '#fff'],
    null,
    ['🧠 model（模型）', 'var(--soft)'],
  ]
    .map((x) => (x ? `<div style="background:${x[1]};border:4px solid var(--ink);border-radius:999px;padding:22px 50px;font-size:42px;box-shadow:6px 6px 0 var(--ink)">${x[0]}</div>` : `<div style="width:6px;height:60px;background:var(--ink)"></div>`))
    .join('')}
  <div style="display:flex;align-items:center;gap:30px;margin:10px 0">
    <div style="display:flex;flex-direction:column;align-items:center;font-size:30px;color:var(--deep)"><span style="font-size:60px;line-height:1">⇅</span>要用工具？</div>
  </div>
  <div style="display:flex;gap:60px;align-items:center">
    <div style="background:#FFF6DE;border:4px solid var(--ink);border-radius:999px;padding:22px 50px;font-size:42px;box-shadow:6px 6px 0 var(--ink)">🛠️ tools（工具）</div>
    <div style="font-size:30px;color:var(--ink2);font-weight:700">不用了 ↓</div>
  </div>
  <div style="width:6px;height:50px;background:var(--ink);margin-left:420px"></div>
  <div style="background:var(--hl);border:4px solid var(--ink);border-radius:999px;padding:22px 50px;font-size:42px;box-shadow:6px 6px 0 var(--ink);margin-left:420px">■ 结束</div>
</div>`;

module.exports = {
  id: '04',
  slug: '10行代码造agent',
  theme: { accent: '#2F7CF6', soft: '#DCE9FF', deep: '#1D4FB8', hl: '#FFE066' },
  cards: [
    cover({
      kicker: '手把手 · 可直接抄',
      title: '==10 来行代码==\n造一个 AI Agent',
      sub: 'LangChain `create_agent` 上手',
      art: `<div class="art-row"><span class="sticker t1">🐍</span><span class="plus">+</span><span class="sticker c t2">🦜</span><span class="plus">=</span><span class="sticker y t3">🤖</span></div>`,
      tags: ['Python', 'LangChain', 'AI Agent', '代码'],
    }),
    card(
      h('开工前准备 3 样', '都很简单'),
      list([
        item('🐍', '装好 Python', '3.10 或更新的版本'),
        item('📦', '装 LangChain', '`pip install langchain langchain-openai`'),
        item('🔑', '准备一个模型 API Key', '比如 `OPENAI_API_KEY`，放进环境变量'),
      ]),
      `<div class="mt">${tip('不想用 OpenAI？换成任何==支持工具调用==的模型都行，装对应的包、配好 Key 就好。')}</div>`
    ),
    card(
      h('第 1 步：给它一只"手"', '写一个工具，加上 `@tool` 就行'),
      code(
        `
from langchain.tools import tool

@tool
def get_weather(city: str) -> str:
    """查询某个城市今天的天气"""
    return f"{city}今天小雨，22°C"
`,
        { mark: [3, 5], notes: { 3: '变成工具', 5: '说明书：给模型看的' } }
      ),
      `<div class="mt">${tip('这里先用假数据演示。真实项目里，这一行换成调用天气 API。')}</div>`
    ),
    card(
      h('第 2 步：组装 Agent', '大脑 + 手脚 + 规则'),
      code(
        `
from langchain.agents import create_agent

agent = create_agent(
    model="openai:gpt-5-mini",
    tools=[get_weather],
    system_prompt="你是出行助手",
)
`,
        { mark: [4, 5, 6], notes: { 4: '🧠 大脑', 5: '🛠️ 手脚', 6: '📜 规则' } }
      )
    ),
    card(
      h('第 3 步：跑起来！'),
      code(
        `
result = agent.invoke(
    {"messages": "上海今天要带伞吗？"}
)
print(result["messages"][-1].content)
`,
        { mark: [2] }
      ),
      `<div style="height:40px"></div>`,
      chat(bubble('tool', 'get_weather(city="上海")\n→ 上海今天小雨，22°C', 'Agent 自己决定调用工具'), bubble('ai', '今天上海有小雨，记得带伞哦 ☔', '最终回答'))
    ),
    card(h('悄悄告诉你', '`create_agent` 造出来的其实是一张==图=='), graph, `<div class="mt">${tip('这就是上一篇的 ReAct 循环。这张图是用 **LangGraph** 搭的，想自己画图，以后学 LangGraph。')}</div>`),
    outro({
      body: checks(['`@tool` 把普通函数变成工具', '`create_agent` = 模型 + 工具 + 提示词', '`agent.invoke()` 运行，答案在最后一条消息里', '它背后是一张 ==模型 ⇄ 工具== 的循环图']),
      next: 'AI 怎么知道该用哪个**工具**？',
    }),
  ],
};
