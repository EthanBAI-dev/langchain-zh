// Usage: npm install && node render.cjs [name ...]   (outputs to ./out)
// Static specs -> PNG @2x; specs with frames -> GIF with eased transitions between keyframes.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = __dirname;
const FONT = 'node_modules/@fontsource/noto-sans-sc';
const ICON_DIR = path.join(DIR, 'node_modules/lucide-static/icons');
const GIF_SCALE = 1.5;
const STEP_MS = 40;

const CSS = `
html,body{margin:0;background:#F8FAFC}
body{font-family:Inter,"Noto Sans SC",sans-serif;-webkit-font-smoothing:antialiased}
.title{font-size:27px;font-weight:700;color:#0F172A;line-height:48px;letter-spacing:.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.title code{font-size:23px}
.ic{display:inline-block;vertical-align:-3px;flex:none}
.nbox{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4px 10px;box-sizing:border-box}
.nrow{display:flex;align-items:center;justify-content:center;gap:8px}
.badge{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;flex:none}
.nlabel{font-size:17px;font-weight:700;line-height:1.35}
.nlabel.mono{font-family:"JetBrains Mono","Noto Sans SC",monospace;font-size:15px;font-weight:600}
.nlabel.pill{font-size:15px;letter-spacing:1px;font-weight:700}
.nsub{font-size:13px;color:#64748B;line-height:1.5;margin-top:3px;font-weight:400}
.nsub code,.nlabel code{font-size:12px}
.glabel{font-size:14px;font-weight:700;line-height:20px;white-space:nowrap}
.elabel{font-size:12.5px;font-family:"JetBrains Mono","Noto Sans SC",monospace;font-weight:500}
.free{font-size:15px;fill:#334155;font-family:Inter,"Noto Sans SC",sans-serif}
.big{font-size:20px;fill:#0F172A;font-weight:700;font-family:Inter,"Noto Sans SC",sans-serif}
.tok{font-size:13px;fill:#C2410C;font-weight:700}
.panel{box-sizing:border-box;border:1.5px solid #E2E8F0;border-radius:14px;background:#fff;font-size:14px;color:#1E293B;overflow:hidden}
.ptitle{display:flex;align-items:center;gap:10px;font-weight:600;color:#334155;font-size:13.5px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;padding:8px 12px}
.ptitle .dots{display:inline-flex;gap:5px}
.ptitle .dots i{width:9px;height:9px;border-radius:50%;background:#CBD5E1;display:block}
.ptitle .dots i:nth-child(1){background:#F87171}.ptitle .dots i:nth-child(2){background:#FBBF24}.ptitle .dots i:nth-child(3){background:#34D399}
.pbody{padding:8px 12px}
.monop .pbody{font-family:"JetBrains Mono","Noto Sans SC",monospace;font-size:13px}
.ln{line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere;border-radius:5px;padding:0 6px;margin:0 -6px}
.ln.add{background:#ECFDF5;color:#065F46;box-shadow:inset 3px 0 0 #10B981}
.ln.del{color:#B91C1C;text-decoration:line-through;opacity:.75;background:#FEF2F2}
.ln.bold{font-weight:700;background:#FFF7ED;box-shadow:inset 3px 0 0 #F97316}
.ln.head{font-weight:700;color:#1D4ED8}
.ln.muted{color:#94A3B8}
.ln .ic{margin-right:2px}
code{font-family:"JetBrains Mono",monospace;background:#F1F5F9;border-radius:5px;padding:1px 5px;color:#BE185D;font-size:.92em}
.cap{box-sizing:border-box;height:100%;display:flex;align-items:center;gap:14px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;padding:0 20px;box-shadow:0 6px 18px rgba(15,23,42,.06)}
.cap .num{flex:none;width:34px;height:34px;border-radius:50%;background:#F97316;color:#fff;font-weight:700;font-size:17px;display:flex;align-items:center;justify-content:center}
.cap .num.info{background:#0F172A}
.ctext{font-size:17px;color:#1E293B;line-height:1.45;font-weight:500}
.ctext b{color:#C2410C}
.ctext code{font-size:15px}
`;

function iconMap() {
  const map = {};
  for (const f of fs.readdirSync(ICON_DIR)) {
    if (!f.endsWith('.svg')) continue;
    const src = fs.readFileSync(path.join(ICON_DIR, f), 'utf8');
    map[f.slice(0, -4)] = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  }
  return map;
}

(async () => {
  const names = process.argv.slice(2).length
    ? process.argv.slice(2)
    : fs.readdirSync(path.join(DIR, 'specs')).filter((f) => f.endsWith('.js')).map((f) => f.replace(/\.js$/, ''));
  const icons = iconMap();
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  const lib = fs.readFileSync(path.join(DIR, 'lib.js'), 'utf8');
  const html = `<!doctype html><html><head><meta charset="utf-8">
    <link rel="stylesheet" href="${FONT}/400.css"><link rel="stylesheet" href="${FONT}/500.css"><link rel="stylesheet" href="${FONT}/700.css">
    <style>${CSS}</style></head><body><div id="root"></div></body></html>`;
  const pagePath = path.join(DIR, '.page.html');
  fs.writeFileSync(pagePath, html);
  fs.mkdirSync(path.join(DIR, 'out'), { recursive: true });

  for (const name of names) {
    delete require.cache[require.resolve(path.join(DIR, 'specs', name + '.js'))];
    const spec = require(path.join(DIR, 'specs', name + '.js'));
    const animated = spec.frames && spec.frames.length > 1;
    const page = await browser.newPage({ deviceScaleFactor: animated ? GIF_SCALE : 2 });
    await page.goto('file://' + pagePath);
    await page.evaluate(([spec, icons, lib]) => {
      window.SPEC = spec; window.ICONS = icons;
      const s = document.createElement('script'); s.textContent = lib; document.body.appendChild(s);
    }, [spec, icons, lib]);
    // warm up every glyph so the font subsets are loaded before capture
    const n = (await page.evaluate(() => window.renderFrame(0, 1))).n;
    await page.evaluate((n) => { let h = ''; for (let i = 0; i < n; i++) { window.renderFrame(i, 1); h += document.getElementById('root').innerHTML; } document.body.insertAdjacentHTML('beforeend', `<div id="warm" style="position:absolute;left:-99999px">${h}</div>`); }, n);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.evaluate(() => document.getElementById('warm').remove());

    const fdir = path.join(DIR, 'frames', name);
    fs.rmSync(fdir, { recursive: true, force: true });
    fs.mkdirSync(fdir, { recursive: true });
    const seq = [];
    let k = 0;
    const shot = async (fi, p, dur) => {
      await page.evaluate(([fi, p]) => window.renderFrame(fi, p), [fi, p]);
      const file = path.join(fdir, `f${String(k++).padStart(4, '0')}.png`);
      await (await page.$('#root svg')).screenshot({ path: file });
      seq.push([file, dur]);
    };
    if (!animated) {
      await shot(0, 1, 0);
      fs.copyFileSync(seq[0][0], path.join(DIR, 'out', name + '.png'));
      console.log('png', name);
      await page.close();
      continue;
    }
    for (let fi = 0; fi < n; fi++) {
      const info = await page.evaluate((fi) => window.renderFrame(fi, 1), fi);
      if (fi > 0) {
        const steps = info.tokens ? 18 : 9;
        for (let i = 1; i < steps; i++) await shot(fi, i / steps, STEP_MS);
      }
      await shot(fi, 1, info.dur);
    }
    await page.close();
    let list = '';
    for (const [file, dur] of seq) list += `file '${file}'\nduration ${(dur / 1000).toFixed(3)}\n`;
    list += `file '${seq[seq.length - 1][0]}'\n`;
    fs.writeFileSync(path.join(fdir, 'list.txt'), list);
    const out = path.join(DIR, 'out', name + '.gif');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(fdir, 'list.txt'),
      '-vf', 'split[a][b];[a]palettegen=max_colors=192:stats_mode=full:reserve_transparent=0[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
      '-loop', '0', out]);
    console.log('gif', name, seq.length, 'frames', (fs.statSync(out).size / 1024).toFixed(0) + 'KB');
  }
  await browser.close();
})();
