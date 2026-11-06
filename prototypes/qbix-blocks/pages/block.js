/* =============================================================================
   QBIX · BLOCKS, the motion. One file, no libraries:
     - the stack: each block sticks once its foot is in view (block.css), so
       the next one covers it; here only the stick offset is measured
     - the nav takes the tone of the block under it, and fills once scrolled
     - the site's scenes, mounted as they come near, played by the scroll
       (the site's own mapping, lib/scene/driver.ts, in short)
     - words rise out of sleeves, blocks of words slide out of a mask, the
       highlighter wipes in, buttons wave
     - the converter, the audience switch, samples that play while pointed at
   ============================================================================= */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const smooth = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const wide = () => innerWidth >= 900 && innerHeight >= 560;
  const ARROW = '↗︎';

  /* ---- words in sleeves ---------------------------------------------------- */
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    let i = 0;
    const walk = (node) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const p of n.textContent.split(/(\s+)/)) {
            if (!p) continue;
            if (/^\s+$/.test(p)) {
              frag.append(' ');
              continue;
            }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('i');
            inner.textContent = p;
            inner.style.setProperty('--i', i++);
            w.append(inner);
            frag.append(w);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('keep')) walk(n);
      }
    };
    walk(el);
  }

  /* ---- buttons: each letter twice, for the wave ------------------------------ */
  function splitBtn(btn) {
    if (btn.dataset.split) return;
    btn.dataset.split = '1';
    const text = btn.textContent.trim();
    const arrow = text.includes('↗');
    const label = text.replace(/\s*↗︎?$/, '');
    if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', label);
    btn.textContent = '';
    const ch = (c, d, cls = 'ch') => {
      const s = document.createElement('span');
      s.className = cls;
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--d', d);
      const a = document.createElement('i');
      const b = document.createElement('i');
      a.textContent = b.textContent = c;
      s.append(a, b);
      return s;
    };
    [...label].forEach((c, d) => btn.append(ch(c, d)));
    if (arrow) {
      const ar = document.createElement('span');
      ar.className = 'arr';
      ar.setAttribute('aria-hidden', 'true');
      const svg = '<svg viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
      ar.innerHTML = svg + svg;
      btn.append(ar);
    }
  }

  /* ---- entrances ------------------------------------------------------------- */
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -8% 0px' },
  );
  function watch(scope = document) {
    scope.querySelectorAll('[data-rise]').forEach((el) => {
      splitWords(el);
      if (!el.classList.contains('is-in')) io.observe(el);
    });
    scope.querySelectorAll('[data-up], .mark[data-wipe]').forEach((el) => {
      if (!el.classList.contains('is-in')) io.observe(el);
    });
    scope.querySelectorAll('.btn').forEach(splitBtn);
  }
  /** play an entrance again (a headline swapped by the audience switch) */
  function replay(el) {
    el.querySelectorAll('.is-in').forEach((x) => x.classList.remove('is-in'));
    el.classList.remove('is-in');
    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.classList.add('is-in');
      el.querySelectorAll('[data-rise], [data-up], .mark[data-wipe]').forEach((x) => x.classList.add('is-in'));
    });
  }

  /* ---- display type, fitted by measurement --------------------------------------
     [data-fit] holds .line spans; each is measured for the size that sets its longest line
     to its container's width (never past data-max px × --u). The page has one XL size, so
     every fitted headline takes the smallest of those, and --t-xl-fit carries it to any
     other XL text (a price). Measured again once the faces are in and on resize. */
  function fit() {
    const els = [...document.querySelectorAll('[data-fit]')].filter((el) => el.offsetParent !== null && el.querySelector('.line'));
    if (!els.length) return;
    const k = parseFloat(getComputedStyle(root).getPropertyValue('--u')) || 1;
    els.forEach((el) => (el.style.fontSize = '100px'));
    const sizes = els.map((el) => {
      const widest = Math.max(...[...el.querySelectorAll('.line')].map((l) => l.getBoundingClientRect().width));
      const room = el.clientWidth * Number(el.dataset.fit || 1);
      const max = Number(el.dataset.max || 999) * k;
      const min = Number(el.dataset.min || 30);
      return Math.max(min, Math.min(max, (100 * room) / widest));
    });
    const size = Math.floor(Math.min(...sizes) * 2) / 2;
    els.forEach((el) => (el.style.fontSize = size + 'px'));
    root.style.setProperty('--t-xl-fit', size + 'px');
  }

  /* ---- the stack ---------------------------------------------------------------- */
  const stack = () => [...document.querySelectorAll('.blocks[data-stack] > .block')];
  function measure() {
    const vh = innerHeight;
    const shown = stack().filter((b) => !b.hidden);
    shown.forEach((b, i) => {
      b.style.setProperty('--stick', Math.min(0, vh - b.offsetHeight) + 'px');
      // followed by a block of its own tone, it scrolls on with it: an edge you can't see can't cover
      b.classList.toggle('is-flow', shown[i + 1]?.dataset.tone === b.dataset.tone);
      // and that next block joins it, no gap and no cut: one stretch of white (or dark), as Wise's pages read
      b.classList.toggle('is-cont', i > 0 && shown[i - 1].dataset.tone === b.dataset.tone);
    });
  }

  /* ---- the nav -------------------------------------------------------------------- */
  const nav = document.querySelector('.nav');
  function navTone() {
    if (!nav) return;
    if (root.classList.contains('menu-open')) {
      nav.dataset.tone = 'black';
      nav.classList.add('is-filled');
      return;
    }
    const hit = document.elementsFromPoint(innerWidth / 2, Math.round(nav.offsetHeight / 2));
    const block = hit.find((el) => !nav.contains(el) && el.closest('.block'))?.closest('.block');
    const tone = block?.dataset.tone || document.body.dataset.tone || 'white';
    if (nav.dataset.tone !== tone) nav.dataset.tone = tone;
    nav.classList.toggle('is-filled', scrollY > 8 || nav.classList.contains('has-sub-open'));
  }

  /* ---- the scenes ------------------------------------------------------------------- */
  const entries = new Set();
  window.QMSceneReady = (tl, n, section, intro) => {
    entries.add({ tl, n, section, intro, shown: 0, loadAt: null, step: -1 });
    kick();
  };
  /** where the scroll has a chapter's scene, in beats (0..n); null when it is far off */
  function target(e, now) {
    const vh = innerHeight;
    const r = e.section.getBoundingClientRect();
    if (!r.height || r.bottom < -vh || r.top > vh * 2) return null;
    const run = e.section.querySelector('.ch-run');
    // on a phone the scene pins with its caption (.ch-pin); what pins is what is measured
    const scene = e.section.querySelector('.ch-pin') || e.section.querySelector('.scene');
    const sr = scene?.getBoundingClientRect();
    const pinned = !wide() && run && sr && run.offsetHeight > (scene?.offsetHeight || 0) + 8;
    let intro;
    if (e.intro === 'load') {
      if (e.loadAt === null) {
        if (r.bottom < 0 || r.top > vh) return 0;
        e.loadAt = now;
      }
      intro = clamp01((now - e.loadAt) / 1700);
    } else if (pinned) {
      const top = parseFloat(getComputedStyle(scene).top) || 80;
      intro = clamp01((vh * 0.92 - sr.top) / Math.max(1, vh * 0.92 - top));
    } else {
      intro = clamp01((vh * 0.85 - r.top) / (vh * 0.85));
    }
    if (e.n < 2 || intro < 1) return intro;
    let p;
    if (pinned) {
      const rr = run.getBoundingClientRect();
      p = clamp01((sr.top - rr.top) / Math.max(1, rr.height - sr.height));
    } else {
      p = clamp01(-r.top / Math.max(1, r.height - vh));
    }
    const u = p * (e.n - 1);
    const i = Math.min(e.n - 2, Math.floor(u));
    return 1 + i + smooth(0.18, 0.82, u - i);
  }

  let raf = 0;
  let last = 0;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0.001, (now - (last || now - 16)) / 1000));
    last = now;
    let busy = false;
    for (const e of entries) {
      if (!e.section.isConnected) {
        entries.delete(e);
        continue;
      }
      const want = target(e, now);
      if (want === null) continue;
      const was = e.shown;
      if (reduced) e.shown = want > 0 ? Math.max(1, Math.round(want)) : 0;
      else {
        const next = e.shown + (want - e.shown) * (1 - Math.exp(-dt * 6.5));
        e.shown = Math.abs(want - next) < 0.0005 ? want : next;
      }
      if (e.shown !== was) e.tl.seek(e.shown);
      if (e.shown !== want || (e.intro === 'load' && want < 1)) busy = true;
      const step = Math.max(0, Math.min(e.n - 1, Math.round(e.shown) - 1));
      if (step !== e.step) {
        e.step = step;
        e.section.dataset.step = String(step);
        e.section.dispatchEvent(new CustomEvent('scene:step', { detail: step }));
      }
    }
    navTone();
    dockUpdate();
    if (busy) kick();
    else last = 0;
  }
  function kick() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  // a scene is mounted when its block comes within a screen of the window
  const mio = new IntersectionObserver(
    (es) =>
      es.forEach((en) => {
        if (!en.isIntersecting || !window.QMScenes) return;
        const box = en.target;
        mio.unobserve(box);
        let props = {};
        try {
          props = box.dataset.props ? JSON.parse(box.dataset.props) : {};
        } catch {}
        window.QMScenes.mount(box.dataset.scene, box, props);
      }),
    { rootMargin: '100% 0px 100% 0px' },
  );

  /* ---- the menu, under 900px: the nav's own links, big, on a black sheet ---------------------- */
  function menu() {
    const mid = nav?.querySelector('.nav-mid');
    const end = nav?.querySelector('.nav-end');
    if (!mid || !end) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-menu';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'nav-sheet');
    btn.innerHTML = '<span>Menu</span><i aria-hidden="true"></i>';
    end.append(btn);
    const sheet = document.createElement('div');
    sheet.className = 'nav-sheet';
    sheet.id = 'nav-sheet';
    sheet.dataset.tone = 'black';
    sheet.inert = true;
    const ul = document.createElement('ul');
    mid.querySelectorAll('.nav-links > li').forEach((li) => {
      const item = document.createElement('li');
      const sub = li.querySelector('.nav-sub');
      if (sub) {
        // Services: its name, then what's in it, a size down
        item.className = 'nav-sheet-group';
        const k = document.createElement('p');
        k.className = 'nav-sheet-k';
        k.textContent = li.querySelector('.nav-sub-btn').textContent.trim();
        item.append(k);
        sub.querySelectorAll('a').forEach((a) => {
          const c = document.createElement('a');
          c.href = a.getAttribute('href');
          c.className = 'mid';
          c.textContent = a.querySelector('b')?.textContent || a.textContent;
          item.append(c);
        });
      } else {
        const c = li.querySelector('a').cloneNode(true);
        c.className = 'big';
        item.append(c);
      }
      ul.append(item);
    });
    const foot = document.createElement('div');
    foot.className = 'nav-sheet-foot';
    // the two audiences: on the homepage they switch it, elsewhere they lead to it
    if (mid.querySelector('.aud[role="radiogroup"]')) {
      foot.insertAdjacentHTML('beforeend', '<p class="nav-sheet-aud"><a href="home.html" data-set-aud="ai">AI teams</a><a href="home.html?for=business" data-set-aud="biz">Business</a></p>');
    } else {
      const p = document.createElement('p');
      p.className = 'nav-sheet-aud';
      mid.querySelectorAll('.aud a').forEach((a) => p.append(a.cloneNode(true)));
      foot.append(p);
    }
    foot.insertAdjacentHTML('beforeend', `<a class="btn btn--line" href="start.html">Start a project ${ARROW}</a><a class="link" href="mailto:contact@qbix.space">contact@qbix.space</a>`);
    sheet.append(ul, foot);
    document.body.append(sheet);
    const set = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      btn.firstElementChild.textContent = open ? 'Close' : 'Menu';
      sheet.classList.toggle('is-open', open);
      sheet.inert = !open;
      root.classList.toggle('menu-open', open);
      navTone();
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    sheet.addEventListener('click', (ev) => ev.target.closest('a') && set(false));
    addEventListener('keydown', (ev) => ev.key === 'Escape' && root.classList.contains('menu-open') && set(false));
    matchMedia('(min-width: 900px)').addEventListener('change', (m) => m.matches && set(false));
  }

  /* ---- the brief, always at hand (Wise keeps its "Get in touch" so): hung at the bottom centre of every
     page from the start, in the tone under it.
     <body data-dock="off"> has none; data-dock-label / data-dock-href change what it says and where it goes. */
  let dockEl = null;
  function dock() {
    const b = document.body;
    if (b.dataset.dock === 'off') return;
    dockEl = document.createElement('div');
    dockEl.className = 'dock';
    dockEl.dataset.tone = 'white';
    const href = b.dataset.dockHref || 'start.html';
    const label = b.dataset.dockLabel || 'Start a brief';
    if (root.dataset.dockOption === '2') {
      // the moving clue: a strip at the bottom centre, short lines running past, the brief among them
      const clues = [`${label} ${ARROW}`, 'We read what you send and reply within 24 hours', 'From moodboard to a live domain', 'Bring the idea. We’ll build the thing.'];
      const run = `<span class="dock-run">${clues.map((c) => `<span>${c}</span>`).join('<i></i>')}<i></i></span>`;
      dockEl.classList.add('dock--clue');
      dockEl.innerHTML = `<a class="dock-clue" href="${href}" aria-label="${label}"><span class="dock-track" aria-hidden="true">${run}${run}</span></a>`;
    } else {
      const a = document.createElement('a');
      a.className = 'btn';
      a.href = href;
      a.textContent = `${label} ${ARROW}`;
      dockEl.append(a);
    }
    document.body.append(dockEl);
  }
  function dockUpdate() {
    if (!dockEl) return;
    const vh = innerHeight;
    // always there (2026-11-05, Yuan: "一直悬挂在最中间下面"), but not over the open menu
    const on = !root.classList.contains('menu-open');
    dockEl.classList.toggle('is-on', on);
    if (!on) return;
    const r = dockEl.getBoundingClientRect();
    const hit = document.elementsFromPoint(innerWidth / 2, Math.min(vh - 2, r.top + r.height / 2));
    const block = hit.find((x) => !dockEl.contains(x) && x.closest('.block'))?.closest('.block');
    const tone = block?.dataset.tone || document.body.dataset.tone || 'white';
    if (dockEl.dataset.tone !== tone) dockEl.dataset.tone = tone;
  }

  /* ---- Services: a panel under the bar, opened by pointing (with a mouse), clicking or the keys --- */
  function subnav() {
    nav?.querySelectorAll('.nav-has-sub').forEach((li) => {
      const btn = li.querySelector('.nav-sub-btn');
      let t = 0;
      const set = (open) => {
        clearTimeout(t);
        if (li.classList.contains('is-open') === open) return;
        li.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        nav.classList.toggle('has-sub-open', open);
        navTone();
      };
      btn.addEventListener('click', () => set(!li.classList.contains('is-open')));
      if (canHover) {
        li.addEventListener('pointerenter', () => set(true));
        li.addEventListener('pointerleave', () => {
          clearTimeout(t);
          t = setTimeout(() => set(false), 180);
        });
      }
      li.addEventListener('keydown', (ev) => {
        if (ev.key !== 'Escape') return;
        set(false);
        btn.focus();
      });
      li.addEventListener('focusout', (ev) => !li.contains(ev.relatedTarget) && set(false));
      document.addEventListener('click', (ev) => !li.contains(ev.target) && set(false));
      li.querySelectorAll('.nav-sub a').forEach((a) => a.addEventListener('click', () => set(false)));
    });
  }

  /* ---- a chapter's caption, for phones: the scene and the lit step's name pin together ---- */
  function captions() {
    document.querySelectorAll('.chapter .ch-run > .scene').forEach((scene) => {
      const run = scene.parentElement;
      const chapter = run.closest('.chapter');
      const pin = document.createElement('div');
      pin.className = 'ch-pin';
      run.insertBefore(pin, scene);
      pin.append(scene);
      // a step's name, without its note (small) or its state
      const names = [...chapter.querySelectorAll('.steps > li')].map((li) => {
        const c = li.cloneNode(true);
        c.querySelectorAll('small, .state').forEach((x) => x.remove());
        return c.textContent.replace(/\s+/g, ' ');
      });
      if (!names.length) return;
      const cap = document.createElement('p');
      cap.className = 'ch-cap';
      cap.setAttribute('aria-hidden', 'true');
      const n = document.createElement('span');
      n.className = 'n';
      const k = document.createElement('span');
      cap.append(n, k);
      pin.append(cap);
      const show = (i) => {
        n.textContent = `${String(i + 1).padStart(2, '0')} / ${String(names.length).padStart(2, '0')}`;
        k.textContent = names[i].trim();
      };
      show(0);
      chapter.addEventListener('scene:step', (ev) => show(Math.min(names.length - 1, ev.detail)));
    });
  }

  /* ---- a value swapped in its sleeve ------------------------------------------------ */
  function swap(el, html) {
    const cur = el.firstElementChild;
    if (cur && cur.innerHTML === html) return;
    const next = document.createElement('span');
    next.innerHTML = html;
    if (!cur || reduced) {
      el.replaceChildren(next);
      return;
    }
    [...el.children].slice(1).forEach((x) => x.remove());
    el.append(next);
    const o = { duration: 560, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' };
    cur.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-110%)' }], o);
    next.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], o).onfinish = () => {
      cur.remove();
      next.getAnimations().forEach((a) => a.cancel());
    };
  }

  /* ---- the converter -------------------------------------------------------------------
     [data-conv] holds a JSON list of options ({ k, time, price, get, href, act }), buttons
     .conv-opt[data-k] and the fields [data-f] they fill. Arrow keys move the choice. */
  function converter(el) {
    const items = JSON.parse(el.querySelector('script[type="application/json"]').textContent);
    const byK = new Map(items.map((x) => [x.k, x]));
    const opts = () => [...el.querySelectorAll('.conv-opt')].filter((b) => !b.hidden);
    const pick = (k, focus) => {
      const item = byK.get(k);
      if (!item) return;
      el.querySelectorAll('.conv-opt').forEach((b) => {
        const on = b.dataset.k === k;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      el.querySelectorAll('[data-f]').forEach((f) => {
        const v = item[f.dataset.f];
        if (f.tagName === 'A') {
          f.href = v;
          const label = item.act || f.getAttribute('aria-label');
          if (label && f.getAttribute('aria-label') !== label) {
            f.removeAttribute('data-split');
            f.removeAttribute('aria-label');
            f.textContent = label + ' ' + ARROW;
            splitBtn(f);
          }
        } else if (f.classList.contains('sw')) swap(f, v);
        else f.innerHTML = v;
      });
    };
    el.addEventListener('click', (ev) => {
      const b = ev.target.closest('.conv-opt');
      if (b) pick(b.dataset.k);
    });
    el.addEventListener('keydown', (ev) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(ev.key) || !ev.target.closest('.conv-opt')) return;
      ev.preventDefault();
      const list = opts();
      const i = list.indexOf(ev.target.closest('.conv-opt'));
      const d = ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : 1;
      pick(list[(i + d + list.length) % list.length].dataset.k, true);
    });
    el.pickFirst = () => opts()[0] && pick(opts()[0].dataset.k);
    el.pickFirst();
  }

  /* ---- the audience switch (the homepage's two modes) ------------------------------------ */
  function audience() {
    const sw = document.querySelector('.aud[role="radiogroup"]');
    if (!sw) return;
    const set = (a, first) => {
      root.dataset.aud = a;
      sw.querySelectorAll('[role="radio"]').forEach((b) => {
        const on = b.dataset.a === a;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      document.querySelectorAll('[data-aud-only]').forEach((el) => (el.hidden = el.dataset.audOnly !== a));
      document.querySelectorAll('[data-conv]').forEach((c) => c.pickFirst?.());
      if (!first) {
        document.querySelectorAll(`[data-aud-only="${a}"] [data-rise], [data-aud-only="${a}"][data-rise]`).forEach((h) => {
          if (h.getBoundingClientRect().top < innerHeight) replay(h);
        });
        history.replaceState(null, '', a === 'biz' ? '?for=business' : location.pathname);
      }
      watch();
      fit();
      measure();
      kick();
    };
    sw.addEventListener('click', (ev) => {
      const b = ev.target.closest('[role="radio"]');
      if (b) set(b.dataset.a);
      if (ev.target.closest('.aud-track')) set(root.dataset.aud === 'biz' ? 'ai' : 'biz');
    });
    sw.addEventListener('keydown', (ev) => {
      if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
      ev.preventDefault();
      set(root.dataset.aud === 'biz' ? 'ai' : 'biz');
      sw.querySelector('[aria-checked="true"]')?.focus();
    });
    document.addEventListener('click', (ev) => {
      const to = ev.target.closest('[data-set-aud]');
      if (!to) return;
      ev.preventDefault();
      set(to.dataset.setAud);
      scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
    set(new URLSearchParams(location.search).get('for') === 'business' ? 'biz' : 'ai', true);
  }

  /* ---- samples: the poster, and its few seconds while pointed at -----------------------------
     As on the site's /samples: with a mouse, a card plays while pointed at; on a touch screen
     the first tap plays it and the second opens it, and it stops once it leaves the screen. */
  function vcards(scope = document) {
    const stopOthers = (but) =>
      document.querySelectorAll('.vcard.is-playing').forEach((c) => c !== but && c.vstop?.());
    scope.querySelectorAll('.vcard').forEach((card) => {
      const v = card.querySelector('video');
      if (!v || card.dataset.wired) return;
      card.dataset.wired = '1';
      const play = () => {
        if (reduced) return;
        stopOthers(card);
        v.currentTime = 0;
        v.play().then(() => card.classList.add('is-playing')).catch(() => {});
      };
      const stop = () => {
        v.pause();
        card.classList.remove('is-playing');
      };
      card.vstop = stop;
      if (canHover) {
        card.addEventListener('pointerenter', play);
        card.addEventListener('pointerleave', stop);
        card.addEventListener('focus', play);
        card.addEventListener('blur', stop);
      } else {
        card.addEventListener('click', (ev) => {
          if (reduced || card.classList.contains('is-playing')) return;
          ev.preventDefault();
          play();
        });
        new IntersectionObserver(([en]) => !en.isIntersecting && stop()).observe(card);
      }
    });
  }

  /* ---- start: once the page's chosen variants are in (variants/variants.js), then the variants' own setup */
  function boot() {
    document.querySelectorAll('[data-conv]').forEach(converter);
    menu();
    subnav();
    dock();
    captions();
    audience();
    watch();
    vcards();
    document.querySelectorAll('[data-scene]').forEach((b) => mio.observe(b));
    fit();
    measure();
    navTone();
    const ro = new ResizeObserver(() => {
      measure();
      kick();
    });
    stack().forEach((b) => ro.observe(b));
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', () => {
      fit();
      measure();
      kick();
    });
    document.fonts?.ready.then(() => {
      fit();
      measure();
    });
    kick();
    window.Blocks = { watch, replay, swap, kick, measure, fit, vcards, navTone, reduced, canHover, wide };
    (window.BlocksAfter || []).forEach((f) => {
      try {
        f(window.Blocks);
      } catch (e) {
        console.error(e);
      }
    });
    window.BlocksAfter = { push: (f) => f(window.Blocks) }; // a variant that arrives later runs at once
  }
  Promise.resolve(window.BlocksReady).then(boot, boot);
})();
