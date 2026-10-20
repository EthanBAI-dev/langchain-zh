# LangChain 中文学堂 · 互动学习站

把仓库根目录 `content/` 里的中文教程渲染成一个可以互动学习的静态网站（VitePress）。

## 有什么

- **教程正文**：直接读取 `content/*.md`，中文文件名自动映射成短网址（`/learn/ch01` …），图片原样复制。
- **每章小测验**：章末自动出现，提交后逐题解析，成绩记在浏览器里。题库在 `docs/.vitepress/theme/data/quizzes.ts`。
- **学习进度**：章末“标记本章已完成”，首页和 `/progress` 汇总进度、测验成绩、剩余时长。
- **互动实验室**：ReAct 循环模拟器、Reducer / `add_messages` 实验台、术语记忆卡片（术语从附录表格自动抽取）。
- **中文全文搜索**：本地搜索 + `Intl.Segmenter` 中文分词。

## 本地运行

```bash
cd site
npm ci
npm run dev        # 开发预览，自动从 ../content 生成页面
npm run build      # 产物在 docs/.vitepress/dist
```

部署到 GitHub Pages 时需要设置 `BASE=/<仓库名>/`，`.github/workflows/deploy-site.yml` 已经配好：在仓库 Settings → Pages 里把 Source 选成 “GitHub Actions” 即可。

## 目录

```
site/
├─ scripts/prepare.mjs          content/ → docs/learn/（生成，不入库）
└─ docs/
   ├─ index.md                  首页
   ├─ progress.md               我的进度
   ├─ lab/                      互动实验室三个页面
   └─ .vitepress/
      ├─ config.mts             导航、侧边栏、搜索
      ├─ chapters.json          章节清单（标题、分组、预计时长）
      └─ theme/                 组件、题库、样式
```

新增一章时：在 `content/` 放好 Markdown，再在 `chapters.json` 加一行，`quizzes.ts` 里补上题目即可。
