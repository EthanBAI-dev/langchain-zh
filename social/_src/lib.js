// 卡片组件库：每个函数返回一段 HTML 字符串，由 render.cjs 拼成整页再截图。
'use strict';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 文本里允许少量内联标记：**粗体**、==高亮==、`代码`、\n 换行
function rich(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/==([^=]+)==/g, '<mark>$1</mark>')
    .replace(/\n/g, '<br>');
}

// ---------- Python 代码高亮（够用就行） ----------
const KW = new Set(['from', 'import', 'def', 'return', 'class', 'for', 'in', 'if', 'else', 'await', 'async', 'with', 'as', 'True', 'False', 'None', 'print']);
function hlPy(line) {
  const out = [];
  const re = /(#.*$)|("""[^]*?"""|"[^"]*"|'[^']*'|f"[^"]*")|(@\w+)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)|(\s+)|(.)/g;
  let m;
  let prev = '';
  while ((m = re.exec(line))) {
    const [t, com, str, deco, num, word, ws] = m;
    if (com) out.push(`<span class="c">${esc(com)}</span>`);
    else if (str) out.push(`<span class="s">${esc(str)}</span>`);
    else if (deco) out.push(`<span class="d">${esc(deco)}</span>`);
    else if (num) out.push(`<span class="n">${esc(num)}</span>`);
    else if (word) {
      if (KW.has(word)) out.push(`<span class="k">${word}</span>`);
      else if (prev === 'def' || prev === 'class') out.push(`<span class="f">${word}</span>`);
      else if (/^[A-Z]/.test(word)) out.push(`<span class="t">${word}</span>`);
      else if (line.slice(re.lastIndex).startsWith('(')) out.push(`<span class="f">${word}</span>`);
      else out.push(esc(word));
      prev = word;
      continue;
    } else out.push(esc(t));
    if (!ws) prev = '';
  }
  return out.join('');
}

// code(lines, {title, mark:[行号], notes:{行号:'说明'}})
function code(src, opt = {}) {
  const lines = src.replace(/^\n|\n$/g, '').split('\n');
  const marks = new Set(opt.mark || []);
  const notes = opt.notes || {};
  const rows = lines.map((l, i) => {
    const n = i + 1;
    const note = notes[n] ? `<span class="cnote">${rich(notes[n])}</span>` : '';
    return `<div class="cl${marks.has(n) ? ' on' : ''}"><span class="ct">${hlPy(l) || '&nbsp;'}</span>${note}</div>`;
  });
  return `<div class="code${opt.small ? ' small' : ''}">
    <div class="cbar"><i></i><i></i><i></i><span>${esc(opt.title || 'main.py')}</span></div>
    <div class="cbody">${rows.join('')}</div></div>`;
}

// ---------- 版式组件 ----------
const h = (title, sub) => `<div class="h"><h2>${rich(title)}</h2>${sub ? `<p class="hsub">${rich(sub)}</p>` : ''}</div>`;
const p = (s, cls = '') => `<p class="para ${cls}">${rich(s)}</p>`;
const tip = (s, icon = '💡') => `<div class="tip"><span class="ti">${icon}</span><div>${rich(s)}</div></div>`;
const warn = (s) => `<div class="tip warn"><span class="ti">⚠️</span><div>${rich(s)}</div></div>`;
const stack = (...parts) => `<div class="stack">${parts.join('')}</div>`;
const row = (...parts) => `<div class="row">${parts.join('')}</div>`;

// 大号图标 + 名字 + 一句话，竖排
const tile = (emo, name, desc, cls = '') =>
  `<div class="tile ${cls}"><div class="temo">${emo}</div><div class="tname">${rich(name)}</div>${desc ? `<div class="tdesc">${rich(desc)}</div>` : ''}</div>`;
const grid = (items, cols = 2) => `<div class="grid c${cols}">${items.join('')}</div>`;

// 横向条目：左侧圆形图标，右侧标题 + 说明
const item = (emo, title, desc, cls = '') =>
  `<div class="item ${cls}"><div class="iemo">${emo}</div><div class="ibody"><div class="ititle">${rich(title)}</div>${desc ? `<div class="idesc">${rich(desc)}</div>` : ''}</div></div>`;
const list = (items) => `<div class="list">${items.join('')}</div>`;

// 竖向流程：每步之间画箭头
function flow(steps, opt = {}) {
  return `<div class="flow${opt.compact ? ' compact' : ''}">${steps
    .map((s, i) => {
      const [emo, title, desc, cls] = s;
      const arrow = i < steps.length - 1 ? `<div class="farrow">${opt.arrows && opt.arrows[i] ? `<span>${rich(opt.arrows[i])}</span>` : ''}</div>` : '';
      return `<div class="fstep ${cls || ''}"><div class="fnum">${emo}</div><div class="fbody"><div class="ftitle">${rich(title)}</div>${desc ? `<div class="fdesc">${rich(desc)}</div>` : ''}</div></div>${arrow}`;
    })
    .join('')}</div>`;
}

// 左右对比
// 已是 HTML 的片段里只替换 ==高亮== 和 **粗体**
const md = (s) => s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/==([^=]+)==/g, '<mark>$1</mark>');
const vs = (l, r) => `<div class="vs">
  <div class="vcol bad"><div class="vhead">${l.icon || '😵'} ${rich(l.title)}</div><div class="vbody">${md(l.body)}</div></div>
  <div class="vmid">VS</div>
  <div class="vcol good"><div class="vhead">${r.icon || '😎'} ${rich(r.title)}</div><div class="vbody">${md(r.body)}</div></div></div>`;

// 聊天气泡：who = user | ai | tool | sys
const bubble = (who, text, label) => {
  const av = { user: '🙋', ai: '🤖', tool: '🛠️', sys: '📜', human: '🧑‍💼' }[who] || who;
  return `<div class="bub ${who}"><div class="bav">${av}</div><div class="bwrap">${label ? `<div class="blabel">${rich(label)}</div>` : ''}<div class="btext">${rich(text)}</div></div></div>`;
};
const chat = (...b) => `<div class="chat">${b.join('')}</div>`;

// 类比：左边 = 右边
const eq = (pairs) => `<div class="eqs">${pairs
  .map(([a, b, ea, eb]) => `<div class="eq"><div class="ea"><span>${ea || ''}</span>${rich(a)}</div><div class="eqsign">=</div><div class="eb"><span>${eb || ''}</span>${rich(b)}</div></div>`)
  .join('')}</div>`;

// 检查清单（总结卡）
const checks = (items) => `<div class="checks">${items.map((s) => `<div class="chk"><span>✓</span><div>${rich(s)}</div></div>`).join('')}</div>`;

// 小标签
const chips = (arr) => `<div class="chips">${arr.map((c) => `<span>${rich(c)}</span>`).join('')}</div>`;

// 一张"便签纸"
const note = (inner, cls = '') => `<div class="paper ${cls}">${inner}</div>`;

// JSON / 纯文本结果块
const result = (title, lines, cls = '') =>
  `<div class="result ${cls}"><div class="rtitle">${rich(title)}</div>${lines.map((l) => `<div class="rl">${rich(l)}</div>`).join('')}</div>`;

// ---------- 整卡模板 ----------
// cover({kicker, title, sub, art, tags})
const cover = (o) => ({
  kind: 'cover',
  html: `<div class="cov">
    <div class="ckicker">${rich(o.kicker)}</div>
    <h1${o.size ? ` style="font-size:${o.size}px"` : ''}>${rich(o.title)}</h1>
    ${o.sub ? `<div class="csub">${rich(o.sub)}</div>` : ''}
    <div class="cart">${o.art || ''}</div>
    ${o.tags ? chips(o.tags) : ''}
  </div>`,
});

// 普通内容卡
// 手写 HTML 片段里的 ==高亮== 也一并处理
const card = (...parts) => ({ kind: 'body', html: md(parts.join('')) });

// 结尾卡
const outro = (o) => ({
  kind: 'outro',
  html: `<div class="out">
    ${h(o.title || '一张卡复习', o.sub)}
    ${o.body}
    <div class="next"><div class="nlab">下一篇</div><div class="ntit">${rich(o.next)}</div></div>
    <div class="cta">👍 点赞收藏不迷路 · 有问题评论区见</div>
  </div>`,
});

module.exports = { esc, rich, code, h, p, tip, warn, stack, row, tile, grid, item, list, flow, vs, bubble, chat, eq, checks, chips, note, result, cover, card, outro };
