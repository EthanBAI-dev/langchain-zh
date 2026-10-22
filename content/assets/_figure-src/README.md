# 图示源码

每张图 = `specs/<名字>.js` 里的一份描述（节点、边、面板、关键帧），由 `render.cjs` 用 Chromium 渲染：

- 静态图 → `out/<名字>.svg`：先打印成 PDF，再用 `pdftocairo` 转成矢量 SVG，文字变成路径，放大不糊、不依赖字体
- 带 `frames` 的图 → `out/<名字>.gif`（关键帧之间自动生成平滑过渡，2 倍清晰度、不抖动，文字边缘干净）

```bash
npm install            # 需要 ffmpeg、pdftocairo（poppler-utils）和 Playwright 的 Chromium
node render.cjs        # 渲染全部
node render.cjs react_loop ecosystem   # 只渲染指定的图
```

视觉规范：思源黑体（Noto Sans SC）+ Inter，图标来自 Lucide；节点标签开头的 emoji 会自动换成对应的线性图标。

渲染完把 `out/` 里的文件复制到 `../figures/`。
