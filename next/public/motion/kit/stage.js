/* =============================================================================
   QBIX MOTION — the demo harness.

   A demo describes how its motion is started, and the harness plays it:
   on a loop in a gallery tile (?tile), and in the detail view on a loop too
   until the viewer takes over (a scrub, a scroll, their own pointer), or
   when the page sends it a command.

     QM.demo({ kind: 'play',    dur, hold, lead, play(), reset() })
       a motion that plays once from rest (on load, on view, on a click)
     QM.demo({ kind: 'states',  n, seek(t), dwell })
       a scene with n states played by the scroll: t runs in beats, 0 (nothing
       drawn) to n, and the shown time chases the target as the site's driver
       does (lib/scene/driver.ts: 1 - e^(-6.5 dt))
     QM.demo({ kind: 'scroll',  dur, hold, back, stops })
       the page itself scrolls (real scroll timelines, real listeners); the
       harness scrolls it in a tile, the viewer scrolls it in the detail view
     QM.demo({ kind: 'hover',   targets, dur, enter(el), leave(el) })
       hover motion: a ghost pointer visits each target and sets .is-hot on it
     QM.demo({ kind: 'pointer', move(x, y), leave(), path(t) })
       motion that follows the pointer: the ghost draws a slow figure eight
     QM.demo({ kind: 'loop',    restart() })
       always running (ambient, generative)

   Messages from the gallery: { qm: 'cmd', cmd: 'replay' | 'pause' | 'seek', v }
   Messages to it: { qm: 1, type: 'info' | 'pos' | 'auto', ... }
   ============================================================================= */
(function () {
  const qs = new URLSearchParams(location.search);
  const TILE = qs.has('tile');
  // ?live: a card in the gallery's grid. It plays like a tile (no controls shown) but a real
  // pointer or key takes over, as in the detail view, and it loops again when left alone
  const LIVE = qs.has('live');
  const root = document.documentElement;
  if (TILE || LIVE) root.classList.add('qm-tile');
  if (LIVE) root.classList.add('qm-live');
  const embedded = window.parent !== window;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const post = (m) => {
    if (!embedded) return;
    try { window.parent.postMessage(Object.assign({ qm: 1, id: QM.id }, m), '*'); } catch (e) { /* detached */ }
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const easeMove = bezier(0.65, 0, 0.35, 1);

  const QM = (window.QM = {
    tile: TILE, live: LIVE, embedded, reduced, wait, clamp01, smooth, easeInOut, bezier,
    id: (location.pathname.split('/').pop() || '').replace(/\.html$/, ''),
  });

  /** A CSS cubic-bezier as a function of progress. */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const e = sx(t) - x, d = dx(t);
        if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      return sy(Math.min(1, Math.max(0, t)));
    };
  }

  /* --- the ghost pointer ---------------------------------------------------- */
  let ghost = null;
  let gx = 0, gy = 0;
  function ghostEl() {
    if (ghost) return ghost;
    ghost = document.createElement('div');
    ghost.className = 'qm-ghost is-off';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.innerHTML = '<svg width="22" height="28" viewBox="0 0 22 28"><path d="M1.5 1.5 L1.5 21.2 L6.3 16.6 L9.6 24.4 L13.2 22.9 L9.9 15.2 L16.4 15.2 Z" fill="#0b0c0e" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    document.body.appendChild(ghost);
    gx = window.innerWidth * 0.82;
    gy = window.innerHeight * 0.86;
    place();
    return ghost;
  }
  function place() { if (ghost) ghost.style.transform = `translate(${gx.toFixed(1)}px, ${gy.toFixed(1)}px)`; }
  QM.ghostShow = () => ghostEl().classList.remove('is-off');
  QM.ghostHide = () => ghost && ghost.classList.add('is-off');
  QM.ghostAt = (x, y) => { ghostEl(); gx = x; gy = y; place(); };
  /** Move the ghost to (x, y) over ms, eased like a hand (in-out). */
  QM.ghostTo = (x, y, ms = 700, my = token) => new Promise((res) => {
    ghostEl();
    const x0 = gx, y0 = gy, t0 = performance.now();
    const step = (now) => {
      if (my !== token) return res(false);
      const p = Math.min(1, (now - t0) / ms), k = easeMove(p);
      gx = x0 + (x - x0) * k;
      gy = y0 + (y - y0) * k;
      place();
      if (p < 1) requestAnimationFrame(step);
      else res(true);
    };
    requestAnimationFrame(step);
  });

  /* --- SplitText, for demos whose buttons are incidental (demos/split-cta.html has the piece itself) --- */
  QM.split = (el, { arrow = false, stagger = 18 } = {}) => {
    const text = el.textContent.trim();
    const chars = text.split('');
    if (arrow) chars.push('↗︎');
    el.textContent = '';
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = arrow ? `${text} ↗︎` : text;
    const wrap = document.createElement('span');
    wrap.className = 'split-text';
    const anim = document.createElement('span');
    anim.className = 'split-anim';
    anim.setAttribute('aria-hidden', 'true');
    chars.forEach((ch, i) => {
      const c = document.createElement('span');
      c.className = 'split-char' + (arrow && i === chars.length - 1 ? ' split-arrow' : '');
      c.style.setProperty('--d', `${i * stagger}ms`);
      const g = ch === ' ' ? ' ' : ch;
      c.innerHTML = `<span class="split-char-rest">${g}</span><span class="split-char-next">${g}</span>`;
      anim.appendChild(c);
    });
    wrap.appendChild(anim);
    el.append(sr, wrap);
    el.classList.add('split-cta');
    return el;
  };

  /* --- the run ---------------------------------------------------------------- */
  let token = 0;     // each new run cancels the one before
  let auto = true;   // looping by itself (a tile always is)
  let D = null;      // the demo
  let started = false;

  const setAuto = (on) => {
    if (auto === on) return;
    auto = on;
    post({ type: 'auto', on });
  };

  // states: the shown time chases the target (the site's driver)
  let shown = 0, target = 0, sraf = 0, slast = 0, chaseK = 6.5;
  function chase(now) {
    sraf = 0;
    const dt = Math.min(0.05, Math.max(0.001, (now - slast) / 1000));
    slast = now;
    let next = shown + (target - shown) * (1 - Math.exp(-dt * chaseK));
    if (Math.abs(target - next) < 0.0005) next = target;
    if (next !== shown) {
      shown = next;
      D.seek(shown);
      post({ type: 'pos', v: beatToV(shown) });
    }
    if (shown !== target) sraf = requestAnimationFrame(chase);
  }
  function aim(t, k = 6.5) {
    target = t;
    chaseK = k;
    if (!sraf) {
      slast = performance.now();
      sraf = requestAnimationFrame(chase);
    }
  }
  // a scrub's 0..1 to beats, as the site maps the scroll: the first state draws over the first
  // stretch, then each move sits in the middle of its stretch so every state holds a while
  function vToBeat(v) {
    const n = D.n || 1;
    if (n < 2) return clamp01(v) * n;
    const a = 1 / n;
    if (v <= a) return clamp01(v / a);
    const u = clamp01((v - a) / (1 - a)) * (n - 1);
    const i = Math.min(n - 2, Math.floor(u));
    return 1 + i + smooth(0.18, 0.82, u - i);
  }
  function beatToV(t) {
    const n = D.n || 1;
    if (n < 2) return clamp01(t / n);
    const a = 1 / n;
    if (t <= 1) return clamp01(t) * a;
    return a + ((t - 1) / (n - 1)) * (1 - a);
  }

  // scroll: the page's own scroll, eased
  const maxY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  function scrollTween(to, ms, my) {
    return new Promise((res) => {
      const from = window.scrollY, t0 = performance.now();
      const step = (now) => {
        if (my !== token) return res(false);
        const p = Math.min(1, (now - t0) / ms);
        window.scrollTo(0, from + (to - from) * easeInOut(p));
        if (p < 1) requestAnimationFrame(step);
        else res(true);
      };
      requestAnimationFrame(step);
    });
  }

  async function runPlay(my) {
    for (;;) {
      if (D.reset) D.reset();
      await wait(D.lead ?? 450);
      if (my !== token) return;
      D.play();
      post({ type: 'pos', v: 0, cycle: true });
      await wait((D.dur ?? 1200) + (D.hold ?? 1800));
      if (my !== token) return;
      if (!auto) return;
    }
  }

  async function runStates(my) {
    for (;;) {
      for (let k = 1; k <= D.n; k++) {
        aim(k);
        await wait(k === 1 ? (D.first ?? D.dwell ?? 2000) : (D.dwell ?? 2000));
        if (my !== token) return;
      }
      await wait(D.hold ?? 600);
      if (my !== token) return;
      aim(0, 4.5);
      await wait(D.rewind ?? 1500);
      if (my !== token) return;
    }
  }

  async function runScroll(my) {
    for (;;) {
      await wait(D.lead ?? 700);
      if (my !== token) return;
      const stops = D.stops || [1];
      for (const s of stops) {
        if (!(await scrollTween(maxY() * s, (D.dur ?? 5200) / stops.length, my))) return;
        await wait(D.pause ?? (stops.length > 1 ? 900 : 0));
        if (my !== token) return;
      }
      await wait(D.hold ?? 1400);
      if (my !== token) return;
      if (!(await scrollTween(0, D.back ?? 2400, my))) return;
      await wait(500);
      if (my !== token) return;
    }
  }

  async function runHover(my) {
    const els = Array.from(document.querySelectorAll(D.targets || '.split-cta'));
    if (!els.length) return;
    QM.ghostShow();
    for (;;) {
      for (const el of els) {
        const r = el.getBoundingClientRect();
        const x = r.left + r.width * 0.58, y = r.top + r.height * 0.62;
        if (!(await QM.ghostTo(x, y, D.travel ?? 760, my))) return;
        el.classList.add('is-hot');
        if (D.enter) D.enter(el);
        await wait(D.dur ?? 1500);
        el.classList.remove('is-hot');
        if (D.leave) D.leave(el);
        if (my !== token) return;
        if (!(await QM.ghostTo(x + 70, y + 56, 520, my))) return;
        await wait(D.gap ?? 420);
        if (my !== token) return;
      }
    }
  }

  async function runPointer(my) {
    QM.ghostShow();
    const t0 = performance.now();
    const path = D.path || ((t) => [
      window.innerWidth * (0.5 + 0.38 * Math.sin(t * 0.62)),
      window.innerHeight * (0.52 + 0.24 * Math.sin(t * 1.24 + 0.6)),
    ]);
    const step = (now) => {
      if (my !== token) return;
      const [x, y] = path((now - t0) / 1000);
      QM.ghostAt(x, y);
      if (D.move) D.move(x, y, true);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function run() {
    const my = ++token;
    if (!D) return;
    QM.ghostHide();
    document.querySelectorAll('.is-hot').forEach((el) => el.classList.remove('is-hot'));
    switch (D.kind) {
      case 'play': runPlay(my); break;
      case 'states': runStates(my); break;
      case 'scroll': runScroll(my); break;
      case 'hover': runHover(my); break;
      case 'pointer': runPointer(my); break;
      default: if (D.restart && started) D.restart();
    }
    started = true;
  }
  function stop() {
    token++;
    QM.ghostHide();
  }

  /* --- the viewer takes over (the detail view only) ------------------------ */
  let resumeAt = 0;
  function takeOver() {
    if (TILE) return;
    if (auto) {
      setAuto(false);
      stop();
      document.querySelectorAll('.is-hot').forEach((el) => el.classList.remove('is-hot'));
      if (D && D.leave && D.kind === 'pointer') D.leave();
    }
    clearTimeout(resumeAt);
  }
  function resumeLater(ms = 2200) {
    if (TILE || !D || !['hover', 'pointer'].includes(D.kind)) return;
    clearTimeout(resumeAt);
    resumeAt = setTimeout(() => {
      setAuto(true);
      run();
    }, ms);
  }
  if (!TILE) {
    window.addEventListener('pointermove', (e) => {
      if (!D || e.pointerType !== 'mouse') return;
      if (['hover', 'pointer'].includes(D.kind)) takeOver();
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => resumeLater());
    const manualScroll = () => { if (D && D.kind === 'scroll') takeOver(); };
    window.addEventListener('wheel', manualScroll, { passive: true });
    window.addEventListener('touchstart', manualScroll, { passive: true });
    window.addEventListener('keydown', (e) => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) manualScroll(); });
  }
  let sent = -1;
  window.addEventListener('scroll', () => {
    if (!D || D.kind !== 'scroll') return;
    const v = Math.round((window.scrollY / Math.max(1, maxY())) * 1000) / 1000;
    if (v !== sent) {
      sent = v;
      post({ type: 'pos', v });
    }
  }, { passive: true });

  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || m.qm !== 'cmd' || !D) return;
    if (m.cmd === 'replay') {
      setAuto(true);
      if (D.kind === 'scroll') window.scrollTo(0, 0);
      if (D.kind === 'states') { shown = target = 0; D.seek(0); }
      run();
    } else if (m.cmd === 'pause') {
      setAuto(false);
      stop();
    } else if (m.cmd === 'seek') {
      setAuto(false);
      stop();
      const v = clamp01(Number(m.v) || 0);
      if (D.kind === 'states') aim(vToBeat(v), 9);
      else if (D.kind === 'scroll') window.scrollTo(0, v * maxY());
      else if (D.seekPlay) D.seekPlay(v);
    }
  });

  /** Register the demo; it starts once the fonts are in (so first measures are right). */
  QM.demo = (o) => {
    D = o;
    const go = () => {
      post({ type: 'info', kind: o.kind, n: o.n || 0, scrub: o.kind === 'states' || o.kind === 'scroll' || !!o.seekPlay });
      if (o.kind === 'states') o.seek(0);
      run();
    };
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, wait(1500)]).then(() => requestAnimationFrame(go));
  };
})();
