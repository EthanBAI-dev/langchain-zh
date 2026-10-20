module.exports = {
  title: 'LangGraph Store：像文件系统一样存取长期记忆', width: 1100, height: 330, noStep: true,
  caption: 'namespace ≈ 文件夹路径，key ≈ 文件名，value ≈ 文件内容（一个字典）',
  panels: [
    { id: 'a', x: 0, y: 0, w: 520, h: 320, mono: true, title: '写入与读取（本地实测）', text: 'from langgraph.store.memory import InMemoryStore\nstore = InMemoryStore()\nns = ("1", "memories")     # 命名空间\n\nstore.put(ns, "k1",\n  {"food_preference": "I like pizza"})\n\nstore.search(ns)   # 按命名空间列出\n+ → [Item(key="k1", value={...})]\nstore.get(ns, "k1").value\n+ → {"food_preference": "I like pizza"}' },
    { id: 'b', x: 560, y: 0, w: 530, h: 320, mono: true, title: '类比：文件系统', text: '📁 1/\n└─ 📁 memories/\n   ├─ 📄 k1   {"food_preference": "I like pizza"}\n   └─ 📄 k2   {...}\n📁 2/\n└─ 📁 memories/ ...\n\n~ 三种常见记忆结构：\n> 字符串  → 自由文本记忆\n> Profile → 一个持续更新的用户画像\n> Collection → 一条条独立的记忆' },
  ],
};
