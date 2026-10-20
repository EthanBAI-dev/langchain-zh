# LangChain 小白图解 · 小红书 / 抖音图文

把《LangChain Academy 中文图文教程》里最核心的 12 个概念，改写成手机上一屏能看懂的图文卡片。阅读难度比教程低很多：多用比喻，少讲 API 细节，每张卡只讲一件事。

| 篇 | 主题 | 张数 |
|---|---|---|
| EP.01 | 一张图看懂 LangChain 全家桶 | 7 |
| EP.02 | ChatGPT 会聊天，Agent 会干活 | 6 |
| EP.03 | ReAct 循环：想 → 做 → 看 | 6 |
| EP.04 | 10 来行代码造一个 Agent | 7 |
| EP.05 | 工具：写给 AI 的说明书 | 6 |
| EP.06 | MCP：AI 界的 USB-C 接口 | 6 |
| EP.07 | 短期记忆：为什么 AI 记不住上一句 | 7 |
| EP.08 | 结构化输出：让 AI 交表格 | 6 |
| EP.09 | 流式输出：别让用户干等 | 5 |
| EP.10 | 中间件：给 Agent 装插件 | 7 |
| EP.11 | Deep Agents 的三件法宝 | 7 |
| EP.12 | LangSmith：Agent 的行车记录仪 | 6 |

## 目录结构

```
images/<编号-主题>/xhs/      小红书 3:4，1080×1440
images/<编号-主题>/douyin/   抖音 9:16，1080×1920（底部留出了文案和按钮的遮挡区）
文案.md                      每篇的标题、正文、话题标签
_src/                        生成图片的源码
```

## 重新生成图片

卡片是用 HTML/CSS 写的，再用 Playwright 截图。改文字只需要编辑 `_src/posts/` 里对应的文件。

```bash
npm pack @fontsource/noto-sans-sc && tar xzf fontsource-noto-sans-sc-*.tgz   # 思源黑体（Noto Sans SC）
cd _src
FONT_DIR=$PWD/../package OUT=$PWD/../images node render.cjs        # 全部
FONT_DIR=$PWD/../package OUT=$PWD/../images node render.cjs 07     # 只生成第 7 篇
```

需要 Node 18+ 和 `playwright`（自带 Chromium）。代码字体用 JetBrains Mono，emoji 用 Noto Color Emoji，系统没装时会回退到默认字体。
