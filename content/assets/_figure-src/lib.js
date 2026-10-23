// Diagram renderer v2: spec -> SVG frame. Runs in the browser page created by render.cjs.
// renderFrame(fi, p): keyframe fi, p = transition progress (0..1) from keyframe fi-1.

const PAL = {
  llm: { c: '#2563EB', bg: '#EFF6FF', icon: 'sparkles' },
  tool: { c: '#D97706', bg: '#FFFBEB', icon: 'wrench' },
  node: { c: '#7C3AED', bg: '#F5F3FF' },
  store: { c: '#0D9488', bg: '#F0FDFA', icon: 'database' },
  human: { c: '#DB2777', bg: '#FDF2F8' },
  note: { c: '#CA8A04', bg: '#FEFCE8', icon: 'lightbulb' },
  plain: { c: '#64748B', bg: '#FFFFFF' },
  start: { c: '#059669', bg: '#ECFDF5', icon: 'play' },
  end: { c: '#334155', bg: '#F1F5F9', icon: 'flag' },
  group: { c: '#94A3B8', bg: 'rgba(241,245,249,0.6)' },
};
// legacy pastel group fills -> palette tints
const TINT = {
  '227,242,253': ['#EFF6FF', '#93C5FD', '#1D4ED8'],
  '243,229,245': ['#F5F3FF', '#C4B5FD', '#6D28D9'],
  '224,242,241': ['#F0FDFA', '#5EEAD4', '#0F766E'],
  '252,228,236': ['#FDF2F8', '#F9A8D4', '#BE185D'],
  '255,243,224': ['#FFFBEB', '#FCD34D', '#B45309'],
};
const EMOJI = {
  '🤖': 'bot', '🧑': 'user', '🔧': 'wrench', '⏳': 'hourglass', '🧠': 'brain', '📁': 'folder',
  '✅': 'circle-check', '🔄': 'refresh-cw', '📄': 'file-text', '👥': 'users', '📝': 'notebook-pen',
  '⏸': 'circle-pause', '🗂': 'folder-tree', '⛔': 'octagon-x', '🔎': 'search', '🧰': 'toolbox',
  '🎨': 'palette', '🚀': 'rocket', '🔭': 'telescope', '⏰': 'alarm-clock', '🗄': 'database',
  '💻': 'code-xml', '🔒': 'lock-keyhole', '📦': 'package', '🐍': 'square-terminal',
};
const EMOJI_COLOR = {
  bot: '#2563EB', user: '#DB2777', wrench: '#D97706', 'circle-check': '#059669', 'octagon-x': '#DC2626',
  hourglass: '#64748B', 'circle-pause': '#DC2626', 'alarm-clock': '#D97706',
};
const ACC = '#F97316';
const EDGE = '#94A3B8';
const TOP = 84;
const CAP_H = 76;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function icon(name, color, size) {
  const body = (window.ICONS || {})[name];
  if (!body) return '';
  return `<svg class="ic" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

// pull a leading emoji off a label -> [iconName|null, rest]
function splitEmoji(text) {
  const m = String(text).match(/^\s*([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{231A}-\u{23FF}])️?\s*/u);
  if (m && EMOJI[m[1]]) return [EMOJI[m[1]], String(text).slice(m[0].length)];
  return [null, String(text)];
}

// inline emoji anywhere in rich text -> icon chips
function inlineIcons(html, size) {
  return html.replace(/([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{231A}-\u{23FF}])️?/gu, (m, e) => {
    const n = EMOJI[e];
    return n ? icon(n, EMOJI_COLOR[n] || '#475569', size) : m;
  });
}

function fmt(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');
}

function center(n) { return [n.x + n.w / 2, n.y + n.h / 2]; }
function sidePoint(n, side) {
  const [cx, cy] = center(n);
  if (side === 't') return [cx, n.y];
  if (side === 'b') return [cx, n.y + n.h];
  if (side === 'l') return [n.x, cy];
  if (side === 'r') return [n.x + n.w, cy];
  if (Array.isArray(side)) return [n.x + n.w * side[0], n.y + n.h * side[1]];
  return null;
}
function borderPoint(n, px, py) {
  const [cx, cy] = center(n);
  const dx = px - cx, dy = py - cy;
  if (dx === 0 && dy === 0) return [cx, cy];
  const s = Math.min((n.w / 2) / Math.abs(dx || 1e-9), (n.h / 2) / Math.abs(dy || 1e-9));
  return [cx + dx * s, cy + dy * s];
}
function edgePoints(spec, e) {
  const a = spec._nodes[e.from], b = spec._nodes[e.to];
  const via = e.via || [];
  const ft = via.length ? via[0] : center(b);
  const ls = via.length ? via[via.length - 1] : center(a);
  const p0 = sidePoint(a, e.fs) || borderPoint(a, ft[0], ft[1]);
  const p1 = sidePoint(b, e.ts) || borderPoint(b, ls[0], ls[1]);
  return [p0, ...via, p1];
}
function pathLen(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
function pointAt(pts, t) {
  let target = pathLen(pts) * Math.max(0, Math.min(1, t));
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (target <= seg) {
      const r = seg ? target / seg : 0;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * r, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * r];
    }
    target -= seg;
  }
  return pts[pts.length - 1];
}
// polyline with rounded corners
function roundedPath(pts, r) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(x - px, y - py), l2 = Math.hypot(nx - x, ny - y);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const ax = x - ((x - px) / l1) * rr, ay = y - ((y - py) / l1) * rr;
    const bx = x + ((nx - x) / l2) * rr, by = y + ((ny - y) / l2) * rr;
    d += ` L${ax.toFixed(1)},${ay.toFixed(1)} Q${x},${y} ${bx.toFixed(1)},${by.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L${last[0].toFixed(1)},${last[1].toFixed(1)}`;
}

function edgeId(e) { return e.id || `${e.from}->${e.to}`; }

// visual state of every element for one keyframe: { op, on }
function frameState(spec, f) {
  const hl = new Set(f.hl || []);
  const hidden = new Set(f.hide || []);
  const dim = hl.size > 0 && f.dim !== false && spec.dim !== false;
  const st = {};
  const set = (id, base) => {
    const on = hl.has(id) ? 1 : 0;
    st[id] = { on, op: hidden.has(id) ? 0 : (dim && !on ? base : 1) };
  };
  for (const g of spec.groups || []) set(g.id, 1);
  for (const n of spec.nodes || []) set(n.id, 0.42);
  for (const e of spec.edges || []) set(edgeId(e), 0.3);
  for (const p of spec.panels || []) set(p.id, 1);
  return st;
}

function richLines(text, p) {
  return String(text).split('\n').map((ln) => {
    let cls = '', body = ln;
    const tags = { '+ ': 'add', '- ': 'del', '> ': 'bold', '# ': 'head', '~ ': 'muted' };
    const k = Object.keys(tags).find((t) => ln.startsWith(t));
    if (k) { cls = tags[k]; body = ln.slice(2); }
    const style = cls === 'add' ? ` style="opacity:${(0.15 + 0.85 * p).toFixed(2)};transform:translateY(${((1 - p) * 6).toFixed(1)}px)"` : '';
    return `<div class="ln ${cls}"${style}>${inlineIcons(fmt(body), 15) || '&nbsp;'}</div>`;
  }).join('');
}

function render(spec, fi, pRaw) {
  spec._nodes = {};
  for (const n of spec.nodes || []) spec._nodes[n.id] = n;
  const frames = spec.frames && spec.frames.length ? spec.frames : [{}];
  const multi = frames.length > 1;
  const f = frames[fi] || {};
  const p = ease(pRaw);
  const cur = frameState(spec, f);
  const prev = fi > 0 && pRaw < 1 ? frameState(spec, frames[fi - 1]) : cur;
  const S = (id) => {
    const a = prev[id] || { op: 1, on: 0 }, b = cur[id] || { op: 1, on: 0 };
    return { op: lerp(a.op, b.op, p), on: lerp(a.on, b.on, p) };
  };
  const W = spec.width + 80;
  const H = spec.height + TOP + (spec.noCaption ? 24 : CAP_H + 20);
  const OX = 40;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  const colors = new Set([EDGE, ACC, ...(spec.edges || []).map((e) => e.color).filter(Boolean)]);
  s += '<defs>';
  for (const c of colors) {
    const id = 'm' + c.replace('#', '');
    s += `<marker id="${id}" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M1,1.5 L10.5,6 L1,10.5 L3.5,6 z" fill="${c}"/></marker>`;
  }
  s += `<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="#E2E8F0"/></pattern>
    <filter id="card" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#0F172A" flood-opacity="0.06"/><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.07"/></filter>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.14"/></filter>
    <radialGradient id="halo"><stop offset="0" stop-color="${ACC}" stop-opacity="0.45"/><stop offset="1" stop-color="${ACC}" stop-opacity="0"/></radialGradient>
  </defs>`;
  s += `<rect width="${W}" height="${H}" fill="#F8FAFC"/><rect width="${W}" height="${H}" fill="url(#dots)"/>`;

  // header
  s += `<rect x="${OX}" y="30" width="5" height="30" rx="2.5" fill="${ACC}"/>`;
  const tw = W - OX * 2 - (multi && !spec.noStep ? 240 : 30);
  const est = [...String(spec.title || '')].reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? 1 : 0.56), 0);
  const tfs = Math.max(19, Math.min(27, Math.floor(tw / est)));
  s += `<foreignObject x="${OX + 18}" y="22" width="${tw}" height="48"><div xmlns="http://www.w3.org/1999/xhtml" class="title" style="font-size:${tfs}px">${fmt(spec.title || '')}</div></foreignObject>`;
  if (multi && !spec.noStep) {
    const n = frames.length, gap = 7, dw = 8, aw = 26;
    let x = W - OX - ((n - 1) * (dw + gap) + aw);
    for (let i = 0; i < n; i++) {
      const w = i === fi ? lerp(dw, aw, p) : (i === fi - 1 ? lerp(aw, dw, p) : dw);
      const c = i <= fi ? ACC : '#CBD5E1';
      s += `<rect x="${x.toFixed(1)}" y="41" width="${w.toFixed(1)}" height="8" rx="4" fill="${c}" opacity="${i < fi ? 0.45 : 1}"/>`;
      x += w + gap;
    }
  }

  s += `<g transform="translate(${OX},${TOP})">`;

  // groups
  for (const g of spec.groups || []) {
    const st = S(g.id);
    if (st.op <= 0.01) continue;
    const m = g.fill && g.fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    const t = m ? TINT[`${m[1]},${m[2]},${m[3]}`] : null;
    const bg = t ? t[0] : (PAL[g.kind] && g.kind !== 'group' ? PAL[g.kind].bg : '#F1F5F9');
    const bd = t ? t[1] : '#CBD5E1';
    const tc = t ? t[2] : '#475569';
    s += `<g opacity="${st.op.toFixed(2)}"><rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="18" fill="${bg}" fill-opacity="0.75" stroke="${bd}" stroke-width="1.5" stroke-dasharray="6 5"/>`;
    if (g.label) s += `<foreignObject x="${g.x + 12}" y="${g.y + 10}" width="${g.w - 24}" height="30"><div xmlns="http://www.w3.org/1999/xhtml" class="glabel" style="color:${tc}">${inlineIcons(fmt(g.label), 15)}</div></foreignObject>`;
    s += '</g>';
  }

  // edges
  const labels = [];
  for (const e of spec.edges || []) {
    const id = edgeId(e);
    const st = S(id);
    if (st.op <= 0.01) continue;
    const pts = edgePoints(spec, e);
    const d = roundedPath(pts, 16);
    const base = e.color || EDGE;
    s += `<g opacity="${st.op.toFixed(2)}">`;
    s += `<path d="${d}" fill="none" stroke="${base}" stroke-width="2" ${e.dashed ? 'stroke-dasharray="6 6"' : ''} stroke-linecap="round" marker-end="url(#m${base.replace('#', '')})" ${e.both ? `marker-start="url(#m${base.replace('#', '')})"` : ''}/>`;
    if (st.on > 0.01) {
      s += `<path d="${d}" fill="none" stroke="${ACC}" stroke-opacity="${(0.18 * st.on).toFixed(2)}" stroke-width="10" stroke-linecap="round"/>`;
      s += `<path d="${d}" fill="none" stroke="${ACC}" stroke-opacity="${st.on.toFixed(2)}" stroke-width="3" stroke-linecap="round" marker-end="url(#m${ACC.replace('#', '')})" ${e.both ? `marker-start="url(#m${ACC.replace('#', '')})"` : ''}/>`;
      s += `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${(0.85 * st.on).toFixed(2)}" stroke-width="1.6" stroke-dasharray="2 12" stroke-dashoffset="${(-pRaw * 42).toFixed(1)}" stroke-linecap="round"/>`;
    }
    s += '</g>';
    if (e.label) {
      const m = e.lp ? e.lp : pointAt(pts, e.lt ?? 0.5);
      labels.push({ m, text: e.label, st });
    }
  }

  // nodes
  for (const n of spec.nodes || []) {
    const st = S(n.id);
    if (st.op <= 0.01) continue;
    const kind = n.kind || 'node';
    const pal = PAL[kind] || PAL.node;
    const c = n.stroke && !/^#(90A4AE|B0BEC5)$/i.test(n.stroke) ? n.stroke : pal.c;
    const pill = kind === 'start' || kind === 'end';
    const rx = pill ? n.h / 2 : 14;
    const lift = st.on * 3;
    s += `<g opacity="${st.op.toFixed(2)}" transform="translate(0,${(-lift).toFixed(1)})">`;
    if (st.on > 0.01) {
      s += `<rect x="${n.x - 6}" y="${n.y - 6}" width="${n.w + 12}" height="${n.h + 12}" rx="${rx + 6}" fill="${c}" fill-opacity="${(0.14 * st.on).toFixed(3)}"/>`;
    }
    const fill = pill ? (kind === 'end' ? '#1E293B' : '#059669') : '#FFFFFF';
    s += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${rx}" fill="${fill}" stroke="${pill ? fill : c}" stroke-opacity="${pill ? 1 : (0.35 + 0.65 * st.on).toFixed(2)}" stroke-width="${(1.5 + 1.2 * st.on).toFixed(2)}" filter="url(#${st.on > 0.5 ? 'lift' : 'card'})"/>`;
    if (!pill && kind !== 'plain') {
      // tinted top band
      s += `<clipPath id="cp-${n.id}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${rx}"/></clipPath>`;
      s += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" fill="${pal.bg}" clip-path="url(#cp-${n.id})"/>`;
      s += `<rect x="${n.x}" y="${n.y}" width="5" height="${n.h}" fill="${c}" clip-path="url(#cp-${n.id})"/>`;
      s += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${rx}" fill="none" stroke="${c}" stroke-opacity="${(0.35 + 0.65 * st.on).toFixed(2)}" stroke-width="${(1.5 + 1.2 * st.on).toFixed(2)}"/>`;
    }
    const lines = String(n.label).split('\n');
    const [ic, first] = splitEmoji(lines[0]);
    lines[0] = first;
    const iname = n.icon || ic || (pill ? pal.icon : null);
    const tc = pill ? '#FFFFFF' : '#0F172A';
    const big = n.h >= 70 && !pill;
    const iconHtml = iname ? (pill ? icon(iname, '#fff', 15) : `<span class="badge" style="background:${c}1A">${icon(iname, c, big ? 18 : 15)}</span>`) : '';
    const sub = n.sub ? String(n.sub).split('\n') : [];
    s += `<foreignObject x="${n.x + (pill ? 0 : 6)}" y="${n.y}" width="${n.w - (pill ? 0 : 8)}" height="${n.h}"><div xmlns="http://www.w3.org/1999/xhtml" class="nbox">`;
    // shrink labels that would overflow the box
    const baseFs = pill ? 15 : (n.mono ? 15 : 17);
    const unit = (ch) => (ch.charCodeAt(0) > 255 ? 1 : (n.mono ? 0.6 : 0.56));
    const lfs = (ln, extra) => {
      const est = [...ln].reduce((a, ch) => a + unit(ch), 0);
      return Math.max(11, Math.min(baseFs, Math.floor((n.w - 26 - extra) / Math.max(est, 1))));
    };
    s += `<div class="nrow">${iconHtml}<span class="nlabel ${n.mono ? 'mono' : ''} ${pill ? 'pill' : ''}" style="color:${tc};font-size:${lfs(lines[0], iconHtml ? 38 : 0)}px">${fmt(lines[0])}</span></div>`;
    for (const ln of lines.slice(1)) s += `<div class="nlabel ${n.mono ? 'mono' : ''}" style="color:${tc};font-size:${lfs(ln, 0)}px">${fmt(ln)}</div>`;
    if (sub.length) s += `<div class="nsub">${sub.map((x) => inlineIcons(fmt(x), 13) || '&nbsp;').join('<br/>')}</div>`;
    s += `</div></foreignObject></g>`;
  }

  // edge labels above nodes/edges
  for (const L of labels) {
    const on = L.st.on;
    const w = Math.max(40, [...L.text].reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? 14 : 7.6), 0) + 20);
    s += `<g opacity="${L.st.op.toFixed(2)}"><rect x="${(L.m[0] - w / 2).toFixed(1)}" y="${L.m[1] - 13}" width="${w.toFixed(1)}" height="26" rx="13" fill="${on > 0.5 ? '#FFF7ED' : '#FFFFFF'}" stroke="${on > 0.5 ? ACC : '#E2E8F0'}" stroke-width="1.2"/>`;
    s += `<text x="${L.m[0]}" y="${L.m[1] + 4.5}" text-anchor="middle" class="elabel" fill="${on > 0.5 ? '#C2410C' : '#475569'}">${esc(L.text)}</text></g>`;
  }

  // tokens: travel the edge during the transition, rest at t afterwards
  for (const t of f.tokens || []) {
    const e = (spec.edges || []).find((x) => edgeId(x) === t.edge);
    if (!e) continue;
    const pts = edgePoints(spec, e);
    const tt = pRaw >= 1 ? (t.t ?? 0.5) : lerp(0, Math.max(t.t ?? 0.5, 0.85), p);
    for (let k = 3; k >= 1; k--) {
      if (pRaw >= 1) break;
      const q = pointAt(pts, tt - k * 0.035);
      s += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${(7 - k * 1.4).toFixed(1)}" fill="${ACC}" opacity="${(0.5 - k * 0.12).toFixed(2)}"/>`;
    }
    const q = pointAt(pts, tt);
    s += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="20" fill="url(#halo)"/>`;
    s += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="8" fill="${ACC}" stroke="#fff" stroke-width="3"/>`;
    if (t.label) s += `<text x="${q[0] + 14}" y="${q[1] - 12}" class="tok">${esc(t.label)}</text>`;
  }

  // panels
  for (const pn of spec.panels || []) {
    const st = S(pn.id);
    if (st.op <= 0.01) continue;
    const content = (f.panels && f.panels[pn.id] !== undefined) ? f.panels[pn.id] : (pn.text || '');
    s += `<foreignObject x="${pn.x}" y="${pn.y}" width="${pn.w}" height="${pn.h}" opacity="${st.op.toFixed(2)}"><div xmlns="http://www.w3.org/1999/xhtml" class="panel ${pn.mono ? 'monop' : ''}" style="height:${pn.h - 2}px;border-color:${st.on > 0.5 ? ACC : '#E2E8F0'};box-shadow:${st.on > 0.5 ? `0 0 0 4px ${ACC}26,` : ''}0 8px 20px rgba(15,23,42,.06)">`;
    if (pn.title) s += `<div class="ptitle"><span class="dots"><i></i><i></i><i></i></span><span>${inlineIcons(fmt(pn.title), 14)}</span></div>`;
    s += `<div class="pbody">${richLines(content, pRaw >= 1 ? 1 : p)}</div></div></foreignObject>`;
  }

  for (const t of spec.texts || []) {
    s += `<text x="${t.x}" y="${t.y}" class="${t.cls || 'free'}" text-anchor="${t.anchor || 'start'}">${esc(t.text)}</text>`;
  }
  s += '</g>';

  if (!spec.noCaption) {
    let cap = f.caption || spec.caption || '';
    let num = '';
    const m = cap.match(/^([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮])\s*/);
    if (m) { num = String('①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮'.indexOf(m[1]) + 1); cap = cap.slice(m[0].length); }
    else if (multi) num = String(fi + 1);
    const y = H - CAP_H - 16;
    s += `<foreignObject x="${OX - 4}" y="${y}" width="${W - OX * 2 + 8}" height="${CAP_H}"><div xmlns="http://www.w3.org/1999/xhtml" class="cap">`;
    s += num ? `<span class="num">${num}</span>` : `<span class="num info">${icon('lightbulb', '#fff', 18)}</span>`;
    s += `<span class="ctext" style="opacity:${multi && pRaw < 1 ? (0.25 + 0.75 * p).toFixed(2) : 1}">${inlineIcons(fmt(cap), 17)}</span></div></foreignObject>`;
  }
  s += '</svg>';
  return s;
}

window.renderFrame = function (fi, p) {
  document.getElementById('root').innerHTML = render(window.SPEC, fi, p == null ? 1 : p);
  const fr = window.SPEC.frames && window.SPEC.frames.length ? window.SPEC.frames : [{}];
  return { n: fr.length, dur: (fr[fi] && fr[fi].dur) || window.SPEC.dur || 1800, tokens: !!(fr[fi] && fr[fi].tokens && fr[fi].tokens.length) };
};
