// 把 content/ 里的教程 Markdown 转成站点页面：docs/learn/*.md
// - 中文文件名 → 短 slug（ch01.md …），并改写章节间的相对链接
// - 复制图片资源
// - 从附录术语表抽取 glossary.json，供"术语卡片"页使用
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// 教程正文在仓库根目录的 content/（由教程维护，站点只读不改）
const src = path.resolve(root, process.env.CONTENT_DIR || '../content')
const out = path.join(root, 'docs', 'learn')
const chapters = JSON.parse(fs.readFileSync(path.join(root, 'docs/.vitepress/chapters.json'), 'utf8'))

const slugOf = new Map(chapters.map((c) => [c.file, c.slug]))
slugOf.set('README.md', 'index')

fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })

// 章节间链接：(01-xxx.md) / (01-xxx.md#锚点) → (./ch01.md#锚点)
const linkRe = /\]\(([^)\s#]+\.md)(#[^)\s]*)?\)/g
function rewriteLinks(md, from) {
  return md.replace(linkRe, (all, target, hash = '') => {
    const slug = slugOf.get(decodeURIComponent(target))
    if (!slug) {
      console.warn(`  ! ${from}: 未识别的链接 ${target}`)
      return all
    }
    return `](./${slug}.md${hash})`
  })
}

// Vue 会把正文里的 {{ }} 当插值；代码块之外的统一包 v-pre
function guardMustache(md) {
  return md.replace(/^(?!\s*```)(.*\{\{.*)$/gm, '<span v-pre>$1</span>')
}

// 静态示意图已改成矢量 SVG；正文里如果还写着 .png（比如别的分支新加的引用），自动换成 .svg
function preferSvg(md) {
  return md.replace(/(assets\/figures\/[\w-]+)\.png/g, (all, base) =>
    !fs.existsSync(path.join(src, base + '.png')) && fs.existsSync(path.join(src, base + '.svg')) ? base + '.svg' : all)
}

// 路线图抽屉要用：每章的"本章目标"和二级标题（锚点算法与 VitePress 一致）
const slugify = (str) => str.normalize('NFKD').replace(/[\u0300-\u036F]/g, '').replace(/[\u0000-\u001f]/g, '')
  .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '')
  .replace(/^(\d)/, '_$1').toLowerCase()
const plain = (s) => s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`*]/g, '').replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, '').trim()
const outline = {}

for (const [file, slug] of slugOf) {
  const p = path.join(src, file)
  if (!fs.existsSync(p)) {
    console.warn(`  ! 缺少 ${file}`)
    continue
  }
  let md = fs.readFileSync(p, 'utf8')
  if (slug !== 'index') {
    const goal = md.match(/^>\s*\*\*本章目标\*\*[：:]\s*(.+)$/m)
    let inFence = false
    const sections = []
    for (const line of md.split('\n')) {
      if (/^\s*```/.test(line)) inFence = !inFence
      const h = !inFence && line.match(/^## (.+)$/)
      if (h) sections.push({ title: plain(h[1]), anchor: slugify(plain(h[1])) })
    }
    outline[slug] = { goal: goal ? plain(goal[1]) : '', sections }
  }
  md = rewriteLinks(md, file)
  md = preferSvg(md)
  md = guardMustache(md)
  const fm = slug === 'index' ? '---\ntitle: 总导读\n---\n\n' : `---\nchapter: ${slug}\n---\n\n`
  fs.writeFileSync(path.join(out, `${slug}.md`), fm + md)
}

// 图片：只复制成品图，不复制作图源码
for (const dir of ['figures', 'course']) {
  fs.cpSync(path.join(src, 'assets', dir), path.join(out, 'assets', dir), { recursive: true })
}

// 术语表：附录里 "| 中文 | 英文 | 解释 | 首次出现 |" 这张表
const appendix = fs.readFileSync(path.join(src, '附录-速查表与术语表.md'), 'utf8')
const glossary = []
let inTable = false
for (const line of appendix.split('\n')) {
  if (/^\|\s*中文\s*\|\s*英文\s*\|/.test(line)) { inTable = true; continue }
  if (!inTable) continue
  if (!line.startsWith('|')) { if (glossary.length) break; continue }
  const cells = line.split('|').slice(1, -1).map((s) => s.trim())
  if (cells.every((c) => /^-+$/.test(c))) continue
  const [zh, en, desc, first] = cells
  glossary.push({ zh, en, desc: desc.replace(/`/g, ''), first })
}
fs.writeFileSync(path.join(root, 'docs/.vitepress/theme/data/outline.json'), JSON.stringify(outline, null, 2))
fs.writeFileSync(path.join(root, 'docs/.vitepress/theme/data/glossary.json'), JSON.stringify(glossary, null, 2))

console.log(`✓ 已生成 ${slugOf.size} 个页面，术语 ${glossary.length} 条`)
