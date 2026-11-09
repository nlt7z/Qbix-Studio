/* =============================================================================
   QBIX MOTION — the tweak engine ("调整细节").

   A classic script that defines window.QMTweak. It reads a demo's own source,
   finds what a reader may tune, and rebuilds the page and its copyable code
   with the tuned values:

     const tw = await QMTweak.open(item);   // item: one entry of QMLIB.items; fetches item.demo (fresh)
     tw.params     [{ key, group, label, value, def, min, max, step, unit, options }], live: set() writes p.value
                   options: null, or [{ value, label }] (accent, ground, easing)
     tw.set(key, value)   returns the value kept (clamped, normalised) or undefined when it is refused
     tw.reset()   tw.changed
     tw.srcdoc()   the demo page with the tweaks applied, for <iframe srcdoc>
     tw.code()     { html, css, js, file } tuned copies of item.code ({ files } for a bundle)
     QMTweak.compose(item, demoHtml, { html, css, js })   a remix: the page with its code replaced
     QMTweak.demoHtml(item)                                the demo source, fetched once (a Promise<string>)
     QMTweak.parse(item, source[, kit])                    open() from a source in hand, synchronous

   Groups, in order (each found in the demo's own source, never from a list of pieces):
     speed    one param, 0.25–2×: a clock shim (performance.now, Date, rAF, timers, every
              Animation's playbackRate), so CSS, WAAPI and JS-driven motion all follow.
              Preview only: the copied code carries the other groups.
     colour   accent  the lime: #B8FF00, rgb(184, 255, 0), rgba(184, 255, 0, a), [184, 255, 0], var(--signal)…
                      (and the ink on it: chalk on a dark accent)
              ground  paper | white | dark (| lime), the <html data-tone>.
     timing   durations and delays in the <style data-code> CSS (at most 8, the longest first).
     easing   each distinct cubic-bezier() in the code blocks, and the kit's --ease-* tokens (at most 4).
     value    UPPER_CASE numeric constants in the <script data-code> blocks (at most 6).
   A bundled scene (item.code.files) gets speed and ground only.

   Every change is a replacement at an offset of the demo's source (found by one scan,
   applied from the end backwards). With every value at its default nothing is replaced and
   srcdoc() is the source plus a <base>. URLs resolve against document.baseURI.
   ============================================================================= */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;

  /* ---- what can be tuned -------------------------------------------------------- */
  const LIME = '#B8FF00';
  const ACCENTS = [
    { value: '#B8FF00', label: 'Lime' },
    { value: '#121417', label: 'Ink' },
    { value: '#2F6BFF', label: 'Blue' },
    { value: '#FF5A1F', label: 'Orange' },
    { value: '#FF4FD8', label: 'Pink' },
  ];
  const CURVES = [
    { value: 'cubic-bezier(0.16, 1, 0.3, 1)', label: 'Expo out' },
    { value: 'cubic-bezier(0.65, 0, 0.35, 1)', label: 'Move' },
    { value: 'cubic-bezier(0.22, 1, 0.36, 1)', label: 'Soft' },
    { value: 'cubic-bezier(0.34, 1.56, 0.46, 1)', label: 'Spring' },
    { value: 'linear', label: 'Linear' },
  ];
  const GROUNDS = [
    { value: 'paper', label: 'Paper' },
    { value: 'white', label: 'White' },
    { value: 'dark', label: 'Dark' },
  ];
  const SPEED = { min: 0.25, max: 2, step: 0.05 };
  const CAP = { timing: 8, easing: 4, value: 6 };
  const INK_ON_LIME = '#0c1300';   // the ink the kit sets on lime
  const CHALK = '#f4f5f2';         // what replaces it on a dark accent

  /* what kit/qbix.css says, in case it cannot be read (open() reads it live) */
  const KIT_FALLBACK = {
    ease: {
      '--ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      '--ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      '--ease-move': 'cubic-bezier(0.65, 0, 0.35, 1)',
      '--ease-soft': 'cubic-bezier(0.45, 0, 0.25, 1)',
      '--ease-in': 'cubic-bezier(0.5, 0, 0.75, 0)',
      '--ease-back': 'cubic-bezier(0.22, 1.2, 0.36, 1)',
      '--ease-spring': 'cubic-bezier(0.34, 1.56, 0.46, 1)',
      '--ease-ambient': 'cubic-bezier(0.45, 0, 0.55, 1)',
      '--ease-portfolio': 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
    paper: [
      '--ground: #f3f4f5;',
      '--fg: #121417;',
      '--fg2: rgba(18, 20, 23, 0.64);',
      '--fg3: rgba(18, 20, 23, 0.38);',
      '--fg4: rgba(18, 20, 23, 0.14);',
      '--fill: rgba(18, 20, 23, 0.05);',
      '--surface: #ffffff;',
      '--sunk: #eceef0;',
      '--lift: 0 1px 2px rgba(18, 20, 23, 0.05), 0 18px 40px -18px rgba(18, 20, 23, 0.22);',
    ].join('\n  '),
  };

  /* ---- small helpers ------------------------------------------------------------ */
  /** What relative URLs resolve against: document.baseURI, so a <base href="/motion/"> counts (the static copy at
   *  qbix.space/motion, whose location has no trailing slash). Without a <base> it is the page's own URL. */
  const baseURI = () => (ROOT.document && ROOT.document.baseURI) || (ROOT.location && ROOT.location.href) || '';
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const decimals = (x) => { const s = String(x); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; };
  function trimNum(v, dp) {
    let s = v.toFixed(Math.min(6, Math.max(0, dp)));
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s === '-0' ? '0' : s;
  }
  function niceStep(x) {
    const e = Math.pow(10, Math.floor(Math.log10(x)));
    const f = x / e;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e;
  }
  const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---- build.py's extraction, ported (tools/build.py: the same regexes, the same dedent) ---- */
  const CSS_SRC = '<style data-code>\\s*\\n?(.*?)\\s*</style>';
  const JS_SRC = '<script data-code>\\s*\\n?(.*?)\\s*</script>';
  const HTML_SRC = '<!-- code -->\\s*\\n?(.*?)\\n?\\s*<!-- /code -->';

  function dedent(s) {
    const lines = s.split('\n');
    let pad = Infinity;
    for (const l of lines) if (l.trim()) pad = Math.min(pad, l.length - l.replace(/^\s+/, '').length);
    if (pad === Infinity) pad = 0;
    return lines.map((l) => l.slice(pad)).join('\n').replace(/^\n+|\n+$/g, '');
  }

  /** The copyable blocks of a demo with their offsets: s..e is the regex group (what build.py keeps),
   *  os..oe everything between the open and the close marker. */
  function grab(src) {
    const one = (m, head, tail) => {
      const t = m[1];
      const os = m.index + head;
      const s = t ? m.index + m[0].indexOf(t, head) : os;
      return { s, e: s + t.length, text: t, os, oe: m.index + m[0].length - tail, ts: m.index, te: m.index + m[0].length };
    };
    const out = { html: null, css: [], js: [] };
    let m, re = new RegExp(CSS_SRC, 'gs');
    while ((m = re.exec(src))) out.css.push(one(m, '<style data-code>'.length, '</style>'.length));
    re = new RegExp(JS_SRC, 'gs');
    while ((m = re.exec(src))) out.js.push(one(m, '<script data-code>'.length, '</script>'.length));
    m = new RegExp(HTML_SRC, 's').exec(src);
    if (m) out.html = one(m, '<!-- code -->'.length, '<!-- /code -->'.length);
    return out;
  }
  function extractCode(src) {
    const g = grab(src);
    return {
      html: g.html ? dedent(g.html.text) : '',
      css: g.css.map((b) => dedent(b.text)).join('\n\n'),
      js: g.js.map((b) => dedent(b.text)).join('\n\n'),
    };
  }

  /** Replace [s, e) by text, from the end backwards; an edit that overlaps a later one is dropped. */
  function applyEdits(src, edits) {
    const list = edits.slice().sort((a, b) => b.s - a.s || b.e - a.e);
    let out = src, floor = Infinity;
    for (const ed of list) {
      if (ed.e > floor) continue;
      out = out.slice(0, ed.s) + ed.text + out.slice(ed.e);
      floor = ed.s;
    }
    return out;
  }

  /* ---- colour -------------------------------------------------------------------- */
  const hex2 = (n) => (n < 16 ? '0' : '') + n.toString(16);
  function parseHex(h) {
    let s = String(h == null ? '' : h).trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(s)) s = s.replace(/./g, (c) => c + c);
    if (!/^[0-9a-f]{6}$/i.test(s)) return null;
    return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
  }
  const toHex = (c) => '#' + c.map((v) => hex2(clamp(Math.round(v), 0, 255))).join('').toUpperCase();
  function lum(c) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  }
  const mixc = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

  /** Everything an accent drives: the colour, its shades (hover, shade, the sunk lime tone) and
   *  the ink that sits on it (the kit's #0c1300 on lime; chalk on a dark accent). */
  function deriveAccent(hex) {
    const rgb = parseHex(hex) || parseHex(LIME);
    const flip = lum(rgb) < 0.2;
    const ink = flip ? CHALK : INK_ON_LIME;
    return {
      hex: toHex(rgb), rgb, flip, ink, inkRgb: parseHex(ink),
      hover: toHex(mixc(rgb, [255, 255, 255], 0.2)),     // #C9F24A on lime
      shade: toHex(mixc(rgb, [0, 0, 0], 0.37)),          // #6FAE00
      sunk: toHex(mixc(rgb, [0, 0, 0], 0.098)),          // #a6e600
      dim: toHex(mixc(rgb, [0, 0, 0], 0.22)),            // #8fc900
    };
  }

  /* ---- curves ---------------------------------------------------------------------- */
  const NUM = '(-?(?:\\d+\\.?\\d*|\\.\\d+))';
  const CB_SRC = 'cubic-bezier\\(\\s*' + NUM + '\\s*,\\s*' + NUM + '\\s*,\\s*' + NUM + '\\s*,\\s*' + NUM + '\\s*\\)';
  const canonCurve = (a, b, c, d) => 'cubic-bezier(' + [a, b, c, d].map((x) => String(Number(x))).join(', ') + ')';
  /** A curve as the engine writes it, or null: cubic-bezier(x1, y1, x2, y2) with x in 0..1, or linear. */
  function normCurve(v) {
    const s = String(v == null ? '' : v).trim();
    if (/^linear$/i.test(s)) return 'linear';
    const m = new RegExp('^' + CB_SRC + '$', 'i').exec(s);
    if (!m) return null;
    const n = m.slice(1, 5).map(Number);
    if (n.some((x) => !isFinite(x)) || n[0] < 0 || n[0] > 1 || n[2] < 0 || n[2] > 1) return null;
    return canonCurve(n[0], n[1], n[2], n[3]);
  }

  /* ---- CSS: comments, declarations and where they sit ---------------------------- */
  const maskCss = (t) => t.replace(/\/\*[\s\S]*?\*\//g, blank);

  function skipStr(t, i) {
    const q = t[i], n = t.length;
    let j = i + 1;
    while (j < n) {
      const ch = t[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === q) return j + 1;
      if (ch === '\n') return j;
      j++;
    }
    return n;
  }
  function skipParen(t, i) {
    const n = t.length;
    let d = 0;
    for (; i < n; i++) {
      const ch = t[i];
      if (ch === '"' || ch === "'") { i = skipStr(t, i) - 1; continue; }
      if (ch === '(') d++;
      else if (ch === ')') { d--; if (d === 0) return i + 1; }
    }
    return n;
  }
  function classify(pre) {
    const c = { text: pre.replace(/\s+/g, ' '), rule: pre.charAt(0) !== '@', reduced: false, kf: false };
    if (!c.rule) {
      const m = /^@([\w-]+)/.exec(pre);
      const at = m ? m[1].toLowerCase() : '';
      c.kf = /keyframes$/.test(at);
      c.reduced = at === 'media' && /prefers-reduced-motion\s*:\s*reduce/i.test(pre);
    }
    return c;
  }
  /** Every declaration of a masked stylesheet: { prop, vs, ve (the value), sel, reduced, kf }. */
  function scanCss(t) {
    const decls = [], stack = [], n = t.length;
    let i = 0, seg = 0;
    const flush = (a, b) => {
      let c = -1, d = 0;
      for (let k = a; k < b; k++) {
        const ch = t[k];
        if (ch === '(') d++;
        else if (ch === ')') d--;
        else if (ch === ':' && d === 0) { c = k; break; }
      }
      if (c < 0) return;
      const prop = t.slice(a, c).trim().toLowerCase();
      if (!/^-{0,2}[a-z][\w-]*$/.test(prop)) return;
      let vs = c + 1, ve = b;
      while (vs < ve && /\s/.test(t[vs])) vs++;
      while (ve > vs && /\s/.test(t[ve - 1])) ve--;
      let sel = '';
      const kf = stack.filter((x) => x.kf)[0];
      if (kf) sel = kf.text.replace(/^@[\w-]*keyframes\s*/i, '') + ' keyframes';
      else for (let k = stack.length - 1; k >= 0; k--) if (stack[k].rule) { sel = stack[k].text; break; }
      decls.push({ prop, vs, ve, sel, reduced: stack.some((x) => x.reduced), kf: stack.some((x) => x.kf) });
    };
    while (i < n) {
      const ch = t[i];
      if (ch === '"' || ch === "'") { i = skipStr(t, i); continue; }
      if (ch === '(') { i = skipParen(t, i); continue; }
      if (ch === '{') { stack.push(classify(t.slice(seg, i).trim())); seg = ++i; continue; }
      if (ch === '}') { flush(seg, i); stack.pop(); seg = ++i; continue; }
      if (ch === ';') { flush(seg, i); seg = ++i; continue; }
      i++;
    }
    return decls;
  }
  function splitTop(t, a, b, sep) {
    const out = [];
    let d = 0, s = a;
    for (let k = a; k < b; k++) {
      const ch = t[k];
      if (ch === '(') d++;
      else if (ch === ')') d--;
      else if (ch === sep && d === 0) { out.push([s, k]); s = k + 1; }
    }
    out.push([s, b]);
    return out;
  }
  function wordsOf(t, a, b) {
    const out = [];
    let d = 0, s = -1;
    for (let k = a; k < b; k++) {
      const ch = t[k];
      if (d === 0 && /\s/.test(ch)) { if (s >= 0) { out.push([s, k]); s = -1; } continue; }
      if (s < 0) s = k;
      if (ch === '(') d++;
      else if (ch === ')') d--;
    }
    if (s >= 0) out.push([s, b]);
    return out;
  }
  const TIME_PROPS = { transition: 1, 'transition-duration': 1, 'transition-delay': 1, animation: 1, 'animation-duration': 1, 'animation-delay': 1 };
  const TIME_RE = /^([+-]?(?:\d+\.?\d*|\.\d+))(ms|s)$/i;
  const ANIM_KW = new Set(['infinite', 'alternate', 'alternate-reverse', 'reverse', 'normal', 'forwards', 'backwards', 'both', 'none', 'running', 'paused', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-start', 'step-end', 'initial', 'inherit', 'unset']);

  /** The durations and delays written out in one declaration (not the ones inside var() or calc()). */
  function timesOf(t, d) {
    const out = [];
    const short = d.prop === 'transition' || d.prop === 'animation';
    const layers = splitTop(t, d.vs, d.ve, ',');
    layers.forEach(([a, b]) => {
      const times = [];
      let name = '';
      wordsOf(t, a, b).forEach(([s, e]) => {
        const w = t.slice(s, e), m = TIME_RE.exec(w);
        if (m) times.push({ s, e, m });
        else if (!name && short && /^[a-z_-][\w-]*$/i.test(w) && !ANIM_KW.has(w.toLowerCase())) name = w;
      });
      times.forEach((x, k) => {
        let role;
        if (short) role = k === 0 ? 'duration' : k === 1 ? 'delay' : null;
        else role = k === 0 ? (/delay$/.test(d.prop) ? 'delay' : 'duration') : null;
        if (!role) return;
        const unit = x.m[2].toLowerCase();
        const ms = parseFloat(x.m[1]) * (unit === 's' ? 1000 : 1);
        if (!(ms >= 0)) return;                                  // a negative delay is a phase, not a time
        out.push({ role, ms: +ms.toFixed(3), unit, s: x.s, e: x.e, name, layers: layers.length });
      });
    });
    return out;
  }

  /* ---- JS: a small tokenizer (strings, templates, regexes, comments, brackets) ---- */
  const RE_AFTER = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);
  const OPS = ['>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=', '=>', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '&&', '||', '??', '?.', '++', '--', '**', '<<', '>>'];
  const isIdStart = (c) => /[A-Za-z_$\u0080-\uffff]/.test(c);
  const isIdPart = (c) => /[\w$\u0080-\uffff]/.test(c);

  function skipTemplate(t, i) {
    const n = t.length;
    let j = i + 1;
    while (j < n) {
      const ch = t[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === '`') return j + 1;
      if (ch === '$' && t[j + 1] === '{') { j = skipExpr(t, j + 2); continue; }
      j++;
    }
    return n;
  }
  function skipExpr(t, i) {
    const n = t.length;
    let d = 1;
    while (i < n) {
      const ch = t[i];
      if (ch === '"' || ch === "'") { i = skipStr(t, i); continue; }
      if (ch === '`') { i = skipTemplate(t, i); continue; }
      if (ch === '/' && t[i + 1] === '/') { const j = t.indexOf('\n', i); i = j < 0 ? n : j; continue; }
      if (ch === '/' && t[i + 1] === '*') { const j = t.indexOf('*/', i + 2); i = j < 0 ? n : j + 2; continue; }
      if (ch === '{') d++;
      else if (ch === '}') { d--; if (d === 0) return i + 1; }
      i++;
    }
    return n;
  }
  function scanRegex(t, i) {
    const n = t.length;
    let j = i + 1, cls = false;
    while (j < n) {
      const ch = t[j];
      if (ch === '\n') return -1;
      if (ch === '\\') { j += 2; continue; }
      if (cls) { if (ch === ']') cls = false; }
      else if (ch === '[') cls = true;
      else if (ch === '/') { j++; while (j < n && /[a-z]/i.test(t[j])) j++; return j; }
      j++;
    }
    return -1;
  }
  function regexOk(toks) {
    const p = toks[toks.length - 1];
    if (!p) return true;
    if (p.type === 'id') return RE_AFTER.has(p.v);
    if (p.type === 'op') return !(p.v === ')' || p.v === ']');
    return false;
  }
  function tokenizeJs(t) {
    const toks = [], comments = [], stack = [], n = t.length;
    let i = 0, nl = false, bad = false;
    const push = (type, s, e) => {
      const k = { type, s, e, v: t.slice(s, e), nl, depth: stack.length, encl: stack.length ? stack[stack.length - 1] : -1, match: -1 };
      nl = false;
      toks.push(k);
      return k;
    };
    while (i < n) {
      const c = t[i];
      if (c === '\n') { nl = true; i++; continue; }
      if (c <= ' ' || c === '\u00a0' || c === '\u2028' || c === '\u2029' || c === '\ufeff') { i++; continue; }
      if (c === '/') {
        const d = t[i + 1];
        if (d === '/') { let j = t.indexOf('\n', i); if (j < 0) j = n; comments.push([i, j]); i = j; continue; }
        if (d === '*') {
          let j = t.indexOf('*/', i + 2);
          j = j < 0 ? n : j + 2;
          if (t.slice(i, j).indexOf('\n') >= 0) nl = true;
          comments.push([i, j]);
          i = j;
          continue;
        }
        if (regexOk(toks)) {
          const j = scanRegex(t, i);
          if (j > 0) { push('re', i, j); i = j; continue; }
        }
      }
      if (c === '"' || c === "'") { const j = skipStr(t, i); push('str', i, j); i = j; continue; }
      if (c === '`') { const j = skipTemplate(t, i); push('tpl', i, j); i = j; continue; }
      const p = toks[toks.length - 1];
      const afterOperand = p && (p.type === 'num' || p.type === 'id' || p.type === 'str' || (p.type === 'op' && (p.v === ')' || p.v === ']')));
      if ((c >= '0' && c <= '9') || (c === '.' && /[0-9]/.test(t[i + 1] || '') && !afterOperand)) {
        let j = i;
        if (c === '0' && /[xXbBoO]/.test(t[i + 1] || '')) { j += 2; while (/[0-9a-fA-F_]/.test(t[j] || '')) j++; }
        else {
          while (/[0-9_]/.test(t[j] || '')) j++;
          if (t[j] === '.') { j++; while (/[0-9_]/.test(t[j] || '')) j++; }
          if (/[eE]/.test(t[j] || '') && /[0-9+-]/.test(t[j + 1] || '')) { j += 2; while (/[0-9_]/.test(t[j] || '')) j++; }
        }
        if (t[j] === 'n') j++;
        push('num', i, j);
        i = j;
        continue;
      }
      if (isIdStart(c)) { let j = i + 1; while (j < n && isIdPart(t[j])) j++; push('id', i, j); i = j; continue; }
      if (c === '(' || c === '[' || c === '{') { push('op', i, i + 1); stack.push(toks.length - 1); i++; continue; }
      if (c === ')' || c === ']' || c === '}') {
        if (!stack.length) { bad = true; push('op', i, i + 1); i++; continue; }
        const o = stack.pop();
        const ov = toks[o].v;
        if (!((ov === '(' && c === ')') || (ov === '[' && c === ']') || (ov === '{' && c === '}'))) bad = true;
        const k = push('op', i, i + 1);
        k.match = o;
        toks[o].match = toks.length - 1;
        i++;
        continue;
      }
      let op = c;
      for (const o of OPS) if (t.startsWith(o, i)) { op = o; break; }
      push('op', i, i + op.length);
      i += op.length;
    }
    if (stack.length) bad = true;
    return { toks, comments, bad };
  }

  const CONT_RE = /^(?:[(\[.+\-*\/%<>=?:,&|^]|\?\.|\*\*|instanceof|in)$/;
  const continues = (t) => t.type === 'tpl' || ((t.type === 'op' || t.type === 'id') && CONT_RE.test(t.v));
  const canEnd = (t) => t.type === 'id' || t.type === 'num' || t.type === 'str' || t.type === 'tpl' || t.type === 're' || (t.type === 'op' && (t.v === ')' || t.v === ']' || t.v === '}'));
  const PLAIN_NUM = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
  const NAME_RE = /^[A-Z][A-Z0-9_]*$/;
  const GROUPING_AFTER = new Set(['return', 'void', 'await', 'typeof', 'yield']);

  /** The `{` of a function wrapped in grouping parens at the top of the script:
   *  (function () {   (() => {   const x = (async () => {   (parens that are a call, as in f(() => {, do not count) */
  function isWrapper(toks, b) {
    if (toks[b].depth !== 1) return false;
    let j = b - 1;
    const p = toks[j];
    if (!p) return false;
    if (p.type === 'op' && p.v === '=>') {
      j--;
      if (toks[j] && toks[j].v === ')' && toks[j].match >= 0) j = toks[j].match - 1;
      else if (toks[j] && toks[j].type === 'id') j--;
      else return false;
      if (toks[j] && toks[j].type === 'id' && toks[j].v === 'async') j--;
    } else if (p.type === 'op' && p.v === ')' && p.match >= 0) {
      j = p.match - 1;
      if (toks[j] && toks[j].type === 'id' && toks[j].v !== 'function') j--;
      if (toks[j] && toks[j].v === '*') j--;
      if (!(toks[j] && toks[j].type === 'id' && toks[j].v === 'function')) return false;
      j--;
      if (toks[j] && toks[j].type === 'id' && toks[j].v === 'async') j--;
    } else return false;
    const w = toks[j];
    if (!w || w.type !== 'op' || w.v !== '(' || w.depth !== 0 || toks[b].encl !== j) return false;
    const pre = toks[j - 1];
    return !pre || !((pre.type === 'id' && !GROUPING_AFTER.has(pre.v)) || (pre.type === 'op' && (pre.v === ')' || pre.v === ']')) || pre.type === 'str' || pre.type === 'num');
  }
  function topLevel(toks, k) {
    const t = toks[k];
    if (t.depth === 0) return true;
    if (t.depth !== 2) return false;
    const b = toks[t.encl];
    return !!b && b.v === '{' && isWrapper(toks, t.encl);
  }
  function endsHere(toks, idx, d) {
    const nx = toks[idx];
    if (!nx || nx.depth < d) return true;
    if (nx.depth > d) return false;
    if (nx.type === 'op' && (nx.v === ',' || nx.v === ';')) return true;
    return nx.nl && !continues(nx);
  }
  function skipInit(toks, m, d) {
    let k = m;
    for (; k < toks.length; k++) {
      const t = toks[k];
      if (t.depth < d) return k;
      if (t.depth === d && t.type === 'op' && (t.v === ',' || t.v === ';')) return k;
      if (t.depth === d && t.nl && k > m && !continues(t) && canEnd(toks[k - 1])) return k;
    }
    return k;
  }
  /** `const NAME = 12.5` (also `const A = 1, B = 2`) at the top of the script or of its wrapper: only plain numbers. */
  function findConsts(toks) {
    const out = [];
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k];
      if (t.type !== 'id' || t.v !== 'const' || (k && toks[k - 1].v === '.') || !topLevel(toks, k)) continue;
      const d = t.depth;
      let j = k + 1;
      for (;;) {
        const nm = toks[j], eq = toks[j + 1];
        if (!nm || nm.type !== 'id' || !eq || eq.type !== 'op' || eq.v !== '=') break;
        let m = j + 2, sgn = null, num = toks[m];
        if (num && num.type === 'op' && (num.v === '-' || num.v === '+')) { sgn = num; m++; num = toks[m]; }
        let after;
        if (num && num.type === 'num' && PLAIN_NUM.test(num.v) && endsHere(toks, m + 1, d)) {
          if (NAME_RE.test(nm.v)) {
            const first = sgn || num;
            out.push({ name: nm.v, value: (sgn && sgn.v === '-' ? -1 : 1) * parseFloat(num.v), s: first.s, e: num.e, dp: decimals(num.v) });
          }
          after = m + 1;
        } else after = skipInit(toks, j + 2, d);
        const nx = toks[after];
        if (nx && nx.depth === d && nx.type === 'op' && nx.v === ',') { j = after + 1; continue; }
        break;
      }
    }
    return out;
  }

  /* ---- the demo's anatomy ----------------------------------------------------------- */
  /** Style and script blocks (JSON data excluded) with their inner ranges, the tags around them, the
   *  <head> and <html> positions. Everything is an offset into the demo's source. */
  function locate(src) {
    const blocks = [];
    const open = /<(style|script)\b([^>]*)>/gi;
    let m;
    while ((m = open.exec(src))) {
      const name = m[1].toLowerCase(), attrs = m[2];
      const s = m.index + m[0].length;
      const close = new RegExp('</' + name + '\\s*>', 'ig');
      close.lastIndex = s;
      const cm = close.exec(src);
      const e = cm ? cm.index : src.length;
      const type = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs);
      const js = name === 'script' && (!type || /^(?:text|application)\/(?:x-)?javascript$|^module$/i.test(type[1]));
      blocks.push({ name, s, e, text: src.slice(s, e), kind: name === 'style' ? 'css' : (js ? 'js' : 'data'), code: false });
      open.lastIndex = cm ? cm.index + cm[0].length : src.length;
    }
    const inner = blocks.map((b) => [b.s, b.e]);
    const segs = [];
    let at = 0;
    inner.forEach(([s, e]) => { segs.push([at, s]); at = e; });
    segs.push([at, src.length]);
    const tags = [];
    segs.forEach(([a, b]) => {
      const seg = src.slice(a, b).replace(/<!--[\s\S]*?-->/g, blank);
      const re = /<[A-Za-z][^<>]*>/g;
      let t;
      while ((t = re.exec(seg))) tags.push({ s: a + t.index, e: a + t.index + t[0].length, text: t[0] });
    });
    const html = /<html\b[^>]*>/i.exec(src);
    const head = /<head(?:\s[^>]*)?>/i.exec(src);
    const headEnd = /<\/head\s*>/i.exec(src);
    return {
      blocks, tags,
      html: html ? { s: html.index, e: html.index + html[0].length, text: html[0] } : null,
      headAt: head ? head.index + head[0].length : (html ? html.index + html[0].length : 0),
      bareHead: !head,
      headEndAt: headEnd ? headEnd.index : (/<body\b/i.exec(src) || { index: src.length }).index,
    };
  }

  /* ---- the kit, read live --------------------------------------------------------- */
  function parseKit(text) {
    const kit = { ease: Object.assign({}, KIT_FALLBACK.ease), paper: KIT_FALLBACK.paper };
    if (!text) return kit;
    try {
      const re = /(--ease[\w-]*)\s*:\s*([^;]+);/g;
      let m, seen = false;
      const live = {};
      while ((m = re.exec(text))) {
        const v = m[2].replace(/\/\*[\s\S]*?\*\//g, '').trim();
        const c = normCurve(v);
        if (c) { live[m[1]] = c; seen = true; }
      }
      if (seen) kit.ease = live;
      const p = /\[data-tone=['"]paper['"]\]\s*\{([^}]*)\}/.exec(text);
      if (p && /--ground\s*:/.test(p[1]) && /--surface\s*:/.test(p[1])) kit.paper = p[1].trim().replace(/\n\s*/g, '\n  ');
    } catch (e) { /* the fallback stands */ }
    return kit;
  }
  let kitPromise = null;
  function readKit() {
    if (!kitPromise) {
      let url;
      try { url = new URL('kit/qbix.css', baseURI()).href; } catch (e) { url = null; }
      kitPromise = (url ? fetch(url, { cache: 'no-store' }).then((r) => (r.ok ? r.text() : '')).catch(() => '') : Promise.resolve('')).then(parseKit);
    }
    return kitPromise;
  }

  /* ---- ground: the tones --------------------------------------------------------- */
  function whiteBlock(kit) {
    let body = kit.paper;
    body = body.replace(/--ground\s*:[^;]+;/, '--ground: #ffffff;').replace(/--surface\s*:[^;]+;/, '--surface: #f5f6f7;');
    return "[data-tone='white'] {\n  " + body + "\n}\nhtml[data-tone='white'] { color-scheme: light; }";
  }
  /** The kit's lime tokens and tone, for an accent that is not lime. */
  function accentBlock(a) {
    const r = a.inkRgb.join(', ');
    return [
      ':root { --signal: ' + a.hex + '; --signal-hover: ' + a.hover + '; --signal-shade: ' + a.shade + '; --on-lime: ' + a.ink + '; }',
      "[data-tone='lime'] {",
      '  --ground: ' + a.hex + '; --fg: ' + a.ink + ';',
      '  --fg2: rgba(' + r + ', 0.66); --fg3: rgba(' + r + ', 0.42); --fg4: rgba(' + r + ', 0.16); --fill: rgba(' + r + ', 0.07);',
      '  --surface: ' + a.ink + '; --sunk: ' + a.sunk + '; --lift: 0 24px 48px -24px rgba(' + r + ', 0.5);',
      '}',
    ].join('\n');
  }

  /* ---- the clock: speed ---------------------------------------------------------- */
  /** Runs inside the demo's page, first thing in <head> (it is stringified, so it holds no outside names).
   *  Time is scaled around one anchor: performance.now, Date, rAF timestamps and event times by
   *  anchor + (t - anchor) * S; timer delays divided by S; every frame, every Animation's playbackRate
   *  (CSS transitions and animations, WAAPI) and every media element's rate multiplied by S. */
  function speedShim(S) {
    'use strict';
    var w = window, d = w.document, perf = w.performance, slice = Array.prototype.slice;
    var raf = w.requestAnimationFrame.bind(w), nowN = perf.now.bind(perf);
    var RD = w.Date, dateN = RD.now.bind(RD);
    var P0 = nowN(), D0 = dateN();
    var vts = function (t) { return P0 + (t - P0) * S; };
    try { perf.now = function () { return vts(nowN()); }; } catch (e) { /* kept */ }
    try {
      RD.now = function () { return D0 + (dateN() - D0) * S; };
      w.Date = new Proxy(RD, { construct: function (t, a, nt) { return Reflect.construct(t, a.length ? a : [RD.now()], nt); } });
    } catch (e) { /* kept */ }
    var st = w.setTimeout, si = w.setInterval;
    w.setTimeout = function (fn, ms) { var a = slice.call(arguments); a[1] = (+ms || 0) / S; return st.apply(w, a); };
    w.setInterval = function (fn, ms) { var a = slice.call(arguments); a[1] = (+ms || 0) / S; return si.apply(w, a); };
    w.requestAnimationFrame = function (cb) { return typeof cb === 'function' ? raf(function (t) { cb(vts(t)); }) : raf(cb); };
    try {
      var td = Object.getOwnPropertyDescriptor(w.Event.prototype, 'timeStamp');
      if (td && td.get) Object.defineProperty(w.Event.prototype, 'timeStamp', { configurable: true, enumerable: td.enumerable, get: function () { return vts(td.get.call(this)); } });
    } catch (e) { /* kept */ }
    var seen = new WeakMap();
    // a rate the page set itself is multiplied once; a flip of sign (reverse()) is the page's, the size is ours
    function tune(o) {
      var r = o.playbackRate, k = seen.get(o);
      if (!k) { k = { b: r, s: r * S }; seen.set(o, k); o.playbackRate = k.s; }
      else if (r !== k.s) {
        if (r === -k.s) { k.b = -k.b; k.s = r; }
        else { k.b = r; k.s = r * S; o.playbackRate = k.s; }
      }
    }
    var n = 0;
    function frame() {
      try {
        var list = d.getAnimations();
        for (var i = 0; i < list.length; i++) {
          var a = list[i];
          if (a.timeline && a.timeline !== d.timeline) continue;       // scroll- and view-driven: the scroll is the clock
          try { tune(a); } catch (e) { /* finished or detached */ }
        }
        if (n++ % 10 === 0) {
          var media = d.querySelectorAll('video,audio');
          for (var j = 0; j < media.length; j++) try { tune(media[j]); } catch (e) { /* not ready */ }
        }
      } catch (e) { /* no getAnimations */ }
      raf(frame);
    }
    raf(frame);
  }
  /** A <base> sends #links to the demo's folder inside a srcdoc: keep them still, as in the page itself. */
  function linkGuard() {
    addEventListener('click', function (e) {
      var t = e.target, a = t && t.closest && t.closest('a[href^="#"]');
      if (a) e.preventDefault();
    }, true);
  }
  const callSrc = (fn, arg) => '(' + fn.toString() + ')(' + (arg === undefined ? '' : arg) + ');';

  /* ---- fetching ---------------------------------------------------------------------- */
  const sources = new Map();   // demo URL → Promise<string>
  function demoUrl(item) {
    if (!item || !item.demo) throw new Error('QMTweak: this piece has no demo page');
    return new URL(item.demo, baseURI()).href;
  }
  function fetchDemo(item) {
    let url;
    try { url = demoUrl(item); } catch (e) { return Promise.reject(e); }
    const p = (async () => {
      let res;
      try { res = await fetch(url, { cache: 'no-store' }); }
      catch (e) { throw new Error('QMTweak: cannot read ' + item.demo + ' (' + ((e && e.message) || e) + '). The library has to be served over http (tools/serve.py); a file:// page cannot fetch it.'); }
      if (!res.ok) throw new Error('QMTweak: ' + item.demo + ' answered ' + res.status);
      return res.text();
    })();
    sources.set(url, p);
    p.catch(() => { if (sources.get(url) === p) sources.delete(url); });
    return p;
  }
  function demoHtml(item) {
    let url;
    try { url = demoUrl(item); } catch (e) { return Promise.reject(e); }
    return sources.get(url) || fetchDemo(item);
  }

  /* ---- the base, the page guards ---------------------------------------------------- */
  const baseHref = () => new URL('demos/', baseURI()).href;
  function headInsert(src, loc, extra) {
    const base = loc.tags.some((t) => /^<base\b/i.test(t.text)) ? '' : '<base href="' + baseHref() + '">';
    const text = (loc.bareHead ? '<head>' : '') + base + (extra || '') + (loc.bareHead ? '</head>' : '');
    return { s: loc.headAt, e: loc.headAt, text };
  }

  /* ---- analysis: what in this source can be tuned -------------------------------------- */
  function analyse(item, src, kit) {
    kit = kit || { ease: KIT_FALLBACK.ease, paper: KIT_FALLBACK.paper };
    const bundle = !!(item && item.code && item.code.files);
    const loc = locate(src);
    const grabbed = grab(src);
    // a copyable block is exactly what build.py's regexes keep
    loc.blocks.forEach((b) => {
      b.code = (b.kind === 'css' && grabbed.css.some((g) => g.os === b.s && g.oe === b.e)) || (b.kind === 'js' && grabbed.js.some((g) => g.os === b.s && g.oe === b.e));
    });
    const params = [], meta = new Map();
    const add = (p, m) => { p.options = p.options || null; params.push(p); meta.set(p.key, m); return p; };
    const num = (key, group, label, o) => ({ key, group, label, value: o.def, def: o.def, min: o.min, max: o.max, step: o.step, unit: o.unit || null, options: null });
    const guard = (what, fn) => { try { fn(); } catch (e) { /* a group that cannot be read is left out */ } };

    /* speed */
    add(num('speed', 'speed', 'Speed', { def: 1, min: SPEED.min, max: SPEED.max, step: SPEED.step, unit: '×' }), { kind: 'speed' });

    /* ground + accent need the blocks; the accent comes first in the list */
    const own = loc.blocks.filter((b) => b.kind === 'css' || b.kind === 'js');
    const masked = new Map();
    own.forEach((b) => {
      if (b.kind === 'css') masked.set(b, maskCss(b.text));
      else {
        const tk = tokenizeJs(b.text);
        b.tk = tk;
        let out = b.text;
        const parts = [];
        let at = 0;
        tk.comments.forEach(([s, e]) => { parts.push(out.slice(at, s), blank(out.slice(s, e))); at = e; });
        parts.push(out.slice(at));
        masked.set(b, parts.join(''));
      }
    });
    const codeCss = loc.blocks.filter((b) => b.kind === 'css' && b.code);
    const codeJs = loc.blocks.filter((b) => b.kind === 'js' && b.code);

    /* --- accent --- */
    if (!bundle) {
      guard('accent', () => {
        const sites = [];
        const hit = { primary: 0 };
        // the lime in every form the kit and the demos write it, and the ink that sits on it
        const scan = (text, base) => {
          const site = (m, render) => sites.push({ s: base + m.index, e: base + m.index + m[0].length, orig: m[0], render });
          let m, re = /#b8ff00([0-9a-f]{2})?(?![0-9a-f])/gi;
          while ((m = re.exec(text))) { hit.primary++; const al = m[1] || ''; site(m, (a) => a.hex + al); }
          // the channels, wherever they stand: rgb(184, 255, 0), rgba(184,255,0,.4), [184, 255, 0], '184, 255, 0'; the alpha stays as written
          re = /(^|[^\d.])184(\s*[,\s]\s*)255(\s*[,\s]\s*)0(?![\d.])/g;
          while ((m = re.exec(text))) { hit.primary++; const p = m; sites.push({ s: base + m.index + m[1].length, e: base + m.index + m[0].length, orig: m[0].slice(m[1].length), render: (a) => a.rgb[0] + p[2] + a.rgb[1] + p[3] + a.rgb[2] }); }
          // the same as a shader or a canvas writes it, 0..1
          re = /(^|[^\d.])0?\.72(?:16\d*)?(\s*,\s*)1(?:\.0+)?(\s*,\s*)0(?:\.0+)?(?![\d.])/g;
          while ((m = re.exec(text))) { hit.primary++; const p = m; sites.push({ s: base + m.index + m[1].length, e: base + m.index + m[0].length, orig: m[0].slice(m[1].length), render: (a) => trimNum(a.rgb[0] / 255, 3) + p[2] + trimNum(a.rgb[1] / 255, 3) + p[3] + trimNum(a.rgb[2] / 255, 3) }); }
          re = /var\(\s*(--signal(?:-hover|-shade)?)\s*(?:,[^)]*)?\)/g;
          while ((m = re.exec(text))) { hit.primary++; const nm = m[1]; site(m, (a) => (nm === '--signal' ? a.hex : nm === '--signal-hover' ? a.hover : a.shade)); }
          re = /#(a6e600|6fae00|8fc900|c9f24a)(?![0-9a-f])/gi;                          // the lime's own shades
          while ((m = re.exec(text))) { const k = m[1].toLowerCase(); site(m, (a) => (k === 'a6e600' ? a.sunk : k === '8fc900' ? a.dim : k === 'c9f24a' ? a.hover : a.shade)); }
          re = /#0c1300(?![0-9a-f])/gi;                                                  // ink on lime: chalk on a dark accent
          while ((m = re.exec(text))) { const o = m[0]; site(m, (a) => (a.flip ? a.ink : o)); }
          re = /(^|[^\d.])12(\s*[,\s]\s*)19(\s*[,\s]\s*)0(?![\d.])/g;
          while ((m = re.exec(text))) { const p = m, o = m[0].slice(m[1].length); sites.push({ s: base + m.index + m[1].length, e: base + m.index + m[0].length, orig: o, render: (a) => (a.flip ? a.inkRgb[0] + p[2] + a.inkRgb[1] + p[3] + a.inkRgb[2] : o) }); }
          re = /var\(\s*--on-lime\s*(?:,[^)]*)?\)/g;
          while ((m = re.exec(text))) { const o = m[0]; site(m, (a) => (a.flip ? a.ink : o)); }
        };
        own.forEach((b) => scan(masked.get(b), b.s));
        loc.tags.forEach((t) => scan(t.text, t.s));
        const usesLimeClass = loc.tags.some((t) => /\bbtn-lime\b/.test(t.text));
        const tone = /\bdata-tone\s*=\s*["']lime["']/i.test(loc.html ? loc.html.text : '');
        if (hit.primary || usesLimeClass || tone) {
          add({ key: 'accent', group: 'colour', label: 'Accent', value: LIME, def: LIME, min: null, max: null, step: null, unit: null, options: ACCENTS.map((o) => Object.assign({}, o)) }, { kind: 'accent', sites });
        }
      });
    }

    /* --- ground --- */
    guard('ground', () => {
      const htmlText = loc.html ? loc.html.text : '';
      const am = /(\bdata-tone\s*=\s*)(["'])(.*?)\2/i.exec(htmlText);
      const tone = ((am && am[3]) || (item && item.tone) || 'dark').toLowerCase();
      const sites = [];
      if (loc.html) {
        if (am) sites.push({ s: loc.html.s + am.index + am[1].length, e: loc.html.s + am.index + am[0].length, q: am[2] });
        else sites.push({ s: loc.html.s + 5, e: loc.html.s + 5, q: '"', add: true });
      }
      if (bundle) {
        // a scene's chapter carries its own tone: it follows the page's
        loc.tags.forEach((t) => {
          if (!/\bdata-chapter\b/.test(t.text)) return;
          const cm = /(\bdata-tone\s*=\s*)(["'])(.*?)\2/i.exec(t.text);
          if (cm && cm[3].toLowerCase() === tone) sites.push({ s: t.s + cm.index + cm[1].length, e: t.s + cm.index + cm[0].length, q: cm[2] });
        });
      }
      const options = GROUNDS.map((o) => Object.assign({}, o));
      if (tone === 'lime') options.push({ value: 'lime', label: 'Lime' });
      else if (!options.some((o) => o.value === tone)) options.push({ value: tone, label: cap1(tone) });
      add({ key: 'ground', group: 'colour', label: 'Ground', value: tone, def: tone, min: null, max: null, step: null, unit: null, options }, { kind: 'ground', sites, tone });
    });

    /* --- timing --- */
    if (!bundle) {
      guard('timing', () => {
        const found = [];
        codeCss.forEach((b) => {
          const t = masked.get(b);
          scanCss(t).forEach((d) => {
            if (!TIME_PROPS[d.prop] || d.reduced || d.kf) return;
            timesOf(t, d).forEach((x) => {
              const sel = d.sel.length > 44 ? d.sel.slice(0, 41) + '…' : d.sel;
              const label = (sel || 'css') + ' · ' + d.prop + ((d.prop === 'transition' || d.prop === 'animation') && x.role === 'delay' ? ' delay' : '') + (x.layers > 1 && x.name ? ' · ' + x.name : '');
              found.push({ ms: x.ms, unit: x.unit, s: b.s + x.s, e: b.s + x.e, label, i: found.length });
            });
          });
        });
        found.sort((a, b) => b.ms - a.ms || a.i - b.i);
        found.slice(0, CAP.timing).forEach((x, k) => {
          const label = x.label;
          const max = Math.max(600, Math.ceil((x.ms * 3) / 10) * 10);
          add(num('time:' + k, 'timing', label, { def: x.ms, min: 0, max, step: 10, unit: 'ms' }), { kind: 'time', sites: [{ s: x.s, e: x.e, unit: x.unit }] });
        });
      });
    }

    /* --- easing --- */
    if (!bundle) {
      guard('easing', () => {
        const pool = [];
        const byCurve = new Map(), byToken = new Map();
        const all = codeCss.concat(codeJs);
        const everything = all.map((b) => masked.get(b)).join('\n');
        const cssDecls = new Map();
        codeCss.forEach((b) => cssDecls.set(b, scanCss(masked.get(b))));
        all.forEach((b) => {
          const t = masked.get(b);
          const re = new RegExp(CB_SRC, 'gi');
          let m;
          while ((m = re.exec(t))) {
            const key = canonCurve(m[1], m[2], m[3], m[4]);
            let g = byCurve.get(key);
            if (!g) { g = { kind: 'curve', def: key, sites: [], label: '', weight: 0, order: pool.length }; byCurve.set(key, g); pool.push(g); }
            const at = m.index;
            g.sites.push({ s: b.s + at, e: b.s + at + m[0].length });
            g.weight++;
            if (!g.label) {
              let where = 'script';
              if (b.kind === 'css') {
                const d = (cssDecls.get(b) || []).find((x) => at >= x.vs && at < x.ve);
                if (d) {
                  if (d.prop.indexOf('--') === 0) { where = d.prop; g.weight += (everything.match(new RegExp('var\\(\\s*' + esc(d.prop) + '\\b', 'g')) || []).length; }
                  else where = d.sel || d.prop;
                } else where = 'css';
              }
              g.label = (where.length > 44 ? where.slice(0, 41) + '…' : where) + ' · easing';
            }
          }
          // the kit's tokens, where the piece does not make its own
          const rt = /var\(\s*(--ease[\w-]*)\s*(?:,[^)]*)?\)/g;
          while ((m = rt.exec(t))) {
            const name = m[1];
            if (!kit.ease[name]) continue;
            const def = new RegExp(esc(name) + '\\s*:');
            if (def.test(everything) || loc.tags.some((x) => def.test(x.text)) || loc.blocks.some((x) => x.kind === 'js' && (x.text.indexOf("'" + name + "'") >= 0 || x.text.indexOf('"' + name + '"') >= 0))) continue;   // the piece makes its own
            let g = byToken.get(name);
            if (!g) { g = { kind: 'token', name, def: kit.ease[name], sites: [], label: name + ' · easing', weight: 0, order: pool.length }; byToken.set(name, g); pool.push(g); }
            g.sites.push({ s: b.s + m.index, e: b.s + m.index + m[0].length });
            g.weight++;
          }
        });
        pool.sort((a, b) => b.weight - a.weight || a.order - b.order);
        pool.slice(0, CAP.easing).forEach((g, k) => {
          const options = CURVES.map((o) => Object.assign({}, o));
          const hit = options.find((o) => o.value === g.def);
          if (hit) hit.label += ' (original)';
          else options.push({ value: g.def, label: 'Original' });
          add({ key: 'ease:' + k, group: 'easing', label: g.label, value: g.def, def: g.def, min: null, max: null, step: null, unit: null, options }, { kind: 'curve', sites: g.sites, token: g.kind === 'token' ? g.name : null });
        });
      });
    }

    /* --- values --- */
    if (!bundle) {
      guard('value', () => {
        const names = {};
        let n = 0;
        codeJs.forEach((b) => {
          if (!b.tk || b.tk.bad) return;                       // a script the tokenizer could not follow keeps its numbers
          findConsts(b.tk.toks).forEach((c) => {
            if (n >= CAP.value || !isFinite(c.value) || c.value === 0) return;
            n++;
            names[c.name] = (names[c.name] || 0) + 1;
            const v = c.value, int = Number.isInteger(v);
            let min, max, step;
            if (v < 0) { min = +(3 * v).toFixed(6); max = 0; } else { min = 0; max = +(3 * v).toFixed(6); }
            if (int && v > 0 && v <= 12) { min = 1; max = Math.max(3 * v, v + 4); }          // a count stays a whole number, 1 at least
            step = +niceStep((max - min) / 100).toFixed(6);
            if (int) step = Math.max(1, step);
            const key = 'value:' + c.name + (names[c.name] > 1 ? '#' + names[c.name] : '');
            add(num(key, 'value', c.name, { def: v, min, max, step, unit: /(^|_)MS$/.test(c.name) ? 'ms' : null }), { kind: 'value', sites: [{ s: b.s + c.s, e: b.s + c.e }], int, dp: Math.max(c.dp, decimals(step)) });
          });
        });
      });
    }

    /* a label is told from its twin by a number */
    ['timing', 'easing', 'value'].forEach((g) => {
      const seen = {};
      params.forEach((p) => {
        if (p.group !== g) return;
        seen[p.label] = (seen[p.label] || 0) + 1;
        if (seen[p.label] > 1) p.label += ' #' + seen[p.label];
      });
    });

    /* display order: speed, colour (accent, ground), timing, easing, value */
    const order = { speed: 0, colour: 1, timing: 2, easing: 3, value: 4 };
    params.forEach((p, i) => { p._i = i; });
    params.sort((a, b) => order[a.group] - order[b.group] || (a.key === 'accent' ? -1 : b.key === 'accent' ? 1 : a._i - b._i));
    params.forEach((p) => { delete p._i; });
    return { item, src, bundle, loc, grabbed, params, meta, kit };
  }

  /* ---- a tweak ---------------------------------------------------------------------------- */
  const fmtTime = (ms, unit) => (unit === 's' ? trimNum(ms / 1000, 3) + 's' : trimNum(ms, 3) + 'ms');

  function same(m, a, b) {
    if (m.kind === 'accent') return String(a).toUpperCase() === String(b).toUpperCase();
    if (m.kind === 'speed' || m.kind === 'time' || m.kind === 'value') return Math.abs(a - b) < 1e-9;
    return String(a) === String(b);
  }

  function makeTweak(A) {
    const byKey = new Map(A.params.map((p) => [p.key, p]));
    const val = (key) => { const p = byKey.get(key); return p ? p.value : undefined; };
    const dirty = (p) => !same(A.meta.get(p.key), p.value, p.def);

    /** Each changed value as replacements at offsets of the demo's source. */
    function edits(withGround) {
      const out = [];
      A.params.forEach((p) => {
        if (!dirty(p)) return;
        const m = A.meta.get(p.key);
        if (m.kind === 'accent') {
          const a = deriveAccent(p.value);
          m.sites.forEach((st) => { const text = st.render(a); if (text !== st.orig) out.push({ s: st.s, e: st.e, text }); });
        } else if (m.kind === 'time') {
          m.sites.forEach((st) => out.push({ s: st.s, e: st.e, text: fmtTime(p.value, st.unit) }));
        } else if (m.kind === 'curve') {
          m.sites.forEach((st) => out.push({ s: st.s, e: st.e, text: p.value }));
        } else if (m.kind === 'value') {
          m.sites.forEach((st) => out.push({ s: st.s, e: st.e, text: trimNum(m.int ? Math.round(p.value) : p.value, m.int ? 0 : m.dp) }));
        } else if (m.kind === 'ground' && withGround) {
          m.sites.forEach((st) => out.push({ s: st.s, e: st.e, text: st.add ? ' data-tone=' + st.q + p.value + st.q : p.value }));
        }
      });
      return out;
    }
    /** The blocks a tweak adds to the page's styles: tones and kit tokens, which replacements cannot reach. */
    function extraCss() {
      const parts = [];
      if (val('ground') === 'white') parts.push(whiteBlock(A.kit));
      const ac = byKey.get('accent');
      if (ac && dirty(ac)) parts.push(accentBlock(deriveAccent(ac.value)));
      const tok = [];
      A.params.forEach((p) => { const m = A.meta.get(p.key); if (m.kind === 'curve' && m.token && dirty(p)) tok.push('--' + m.token.replace(/^--/, '') + ': ' + p.value + ';'); });
      if (tok.length) parts.push(':root { ' + tok.join(' ') + ' }');
      return parts.join('\n');
    }

    const tw = {
      item: A.item,
      bundle: A.bundle,
      params: A.params,
      get changed() { return A.params.some(dirty); },
      set(key, v) {
        const p = byKey.get(key);
        if (!p) return undefined;
        const m = A.meta.get(key);
        let nv;
        if (m.kind === 'speed' || m.kind === 'time' || m.kind === 'value') {
          nv = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
          if (!isFinite(nv)) return undefined;
          nv = clamp(nv, p.min, p.max);
          if (m.int) nv = Math.round(nv);
          nv = +nv.toFixed(6);
        } else {
          const want = String(v).toLowerCase().replace(/\s*\(original\)$/, '');
          const opt = p.options && p.options.find((o) => String(o.label).toLowerCase().replace(/\s*\(original\)$/, '') === want || String(o.value).toLowerCase() === want);
          if (m.kind === 'accent') {
            const c = parseHex(opt ? opt.value : v);
            if (!c) return undefined;
            nv = toHex(c);
          } else if (m.kind === 'ground') {
            if (!opt) return undefined;
            nv = opt.value;
          } else {
            nv = normCurve(opt ? opt.value : v);
            if (!nv) return undefined;
          }
        }
        p.value = nv;
        return nv;
      },
      reset() { A.params.forEach((p) => { p.value = p.def; }); },
      srcdoc() {
        const speed = val('speed');
        const changed = tw.changed;
        const list = edits(true);
        let extra = '';
        if (changed) {
          if (speed !== 1) extra += '<script>' + callSrc(speedShim, +speed.toFixed(4)) + '</script>';
          extra += '<script>' + callSrc(linkGuard) + '</script>';
        }
        list.push(headInsert(A.src, A.loc, extra));
        const css = extraCss();
        if (css) list.push({ s: A.loc.headEndAt, e: A.loc.headEndAt, text: '<style data-qm-tweak>\n' + css + '\n</style>\n' });
        return applyEdits(A.src, list);
      },
      code() {
        const ic = (A.item && A.item.code) || {};
        if (A.bundle) return { files: ic.files };
        if (!tw.changed) return { html: ic.html, css: ic.css, js: ic.js, file: ic.file };
        const now = extractCode(applyEdits(A.src, edits(false)));
        let file = ic.file;
        if (typeof file === 'string') {
          const swap = (from, text, at) => {
            if (!from || from === text) return;
            const i = file.indexOf(from, at);
            if (i >= 0) file = file.slice(0, i) + text + file.slice(i + from.length);
          };
          swap(ic.css, now.css, 0);
          const body = Math.max(0, file.indexOf('<body'));       // the markup and the script come after it
          swap(ic.html, now.html, body);
          swap(ic.js, now.js, body);
          const ground = val('ground');
          const gm = A.meta.get('ground');
          if (gm && ground !== A.params.find((p) => p.key === 'ground').def) file = file.replace(/(<html\b[^>]*\bdata-tone=")[^"]*(")/i, (all, a, b) => a + ground + b);
          const css = extraCss();
          const k = file.indexOf('</style>');
          if (css && k >= 0) file = file.slice(0, k) + '\n/* Tuned in Qbix Motion */\n' + css + '\n' + file.slice(k);
        }
        return { html: now.html, css: now.css, js: now.js, file };
      },
    };
    return tw;
  }

  /* ---- compose: a remix, the demo page with its copyable code replaced -------------------- */
  function compose(item, demoSource, code) {
    if (typeof demoSource !== 'string') throw new TypeError('QMTweak.compose needs the demo source as a string (await QMTweak.demoHtml(item))');
    const src = demoSource;
    const loc = locate(src);
    const g = grab(src);
    const edits = [];
    code = code || {};
    if (typeof code.html === 'string' && g.html) edits.push({ s: g.html.os, e: g.html.oe, text: '\n' + code.html + '\n' });
    const blocks = (list, text, tag, at, wrap) => {
      if (typeof text !== 'string') return;
      const safe = text.replace(new RegExp('</' + tag, 'gi'), '<\\/' + tag);
      if (list.length) {
        // the blocks of a piece are read as one text: it goes in the first, the others leave the page
        list.forEach((b, i) => edits.push(i === 0 ? { s: b.os, e: b.oe, text: '\n' + safe + '\n' } : { s: b.ts, e: b.te, text: '' }));
      } else if (text.trim()) {
        edits.push({ s: at, e: at, text: wrap(safe) });
      }
    };
    blocks(g.css, code.css, 'style', loc.headEndAt, (t) => '<style data-code>\n' + t + '\n</style>\n');
    const bodyEnd = /<\/body\s*>/i.exec(src);
    blocks(g.js, code.js, 'script', bodyEnd ? bodyEnd.index : src.length, (t) => '<script data-code>\n' + t + '\n</script>\n');
    edits.push(headInsert(src, loc, '<script>' + callSrc(linkGuard) + '</script>'));
    return applyEdits(src, edits);
  }

  /* ---- the API ----------------------------------------------------------------------------- */
  ROOT.QMTweak = {
    version: 1,
    /** Fetch the piece's demo page and read what can be tuned in it. Rejects when the page cannot be fetched. */
    async open(item) {
      const [src, kit] = await Promise.all([fetchDemo(item), readKit()]);
      return makeTweak(analyse(item, src, kit));
    },
    /** The same from a source in hand (synchronous; the kit's own values unless given). */
    parse(item, src, kit) { return makeTweak(analyse(item, src, kit)); },
    compose,
    demoHtml,
    /* the pieces below are for tests */
    _grab: grab, _extract: extractCode, _kit: parseKit, _tokenize: tokenizeJs, _consts: findConsts,
  };
})();
