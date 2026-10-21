// 每章末尾的小测验。answer 是正确选项的下标（从 0 开始）。
// 题目只考教程里讲过的内容；`反引号` 会渲染成代码。
export interface Question {
  q: string
  options: string[]
  answer: number
  explain: string
}

export const quizzes: Record<string, Question[]> = {
  ch00: [
    {
      q: '课程要求的 Python 版本是？',
      options: ['3.8 及以上', '3.10 及以上', '3.11 – 3.13', '只能用 3.13'],
      answer: 2,
      explain: '课程明确要求 Python ≥ 3.11，教程推荐 3.11 – 3.13。',
    },
    {
      q: '新课程统一用哪个工具管理 Python 环境和依赖？',
      options: ['conda', 'uv', 'poetry', 'pipenv'],
      answer: 1,
      explain: '新课程用 `uv sync` 一步创建 `.venv` 并安装依赖，比 pip + venv 快得多。',
    },
    {
      q: '想在浏览器里可视化调试图（Studio），应该运行哪个命令？',
      options: ['`jupyter lab`', '`uv run studio`', '`langgraph dev`', '`langsmith start`'],
      answer: 2,
      explain: '`langgraph dev` 会启动本地服务器，然后可以在浏览器里打开 LangSmith Studio。',
    },
  ],
  ch01: [
    {
      q: '一个 Agent 由哪三样东西组成？',
      options: ['模型、工具、提示词', '模型、数据库、前端', '提示词、向量库、缓存', '模型、GPU、API Key'],
      answer: 0,
      explain: '模型是大脑，工具是手脚，提示词是规则。三者在循环里自主决策。',
    },
    {
      q: '在 ReAct 循环里，工具到底是谁执行的？',
      options: ['大模型自己执行代码', '框架（工具节点）执行，模型只输出 tool_call', '用户手动执行', '由 LangSmith 远程执行'],
      answer: 1,
      explain: '模型从不执行代码，它只“说”想调用哪个工具、传什么参数；执行是框架做的。',
    },
    {
      q: '`execute_sql` 工具出错时，为什么要返回 `"Error: ..."` 字符串而不是抛异常？',
      options: ['抛异常会让程序变慢', '这样模型能看到错误信息，自己修改 SQL 重试', '异常无法被记录到日志', '字符串更省 token'],
      answer: 1,
      explain: '把错误当作工具结果交还给模型，模型才有机会自我修正。',
    },
    {
      q: '`context_schema` + `get_runtime()` 解决的是什么问题？',
      options: ['让 Agent 记住对话', '输出结构化 JSON', '运行时依赖注入，比如每次调用连不同的数据库', '限制模型调用次数'],
      answer: 2,
      explain: '调用 Agent 时把依赖（如数据库连接）通过 `context` 传进去，工具在运行时用 `get_runtime` 取用。',
    },
    {
      q: '`create_agent` 返回的是什么？',
      options: ['一个 Python 字符串', '一张编译好的 LangGraph 图', '一个 HTTP 服务', '一个 OpenAI 客户端'],
      answer: 1,
      explain: '它返回编译好的 LangGraph 图，结构是 `__start__ → model ⇄ tools → __end__`。',
    },
  ],
  ch02: [
    {
      q: 'Agent 内部流动的消息有哪四类？',
      options: ['System / Human / AI / Tool', 'Input / Output / Error / Log', 'User / Bot / Admin / Guest', 'Request / Response / Event / Stream'],
      answer: 0,
      explain: '消息是 Agent 的通用语言：SystemMessage、HumanMessage、AIMessage、ToolMessage。',
    },
    {
      q: '要做一个“打字机效果”的聊天界面，应该用哪种 `stream_mode`？',
      options: ['`values`', '`updates`', '`messages`', '`custom`'],
      answer: 2,
      explain: '`messages` 模式按 token 逐个推送模型输出。',
    },
    {
      q: '想在工具运行时向前端推送“进度：已完成 30%”，用什么？',
      options: ['在工具里 `print()`', '`get_stream_writer()` 配合 `stream_mode="custom"`', '返回一个 ToolMessage', '修改系统提示词'],
      answer: 1,
      explain: '工具里调用 `get_stream_writer()` 写入任意数据，用 `custom` 模式订阅即可收到。',
    },
    {
      q: '用 `@tool` 定义工具时，哪些信息会被发给模型当作“说明书”？',
      options: ['只有函数名', '函数体源码', '函数名、参数类型和 docstring', '函数的返回值示例'],
      answer: 2,
      explain: '名字、参数类型、描述（docstring）就是模型选择和调用工具的依据，写得越清楚模型用得越准。',
    },
    {
      q: 'MCP 是什么？',
      options: ['一种模型压缩算法', '连接外部工具的开放协议', 'LangChain 的提示词模板语言', '一种向量数据库'],
      answer: 1,
      explain: 'MCP（Model Context Protocol）让你几行代码接入社区现成的工具生态，例如用 `MultiServerMCPClient`。',
    },
  ],
  ch03: [
    {
      q: '让 Agent 记住上一轮对话，最少需要做哪两件事？',
      options: ['加 `checkpointer`，并在调用时给 `thread_id`', '加向量库，并开启流式', '把历史对话拼进系统提示词', '换一个上下文更长的模型'],
      answer: 0,
      explain: '`checkpointer=InMemorySaver()` 保存状态，`thread_id` 区分不同对话。',
    },
    {
      q: '用 `response_format=Schema` 之后，结构化结果从哪里取？',
      options: ['`result["messages"][-1]`', '`result["structured_response"]`', '`result["output"]`', '`agent.schema`'],
      answer: 1,
      explain: '结构化输出放在 `result["structured_response"]`。',
    },
    {
      q: '员工和顾客要看到不同的系统提示词，用哪个中间件最合适？',
      options: ['`@dynamic_prompt`', '`SummarizationMiddleware`', '`ToolRetryMiddleware`', '`ModelCallLimitMiddleware`'],
      answer: 0,
      explain: '`@dynamic_prompt` 可以根据运行时上下文（比如用户身份）动态生成提示词。',
    },
    {
      q: '用 `HumanInTheLoopMiddleware` 暂停后，怎样把人的决定传回去让 Agent 继续？',
      options: ['重新调用 `create_agent`', '`Command(resume=...)`', '修改环境变量', '调用 `agent.stop()`'],
      answer: 1,
      explain: '用 `Command(resume=决定)` 再次调用同一个 thread，Agent 从暂停处继续。',
    },
  ],
  ch04: [
    {
      q: 'LangGraph 的三个核心概念是？',
      options: ['模型、工具、提示词', '状态、节点、边', '线程、运行、助手', '链、路由、代理'],
      answer: 1,
      explain: 'State 是共享数据，Node 是做事的函数，Edge 决定下一步去哪。',
    },
    {
      q: '节点函数应该返回什么？',
      options: ['下一个节点的名字', '要更新的状态字段（字典）', '完整的新图', '一段日志文本'],
      answer: 1,
      explain: '节点读状态，返回要更新的字段；默认情况下新值会覆盖旧值。返回节点名的是条件边函数。',
    },
    {
      q: '从 Router 升级到 Agent，关键的一步是什么？',
      options: ['换更大的模型', '加一条从 tools 回到 assistant 的边', '删掉条件边', '加一个 checkpointer'],
      answer: 1,
      explain: '`add_edge("tools", "assistant")` 形成 assistant ⇄ tools 的循环，就是 ReAct。',
    },
    {
      q: '`tools_condition` 做了什么判断？',
      options: ['工具是否执行成功', '最后一条 AI 消息里有没有 tool_calls，有就去 tools，没有就结束', '用户是否同意调用工具', '工具调用次数是否超限'],
      answer: 1,
      explain: '它是预置的条件边：有 tool_calls 走 tools 节点，否则走 END。',
    },
    {
      q: '`builder.compile()` 除了得到可运行的图，还会做什么？',
      options: ['自动部署到云端', '检查图的结构是否合法', '训练模型', '生成测试用例'],
      answer: 1,
      explain: '编译时会做结构检查，也可以在这里传入 checkpointer 等参数。',
    },
  ],
  ch05: [
    {
      q: '两个并行节点同时写同一个字段，没有 reducer 会怎样？',
      options: ['后写的覆盖先写的', '报错', '自动合并成列表', '随机保留一个'],
      answer: 1,
      explain: '同一超步内多个节点写同一通道且没有 reducer，LangGraph 会报 InvalidUpdateError。',
    },
    {
      q: '`Annotated[list, operator.add]` 的效果是？',
      options: ['新值覆盖旧值', '新列表拼接到旧列表后面', '只保留最大值', '去重'],
      answer: 1,
      explain: '`operator.add` 作为 reducer，会把每次更新的列表加（拼接）到已有列表上。',
    },
    {
      q: '用 `add_messages` 时，返回一条和已有消息 **id 相同** 的消息，会发生什么？',
      options: ['追加到末尾', '覆盖那条旧消息', '报错', '被忽略'],
      answer: 1,
      explain: '`add_messages` 规则：新 id 追加，同 id 覆盖，`RemoveMessage` 删除。',
    },
    {
      q: '想把对话里的某条消息删掉，节点该返回什么？',
      options: ['`{"messages": []}`', '`RemoveMessage(id=...)`', '`None`', '`{"messages": None}`'],
      answer: 1,
      explain: '返回 `RemoveMessage(id=要删的id)`，`add_messages` 会把它删除。',
    },
    {
      q: '想让记忆在程序重启后还在，应该把 `InMemorySaver` 换成什么？',
      options: ['`SqliteSaver` / `PostgresSaver`', '`InMemoryStore`', 'Redis 缓存', '写入 `.env`'],
      answer: 0,
      explain: '持久化检查点用 `SqliteSaver`（本地）或 `PostgresSaver`（生产）。',
    },
  ],
  ch06: [
    {
      q: '想在执行工具 **之前** 停下来让人审批，编译时怎么写？',
      options: ['`compile(interrupt_after=["tools"])`', '`compile(interrupt_before=["tools"])`', '`compile(debug=True)`', '`compile(pause=True)`'],
      answer: 1,
      explain: '`interrupt_before=["tools"]` 是静态断点：模型输出 tool_call 后、工具执行前停住。',
    },
    {
      q: '停在断点后，什么都不改直接继续，应该怎么调用？',
      options: ['`graph.stream(None, config)`', '`graph.stream({}, {})`', '`graph.resume()`', '重新 `compile`'],
      answer: 0,
      explain: '输入传 `None` 表示“从当前检查点继续”。',
    },
    {
      q: '节点内部根据条件 **动态** 暂停，用什么？',
      options: ['`raise Exception`', '`interrupt(payload)`', '`time.sleep()`', '`interrupt_before`'],
      answer: 1,
      explain: '`interrupt(payload)` 在节点内暂停，之后用 `Command(resume=值)` 恢复；旧写法 `NodeInterrupt` 已被取代。',
    },
    {
      q: '想“假装是某个节点”修改状态，用哪个参数？',
      options: ['`update_state(config, 更新, as_node="xxx")`', '`get_state(config, node="xxx")`', '`stream(..., node="xxx")`', '`compile(as_node="xxx")`'],
      answer: 0,
      explain: '`as_node` 让这次更新看起来像是该节点产生的，图会从那个节点之后继续。',
    },
    {
      q: '时间旅行里，“回放”和“分叉”的区别是？',
      options: [
        '没有区别',
        '回放：用旧 config 直接重跑；分叉：先 `update_state` 改旧状态，再从新 config 跑',
        '回放会删除历史，分叉不会',
        '回放只能在 Studio 里做',
      ],
      answer: 1,
      explain: '回放 = `stream(None, 旧config)`；分叉 = `update_state(旧config, ...)` 得到新 config 再运行。',
    },
  ],
  ch07: [
    {
      q: '一个节点连出多条边时，下游节点会怎么执行？',
      options: ['按添加顺序依次执行', '在同一个超步里并行执行', '只执行第一个', '随机挑一个执行'],
      answer: 1,
      explain: '多条出边构成扇出，下游节点在同一超步并行执行，并看到同一份旧状态。',
    },
    {
      q: '想让节点 c 等 a、b 都完成后才执行（扇入），怎么写？',
      options: ['`add_edge("a", "c")` 就够了', '`add_edge(["a", "b"], "c")`', '`add_conditional_edges("c", ...)`', '`Send("c", ...)`'],
      answer: 1,
      explain: '`add_edge([...], 下游)` 表示等列表里的节点都完成后再执行下游。',
    },
    {
      q: '两个子图并行，都返回了 `cleaned_logs` 字段导致报错，推荐怎么解决？',
      options: ['把子图改成串行', '给子图设置 `output_schema`，只输出需要的字段', '删除 `cleaned_logs`', '换一个模型'],
      answer: 1,
      explain: '子图默认返回所有字段；设 `output_schema` 只返回父图需要的，或给字段加 reducer。',
    },
    {
      q: '并行任务的数量要在运行时才能确定（比如每个主题生成一个笑话），用什么？',
      options: ['写死 N 条边', '条件边返回 `[Send("节点", 状态), ...]`', '`interrupt`', '`RemoteGraph`'],
      answer: 1,
      explain: '`Send` 是 Map-Reduce 的关键：动态生成任意数量的并行任务，每个带自己的状态。',
    },
  ],
  ch08: [
    {
      q: '短期记忆和长期记忆分别靠什么实现？',
      options: ['都靠 checkpointer', '短期：checkpointer（按 thread）；长期：Store（跨 thread）', '短期：Store；长期：checkpointer', '都靠向量数据库'],
      answer: 1,
      explain: 'checkpointer 按 `thread_id` 保存一段对话；Store 跨线程保存，比如按 `user_id` 记住用户。',
    },
    {
      q: 'Store 里一条记忆由哪几部分定位？',
      options: ['`thread_id` + `run_id`', '`namespace`（元组）+ `key`，值是字典', '文件路径 + 行号', '只有 `user_id`'],
      answer: 1,
      explain: '`store.put(namespace, key, value)`，namespace 像“文件夹路径”，常包含 `user_id`。',
    },
    {
      q: '节点函数怎样拿到 Store？',
      options: ['全局变量', '函数参数写 `store: BaseStore`，框架自动注入', '从 state 里取', '调用 `get_store_from_env()`'],
      answer: 1,
      explain: '只要签名里写 `store: BaseStore`，编译时传了 store 就会自动注入。',
    },
    {
      q: 'Trustcall 的主要作用是？',
      options: ['加密记忆', '用 JSON Patch 增量更新结构化记忆，避免整体重写丢信息', '验证用户身份', '加速向量检索'],
      answer: 1,
      explain: '把已有画像传给 Trustcall，它只生成需要修改的部分，而不是每次重写整个对象。',
    },
  ],
  ch09: [
    {
      q: '告诉 LangGraph Server “图在哪里”的配置文件是？',
      options: ['`package.json`', '`langgraph.json`', '`.env`', '`pyproject.toml`'],
      answer: 1,
      explain: '`langgraph.json` 声明依赖、图的入口和环境变量文件。',
    },
    {
      q: '部署后的 LangGraph Server 自带什么来做持久化和流式？',
      options: ['SQLite + 本地文件', 'Postgres + Redis', 'MongoDB + Kafka', '什么都不带，需要自己配'],
      answer: 1,
      explain: 'Postgres 负责持久化（检查点和 Store），Redis 负责流式和任务队列。',
    },
    {
      q: '“一张图，多套配置”对应 SDK 里的哪个对象？',
      options: ['Thread', 'Run', 'Assistant', 'Store'],
      answer: 2,
      explain: 'Assistant = 图 + 一组配置，例如同一个待办助手分“个人版”和“工作版”。',
    },
    {
      q: '用户上一轮还没回完又发了一句，想“丢掉当前运行、像没发生过一样处理新消息”，用哪个 `multitask_strategy`？',
      options: ['`reject`', '`enqueue`', '`interrupt`', '`rollback`'],
      answer: 3,
      explain: '`rollback` 回滚当前运行；`interrupt` 会保留已完成的进度；`enqueue` 排队；`reject` 拒绝新请求。',
    },
  ],
  ch10: [
    {
      q: '普通 Agent 干长任务时容易出现哪些问题？',
      options: ['跑偏、上下文爆炸、上下文冲突', '速度太快', '不会调用工具', '只能用 OpenAI 模型'],
      answer: 0,
      explain: 'Deep Agents 的三件法宝正是针对这三点：TODO 规划、文件系统、子智能体。',
    },
    {
      q: '“把大段搜索结果写进文件，上下文里只留文件名”属于哪种技巧？',
      options: ['上下文隔离', '上下文卸载', '提示词缓存', '模型蒸馏'],
      answer: 1,
      explain: '上下文卸载（offloading）：大内容放进状态里的 `files`，需要时再 `read_file`。',
    },
    {
      q: '子智能体为什么能避免上下文冲突？',
      options: ['它用更大的模型', '它从全新的 messages 开始，只把结论回传给主 Agent', '它共享主 Agent 的全部历史', '它不调用工具'],
      answer: 1,
      explain: '通过 `task` 工具调用的子智能体有独立上下文，干完只交回结论，这叫上下文隔离。',
    },
    {
      q: '工具想直接修改图的状态（比如写入 `files`），应该返回什么？',
      options: ['一个普通字符串', '`Command(update={...})`', '`RemoveMessage`', '`Send(...)`'],
      answer: 1,
      explain: '工具返回 `Command(update=...)` 即可更新状态；读状态则用 `InjectedState` 注入。',
    },
    {
      q: '用官方库一行得到规划 + 文件系统 + 子智能体，调用的是？',
      options: ['`create_agent`', '`create_react_agent`', '`create_deep_agent`', '`StateGraph`'],
      answer: 2,
      explain: '`from deepagents import create_deep_agent`，可以传 `subagents`、`interrupt_on` 等参数。',
    },
  ],
  ch11: [
    {
      q: '开启 LangSmith 追踪需要改多少代码？',
      options: ['要给每个函数加装饰器', '零代码改动：设置 `LANGSMITH_TRACING=true` 和 API Key', '要换成 LangSmith 专用的模型类', '要重写整个 Agent'],
      answer: 1,
      explain: '只需要环境变量，LangChain / LangGraph 会自动上报 trace。',
    },
    {
      q: '“改了提示词，到底变好还是变坏？”应该用哪种方式回答？',
      options: ['凭感觉试几次', '离线评估：数据集 + 评估器 + 实验对比', '看 token 消耗', '问模型自己'],
      answer: 1,
      explain: '用固定数据集跑新旧两版，评估器打分，在实验对比里看差异。',
    },
    {
      q: '评估器（Evaluator）是什么？',
      options: ['给输出打分的函数或模型', '一种新的模型', '部署工具', '追踪的另一个名字'],
      answer: 0,
      explain: '评估器可以是规则函数，也可以是 LLM-as-judge，用来给每条输出打分。',
    },
    {
      q: '线上发现了答得不好的问题，推荐的做法是？',
      options: ['直接忽略', '把它加回数据集，作为后续离线评估的用例', '删掉这条 trace', '换掉 LangSmith'],
      answer: 1,
      explain: '在线评估和 Insights 发现问题，回流到数据集，形成“观察 → 评估 → 改进”的闭环。',
    },
  ],
  ch12: [
    {
      q: '从 deepagents 0.7 起，想让 Agent 用 `write_todos` 列任务清单，需要怎么做？',
      options: ['什么都不用做，默认就有', '给 `middleware` 加 `TodoListMiddleware()`', '在系统提示词里写"请列清单"', '换成 `create_agent`'],
      answer: 1,
      explain: '0.7 起 `write_todos` 不再默认开启，要手动加 `TodoListMiddleware`。',
    },
    {
      q: '给 `create_deep_agent` 传 `tools=[read_sql]` 之后，内置的文件工具还在吗？',
      options: ['不在了，被替换掉了', '还在，自定义工具是叠加上去的', '只剩 `read_file`', '要重新声明才在'],
      answer: 1,
      explain: '你的工具叠加在内置工具（ls、read_file、write_file 等）之上，不会替换它们。',
    },
    {
      q: '用 `interrupt_on` 暂停后，想让人直接回答 Agent 的提问（而不是批准某个动作），应该允许哪种决定？',
      options: ['`approve`', '`edit`', '`reject`', '`respond`'],
      answer: 3,
      explain: '`respond` 把人的回答直接当成工具结果；对只允许 `respond` 的工具传 `approve` 会报错。',
    },
    {
      q: '为什么两个不同的 `thread_id` 之间互相不记得对方说过的话？',
      options: ['模型每次都会重置', '检查点按线程保存消息历史，线程之间是隔离的', 'LangSmith 删掉了记录', '因为没有用 Store'],
      answer: 1,
      explain: '检查点 + `thread_id` 构成短期记忆，每个线程有自己独立的消息历史。',
    },
  ],
  ch13: [
    {
      q: '不传 `backend` 时，Deep Agent 的文件存在哪里？',
      options: ['本地硬盘的当前目录', '当前线程的状态里（StateBackend）', 'LangSmith 云端', '系统临时目录'],
      answer: 1,
      explain: '默认是 `StateBackend()`，文件跟着线程状态走，适合当草稿。',
    },
    {
      q: '`FilesystemPermission(operations=["write"], paths=["/reference/**"], mode="deny")` 生效后，模型去改 `/reference/` 下的文件会怎样？',
      options: ['悄悄改成功', '在代码层被拦下，返回 permission denied 错误', '整个程序崩溃', '要看模型愿不愿意遵守'],
      answer: 1,
      explain: '权限在代码里执行，模型绕不过去；被拒的操作以错误信息回到模型。',
    },
    {
      q: '关于 `LocalShellBackend`，下面哪句是对的？',
      options: ['`virtual_mode=True` 能把 `execute` 也限制在 `root_dir` 里', '`root_dir` 只限制文件工具，`execute` 照样能访问整台电脑', '它自带进程隔离，可以放心上生产', '它不提供 `execute`'],
      answer: 1,
      explain: '`execute` 以你的用户权限运行，不受 `root_dir` 限制，所以建议给它配人工审批，生产环境用沙箱。',
    },
    {
      q: '程序化工具调用（PTC）为什么能减少模型往返次数？',
      options: ['它换了更快的模型', 'JS 代码在解释器里直接串联工具调用，中间结果留在变量里，只把最终结果交回模型', '它把工具结果缓存起来', '它跳过了工具执行'],
      answer: 1,
      explain: '课程实验里同一个问题：有 PTC 2 次模型往返，没 PTC 5 次。',
    },
    {
      q: '技能（Skill）的"渐进式披露"指的是？',
      options: ['所有技能全文每次都放进系统提示词', '系统提示词里只有名字和描述，需要时模型才用 `read_file` 读全文', '技能按字母顺序依次加载', '用户手动选择技能'],
      answer: 1,
      explain: '发现靠描述，激活靠 `read_file`，没用到的技能正文从不进上下文。',
    },
  ],
  ch14: [
    {
      q: '子智能体被调用时，能看到主 Agent 的对话历史吗（默认情况下）？',
      options: ['能，全部继承', '不能，只收到一条任务描述', '只能看到最后一条消息', '能看到但不能用'],
      answer: 1,
      explain: '这就是上下文隔离：一条任务进去，一条结果出来。想让它看到对话要用实验性的 `"mode": "fork"`。',
    },
    {
      q: '要对 1000 份录音逐一总结，为什么推荐动态子智能体？',
      options: ['因为它用的模型更强', '循环写在代码里，保证每一项都被处理，不靠模型记进度', '因为它不需要子智能体', '因为它更便宜'],
      answer: 1,
      explain: '让代码去数而不是让模型去记，避免做到一半就宣布完成。提示词里说 "workflow" 会触发这种写法。',
    },
    {
      q: '`start_async_task` 调用后，主 Agent 应该怎么做？',
      options: ['马上循环调 `check_async_task` 直到完成', '报告 `task_id` 然后把控制权还给用户，等用户问起再查', '取消任务', '重新启动一个同样的任务'],
      answer: 1,
      explain: '启动完就停；用户问起才查；而且不要相信对话里旧的状态。',
    },
    {
      q: '综合项目里 `langgraph.json` 为什么指向 `make_graph` 工厂函数，而不是一个现成的 `graph`？',
      options: ['工厂函数跑得更快', '邮件 MCP 工具要运行时连上服务器才知道有哪些，没法提前建好图', 'Studio 只认工厂函数', '为了少写代码'],
      answer: 1,
      explain: '工具在运行时才确定，所以让 `langgraph dev` 启动时调用工厂来建图。',
    },
  ],
  ch15: [
    {
      q: '披萨店的 Bug 1 为什么模型自己发现不了？',
      options: ['模型太弱', '库存数字只出现在 `get_ingredient` 的子 run 里，从没回到模型的上下文', '系统提示词禁止它检查库存', '菠萝根本不在菜单上'],
      answer: 1,
      explain: '证据在 trace 里，不在模型的上下文里。只看最终回复永远发现不了，要展开子 run。',
    },
    {
      q: '想让多次请求在 LangSmith 里归成同一段对话，元数据的键名应该用？',
      options: ['`chat_id`', '`thread_id`、`session_id` 或 `conversation_id`', '`run_id`', '`user_id`'],
      answer: 1,
      explain: '只认这三个键名，值通常是一个 UUID。LangGraph 应用会自动带上 `thread_id`。',
    },
    {
      q: '分类任务的 F1 分数应该用哪种评估器算？',
      options: ['普通评估器，每条样本算一次', '汇总评估器（`summary_evaluators`），一次拿到所有输出', '两两对比评估器', '在线评估器'],
      answer: 1,
      explain: 'F1 要先数完全部真阳性、假阳性、假阴性，只能在整个实验上算。',
    },
    {
      q: '`eval.py` 为什么给每条样本新开一个 `thread_id`？',
      options: ['为了跑得更快', '订单按 `thread_id` 存，共用会让后面的样本在前面的订单上继续加披萨', 'LangSmith 要求这样', '为了省 token'],
      answer: 1,
      explain: '样本之间必须互不干扰，打分才可信。',
    },
  ],
  ch16: [
    {
      q: '在线情绪评估器为什么要把 `OPENAI_API_KEY` 存成工作区密钥？',
      options: ['为了加密', '评估器在 LangSmith 自己的服务器上调模型，读不到你本机的 `.env`', '为了省钱', 'Prompt Hub 需要'],
      answer: 1,
      explain: '在 Settings → Provider secrets 里添加。就算只跑 Claude SDK 版也要放 OpenAI 的 key。',
    },
    {
      q: '情绪裁判 Version 2 相比 Version 1 改了什么？',
      options: ['换了更强的模型', '加了"结果"一块：问题没解决就给 0 分，不管语气多好', '改成每条消息打分', '去掉了评分标准'],
      answer: 1,
      explain: '人工复核发现两个"语气平静但没买成"的假正面。没有负面词不代表体验好。',
    },
    {
      q: 'Bug 2 的破案线索是什么？',
      options: ['模型报错了', '加了蒜香面包结后 `order_subtotal` 正好等于这份小食的价格', '订单号重复', '配送地址错了'],
      answer: 1,
      explain: '起送价的小计只算了小食，披萨没算进去。修复是改用 `db.order_summary(order)["subtotal"]`。',
    },
    {
      q: '网页前端想让用户点赞，又不能暴露 API Key，应该用？',
      options: ['把 API Key 写进前端', '`create_presigned_feedback_token` 生成的预签名链接', '让用户自己登录 LangSmith', '在线评估器'],
      answer: 1,
      explain: '预签名链接不需要密钥，还可以配合预生成的 `run_id` 在 run 产生之前就生成。',
    },
  ],
}
