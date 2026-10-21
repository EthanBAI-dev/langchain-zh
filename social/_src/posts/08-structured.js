const { h, p, tip, card, cover, outro, item, list, checks, code, result, grid, tile } = require('../lib');

module.exports = {
  id: '08',
  slug: '结构化输出',
  theme: { accent: '#3BAA4A', soft: '#DDF3D9', deep: '#22722D', hl: '#FFE066' },
  cards: [
    cover({
      kicker: '结构化输出',
      title: '让 AI 交==表格==\n别交作文',
      sub: '一段乱糟糟的话 → 整整齐齐的数据',
      art: `<div class="art-row"><span class="sticker t1">📝</span><span class="plus">→</span><span class="sticker c t2">🤖</span><span class="plus">→</span><span class="sticker y t3">📋</span></div>`,
      tags: ['结构化输出', 'JSON', 'LangChain', '提效'],
    }),
    card(
      h('场景：整理通话记录', '下面这段话，程序没法直接用'),
      `<div class="paper tilt" style="font-size:36px;line-height:1.7;color:var(--ink2)">"我们和 John Doe 聊了。他的电话是……我看看，==five, five, five，一二三，四五六七==。记下了吗？对了邮箱是 ==john at example.com==……"</div>`,
      `<div class="mt">${tip('程序想要的是三个格子：**名字**、**邮箱**、**电话**。')}</div>`
    ),
    card(
      h('第 1 步：画好"表格模板"'),
      code(
        `
from typing_extensions import TypedDict

class ContactInfo(TypedDict):
    name: str
    email: str
    phone: str
`,
        { mark: [4, 5, 6], notes: { 4: '名字', 5: '邮箱', 6: '电话' } }
      ),
      `<div class="mt">${tip('你要几个格子，就写几行。')}</div>`
    ),
    card(
      h('第 2 步：交给 Agent'),
      code(
        `
agent = create_agent(
    model="openai:gpt-5-mini",
    response_format=ContactInfo,
)
result = agent.invoke({"messages": 通话记录})
result["structured_response"]
`,
        { mark: [3, 6], notes: { 3: '按模板交作业', 6: '结果在这里取' } }
      ),
      `<div style="height:36px"></div>`,
      result('得到 👇', ['{', '  "name": "John Doe",', '  "email": "john@example.com",', '  "phone": "555-123-4567"', '}'])
    ),
    card(
      h('"表格模板"有 4 种写法', '挑一种你顺手的'),
      grid([tile('🪶', 'TypedDict', '最轻量\n返回字典', 'hl'), tile('🛡️', 'Pydantic', '自动校验\n返回对象'), tile('📦', 'dataclass', 'Python 自带\n返回实例'), tile('🌐', 'JSON Schema', '跨语言通用')], 2),
      `<div class="mt">${tip('注意：结果在 `structured_response` 里，==不在==最后一条消息里。')}</div>`
    ),
    outro({
      body: checks(['先定义"表格模板"（比如 TypedDict）', '传给 `response_format`', '结果从 `structured_response` 取', '口语化的内容也能被==整理成标准格式==']),
      next: 'AI 回答太慢？试试**流式输出**',
    }),
  ],
};
