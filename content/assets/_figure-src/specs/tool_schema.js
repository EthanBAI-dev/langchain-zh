module.exports = {
  title: '工具是怎么"被模型看懂"的：函数签名 + 文档字符串 → JSON Schema', width: 1100, height: 430,
  caption: '模型从不执行你的代码，它只看"名字 + 描述 + 参数结构"，然后输出一个 tool_call 请求；真正执行的是工具节点',
  panels: [
    { id: 'code', x: 10, y: 0, w: 420, h: 300, mono: true, title: '① 你写的 Python 函数', text: '@tool\ndef real_number_calculator(\n    a: float, b: float,\n    operation: Literal["add","subtract",\n                       "multiply","divide"],\n) -> float:\n    """Perform basic arithmetic\n    operations on two real numbers."""\n    ...' },
    { id: 'schema', x: 520, y: 0, w: 560, h: 300, mono: true, title: '② 模型实际收到的工具说明（简化）', text: '{\n  "name": "real_number_calculator",\n  "description": "Perform basic arithmetic\n                  operations on two real numbers.",\n  "parameters": {\n    "a": {"type": "number"},\n    "b": {"type": "number"},\n    "operation": {"enum": ["add","subtract",\n                           "multiply","divide"]}\n  }\n}' },
    { id: 'call', x: 10, y: 320, w: 1070, h: 70, mono: true, title: '③ 用户问 "what is 3.1125 * 4.1234" 时，模型输出：', text: '+ tool_calls=[{"name": "real_number_calculator", "args": {"a": 3.1125, "b": 4.1234, "operation": "multiply"}}]' },
  ],
  nodes: [{ id: 'x', kind: 'plain', x: 440, y: 120, w: 70, h: 50, label: '→' }],
};
