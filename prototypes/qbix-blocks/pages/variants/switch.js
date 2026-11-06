/* =============================================================================
   QBIX · BLOCKS, the ways the sections switch colour, 2 to 5 (1, the cover, is
   block.css's sticky stack). Picked on the options board: html[data-switch="N"].

     2  整页渐变  the page's ground (and the nav) moves from one tone to the next
                  as the boundary crosses the middle of the screen; the blocks
                  give up their own ground for it, and every block's words take
                  the ground's tone, flipped where both inks read alike (4:1+)
     3  卡片展开  a block whose tone differs from the one before comes in as a card
                  set in the page (the cut corner), and grows to the full width
     4  斜切擦除  the incoming block is uncovered by a 45° edge (the cut's angle)
                  sweeping from the bottom right to the top left
     5  方块翻转  the boundary is a grid of squares of the tone before, which shrink
                  away in a wave from the bottom right as the block comes in
    14  1+4       the chosen one: into a dark block by the 45° wipe (4); back to white by
                  the cover (1): the dark block sticks and the white slides over it

   All of them are scrubbed by the scroll: one frame loop that reads every block's
   place once and writes only clip-paths, transforms and colours. Layout (the covers'
   size, the squares) is set when the page's size or its set of blocks changes, never
   in the loop. With reduced motion none of this runs: the page keeps the plain cut.
   ============================================================================= */
(() => {
  const root = document.documentElement;
  const mode = Number(root.dataset.switch || 1);
  if (!((mode >= 2 && mode <= 5) || mode === 14)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const smooth = (x) => x * x * (3 - 2 * x);
  const px = (n) => `${Math.round(n * 10) / 10}px`;

  (window.BlocksAfter = window.BlocksAfter || []).push(start);

  function start() {
    root.classList.add('sw-live');
    const nav = document.querySelector('.nav');
    /** every shown block, in order, with what the loop needs of it */
    let list = [];
    let raf = 0;

    /* ---- layout: which blocks switch, their covers ------------------------------------------ */
    function layout() {
      const blocks = [...document.querySelectorAll('.blocks > .block')].filter((b) => !b.hidden && b.offsetParent !== null);
      const vh = innerHeight;
      list = blocks.map((b, i) => {
        const prev = blocks[i - 1];
        const switches = !!prev && prev.dataset.tone !== b.dataset.tone;
        return { el: b, tone: b.dataset.tone, switches, prevBg: prev ? getComputedStyle(prev).backgroundColor : '', cover: null };
      });
      // 14: into the dark is wiped, back to white is covered: the dark block before the white sticks
      const wiped = (x) => x.switches && (mode !== 14 || x.tone === 'black');
      if (mode === 14) list.forEach((x, i) => x.el.classList.toggle('sw-stick', !!list[i + 1]?.switches && list[i + 1].tone === 'white'));
      // covers (3, 4, 5, 14): the tone before, over the top of each block that switches
      document.querySelectorAll('.sw-cover').forEach((c) => {
        if (!list.some((x) => wiped(x) && x.el === c.parentElement)) c.remove();
      });
      if (mode >= 3) {
        for (const x of list) {
          if (!wiped(x)) continue;
          let c = x.el.querySelector(':scope > .sw-cover');
          if (!c) {
            c = document.createElement('div');
            c.className = 'sw-cover';
            c.setAttribute('aria-hidden', 'true');
            x.el.append(c);
          }
          const W = x.el.clientWidth;
          const H = Math.min(x.el.offsetHeight, mode === 5 ? vh : vh * 1.1);
          c.style.height = px(H);
          c.style.setProperty('--sw-prev', x.prevBg);
          c.dataset.state = '';
          x.cover = c;
          x.W = W;
          x.H = H;
          if (mode === 5) squares(x);
        }
      }
      kick();
    }

    /** mode 5: the cover as a grid of squares, each with its place in the wave (0 bottom right … 1 top left) */
    function squares(x) {
      const S = Math.round(Math.min(80, Math.max(40, innerWidth * 0.05)));
      const cols = Math.ceil(x.W / S);
      const rows = Math.ceil(x.H / S);
      const g = x.cover._grid;
      if (g && g.cols === cols && g.rows === rows && g.S === S) {
        x.grid = g;
        return;
      }
      x.cover.replaceChildren();
      x.cover.style.gridTemplateColumns = `repeat(${cols}, ${S}px)`;
      x.cover.style.gridAutoRows = `${S}px`;
      const sq = [];
      const span = Math.max(1, cols + rows - 2);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const el = document.createElement('i');
          el.className = 'sw-sq';
          x.cover.append(el);
          sq.push({ el, w: (cols - 1 - c + (rows - 1 - r)) / span, s: 1 });
        }
      }
      x.grid = x.cover._grid = { cols, rows, S, sq };
    }

    /* ---- mode 2: the two tones' inks, read from block.css, applied to every block by the ground ---- */
    const NAMES = ['--bg', '--fg', '--fg2', '--fg3', '--soft', '--soft2', '--hi', '--on-hi', '--mk-bg', '--mk-fg', '--mk-h', '--mk-y', '--act', '--on-act', '--act2', '--on-act2'];
    const ground = {};
    let groundTone = '';
    let flipAt = 0.2; // the ground's luminance where dark and light words read alike
    if (mode === 2) {
      const css = [];
      for (const tone of ['white', 'black']) {
        const probe = document.createElement('div');
        probe.dataset.tone = tone;
        probe.hidden = true;
        document.body.append(probe);
        const cs = getComputedStyle(probe);
        css.push(`html.sw-live[data-switch='2'][data-sw-tone='${tone}'] .blocks > .block { ${NAMES.map((n) => `${n}: ${cs.getPropertyValue(n).trim()};`).join(' ')} }`);
        ground[tone] = rgb(cs.getPropertyValue('--bg').trim());
        ground[tone + 'Ink'] = rgb(cs.getPropertyValue('--fg').trim());
        probe.remove();
      }
      const style = document.createElement('style');
      style.textContent = css.join('\n');
      document.head.append(style);
      // where both inks have the same contrast on the ground: (L + .05)² = (Lw + .05)(Ld + .05)
      const Lw = lum(ground.blackInk);
      const Ld = lum(ground.whiteInk);
      flipAt = Math.sqrt((Lw + 0.05) * (Ld + 0.05)) - 0.05;
      // the nav takes the ground's tone too, whatever block.js last set it to
      if (nav) {
        new MutationObserver(() => {
          if (groundTone && nav.dataset.tone !== groundTone) nav.dataset.tone = groundTone;
        }).observe(nav, { attributes: true, attributeFilter: ['data-tone'] });
      }
    }

    /* ---- the loop ---------------------------------------------------------------------------- */
    function frame() {
      raf = 0;
      const vh = innerHeight;
      // read: every block's top and bottom, once
      const rects = list.map((x) => x.el.getBoundingClientRect());
      // write
      if (mode === 2) return morph(vh, rects);
      list.forEach((x, i) => {
        if (!x.cover) return;
        const top = rects[i].top;
        if (mode === 3) card(x, top, vh);
        else if (mode === 4 || mode === 14) wipe(x, top, vh);
        else mosaic(x, top, vh);
      });
    }
    function kick() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    /** 2: the ground between the two tones round the boundary nearest the middle; the words flip where they read alike */
    function morph(vh, rects) {
      let col = null;
      for (let i = 1; i < list.length; i++) {
        if (!list[i].switches) continue;
        const y = rects[i].top;
        // a narrow band and a steep curve: the in-between (a muddy grey-olive) passes in a moment
        if (y > vh * 0.44 && y < vh * 0.56) {
          const t = smooth(smooth(clamp01((vh * 0.56 - y) / (vh * 0.12))));
          col = mix(ground[list[i - 1].tone], ground[list[i].tone], t);
          break;
        }
      }
      if (!col) {
        const mid = vh / 2;
        // the block at the middle; past the last one (a curtain footer's room), the last block above it
        let at = list.find((x, i) => rects[i].top <= mid && rects[i].bottom > mid);
        if (!at) for (let i = list.length - 1; i >= 0 && !at; i--) if (rects[i].top <= mid) at = list[i];
        at = at || list[0];
        col = ground[at?.tone] || ground.white;
      }
      const tone = lum(col) > flipAt ? 'white' : 'black';
      const css = `rgb(${col.map((v) => Math.round(v)).join(', ')})`;
      root.style.setProperty('--sw-ground', css);
      if (nav) nav.style.setProperty('--bg', css);
      if (tone !== groundTone) {
        groundTone = tone;
        root.dataset.swTone = tone;
        if (nav) nav.dataset.tone = tone;
        // the scenes' drawings take the ground's tone with it
        document.querySelectorAll('.blocks .scene[data-tone]').forEach((s) => {
          if (!s.dataset.sw0) s.dataset.sw0 = s.dataset.tone;
          s.dataset.tone = tone === 'white' ? 'paper' : 'dark';
        });
      }
    }

    /** 3: a card in the page, its top right corner cut, growing to the full width as its top travels up */
    function card(x, top, vh) {
      const g = smooth(clamp01((vh - top) / (vh * 0.78)));
      if (g >= 1 || top >= vh) return shut(x, g >= 1);
      const M = Math.min(72, Math.max(14, innerWidth * 0.05));
      const C = Math.min(52, Math.max(22, innerWidth * 0.032));
      const m = (1 - g) * M;
      const c = (1 - g) * C;
      const { W, H } = x;
      // the tone before, as a frame round the card (evenodd: the card is a hole in it)
      x.cover.style.clipPath = `polygon(evenodd, 0 0, ${px(W)} 0, ${px(W)} ${px(H)}, 0 ${px(H)}, 0 0, ${px(m)} ${px(m)}, ${px(W - m - c)} ${px(m)}, ${px(W - m)} ${px(m + c)}, ${px(W - m)} ${px(H)}, ${px(m)} ${px(H)}, ${px(m)} ${px(m)})`;
      x.cover.dataset.state = 'on';
    }

    /** 4: the tone before, cut back by a 45° edge from the bottom right of the screen to the block's top left */
    function wipe(x, top, vh) {
      const p = clamp01((vh - top) / (vh * 0.8));
      if (p >= 1 || top >= vh) return shut(x, p >= 1);
      const W = x.W;
      // the edge is x + y = k on the screen, k from (W + vh) down to the block's top at p = 1
      const k = W + vh - p * W - 0.8 * vh * p * p;
      const c = k - top; // the same edge in the block's own place
      x.cover.style.clipPath = `polygon(0 0, ${px(c)} 0, 0 ${px(c)})`;
      x.cover.dataset.state = 'on';
    }

    /** 5: the squares of the tone before shrink away, the bottom right first */
    function mosaic(x, top, vh) {
      const p = top >= vh ? 0 : clamp01((vh - top) / (vh * 0.85));
      const grid = x.grid;
      if (!grid) return;
      if ((p >= 1 && x.cover.dataset.state === 'done') || (p <= 0 && x.cover.dataset.state === 'shut')) return;
      for (const s of grid.sq) {
        const q = clamp01((p - s.w * 0.62) / 0.38);
        const v = q <= 0 ? 1 : q >= 1 ? 0 : 1 - smooth(q);
        if (v !== s.s && (Math.abs(v - s.s) > 0.004 || v === 0 || v === 1)) {
          s.el.style.transform = v === 1 ? '' : `scale(${v.toFixed(3)})`;
          s.s = v;
        }
      }
      x.cover.dataset.state = p >= 1 ? 'done' : p <= 0 ? 'shut' : 'on';
    }

    /** 3, 4 out of play: open (the block is in) or whole (it hasn't come yet) */
    function shut(x, open) {
      const want = open ? 'open' : 'whole';
      if (x.cover.dataset.state === want) return;
      x.cover.style.clipPath = open ? 'polygon(0 0, 0 0, 0 0)' : 'none';
      x.cover.dataset.state = want;
    }

    /* ---- when it moves ------------------------------------------------------------------------- */
    addEventListener('scroll', kick, { passive: true });
    let resizing = 0;
    const relayout = () => {
      cancelAnimationFrame(resizing);
      resizing = requestAnimationFrame(layout);
    };
    addEventListener('resize', relayout);
    const ro = new ResizeObserver(relayout);
    document.querySelectorAll('.blocks > .block').forEach((b) => ro.observe(b));
    // the homepage's two audiences show and hide blocks
    new MutationObserver(relayout).observe(document.querySelector('.blocks') || document.body, { attributes: true, attributeFilter: ['hidden', 'data-tone'], subtree: false, childList: true });
    document.querySelectorAll('.blocks > .block').forEach((b) =>
      new MutationObserver(relayout).observe(b, { attributes: true, attributeFilter: ['hidden'] }),
    );
    layout();
  }

  /* ---- colour ------------------------------------------------------------------------------------ */
  function rgb(s) {
    s = s.trim();
    if (s.startsWith('#')) {
      const h = s.length === 4 ? [...s.slice(1)].map((c) => c + c).join('') : s.slice(1, 7);
      return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    }
    const m = s.match(/[\d.]+/g);
    return m ? m.slice(0, 3).map(Number) : [255, 255, 255];
  }
  function mix(a, b, t) {
    return a.map((v, i) => v + (b[i] - v) * t);
  }
  function lum([r, g, b]) {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
})();
