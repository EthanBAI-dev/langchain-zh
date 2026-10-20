// 用法：
//   npm i @fontsource/noto-sans-sc   （字体，放在任意目录）
//   FONT_DIR=<.../node_modules/@fontsource/noto-sans-sc> OUT=<输出目录> \
//   NODE_PATH=/opt/node22/lib/node_modules node render.cjs [帖子编号 ...]
// 每张卡同时输出两种尺寸：xhs/ 是小红书 3:4（1080×1440），douyin/ 是抖音 9:16（1080×1920）。
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const FONT_DIR = process.env.FONT_DIR;
const OUT = process.env.OUT || path.join(DIR, '..', 'out');
const SIZES = [
  { dir: 'xhs', cls: 'r34', h: 1440 },
  { dir: 'douyin', cls: 'r916', h: 1920 },
];

const fontLinks = FONT_DIR
  ? [400, 500, 600, 700, 800, 900].map((w) => `<link rel="stylesheet" href="file://${FONT_DIR}/${w}.css">`).join('')
  : '';
const css = fs.readFileSync(path.join(DIR, 'style.css'), 'utf8');

function page(post, card, i, n, size) {
  const t = post.theme;
  const dots = Array.from({ length: n }, (_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8">${fontLinks}<style>${css}</style></head>
<body><div class="card ${size.cls} ${card.kind}" style="--accent:${t.accent};--soft:${t.soft};--deep:${t.deep};--hl:${t.hl}">
  <div class="bgfx"></div>
  <div class="top"><div class="series"><span class="logo">🦜</span>LangChain 小白图解</div><div class="ep">EP.${post.id}</div></div>
  <div class="main">${card.html}</div>
  <div class="foot"><div class="dots">${dots}</div><div class="hint">${i < n - 1 ? '左滑继续 →' : '完'}</div></div>
</div></body></html>`;
}

(async () => {
  const want = process.argv.slice(2);
  const files = fs.readdirSync(path.join(DIR, 'posts')).filter((f) => f.endsWith('.js')).sort()
    .filter((f) => !want.length || want.some((w) => f.startsWith(w)));
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'cards-'));
  for (const f of files) {
    delete require.cache[require.resolve(path.join(DIR, 'posts', f))];
    const post = require(path.join(DIR, 'posts', f));
    const base = path.join(OUT, `${post.id}-${post.slug}`);
    for (const size of SIZES) {
      fs.rmSync(path.join(base, size.dir), { recursive: true, force: true });
      fs.mkdirSync(path.join(base, size.dir), { recursive: true });
      const pg = await browser.newPage({ viewport: { width: 1080, height: size.h }, deviceScaleFactor: 1 });
      for (let i = 0; i < post.cards.length; i++) {
        const file = path.join(tmp, 'c.html');
        fs.writeFileSync(file, page(post, post.cards[i], i, post.cards.length, size));
        await pg.goto('file://' + file);
        await pg.evaluate(() => document.fonts.ready);
        await pg.waitForTimeout(150);
        // 代码行太长时逐步缩小字号，直到每行都放得下
        await pg.evaluate(() => {
          for (const b of document.querySelectorAll('.cbody')) {
            let fs = parseFloat(getComputedStyle(b).fontSize);
            const tooWide = () => [...b.querySelectorAll('.cl')].some((l) => l.scrollWidth > l.clientWidth + 1);
            while (tooWide() && fs > 20) b.style.fontSize = (fs -= 1) + 'px';
          }
        });
        // 内容溢出时提示，方便调整文案
        const over = await pg.evaluate(() => {
          const m = document.querySelector('.main');
          const r = m.getBoundingClientRect();
          let lo = Infinity, hi = -Infinity;
          for (const el of m.querySelectorAll('*')) { const b = el.getBoundingClientRect(); if (b.height) { lo = Math.min(lo, b.top); hi = Math.max(hi, b.bottom); } }
          return Math.max(r.top - lo, hi - r.bottom);
        });
        if (over > 2) console.warn(`  ! ${post.id} 第${i + 1}张 ${size.dir} 溢出 ${over}px`);
        await pg.screenshot({ path: path.join(base, size.dir, `${String(i + 1).padStart(2, '0')}.png`) });
      }
      await pg.close();
    }
    console.log(`✓ ${post.id}-${post.slug}  ${post.cards.length} 张`);
  }
  await browser.close();
})();
