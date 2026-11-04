/* =============================================================================
   QBIX MOTION · picks (batch 3) · the ghost driver for pieces played by drag and click.

   Harness glue, never part of a piece's copyable code. A piece keeps its own handlers
   (pointer events, clicks, keys); this moves the harness's ghost arrow and sends those
   handlers the same events a hand would, so a tile shows the real piece being used and the
   detail view lets the viewer take it over (the first real input stops the ghost; it comes
   back a couple of seconds after the pointer leaves). The same idea as assets/picks/p2-ghost.js,
   kept as its own file so no batch depends on another's.

     PickGhost.start({ reset, script, still, hot })
        reset()     put the piece back at rest, instantly
        script(g)   one pass, awaited; it loops
        still()     a composed still for prefers-reduced-motion (the script is not played)
        hot         selector for what takes .is-hot under the ghost (style it like :hover)
        moves       true: send pointermove to whatever is under the ghost, held or not (a hover piece)
     PickGhost.restart()              for QM.demo({ kind: 'loop', restart })
     PickGhost.fit(box, w, h, opts)   scale a w × h design box to the stage, centred, clear of
                                      the detail view's 46px bar if the piece has one; box.dataset.k holds the scale

   g, in script(g): wait(ms) · to(target, { ms, fx, fy, dx, dy, ease }) · click(target, opts)
   down() · up() · drag(points, ms) · key(k) · at(target, opts)
   A target is a selector, an element, a { x, y } or a function that returns one.
   ============================================================================= */
(function () {
  'use strict';
  const QM = window.QM;
  const CANCEL = { cancelled: true };
  const easeMove = QM.bezier(0.65, 0, 0.35, 1);
  const REJOIN = 2200;          // ms after the viewer's pointer leaves before the ghost plays again
  const REJOIN_TOUCH = 6000;    // …after a touch or a key, which have no "leave"

  let run = 0;                  // each begin() cancels the pass before it
  let cfg = null;
  let pos = { x: 0, y: 0 };
  let held = null;              // the element a scripted press landed on
  let hot = null;
  let rejoin = 0;
  let paused = false;
  let playing = false;

  const post = (on) => {
    if (window.parent === window) return;
    try { window.parent.postMessage({ qm: 1, id: QM.id, type: 'auto', on }, '*'); } catch (e) { /* detached */ }
  };
  const ghostNode = () => document.querySelector('.qm-ghost');
  const place = (x, y) => { pos.x = x; pos.y = y; QM.ghostAt(x, y); };

  /** A pointer event as a hand makes it. */
  function fire(el, type, x, y) {
    if (!el) return;
    el.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y,
      pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1,
    }));
  }
  function setHot(el) {
    const t = cfg && cfg.hot && el && el.closest ? el.closest(cfg.hot) : null;
    if (t === hot) return;
    if (hot) hot.classList.remove('is-hot');
    hot = t;
    if (hot) hot.classList.add('is-hot');
  }
  const under = () => document.elementFromPoint(pos.x, pos.y);
  function pressLook(on) {
    const n = ghostNode();
    if (!n) return;
    n.style.transition = 'opacity 240ms var(--ease), scale 110ms var(--ease)';
    n.style.scale = on ? '0.84' : '1';
  }

  function helpers(my) {
    const live = () => { if (my !== run) throw CANCEL; };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms)).then(live);
    const resolve = (t, o = {}) => {
      if (typeof t === 'function') t = t();
      if (t && typeof t.x === 'number') return { x: t.x + (o.dx || 0), y: t.y + (o.dy || 0) };
      const el = typeof t === 'string' ? document.querySelector(t) : t;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width * (o.fx ?? 0.5) + (o.dx || 0), y: r.top + r.height * (o.fy ?? 0.5) + (o.dy || 0) };
    };
    /** Glide the ghost to a target (re-read every frame, so it follows what moves). */
    const glide = (t, o = {}) => new Promise((res, rej) => {
      const x0 = pos.x, y0 = pos.y, t0 = performance.now(), ms = Math.max(1, o.ms ?? 650), ease = o.ease || easeMove;
      const step = (now) => {
        if (my !== run) return rej(CANCEL);
        const p = Math.min(1, (now - t0) / ms), k = ease(p), to = resolve(t, o);
        place(x0 + (to.x - x0) * k, y0 + (to.y - y0) * k);
        setHot(under());
        if (held) fire(held, 'pointermove', pos.x, pos.y);
        else if (cfg && cfg.moves) fire(under(), 'pointermove', pos.x, pos.y);   // a hover piece hears the ghost pass over it
        if (p < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
    const g = {
      wait,
      at: resolve,
      to: (t, o) => glide(t, o),
      async down() {
        pressLook(true);
        held = under();
        fire(held, 'pointerdown', pos.x, pos.y);
        await wait(0);
      },
      async up() {
        pressLook(false);
        const el = held, now = under();
        held = null;
        fire(el || now, 'pointerup', pos.x, pos.y);
        if (el && now && (el === now || el.contains(now) || now.contains(el))) {
          now.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, clientX: pos.x, clientY: pos.y, button: 0 }));
        }
        await wait(0);
      },
      async click(t, o = {}) {
        if (t !== undefined && t !== null) await glide(t, o);
        await g.down();
        await wait(o.hold ?? 90);
        await g.up();
      },
      /** With the press down, travel through points (targets) taking ms in all. */
      async drag(points, ms = 700, ease) {
        const each = ms / points.length;
        for (const p of points) await glide(p, { ms: each, ease: ease || ((x) => x) });
      },
      async key(k) {
        const el = document.activeElement && document.activeElement !== document.body ? document.activeElement : document.body;
        el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
        el.dispatchEvent(new KeyboardEvent('keyup', { key: k, bubbles: true }));
        await wait(0);
      },
    };
    return g;
  }

  async function pass(my) {
    const g = helpers(my);
    try {
      for (;;) {
        cfg.reset();
        QM.ghostShow();
        await g.wait(0);
        await cfg.script(g);
      }
    } catch (e) {
      if (e !== CANCEL) throw e;
    }
  }

  function begin() {
    clearTimeout(rejoin);
    paused = false;
    held = null;
    setHot(null);
    run++;
    if (QM.reduced) {
      cfg.reset();
      if (cfg.still) cfg.still();
      return;
    }
    playing = true;
    post(true);
    place(window.innerWidth * 0.86, window.innerHeight * 0.9);
    pass(run);
  }
  /** Register the piece. It begins once the harness has (the harness hides the ghost as it starts). */
  function start(c) {
    cfg = c;
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).then(() => requestAnimationFrame(() => requestAnimationFrame(begin)));
  }
  function stop() {
    run++;
    playing = false;
    held = null;
    setHot(null);
    QM.ghostHide();
    const n = ghostNode();
    if (n) n.style.scale = '1';
  }
  function takeOver(ms) {
    if (QM.tile || !cfg || paused || QM.reduced) return;
    if (playing) {                                  // the first input after the ghost was playing: it gives way
      stop();
      post(false);
      if (cfg.reset) cfg.reset();                   // and the piece is put back, so the viewer starts from rest
    }
    clearTimeout(rejoin);
    if (ms) rejoin = setTimeout(begin, ms);
  }

  if (!QM.tile) {
    window.addEventListener('pointermove', (e) => { if (e.isTrusted && e.pointerType === 'mouse') takeOver(0); }, { passive: true });
    window.addEventListener('pointerdown', (e) => { if (e.isTrusted) takeOver(e.pointerType === 'mouse' ? 0 : REJOIN_TOUCH); }, { passive: true });
    window.addEventListener('keydown', (e) => { if (e.isTrusted) takeOver(REJOIN_TOUCH); });
    document.documentElement.addEventListener('mouseleave', () => {
      if (!cfg || paused || playing || QM.reduced) return;      // only a viewer who took over is given the piece back
      clearTimeout(rejoin);
      rejoin = setTimeout(begin, REJOIN);
    });
  }
  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || m.qm !== 'cmd' || !cfg) return;
    if (m.cmd === 'pause') { paused = true; clearTimeout(rejoin); stop(); }     // replay comes through QM.demo's restart
  });

  window.PickGhost = {
    start,
    restart: () => { if (cfg) begin(); },
    /** Scale a w × h design box to the stage and keep it centred. */
    fit(box, w, h, { max = 2, gutter = 24 } = {}) {
      const apply = () => {
        const bar = QM.tile || !document.querySelector('.qm-ui') ? 0 : 46;
        const k = Math.max(0.2, Math.min(max, (innerWidth - gutter * 2) / w, (innerHeight - bar - gutter * 2) / h));
        box.dataset.k = k.toFixed(4);
        box.style.left = innerWidth / 2 + 'px';
        box.style.top = (innerHeight - bar) / 2 + 'px';
        box.style.transform = `translate(-50%, -50%) scale(${k.toFixed(4)})`;
      };
      addEventListener('resize', apply);
      apply();
    },
  };
})();
