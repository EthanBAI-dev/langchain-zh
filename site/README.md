# LangChain 中文学堂 · 互动学习站

把仓库根目录 `content/` 里的中文教程渲染成一个可以互动学习的静态网站（VitePress）。

## 有什么

- **教程正文**：直接读取 `content/*.md`，中文文件名自动映射成短网址（`/learn/ch01` …），图片原样复制。
- **每章小测验**：章末自动出现，提交后逐题解析，成绩记在浏览器里。题库在 `docs/.vitepress/theme/data/quizzes.ts`。
- **学习进度**：章末“标记本章已完成”，首页和 `/progress` 汇总进度、测验成绩、剩余时长。
- **互动实验室**：ReAct 循环模拟器、Reducer / `add_messages` 实验台、术语记忆卡片（术语从附录表格自动抽取）。
- **中文全文搜索**：本地搜索 + `Intl.Segmenter` 中文分词。
- **网页编辑后台**：`/admin`（[Sveltia CMS](https://sveltiacms.app/)），用 GitHub 令牌登录，在浏览器里改 `content/` 的章节，保存即提交到 `main`，网站自动重新部署。

## 编辑后台怎么用

1. **第一次：生成令牌**。打开 GitHub 的 [Fine-grained token 页面](https://github.com/settings/personal-access-tokens/new)，
   Repository access 选 “Only select repositories” → `langchain-zh`，
   Permissions 里把 **Contents** 设成 **Read and write**，生成后复制令牌（只显示一次）。
2. 打开学习站地址后面加 `/admin/`（例如 `https://ethanbai-dev.github.io/langchain-zh/admin/`），
   点“使用访问令牌登录”，粘贴令牌。同一台浏览器之后会记住登录。
3. 左边选章节，左栏改 Markdown、右栏实时预览，点右上角“保存”。保存就是一次 Git 提交，约 2 分钟后网站更新。
4. 打开过后台的浏览器，章节页右上角会多一个“编辑本页”按钮，直接跳到这一章的编辑界面。

- 编辑器默认是 Markdown 原文模式，最不容易把格式弄乱；工具栏里可以切到可视化模式。
- 上传的图片放在 `content/assets/uploads/`。
- 后台的章节列表由 `scripts/prepare.mjs` 根据 `chapters.json` 生成到 `docs/public/admin/config.yml`，新增章节不用另外改后台。

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
├─ scripts/prepare.mjs          content/ → docs/learn/，并生成后台配置（都不入库）
└─ docs/
   ├─ public/admin/index.html   编辑后台入口
   ├─ index.md                  首页
   ├─ progress.md               我的进度
   ├─ lab/                      互动实验室三个页面
   └─ .vitepress/
      ├─ config.mts             导航、侧边栏、搜索
      ├─ chapters.json          章节清单（标题、分组、预计时长）
      └─ theme/                 组件、题库、样式
```

新增一章时：在 `content/` 放好 Markdown，再在 `chapters.json` 加一行，`quizzes.ts` 里补上题目即可。
