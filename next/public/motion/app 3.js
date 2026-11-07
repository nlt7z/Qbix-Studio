/* =============================================================================
   QBIX MOTION — the gallery shell. Reads window.QMLIB (tools/build.py) and
   lays every piece out in one grid, in the shuffled order build.py gives it.
   A strip shows one category (or the saved pieces); a card shows its still
   and plays its preview video while the pointer is on it; a piece opens in
   the sheet, live, with its controls, spec and code. Served by
   tools/serve.py, a piece can also be filmed as a showcase video.
   ============================================================================= */
(function () {
  const LIB = window.QMLIB;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KIND = { play: 'plays', states: 'states', scroll: 'scroll', hover: 'hover', pointer: 'pointer', loop: 'always' };
  const HOW = {
    play: 'Plays on a loop',
    states: 'Drag to scrub the states',
    scroll: 'Scroll the frame, or drag',
    hover: 'Hover it',
    pointer: 'Move the pointer over it',
    loop: 'Always running',
  };
  const ORIGIN = { site: 'qbix.space', lab: 'Lab', picks: 'Picks', studio: 'Studio' };
  const MARK = '<span class="mark" aria-hidden="true"><svg viewBox="0 0 12 16"><path d="M1.5 1.5H10.5V14.3L6 10.9L1.5 14.3Z"/></svg></span>';
  const FILM = '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.75" y="3.25" width="9.5" height="9.5" rx="2"/><path d="M11.25 6.5 14.25 4.75v6.5L11.25 9.5"/></svg>';
  const HEART = '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13.6S2 10.1 2 6.1A3.1 3.1 0 0 1 8 4.6a3.1 3.1 0 0 1 6 1.5c0 4-6 7.5-6 7.5Z"/></svg>';
  const FORK = '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="4" cy="3.5" r="1.6"/><circle cx="12" cy="3.5" r="1.6"/><circle cx="8" cy="12.5" r="1.6"/><path d="M4 5.1v1.4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5.1M8 8.5v2.4"/></svg>';
  const SLIDERS = '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4.5h6M11.5 4.5h2M2.5 11.5h2M7.5 11.5h6"/><circle cx="10" cy="4.5" r="1.5"/><circle cx="6" cy="11.5" r="1.5"/></svg>';

  if (!LIB) {
    $('#groups').innerHTML = '<section class="group"><h2 class="group-title">No catalogue yet</h2><p class="group-blurb">Run python3 -I tools/build.py to build data.js.</p></section>';
    return;
  }
  const items = LIB.items.slice();
  const byId = new Map(items.map((it) => [it.id, it]));
  const groupOf = new Map(LIB.groups.map((g) => [g.id, g]));
  const originOf = (it) => (['lab', 'picks', 'studio'].includes(it.group) ? it.group : 'site');
  const CATS = LIB.cats || [];
  const catOf = new Map(CATS.map((c) => [c.id, c]));
  const catName = (it) => (catOf.get(it.cat) || {}).title || '';
  const root = document.documentElement;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage off: this visit only */ } },
  };

  // motion: WAAPI beats that only add to a visible state (fill backwards), nothing when reduced
  const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const play = (el, frames, o) => (reduced || !el.animate ? null : el.animate(frames, Object.assign({ easing: EXPO, fill: 'backwards' }, o)));
  // FLIP: the pieces that stay glide from where they were to where they are now
  function flip(change) {
    if (reduced) return change();
    const near = cards.filter((c) => !c.hidden && onScreen(c));
    const first = new Map(near.map((c) => [c, c.getBoundingClientRect()]));
    change();
    cards.forEach((c) => {
      if (c.hidden || !onScreen(c)) return;
      const a = first.get(c), b = c.getBoundingClientRect();
      if (a) {
        const dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 520, easing: EXPO });
      } else {
        c.animate([{ opacity: 0, transform: 'scale(0.97)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EXPO, fill: 'backwards' });
      }
    });
  }

  /* --- the theme: white by default, dark on request ----------------------------------- */
  const themeBtn = $('#theme');
  themeBtn.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  themeBtn.addEventListener('click', () => {
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = t;
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    store.set('qbix-motion.theme', t);
  });

  /* --- one library: every piece in one grid, shuffled; the strip shows one category ---- */
  const strip = $('#view');
  // New: the last seven days of studio drops (build.py marks them fresh), right after All
  const hasFresh = items.some((it) => it.fresh);
  if (hasFresh) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.dataset.view = 'new';
    b.title = 'Added in the last seven days';
    b.textContent = 'New';
    strip.appendChild(b);
  }
  CATS.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.dataset.view = c.id;
    b.title = c.blurb || '';
    b.textContent = c.title;
    strip.appendChild(b);
  });
  // a card: the still (its preview plays on hover), save, remix and tweak on the picture, the
  // name, the like under it. r, when given, is a member's remix of the piece.
  function cardHTML(it, r) {
    const title = r ? r.title : it.title;
    const line = r ? `by ${r.author ? r.author.name : 'a member'}` : (it.line || (it.spec && it.spec[0] ? it.spec[0][1] : ''));
    return `
      <a class="card-hit" href="${r ? `#/r/${esc(r.rid)}` : `#/${esc(it.id)}`}" aria-label="${esc(title)}: ${esc(r ? (r.note || `A remix of ${it.title}`) : (it.summary || ''))}"></a>
      <div class="card-view" data-tone="${esc(it.tone || 'dark')}">
        <div class="card-zoom">${it.thumb ? `<img src="${esc(it.thumb)}" alt="" loading="lazy" decoding="async">` : ''}<video class="card-vid" muted loop playsinline preload="none" disablepictureinpicture aria-hidden="true" tabindex="-1"></video></div>
        <div class="card-acts">
          <button class="ca save" type="button" aria-pressed="false" aria-label="Save ${esc(title)}" title="Save">${MARK}</button>
          <span class="ca-row">
            <button class="ca ca--remix" type="button" aria-label="Remix ${esc(title)}" title="Remix">${FORK}</button>
            <button class="ca ca--tweak" type="button" aria-label="Tweak ${esc(title)}" title="Tweak the details">${SLIDERS}</button>
          </span>
        </div>
      </div>
      <div class="card-info">
        <h3 class="card-title">${esc(title)}</h3>
        <p class="card-line"><span class="card-cat">${esc(r ? 'Remix' : catName(it))}</span>${line ? ` · ${esc(line)}` : ''}</p>
        <div class="card-side">
          <button class="act like" type="button" aria-pressed="false" aria-label="Like ${esc(title)}" title="Like">${HEART}<b class="like-n"></b></button>
          ${r ? '' : `<button class="act act--export" type="button" aria-label="Export ${esc(title)} as a video" title="Export video">${FILM}<b class="dl-n"></b></button>`}
        </div>
      </div>`;
  }
  function makeCard(it, r) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = it.id;               // the piece: its still, its preview
    card.dataset.key = r ? r.rid : it.id;  // what is liked and saved
    card.dataset.cat = it.cat || '';
    if (it.fresh && !r) card.dataset.fresh = '1';
    card.innerHTML = cardHTML(it, r);
    return card;
  }
  const sec = document.createElement('section');
  sec.className = 'group group--all';
  sec.id = 'all';
  sec.innerHTML = '<h2 class="sr-only">All pieces</h2><div class="grid"></div>';
  const grid = $('.grid', sec);
  items.forEach((it) => grid.appendChild(makeCard(it)));
  $('#groups').appendChild(sec);
  const cards = $$('.card');
  const cardOf = (id) => cards.find((c) => c.dataset.id === id);
  $('#built').textContent = LIB.built;

  (function heroIn() {
    const h = $('.hero-title');
    if (!h || reduced) return;
    // each word (the highlight as one) in its own line mask
    const parts = [];
    h.childNodes.forEach((n) => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((t) => parts.push(t));
      else parts.push(n);
    });
    h.textContent = '';
    parts.forEach((p) => {
      if (typeof p === 'string') {
        if (!p.trim()) return h.append(p);
        const w = document.createElement('span');
        w.className = 'hw';
        w.innerHTML = `<span>${esc(p)}</span>`;
        h.append(w);
      } else {
        const w = document.createElement('span');
        w.className = 'hw';
        const inner = document.createElement('span');
        inner.append(p);
        w.append(inner);
        h.append(w);
      }
    });
    const go = () => {
      $$('.hw > span', h).forEach((s, i) => play(s, [{ transform: 'translateY(108%)' }, { transform: 'none' }], { duration: 900, delay: 80 + i * 55 }));
      [$('.hero-line'), $('.hero-lede'), $('.hero-cta'), $('#toolbar')].forEach((el, i) => el && play(el, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 380 + i * 70 }));
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(go));
  })();

  // pieces come up as they reach the screen, a beat apart along the row
  const enter = new IntersectionObserver((entries) => {
    const fresh = entries.filter((e) => e.isIntersecting).map((e) => e.target);
    fresh.sort((a, b) => a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft);
    fresh.forEach((c, i) => {
      enter.unobserve(c);
      play(c, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 620, delay: Math.min(i, 5) * 70 });
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  cards.forEach((c) => enter.observe(c));

  const navEl = $('.nav');
  addEventListener('scroll', () => navEl.classList.toggle('is-scrolled', scrollY > 4), { passive: true });

  /* --- previews: a still until the pointer is on a piece, then its video plays ------------
     (one at a time, so the page never runs more than one piece; pieces without a video yet
     show the live piece while hovered) */
  let sheetOpen = false;
  const scaleObs = new ResizeObserver((entries) => {
    for (const e of entries) {
      e.target.style.setProperty('--s', String(e.contentRect.width / 800));
      if (e.target.id === 'stage-frame') zoomStage();
    }
  });
  scaleObs.observe($('#stage-frame'));
  let playing = null;
  function playPreview(card) {
    const it = byId.get(card.dataset.id);
    if (!it || sheetOpen || card.hidden) return;
    if (playing && playing !== card) stopPreview(playing);
    playing = card;
    if (it.preview) {
      const v = $('.card-vid', card);
      if (!v.getAttribute('src')) v.src = it.preview;
      v.onplaying = () => { if (playing === card) card.classList.add('is-playing'); };
      try { v.currentTime = 0; } catch (e) { /* not loaded yet: it starts at 0 anyway */ }
      const pr = v.play();
      if (pr) pr.catch(() => {});
    } else if (!card.querySelector('iframe')) {
      scaleObs.observe(card.querySelector('.card-view'));
      const f = document.createElement('iframe');
      f.title = it.title;
      f.tabIndex = -1;
      f.setAttribute('aria-hidden', 'true');
      f.addEventListener('load', () => setTimeout(() => f.classList.add('is-live'), 200));
      f.src = `${it.demo}?tile`;
      card.querySelector('.card-zoom').appendChild(f);
    }
  }
  function stopPreview(card) {
    if (!card) return;
    if (playing === card) playing = null;
    card.classList.remove('is-playing');
    const v = $('.card-vid', card);
    if (v && !v.paused) v.pause();
    card.querySelector('iframe')?.remove();
  }
  // any card on the page (the library, the community, the bench) plays the same way
  const main = $('#main');
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const seen = canHover ? null : new IntersectionObserver((es) => es.forEach((e) => (e.intersectionRatio >= 0.6 ? playPreview : stopPreview)(e.target)), { threshold: [0, 0.6] });
  if (canHover) {
    main.addEventListener('pointerover', (e) => { const c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) playPreview(c); });
    main.addEventListener('pointerout', (e) => { const c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) stopPreview(c); });
    main.addEventListener('focusin', (e) => { const c = e.target.closest('.card'); if (c) playPreview(c); });
    main.addEventListener('focusout', (e) => { const c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) stopPreview(c); });
  } else {
    // phones have no hover: the piece that is well in view plays
    cards.forEach((c) => seen.observe(c));
  }
  const onScreen = (el) => { const r = el.getBoundingClientRect(); return r.bottom > -160 && r.top < innerHeight + 160; };

  /* --- what is showing: the strip (a category, or saved) and the search ---------------- */
  const findEl = $('#find');
  const hay = new Map(items.map((it) => {
    const g = groupOf.get(it.group);
    return [it.id, [it.id, it.title, catName(it), it.summary, it.kind, it.line, (it.tags || []).join(' '), g ? g.title : '', ORIGIN[originOf(it)]].join(' ').toLowerCase()];
  }));
  const searchWords = () => findEl.value.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (id, words) => !words.length || words.every((w) => hay.get(id).includes(w));
  const SAVED_KEY = 'qbix-motion.saved';
  let saved = new Set();
  let view = 'all';
  const loadSaved = () => {
    try {
      const v = JSON.parse(store.get(SAVED_KEY) || '[]');
      saved = new Set(Array.isArray(v) ? v.filter((id) => byId.has(id)) : []);
    } catch (e) { saved = new Set(); }
  };
  const keepSaved = () => store.set(SAVED_KEY, JSON.stringify(Array.from(saved)));

  // no numbers on the page (Yuan): while searching, a tab with nothing for it just dims
  function counts() {
    const words = searchWords();
    const has = new Set();
    cards.forEach((c) => { if (matches(c.dataset.id, words)) { has.add(c.dataset.cat); if (c.dataset.fresh) has.add('new'); } });
    $$('#view button[data-view]').forEach((b) => b.classList.toggle('is-empty', b.dataset.view !== 'all' && !has.has(b.dataset.view)));
    $('#hero-count').textContent = 'Qbix Motion';
    $('#foot-count').textContent = 'Qbix Motion';
  }
  // signed out (with accounts), each category shows its first three pieces, then "Sign in to view more"
  const FREE_PER_CAT = 3;
  const free = new Set();
  (() => { const n = {}; items.forEach((it) => { n[it.cat] = (n[it.cat] || 0) + 1; if (n[it.cat] <= FREE_PER_CAT) free.add(it.id); }); })();
  const locked = (id) => C.full && !C.user && !free.has(id);
  function filter() {
    const words = searchWords();
    let shown = 0;
    const more = [];
    cards.forEach((c) => {
      const id = c.dataset.id;
      const inView = (view === 'all' || c.dataset.cat === view || (view === 'new' && !!c.dataset.fresh)) && matches(id, words);
      const ok = inView && !locked(id);
      if (inView && !ok) more.push(byId.get(id));
      c.hidden = !ok;
      if (ok) shown++;
      else if (playing === c) stopPreview(c);
    });
    paintGate(more);
    $$('#view button').forEach((b) => { const on = b.dataset.view === view; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
    placeInk();
    $('#all').hidden = !shown;
    $('#no-match').hidden = !!shown || !!more.length;
    $('#principles').hidden = !!words.length || view !== 'all';
    const cat = catOf.get(view);
    $('#toolbar-count').textContent = words.length ? `Matches for “${findEl.value.trim()}”${cat ? ` in ${cat.title}` : ''}` : '';
    counts();
  }
  const ink = $('.seg-ink');
  let inkPlaced = false;
  function placeInk() {
    const b = $(`#view button[data-view="${view}"]`);
    if (!b || !ink) return;
    if (!inkPlaced) ink.classList.add('is-jump');
    ink.style.width = `${b.offsetWidth}px`;
    ink.style.transform = `translateX(${b.offsetLeft}px)`;
    if (!inkPlaced) { void ink.offsetWidth; ink.classList.remove('is-jump'); inkPlaced = true; }
  }
  addEventListener('resize', () => { inkPlaced = false; placeInk(); });
  function setView(v, scroll) {
    view = catOf.has(v) || (v === 'new' && hasFresh) ? v : 'all';
    flip(filter);
    // on a narrow screen the strip scrolls: keep the tab that is on in sight
    const b = $(`#view button[data-view="${view}"]`);
    if (b && strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: b.offsetLeft - (strip.clientWidth - b.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
    if (scroll && scrollY > $('#toolbar').offsetTop) scrollTo({ top: $('#toolbar').offsetTop - 70, behavior: reduced ? 'auto' : 'smooth' });
  }
  $('#view').addEventListener('click', (e) => { const b = e.target.closest('[data-view]'); if (b) setView(b.dataset.view, true); });
  // every card with this key, wherever it is (the library, the community, the bench)
  const cardsFor = (key) => $$('.card').filter((c) => c.dataset.key === key);
  // the card for this key that is on screen now (the library's cards hide on the other pages)
  const shownCard = (key) => cardsFor(key).find((c) => c.offsetParent !== null && !c.hidden && onScreen(c));
  const popMark = (el) => el && play(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(0.34, 1.56, 0.46, 1)', fill: 'none' });
  function paintCard(c) {
    const k = c.dataset.key;
    $('.save', c).setAttribute('aria-pressed', String(saved.has(k)));
    const lk = $('.like', c);
    if (lk) { lk.setAttribute('aria-pressed', String(liked.has(k))); $('.like-n', lk).textContent = C.likes[k] || ''; }
    const dl = $('.act--export', c);
    if (dl) { const n = C.downloads[k] || 0; $('.dl-n', dl).textContent = n || ''; dl.title = n ? `Export video · downloaded ${n} ${n === 1 ? 'time' : 'times'}` : 'Export video'; }
  }
  function paintSaved() {
    $$('.card').forEach(paintCard);
    const k = curKey();
    if (k) {
      $('[data-save]', sheet).setAttribute('aria-pressed', String(saved.has(k)));
      $('[data-like]', sheet).setAttribute('aria-pressed', String(liked.has(k)));
      $('[data-like-n]', sheet).textContent = C.likes[k] || '';
      $('[data-dl-n]', sheet).textContent = C.downloads[k] || '';
    }
    $$('[data-bench-count]').forEach((el) => (el.textContent = saved.size || ''));
  }
  // saving and liking: an account's, kept by the server; opened from disk, saves stay in this browser
  async function toggleSave(key) {
    if (!key) return;
    if (C.on && !C.user) return openAuth('save', () => { if (!saved.has(key)) toggleSave(key); });   // signed in, it may be saved already
    const on = !saved.has(key);
    if (on) saved.add(key); else saved.delete(key);
    paintSaved();
    if (on) [...cardsFor(key).map((c) => $('.save .mark', c)), sheetOpen && curKey() === key && $('[data-save] .mark', sheet)].forEach(popMark);
    if (!C.on) { keepSaved(); renderBench(); return; }
    try {
      const j = await api('/api/save', { id: key, on });
      C.saves[key] = j.n;
    } catch (err) {
      if (on) saved.delete(key); else saved.add(key);
      paintSaved();
      showToast(`Could not save it: ${err.message}`, { ms: 3600 });
    }
    renderBench();
  }
  async function toggleLike(key) {
    if (!key) return;
    if (!C.full) return;
    if (!C.user) return openAuth('like', () => toggleLike(key));
    const on = !liked.has(key);
    if (on) liked.add(key); else liked.delete(key);
    C.likes[key] = Math.max(0, (C.likes[key] || 0) + (on ? 1 : -1));
    paintSaved();
    if (on) [...cardsFor(key).map((c) => $('.like .i', c)), sheetOpen && curKey() === key && $('[data-like] .i', sheet)].forEach(popMark);
    try {
      const j = await api('/api/like', { id: key, on });
      C.likes[key] = j.n;
    } catch (err) {
      if (on) liked.delete(key); else liked.add(key);
      showToast(`Could not like it: ${err.message}`, { ms: 3600 });
    }
    paintSaved();
  }
  findEl.addEventListener('input', () => flip(filter));
  findEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#toolbar').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    else if (e.key === 'Escape') { findEl.value = ''; filter(); findEl.blur(); }
  });
  addEventListener('storage', (e) => { if (e.key === SAVED_KEY && !C.on) { loadSaved(); paintSaved(); renderBench(); } });

  /* =============================================================================
     SERVED — tools/serve.py films pieces and keeps the community on this Mac
     (accounts, likes, saves, remixes). The static copy on qbix.space has the
     site's accounts only (window.QM_API, set by tools/site.py): join, sign in,
     save, and copy code once signed in. Opened from disk, none of that shows.
     C.on: there are accounts. C.full: the whole community (likes, remixes,
     the community page, the pieces kept for members). C.off: there should be
     accounts but they are not open yet (the site answered 'accounts-off').
     ============================================================================= */
  let canEdit = false;
  const served = /^https?:$/.test(location.protocol);
  const toast = $('#toast');
  const C = { on: false, full: false, off: false, user: null, members: 0, likes: {}, saves: {}, downloads: {}, top: [], remixes: [] };
  let liked = new Set();
  // the local server answers at /api/…; the site at window.QM_API (/api/motion/…)
  const API = window.QM_STATIC ? window.QM_API || '' : '/api';
  async function api(path, body) {
    const r = await fetch(path.replace(/^\/api/, API), body === undefined
      ? { headers: { 'X-QM': '1' }, cache: 'no-store' }
      : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-QM': '1' }, body: JSON.stringify(body) });
    let j = {};
    try { j = await r.json(); } catch (e) { /* not JSON */ }
    if (!r.ok || !j.ok) { const err = new Error(j.error || `The server answered ${r.status}.`); err.status = r.status; throw err; }
    return j;
  }

  if (served && !window.QM_STATIC) {
    fetch('/api/ping', { headers: { 'X-QM': '1' }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j) return;
        canEdit = !!j.export;
        if (j.community) C.on = C.full = true;   // then filming waits for an admin to sign in
        paintExport();
        if (j.community) bootAccounts();
      })
      .catch(() => {});
  } else if (served && API) {
    // qbix.space: the site's accounts. The gate is soft, as on this Mac: the demo pages themselves
    // hold the code (anyone can open one alone), so this asks people to join rather than hiding it.
    C.on = true;
    bootAccounts();
  }

  /* =============================================================================
     COMMUNITY — join, sign in, the nav's avatar, the community and bench pages
     ============================================================================= */
  async function bootAccounts() {
    root.classList.add('has-accounts');
    root.classList.toggle('has-community', C.full);
    $$('[data-needs-accounts]').forEach((el) => (el.hidden = false));
    if (C.full) $$('[data-needs-community]').forEach((el) => (el.hidden = false));
    $('#auth-note').textContent = C.full ? 'Accounts live on this Mac, in the library\'s own folder.' : 'Your account is kept by qbix.space. We never send email.';
    await refreshMe();
    await refreshCommunity();
    route();
  }
  async function refreshMe() {
    try {
      const j = await api('/api/me');
      C.off = false;
      C.user = j.user || null;
      liked = new Set(j.liked || []);
      C.downloads = j.downloads || {};
      if (C.user) {
        // saves made in this browser before joining move into the account
        const local = (() => { try { const v = JSON.parse(store.get(SAVED_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } })();
        const server = new Set(j.saved || []);
        const moving = local.filter((id) => byId.has(id) && !server.has(id));
        for (const id of moving) { try { await api('/api/save', { id, on: true }); server.add(id); } catch (e) { /* keep the rest */ } }
        if (local.length) store.set(SAVED_KEY, '[]');
        saved = server;
      } else {
        saved = new Set();
      }
    } catch (e) {
      C.user = null;
      C.off = e.status === 503;   // the site's store is not set up yet: joining opens soon
    }
    paintAuth();
    paintSaved();
    renderBench();
  }
  async function refreshCommunity() {
    if (!C.full) return;
    try {
      const j = await api('/api/community');
      Object.assign(C, { members: j.members || 0, likes: j.likes || {}, saves: j.saves || {}, top: j.top || [], remixes: j.remixes || [] });
    } catch (e) { /* the counts stay as they were */ }
    paintSaved();
    renderCommunity();
    renderBench();
    counts();
  }
  // filming is the admin's: with accounts, only an admin account sees the film buttons
  function paintExport() {
    const ok = canEdit && (!C.on || !!(C.user && C.user.admin));
    root.classList.toggle('can-edit', ok);
    $('[data-export-open]', sheet).hidden = !ok;
    if (!ok && !$('#export-pop').hidden) $('#export-pop').hidden = true;
  }
  function paintAuth() {
    const u = C.user;
    paintExport();
    $$('[data-join]').forEach((b) => (b.hidden = !C.on || !!u));
    $$('[data-signed-out]').forEach((el) => (el.hidden = !!u));
    $$('[data-signed-in]').forEach((el) => (el.hidden = !u));
    $('#me').hidden = !u;
    if (u) {
      $('#me-avatar').textContent = u.initials || (u.name || '?').slice(0, 1).toUpperCase();
      $('#me-name').textContent = u.name;
      $('#me-handle').textContent = `@${u.handle}${u.admin ? ' · admin, can film' : ''}`;
    }
    $('[data-remix-publish]').textContent = !C.full ? 'Copy code' : u ? 'Publish remix' : 'Join to publish';
    if (cur) setTab(tabOn);
    filter();
  }

  // the join and sign-in dialog
  const auth = $('#auth');
  const authForm = $('#auth-form');
  let authMode = 'join', authThen = null, authBack = null;
  const WHY = {
    hero: 'Join for free to copy any piece\'s code and keep a bench of the ones you like.',
    save: 'Join for free to save pieces to your bench.',
    like: 'Join for free to like pieces and remixes.',
    code: 'Join for free to get the full code and the prompt for Claude.',
    remix: 'Join for free to publish your remix to the community.',
    bench: 'Join for free to keep a bench of the pieces you like.',
    more: 'Join for free to see every piece, its full code and its remixes.',
  };
  function setAuthMode(m) {
    authMode = m;
    $$('.auth-mode button').forEach((b) => { const on = b.dataset.mode === m; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
    $$('[data-only="join"]', authForm).forEach((el) => (el.hidden = m !== 'join'));
    $('#auth-title').textContent = m === 'join' ? 'Join Qbix Motion' : 'Welcome back';
    $('.auth-go', authForm).textContent = m === 'join' ? 'Join for free' : 'Sign in';
    authForm.password.setAttribute('autocomplete', m === 'join' ? 'new-password' : 'current-password');
    $('#auth-err').textContent = '';
  }
  function openAuth(why, then) {
    if (!C.on) return;
    authThen = then || null;
    authBack = document.activeElement;
    $('#auth-why').textContent = WHY[why] || (C.full ? 'Like and save pieces, publish remixes and get the full code.' : 'Copy any piece\'s code and keep a bench of the ones you like.');
    setAuthMode(authMode);
    // the site's accounts not open yet: say so, with no form to fill
    auth.classList.toggle('is-off', C.off);
    if (C.off) {
      $('#auth-title').textContent = 'Joining opens soon';
      $('#auth-why').textContent = 'Accounts for Qbix Motion are almost ready. Until then every piece plays here, with the first lines of its code.';
    }
    auth.hidden = false;
    play($('.auth-card', auth), [{ opacity: 0, transform: 'translateY(12px) scale(0.98)' }, { opacity: 1, transform: 'none' }], { duration: 360 });
    setTimeout(() => (C.off ? $('.auth-ok', auth) : authMode === 'join' ? authForm.name : authForm.email).focus(), 30);
  }
  function closeAuth() {
    auth.hidden = true;
    authThen = null;
    if (authBack && authBack.focus) authBack.focus({ preventScroll: true });
  }
  $('.auth-mode').addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (b) setAuthMode(b.dataset.mode); });
  $$('[data-auth-close]', auth).forEach((b) => b.addEventListener('click', closeAuth));
  auth.addEventListener('click', (e) => { if (e.target === auth) closeAuth(); });
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = authForm, err = $('#auth-err'), go = $('.auth-go', f);
    const name = f.name.value.trim(), email = f.email.value.trim(), password = f.password.value;
    if (authMode === 'join' && !name) return void (err.textContent = 'Add your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return void (err.textContent = 'That email does not look right.');
    if (password.length < 8) return void (err.textContent = 'The password needs 8 characters or more.');
    err.textContent = '';
    go.disabled = true;
    try {
      const j = await api(authMode === 'join' ? '/api/join' : '/api/signin', authMode === 'join' ? { name, email, password } : { email, password });
      const then = authThen;
      f.reset();
      closeAuth();
      await refreshMe();
      await refreshCommunity();
      showToast(authMode === 'join' ? `Welcome to Qbix Motion, ${j.user.name}.` : `Welcome back, ${j.user.name}.`, { ms: 2600 });
      if (then) then();
    } catch (x) {
      if (x.status === 503) { C.off = true; openAuth('', authThen); return; }
      err.textContent = x.message;
    } finally {
      go.disabled = false;
    }
  });

  // the avatar's menu
  const meBtn = $('.me-btn'), meMenu = $('#me-menu');
  const setMenu = (open) => { meMenu.hidden = !open; meBtn.setAttribute('aria-expanded', String(open)); if (open) play(meMenu, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 220 }); };
  meBtn.addEventListener('click', (e) => { e.stopPropagation(); setMenu(meMenu.hidden); });
  document.addEventListener('click', (e) => { if (!meMenu.hidden && !e.target.closest('#me')) setMenu(false); });
  meMenu.addEventListener('click', (e) => { if (e.target.closest('a, button')) setMenu(false); });
  $('[data-signout]').addEventListener('click', async () => {
    try { await api('/api/signout', {}); } catch (e) { /* signed out either way */ }
    C.user = null;
    await refreshMe();
    showToast('Signed out.', { ms: 1800 });
  });

  // the pages: the library, the community, your bench
  let page = 'library';
  function setPage(p) {
    if (p === 'community' && !C.full) p = 'library';
    const moved = p !== page;
    page = p;
    root.dataset.page = p;
    $$('.nav-tabs [data-page]').forEach((a) => a.classList.toggle('is-on', a.dataset.page === p));
    if (moved) {
      scrollTo(0, 0);
      const head = $(`#page-${p} .page-head`);
      if (head) play(head, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 520 });
    }
  }
  // the foot of a list a visitor can't see all of: the next pieces' stills, fading, and the way in
  function paintGate(more) {
    const gate = $('#more-gate');
    gate.hidden = !more.length;
    $('#more-peek').innerHTML = more.slice(0, 3).map((it) => `<div class="card-view" data-tone="${esc(it.tone || 'dark')}">${it.thumb ? `<img src="${esc(it.thumb)}" alt="" loading="lazy" decoding="async">` : ''}</div>`).join('');
  }
  const remixOf = (rid) => C.remixes.find((r) => r.rid === rid);
  function cardFor(key) {
    if (byId.has(key)) return makeCard(byId.get(key));
    const r = remixOf(key);
    return r && byId.has(r.base) ? makeCard(byId.get(r.base), r) : null;
  }
  function fillGrid(grid, keys, empty) {
    grid.querySelectorAll('.card').forEach((c) => { if (playing === c) stopPreview(c); if (seen) seen.unobserve(c); });
    grid.textContent = '';
    keys.forEach((k) => { const c = cardFor(k); if (c) { paintCard(c); grid.appendChild(c); if (seen) seen.observe(c); } });
    if (empty) $(empty).hidden = !!grid.children.length;
  }
  function renderCommunity() {
    if (!C.full) return;
    $('#community-line').textContent = 'What members like, save and remix. Accounts and remixes are kept on this Mac.';
    fillGrid($('#top-grid'), C.top, '#top-empty');
    fillGrid($('#remix-grid'), C.remixes.map((r) => r.rid), '#remix-empty');
  }
  function renderBench() {
    fillGrid($('#bench-grid'), [...saved], '#bench-empty');
    const mine = C.user ? C.remixes.filter((r) => r.author && r.author.id === C.user.id).map((r) => r.rid) : [];
    fillGrid($('#mine-grid'), mine, '#mine-empty');
    $('#bench-line').textContent = C.on && !C.user ? 'Join for free and the pieces you save stay with your account.' : 'The pieces you saved and the remixes you made.';
  }

  function showToast(text, { ms = 0 } = {}) {
    $('#toast-text').textContent = text;
    if (toast.hidden) play(toast, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 360 });
    toast.hidden = false;
    clearTimeout(toast._t);
    if (ms) toast._t = setTimeout(() => (toast.hidden = true), ms);
  }

  /* =============================================================================
     EXPORTING — the server films a piece in its showcase frame (tools/export.cjs)
     ============================================================================= */
  const FORMAT_NAME = { '16x9': '16:9', '1x1': '1:1', '9x16': '9:16' };
  const fileName = (it, fmt, secs) => `${it.title.replace(/[\\/:*?"<>|]+/g, '').trim()} · ${FORMAT_NAME[fmt].replace(':', 'x')} · ${secs}s.mp4`;
  const download = (url, name) => {
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  async function film(id, fmt, secs, onProgress) {
    const r = await fetch('/api/export', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-QM': '1' }, body: JSON.stringify({ id, format: fmt, secs }) });
    let j = await r.json();
    if (!r.ok || !j.ok) throw new Error(j.error || r.status);
    for (;;) {
      onProgress(j.state, j.progress || 0);
      if (j.state === 'done') return j.url;
      if (j.state === 'error') throw new Error(j.error || 'the film failed');
      await new Promise((res) => setTimeout(res, 700));
      const s2 = await fetch(`/api/export/${encodeURIComponent(j.job)}`, { headers: { 'X-QM': '1' }, cache: 'no-store' });
      j = { job: j.job, ...(await s2.json()) };
    }
  }
  // each download of a film counts (the server logs the GET of the file); the count beside the film icon follows at once
  function countDownload(id) {
    C.downloads[id] = (C.downloads[id] || 0) + 1;
    paintSaved();
    [...cardsFor(id).map((c) => $('.act--export .dl-n', c)), sheetOpen && curKey() === id && $('[data-dl-n]', sheet)].forEach(popMark);
  }
  $('#export-state').addEventListener('click', (e) => { if (e.target.closest('a[download]') && cur) countDownload(cur.id); });
  // from a piece's icon: the default film, its progress in the toast
  async function quickFilm(id) {
    const it = byId.get(id);
    if (!it || !root.classList.contains('can-edit')) return;
    const say = (state, p) => showToast(state === 'queued' ? `Waiting to film “${it.title}”` : `Filming “${it.title}” · ${Math.round(p * 100)}%`);
    try {
      const url = await film(id, '16x9', 10, say);
      download(url, fileName(it, '16x9', 10));
      countDownload(id);
      showToast(`Saved “${it.title}” · 16:9 · 10 s`, { ms: 3200 });
    } catch (err) {
      showToast(`Could not film “${it.title}”: ${err.message || err}`, { ms: 5000 });
    }
  }

  /* =============================================================================
     THE SHEET
     ============================================================================= */
  const sheet = $('#sheet');
  const stage = $('#stage-view');
  const frame = $('#stage-frame');
  const scrub = $('#scrub');
  const codeEl = $('#code code');
  const tabsEl = $('#code-tabs');
  let cur = null, curRemix = null, tabs = [], tabOn = 0, dragging = false, paused = false;
  // what the sheet's like and save act on: the remix showing, or the piece
  function curKey() { return curRemix ? curRemix.rid : cur ? cur.id : null; }
  const gated = () => C.on && !C.user;
  const GATE_LINES = 14;
  const dateOf = (t) => {
    const d = new Date(typeof t === 'number' ? (t < 1e12 ? t * 1000 : t) : t);
    return isNaN(d) ? '' : d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  function highlight(src) {
    // comments dimmed, nothing else coloured
    const re = /(\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|(^|[^:\\'"])\/\/[^\n]*)/g;
    let out = '', i = 0, m;
    while ((m = re.exec(src))) {
      let start = m.index, text = m[0];
      if (m[2] !== undefined && !text.startsWith('/*') && !text.startsWith('<!--')) { start += m[2].length; text = text.slice(m[2].length); }
      out += esc(src.slice(i, start)) + `<span class="c">${esc(text)}</span>`;
      i = start + text.length;
      re.lastIndex = i;
    }
    return out + esc(src.slice(i));
  }
  // one block a line, so each gets its number (app.css counts them); a comment that runs over
  // several lines is closed at each line's end and opened again on the next
  function numbered(src) {
    let open = false;
    const lines = highlight(src.replace(/\n$/, '')).split('\n').map((line) => {
      const out = `${open ? '<span class="c">' : ''}${line}`;
      open = (open ? 1 : 0) + (line.match(/<span class="c">/g) || []).length - (line.match(/<\/span>/g) || []).length > 0;
      return `<span class="l">${out}${open ? '</span>' : ''}</span>`;
    });
    codeEl.parentElement.style.setProperty('--ln', `${String(lines.length).length}ch`);
    return lines.join('');
  }
  // signed out, the code shows its first lines and the way in
  function setTab(i) {
    tabOn = i;
    $$('button', tabsEl).forEach((t, j) => { t.classList.toggle('is-on', j === i); t.setAttribute('aria-selected', String(j === i)); });
    const text = tabs[i] ? tabs[i].text : '';
    const g = gated();
    codeEl.innerHTML = numbered(g ? text.split('\n').slice(0, GATE_LINES).join('\n') : text);
    $('#code-wrap').classList.toggle('is-gated', g);
    $('#code-gate').hidden = !g;
    $('#code').scrollTop = 0;
    $('#code').scrollLeft = 0;
  }
  // the side's panes: the code (the default), the tweaks, what the piece is
  const tabTweak = $('#info-tabs [data-pane="tweak"]');
  let pane = 'code';
  function setPane(p) {
    if (p === 'tweak' && tabTweak.hidden) p = 'code';
    pane = p;
    $$('#info-tabs [data-pane]').forEach((b) => { const on = b.dataset.pane === p; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
    $('#pane-code').hidden = p !== 'code';
    $('#tweak').hidden = p !== 'tweak';
    $('#pane-about').hidden = p !== 'about';
  }
  $('#info-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-pane]'); if (b) setPane(b.dataset.pane); });
  function setTabs(code, tuned, keep) {
    const c = code || {};
    tabs = c.files
      ? c.files.map((f) => ({ label: f.path.split('/').pop(), text: f.text, path: f.path }))
      : [{ label: 'File', text: c.file }, { label: 'HTML', text: c.html }, { label: 'CSS', text: c.css }, { label: 'JS', text: c.js }].filter((t) => t.text);
    tabsEl.innerHTML = tabs.map((t, i) => `<button type="button" role="tab" data-tab="${i}" title="${esc(t.path || t.label)}">${esc(t.label)}</button>`).join('') + (tuned ? '<span class="tuned">Tuned</span>' : '');
    setTab(keep ? Math.min(tabOn, Math.max(0, tabs.length - 1)) : 0);
  }
  // a member's remix is someone else's code: it runs sandboxed, in an opaque origin, so it can
  // never reach the API with the viewer's session. The pieces and their tweaks are the library's own.
  function stageShow(o) {
    if (o.untrusted) stage.setAttribute('sandbox', 'allow-scripts');
    else stage.removeAttribute('sandbox');
    if (o.doc != null) stage.srcdoc = o.doc;
    else { stage.removeAttribute('srcdoc'); stage.src = o.src; }
  }
  function addTicks(n) {
    for (let k = 1; k <= n; k++) {
      const a = 1 / n;
      const v = n < 2 ? 1 : k === 1 ? a : a + ((k - 1) / (n - 1)) * (1 - a);   // where kit/stage.js puts state k
      const t = document.createElement('span');
      t.className = 'scrub-tick';
      t.style.left = `${v * 100}%`;
      t.textContent = pad(k);
      scrub.appendChild(t);
    }
  }
  // 素材放大: on a wide screen the piece is drawn on a page the stage's size over z, then scaled up
  // by z to fill it (app.css #stage-view). z is the stage's width over 800 (the size every piece is
  // made for), at least 1 and at most 1.35, so the page it gets is never narrower than 800.
  const ZOOM_BASE = 800, ZOOM_MAX = 1.35;
  function zoomStage() {
    const w = frame.clientWidth;
    const z = innerWidth > 960 && w ? Math.min(ZOOM_MAX, Math.max(1, w / ZOOM_BASE)) : 1;
    frame.style.setProperty('--z', z.toFixed(3));
  }
  function setPause(p) {
    paused = p;
    $('.stage', sheet).classList.toggle('is-paused', p);
    $('[data-pause]', sheet).classList.toggle('is-on', p);
    $('[data-replay]', sheet).classList.toggle('is-on', !p);
  }
  // what the sheet steps through: the pieces showing, in the grid's order
  const order = () => items.filter((it) => { const c = cardOf(it.id); return c && !c.hidden; });

  function fill(it, r) {
    curRemix = r || null;
    const g = groupOf.get(it.group) || {};
    const all = order(), n = r ? 0 : all.indexOf(it) + 1;
    $('#crumb').innerHTML = r
      ? `<span>Motion</span><i>/</i><span class="grp">Remix</span><i>/</i><b>${esc(r.title)}</b>`
      : `<span>Motion</span><i>/</i><span class="grp">${esc(catName(it))}</span><i>/</i><b>${esc(it.title)}</b><span class="num">${n ? `${pad(n)} / ${pad(all.length)}` : ''}</span>`;
    const kind = it.kind === 'states' && it.n ? `${it.n} states` : (KIND[it.kind] || '');
    $('#info-kicker').innerHTML = r
      ? ['<b>Remix</b>', `by ${esc(r.author ? r.author.name : 'a member')}`, esc(dateOf(r.created))].filter(Boolean).join(' · ')
      : [`<b>${esc(catName(it))}</b>`, esc(ORIGIN[originOf(it)]), esc(kind)].filter(Boolean).join(' · ');
    $('#sheet-title').textContent = r ? r.title : it.title;
    $('#info-lede').textContent = r ? (r.note || `A remix of ${it.title}.`) : (it.line || '');
    $('#info-summary').innerHTML = r
      ? `${esc(r.note || 'A remix.')} <a class="info-base" href="#/${esc(it.id)}">A remix of ${esc(it.title)}</a>`
      : esc(it.summary || '');
    $('[data-remix-delete]', sheet).hidden = !(r && C.user && r.author && r.author.id === C.user.id);
    $('[data-remix-delete] .lbl', sheet).textContent = 'Delete remix';
    $('#info-spec').innerHTML = (it.spec || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    $('#info-where-k').textContent = g.offsite ? 'Where it comes from' : 'On qbix.space';
    $('#info-where').textContent = it.where || '';
    $('#info-src').innerHTML = (it.source || []).map((s) => `<li>${esc(s)}</li>`).join('');
    const keep = it.rules || [];
    $('#info-keep-sec').hidden = !keep.length;
    $('#info-keep').innerHTML = keep.map((r) => `<li>${esc(r)}</li>`).join('');
    setTabs(r ? r.code : it.code, false);
    frame.dataset.tone = it.tone || 'dark';
    $('[data-open]', sheet).href = it.demo;
    $('#stage-how').textContent = HOW[it.kind] || '';
    setPause(false);
    zoomStage();
    // the controls show for a moment on opening, then wait for the pointer
    const st = $('.stage', sheet);
    st.classList.add('is-fresh');
    clearTimeout(st._fresh);
    st._fresh = setTimeout(() => st.classList.remove('is-fresh'), 2400);
    scrub.hidden = !(it.kind === 'states' || it.kind === 'scroll');
    scrub.style.setProperty('--v', '0');
    $$('.scrub-tick', scrub).forEach((t) => t.remove());
    if (it.kind === 'states' && it.n) addTicks(it.n);
    frame.style.backgroundImage = it.thumb ? `url("${it.thumb}")` : '';
    stage.classList.remove('is-live');
    if (r && window.QMTweak) {
      stage.removeAttribute('src');
      QMTweak.demoHtml(it).then((html) => { if (curRemix === r) stageShow({ doc: QMTweak.compose(it, html, r.code), untrusted: true }); }, () => stageShow({ src: it.demo }));
    } else {
      stageShow({ src: it.demo });
    }
    const i = r ? -1 : all.indexOf(it);
    $('[data-prev]', sheet).disabled = i <= 0;
    $('[data-next]', sheet).disabled = i < 0 || i >= all.length - 1;
    $('[data-save]', sheet).setAttribute('aria-label', `Save ${r ? r.title : it.title}`);
    $('[data-like]', sheet).setAttribute('aria-label', `Like ${r ? r.title : it.title}`);
    paintSaved();
    $$('.pane', sheet).forEach((el) => (el.scrollTop = 0));
    sheet.scrollTop = 0;
    document.title = `${r ? r.title : it.title} · Qbix Motion`;
    if (r) { tw = null; tabTweak.hidden = true; setPane(pane); } else loadTweak(it);
    // what members made from it
    const rs = !r && C.full ? C.remixes.filter((x) => x.base === it.id) : [];
    $('#info-remixes-sec').hidden = !rs.length;
    $('#info-remixes-n').textContent = rs.length || '';
    $('#info-remixes').innerHTML = rs.map((x) => `<li><a href="#/r/${esc(x.rid)}"><span class="avatar">${esc(x.author ? x.author.initials : '?')}</span><span class="rx-t"><b>${esc(x.title)}</b><span>by ${esc(x.author ? x.author.name : 'a member')}${x.created ? ` · ${esc(dateOf(x.created))}` : ''}</span></span>${C.likes[x.rid] ? `<span class="rx-n">${HEART}${C.likes[x.rid]}</span>` : ''}</a></li>`).join('');
    if (typeof resetPop === 'function') { setPop(false); resetPop(); }
  }

  const canMorph = () => !!document.startViewTransition && !reduced;
  function morph(fromEl, toEl, cls, change) {
    if (!canMorph() || !fromEl || !toEl) return change();
    fromEl.style.viewTransitionName = 'qm-stage';
    root.classList.add(cls);
    const t = document.startViewTransition(() => {
      fromEl.style.viewTransitionName = '';
      toEl.style.viewTransitionName = 'qm-stage';
      change();
    });
    t.finished.finally(() => { toEl.style.viewTransitionName = ''; root.classList.remove(cls); });
  }
  function open(id, push) {
    const it = byId.get(id);
    if (!it) return;
    if (locked(id)) return openAuth('more', () => open(id, true));
    if (!sheetOpen) {
      const c = shownCard(id);
      return morph(c && $('.card-view', c), frame, 'vt-open', () => { openNow(it); if (push) history.pushState(null, '', `#/${id}`); });
    }
    openNow(it);
    if (push) history.pushState(null, '', `#/${id}`);
  }
  // a member's remix opens in the same sheet, its code over the piece's page
  async function openRemix(rid, push) {
    let r;
    try { r = (await api(`/api/remix/${encodeURIComponent(rid)}`)).remix; } catch (e) { showToast('That remix is not here any more.', { ms: 2600 }); return; }
    const it = byId.get(r.base);
    if (!it) return;
    if (!sheetOpen) {
      const c = shownCard(rid);
      return morph(c && $('.card-view', c), frame, 'vt-open', () => { openNow(it, r); if (push) history.pushState(null, '', `#/r/${rid}`); });
    }
    openNow(it, r);
    if (push) history.pushState(null, '', `#/r/${rid}`);
  }
  function openNow(it, r) {
    cur = it;
    fill(it, r);
    if (!sheetOpen) {
      sheetOpen = true;
      sheet.classList.add('is-open');
      sheet.setAttribute('aria-hidden', 'false');
      root.classList.add('is-locked');
      // the cards rest while the sheet is up
      stopPreview(playing);
      setTimeout(() => $('[data-close]', sheet).focus({ preventScroll: true }), 40);
    }
  }
  function close(push) {
    if (!sheetOpen) return;
    const c = cardsFor(curKey()).find((x) => x.offsetParent !== null && !x.hidden);
    const to = c && $('.card-view', c);
    if (to) {
      // bring the card on screen first, so the picture can fly back to it
      const r = to.getBoundingClientRect();
      if (r.bottom < 70 || r.top > innerHeight) to.scrollIntoView({ block: 'center' });
    }
    morph(to ? frame : null, to, 'vt-close', () => closeNow(push));
  }
  function closeNow(push) {
    sheetOpen = false;
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    root.classList.remove('is-locked');
    document.title = 'Qbix Motion';
    if (push) history.pushState(null, '', location.pathname + location.search);
    const back = cardsFor(curKey()).find((x) => x.offsetParent !== null && !x.hidden);
    curRemix = null;
    stage.classList.remove('is-live');   // a visible frame inside the hidden sheet would still take the page's clicks
    setTimeout(() => {
      if (sheetOpen) return;
      stage.removeAttribute('srcdoc');
      stage.removeAttribute('sandbox');
      stage.src = 'about:blank';
    }, 260);
    if (back) $('.card-hit', back).focus({ preventScroll: true });
  }
  function go(d) {
    if (!cur) return;
    const all = order(), i = all.indexOf(cur) + d;
    if (i < 0 || i >= all.length) return;
    open(all[i].id, false);
    history.replaceState(null, '', `#/${all[i].id}`);
  }
  stage.addEventListener('load', () => { if (stage.hasAttribute('srcdoc') || (stage.getAttribute('src') || 'about:blank') !== 'about:blank') setTimeout(() => stage.classList.add('is-live'), 120); });

  // the sheet's export panel: format, length, a plan of the frame, the film's progress
  const pop = $('#export-pop');
  const popBtn = $('[data-export-open]', sheet);
  let exFmt = '16x9', exSecs = 10, exBusy = false;
  const pick = (group, attr, val) => $$(`#${group} button`).forEach((b) => { const on = b.dataset[attr] === String(val); b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
  const setPop = (open) => {
    pop.hidden = !open;
    popBtn.setAttribute('aria-expanded', String(open));
    if (open) play(pop, [{ opacity: 0, transform: 'translateY(-6px) scale(0.98)' }, { opacity: 1, transform: 'none' }], { duration: 260 });
  };
  const resetPop = () => {
    if (exBusy) return;
    $('#export-bar').hidden = true;
    $('#export-state').textContent = '';
    $('[data-export-go]', pop).disabled = false;
  };
  popBtn.addEventListener('click', (e) => { e.stopPropagation(); setPop(pop.hidden); });
  document.addEventListener('click', (e) => { if (!pop.hidden && !e.target.closest('.export')) setPop(false); });
  $('#export-format').addEventListener('click', (e) => { const b = e.target.closest('[data-format]'); if (!b) return; exFmt = b.dataset.format; pick('export-format', 'format', exFmt); $('#export-plan').dataset.format = exFmt; resetPop(); });
  $('#export-secs').addEventListener('click', (e) => { const b = e.target.closest('[data-secs]'); if (!b) return; exSecs = Number(b.dataset.secs); pick('export-secs', 'secs', exSecs); resetPop(); });
  $('[data-export-go]', pop).addEventListener('click', async () => {
    if (!cur || exBusy) return;
    const it = cur, fmt = exFmt, secs = exSecs;
    exBusy = true;
    const bar = $('#export-bar'), state = $('#export-state'), go = $('[data-export-go]', pop);
    go.disabled = true;
    bar.hidden = false;
    try {
      const url = await film(it.id, fmt, secs, (st, p) => {
        bar.style.setProperty('--p', String(p));
        state.textContent = st === 'queued' ? 'Waiting' : `${Math.round(p * 100)}%`;
      });
      download(url, fileName(it, fmt, secs));
      countDownload(it.id);
      bar.hidden = true;
      state.innerHTML = `Saved · <a href="${esc(url)}" download="${esc(fileName(it, fmt, secs))}">download again</a>`;
    } catch (err) {
      bar.hidden = true;
      state.textContent = `Could not film it: ${err.message || err}`;
    } finally {
      exBusy = false;
      go.disabled = false;
    }
  });

  // talk to the demo (kit/stage.js)
  const cmd = (c, v) => { try { stage.contentWindow.postMessage({ qm: 'cmd', cmd: c, v }, '*'); } catch (e) { /* not loaded */ } };
  addEventListener('message', (e) => {
    const m = e.data;
    if (!m || m.qm !== 1 || e.source !== stage.contentWindow) return;
    if (m.type === 'info') scrub.hidden = !m.scrub;
    else if (m.type === 'pos' && !dragging) { scrub.style.setProperty('--v', String(m.v)); scrub.setAttribute('aria-valuenow', String(Math.round(m.v * 100))); }
    else if (m.type === 'auto') setPause(!m.on);
  });
  $('[data-replay]', sheet).addEventListener('click', () => { setPause(false); cmd('replay'); });
  $('[data-pause]', sheet).addEventListener('click', () => { const p = !paused; setPause(p); cmd(p ? 'pause' : 'replay'); });
  $('[data-close]', sheet).addEventListener('click', () => close(true));
  $('[data-prev]', sheet).addEventListener('click', () => go(-1));
  $('[data-next]', sheet).addEventListener('click', () => go(1));
  tabsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) setTab(Number(b.dataset.tab)); });

  // the scrubber
  const seekTo = (v) => {
    v = Math.min(1, Math.max(0, v));
    scrub.style.setProperty('--v', String(v));
    scrub.setAttribute('aria-valuenow', String(Math.round(v * 100)));
    setPause(true);
    cmd('seek', v);
  };
  const seekAt = (x) => { const r = scrub.getBoundingClientRect(); seekTo((x - r.left) / r.width); };
  scrub.addEventListener('pointerdown', (e) => { dragging = true; scrub.setPointerCapture(e.pointerId); seekAt(e.clientX); });
  scrub.addEventListener('pointermove', (e) => { if (dragging) seekAt(e.clientX); });
  scrub.addEventListener('pointerup', () => (dragging = false));
  scrub.addEventListener('pointercancel', () => (dragging = false));
  scrub.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.04 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.04 : 0;
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    seekTo((Number(getComputedStyle(scrub).getPropertyValue('--v')) || 0) + d);
  });

  // copying: the button turns lime for a moment
  async function copy(text, btn, done) {
    let ok = true;
    try { await navigator.clipboard.writeText(text); } catch (e) {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch (x) { ok = false; }
      ta.remove();
    }
    if (!ok) { showToast('The browser kept the clipboard closed. Press Copy again.', { ms: 3000 }); return; }
    const l = $('.lbl', btn) || btn;
    const was = l.dataset.was || (l.dataset.was = l.textContent);
    l.textContent = done;
    btn.classList.add('is-done');
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { l.textContent = was; btn.classList.remove('is-done'); }, 1500);
  }
  // signed out, Copy asks you to join or sign in first, then copies what you asked for
  const copyCode = () => { if (tabs[tabOn]) copy(tabs[tabOn].text, $('[data-copy]', sheet), 'Copied'); };
  const copyPrompt = () => { if (cur) copy(promptText(), $('[data-prompt]', sheet), 'Prompt copied'); };
  $('[data-copy]', sheet).addEventListener('click', () => (gated() ? openAuth('code', copyCode) : copyCode()));
  $('[data-prompt]', sheet).addEventListener('click', () => (gated() ? openAuth('code', copyPrompt) : copyPrompt()));
  // the prompt for Claude, with what was tuned
  function promptText() {
    let t = cur.prompt || '';
    if (curRemix) t = `${t}\nThis is “${curRemix.title}”, a member's remix of it. Its code:\n\n${['html', 'css', 'js'].filter((k) => curRemix.code[k]).map((k) => `\`\`\`${k}\n${curRemix.code[k]}\n\`\`\``).join('\n\n')}\n`;
    else if (tw && tw.changed) t += `\nTuned in Qbix Motion:\n${tw.params.filter((p) => String(p.value) !== String(p.def)).map((p) => `- ${p.label}: ${fmtVal(p, p.value)} (was ${fmtVal(p, p.def)})`).join('\n')}\n`;
    return t;
  }
  // a pill's label says what happened, for a moment
  function flash(btn, text) {
    const l = $('.lbl', btn);
    const was = l.dataset.was || (l.dataset.was = l.textContent);
    l.textContent = text;
    clearTimeout(btn._t);
    btn._t = setTimeout(() => (l.textContent = was), 1600);
  }
  $('[data-share]', sheet).addEventListener('click', async (e) => {
    const url = `${location.origin}${location.pathname}${curRemix ? `#/r/${curRemix.rid}` : `#/${cur.id}`}`;
    try { await navigator.clipboard.writeText(url); } catch (x) { /* shown in the toast instead */ }
    flash(e.currentTarget, 'Link copied');
  });
  $('[data-remix]', sheet).addEventListener('click', () => openEditor(cur, curRemix));
  $('[data-remix-delete]', sheet).addEventListener('click', async (e) => {
    const b = e.currentTarget, r = curRemix;
    if (!r) return;
    if (!b.classList.contains('is-sure')) {
      b.classList.add('is-sure');
      $('.lbl', b).textContent = 'Delete it for good?';
      clearTimeout(b._t);
      b._t = setTimeout(() => { b.classList.remove('is-sure'); $('.lbl', b).textContent = 'Delete remix'; }, 3200);
      return;
    }
    b.classList.remove('is-sure');
    try {
      await api(`/api/remix/${encodeURIComponent(r.rid)}/delete`, {});
      saved.delete(r.rid);
      liked.delete(r.rid);
      close(true);
      await refreshCommunity();
      showToast(`Deleted “${r.title}”.`, { ms: 2400 });
    } catch (x) {
      showToast(`Could not delete it: ${x.message}`, { ms: 3600 });
    }
  });

  /* --- tweak: a piece's details, changed live (tweak.js reads them from its source) --- */
  let tw = null, twTimer = 0, wantTweak = false;
  const twBody = $('#tweak-body');
  const TW_GROUP = { colour: 'Colour', timing: 'Timing', easing: 'Easing', value: 'Values' };
  const optsOf = (p) => (p.options || []).map((o) => (o && typeof o === 'object'
    ? { label: o.label || String(o.value), value: o.value }
    : { label: String(o).charAt(0).toUpperCase() + String(o).slice(1), value: o }));
  const fmtVal = (p, v) => {
    if (typeof v !== 'number') { const o = optsOf(p).find((x) => String(x.value) === String(v)); return o ? o.label : String(v); }
    if (p.key === 'speed' || p.unit === '×') return `${v.toFixed(2)}×`;
    if (p.unit === 'ms') return `${Math.round(v)} ms`;
    return `${+v.toFixed(3)}${p.unit ? ` ${p.unit}` : ''}`;
  };
  const isColour = (v) => /^#[0-9a-f]{3,8}$/i.test(String(v));
  async function loadTweak(it) {
    tw = null;
    twBody.textContent = '';
    tabTweak.hidden = true;
    setPane(pane);
    $('[data-tweak-reset]').hidden = true;
    if (!served || !window.QMTweak) return;
    try {
      const t = await window.QMTweak.open(it);
      if (cur !== it || curRemix) return;
      tw = t;
      renderTweak();
      tabTweak.hidden = !tw.params.length;
      if (wantTweak && tw.params.length) {
        wantTweak = false;
        setPane('tweak');
        if (innerWidth <= 960) $('#info-tabs').scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
      } else setPane(pane);
    } catch (e) { /* the demo could not be read: no tweaks for it */ }
  }
  function renderTweak() {
    let html = '', g0 = '';
    tw.params.forEach((p) => {
      if (p.group !== g0) { g0 = p.group; if (TW_GROUP[p.group]) html += `<p class="tw-group">${TW_GROUP[p.group]}</p>`; }
      const k = esc(p.key), label = esc(p.label), opts = optsOf(p);
      if (opts.length && opts.every((o) => isColour(o.value))) {
        html += `<div class="tw-row" data-key="${k}"><span class="tw-k">${label}</span><div class="tw-sw">${opts.map((o) => `<button type="button" class="sw" data-v="${esc(o.value)}" style="--c:${esc(o.value)}" aria-label="${esc(o.label)}" title="${esc(o.label)}"></button>`).join('')}<label class="sw sw--any" title="Any colour"><input type="color" aria-label="Any colour"></label></div></div>`;
      } else if (opts.length && (p.group === 'easing' || opts.length > 4)) {
        html += `<label class="tw-row" data-key="${k}"><span class="tw-k">${label}</span><select class="tw-sel">${opts.map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select></label>`;
      } else if (opts.length) {
        html += `<div class="tw-row" data-key="${k}"><span class="tw-k">${label}</span><div class="seg">${opts.map((o) => `<button type="button" data-v="${esc(o.value)}">${esc(o.label)}</button>`).join('')}</div></div>`;
      } else {
        html += `<div class="tw-bar" data-key="${k}" role="slider" tabindex="0" aria-label="${label}" aria-valuemin="${p.min}" aria-valuemax="${p.max}"><i class="tw-fill"></i><span class="tw-k">${label}</span><span class="tw-v"></span></div>`;
      }
    });
    twBody.innerHTML = html;
    paintTweak();
  }
  const paramOf = (key) => tw && tw.params.find((p) => p.key === key);
  function paintTweak() {
    tw.params.forEach((p) => {
      const el = twBody.querySelector(`[data-key="${CSS.escape(p.key)}"]`);
      if (!el) return;
      if (el.classList.contains('tw-bar')) {
        const f = (Number(p.value) - p.min) / ((p.max - p.min) || 1);
        el.style.setProperty('--f', String(Math.min(1, Math.max(0, f))));
        $('.tw-v', el).textContent = fmtVal(p, Number(p.value));
        el.setAttribute('aria-valuenow', String(p.value));
        el.classList.toggle('is-changed', String(p.value) !== String(p.def));
      } else {
        $$('[data-v]', el).forEach((b) => b.classList.toggle('is-on', String(b.dataset.v).toLowerCase() === String(p.value).toLowerCase()));
        const sel = $('select', el);
        if (sel) sel.value = String(p.value);
        const any = $('input[type=color]', el);
        if (any && isColour(p.value)) { any.value = String(p.value).length === 7 ? String(p.value) : any.value; any.parentElement.classList.toggle('is-on', !$$('.sw[data-v]', el).some((b) => b.classList.contains('is-on'))); }
      }
    });
    $('[data-tweak-reset]').hidden = !tw.changed;
  }
  function setTw(key, v) {
    const p = paramOf(key);
    if (!p) return;
    if (typeof p.def === 'number') {
      v = Math.min(p.max, Math.max(p.min, Number(v)));
      if (p.step) v = Math.round(v / p.step) * p.step;
      v = +v.toFixed(4);
    }
    tw.set(key, v);
    paintTweak();
    clearTimeout(twTimer);
    twTimer = setTimeout(applyTweak, 140);
  }
  function applyTweak() {
    if (!tw || !cur) return;
    stageShow(tw.changed ? { doc: tw.srcdoc() } : { src: cur.demo });
    setTabs(tw.changed ? tw.code() : cur.code, tw.changed, true);
  }
  $('[data-tweak-reset]').addEventListener('click', () => { if (!tw) return; tw.reset(); paintTweak(); applyTweak(); });
  let twDrag = null;
  const barAt = (el, x) => { const p = paramOf(el.dataset.key), r = el.getBoundingClientRect(); setTw(p.key, p.min + ((x - r.left) / r.width) * (p.max - p.min)); };
  twBody.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.tw-bar');
    if (!el) return;
    twDrag = el;
    el.setPointerCapture(e.pointerId);
    barAt(el, e.clientX);
  });
  twBody.addEventListener('pointermove', (e) => { if (twDrag) barAt(twDrag, e.clientX); });
  twBody.addEventListener('pointerup', () => (twDrag = null));
  twBody.addEventListener('pointercancel', () => (twDrag = null));
  twBody.addEventListener('keydown', (e) => {
    const el = e.target.closest('.tw-bar');
    if (!el) return;
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    const p = paramOf(el.dataset.key);
    setTw(p.key, Number(p.value) + d * (p.step || (p.max - p.min) / 100) * (e.shiftKey ? 10 : 1));
  });
  twBody.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (!b) return;
    const row = b.closest('[data-key]'), p = paramOf(row.dataset.key);
    setTw(p.key, typeof p.def === 'number' ? Number(b.dataset.v) : b.dataset.v);
  });
  twBody.addEventListener('input', (e) => {
    const any = e.target.closest('input[type=color]');
    if (any) setTw(any.closest('[data-key]').dataset.key, any.value.toUpperCase());
  });
  twBody.addEventListener('change', (e) => {
    const sel = e.target.closest('select');
    if (sel) setTw(sel.closest('[data-key]').dataset.key, sel.value);
  });

  /* --- remix: the code, edited, live beside it, then published to the community ------ */
  const rxEl = $('#remix'), rxText = $('#remix-text'), rxView = $('#remix-view');
  let rx = null, rxTimer = 0;
  const drafts = new Map();   // a draft per piece or remix, while this page is open
  const rxOpen = () => rxEl.classList.contains('is-open');
  async function openEditor(it, from) {
    if (!it) return;
    if (!served || !window.QMTweak) return showToast('Remixing needs the library served by tools/serve.py.', { ms: 3400 });
    if (it.code && it.code.files) return showToast('Scenes are built from the site’s own components: tweak them, but they are not remixed here.', { ms: 4200 });
    const key = from ? from.rid : it.id;
    let demo;
    try { demo = await QMTweak.demoHtml(it); } catch (e) { return showToast('Could not read that piece.', { ms: 2600 }); }
    let st = drafts.get(key);
    if (!st) {
      const base = from ? from.code : (tw && cur === it && !curRemix && tw.changed ? tw.code() : it.code);
      const seed = { html: base.html || '', css: base.css || '', js: base.js || '' };
      st = { it, from: from || null, demo, seed, code: { ...seed }, part: seed.css ? 'css' : 'html', name: '', note: '' };
      drafts.set(key, st);
    }
    rx = st;
    $('#remix-base').textContent = from ? `${from.title}, a remix of ${it.title}` : it.title;
    $('#remix-name').value = rx.name || (from ? `${from.title}, again` : `${it.title}, remixed`);
    $('#remix-note').value = rx.note;
    $('#remix-frame').dataset.tone = it.tone || 'dark';
    $('[data-remix-publish]').textContent = !C.full ? 'Copy code' : C.user ? 'Publish remix' : 'Join to publish';
    setPart(rx.part);
    renderRx();
    rxEl.classList.add('is-open');
    rxEl.setAttribute('aria-hidden', 'false');
    root.classList.add('is-locked');
    stopPreview(playing);
    setTimeout(() => rxText.focus({ preventScroll: true }), 60);
  }
  function setPart(part) {
    rx.part = part;
    $$('#remix-tabs button').forEach((b) => { const on = b.dataset.part === part; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
    rxText.value = rx.code[part] || '';
    rxText.scrollTop = 0;
  }
  function renderRx() {
    rxView.srcdoc = QMTweak.compose(rx.it, rx.demo, rx.code);   // sandboxed in index.html, like any remix
    const edited = ['html', 'css', 'js'].some((k) => rx.code[k] !== rx.seed[k]);
    $('#remix-state').textContent = edited ? 'Edited · live' : 'Live';
  }
  function closeEditor() {
    if (!rxOpen()) return;
    rx.name = $('#remix-name').value;
    rx.note = $('#remix-note').value;
    rxEl.classList.remove('is-open');
    rxEl.setAttribute('aria-hidden', 'true');
    if (!sheetOpen) root.classList.remove('is-locked');
    setTimeout(() => { if (!rxOpen()) rxView.removeAttribute('srcdoc'); }, 260);
  }
  $('#remix-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-part]'); if (b) setPart(b.dataset.part); });
  rxText.addEventListener('input', () => {
    rx.code[rx.part] = rxText.value;
    $('#remix-state').textContent = 'Edited';
    clearTimeout(rxTimer);
    rxTimer = setTimeout(renderRx, 380);
  });
  rxText.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || e.shiftKey || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    rxText.setRangeText('  ', rxText.selectionStart, rxText.selectionEnd, 'end');
    rxText.dispatchEvent(new Event('input'));
  });
  $('[data-remix-restart]').addEventListener('click', () => { rx.code = { ...rx.seed }; setPart(rx.part); renderRx(); });
  $('[data-remix-close]').addEventListener('click', closeEditor);
  async function publish() {
    if (!rx) return;
    // with no community (the static copy on qbix.space), the remix is yours to copy, signed in
    if (!C.full) {
      if (gated()) return openAuth('code', publish);
      return copy(`${rx.code.html}\n\n<style>\n${rx.code.css}\n</style>\n\n<script>\n${rx.code.js}\n</script>\n`, $('[data-remix-publish]'), 'Copied');
    }
    if (!C.user) return openAuth('remix', publish);
    const btn = $('[data-remix-publish]');
    const title = $('#remix-name').value.trim() || `${rx.it.title}, remixed`;
    const note = $('#remix-note').value.trim();
    btn.disabled = true;
    try {
      const j = await api('/api/remix', { base: rx.it.id, title: title.slice(0, 60), note: note.slice(0, 200), code: rx.code });
      drafts.delete(rx.from ? rx.from.rid : rx.it.id);
      closeEditor();
      await refreshCommunity();
      showToast(`Published “${j.remix.title}” to the community.`, { ms: 2800 });
      openRemix(j.remix.rid, true);
    } catch (x) {
      showToast(`Could not publish it: ${x.message}`, { ms: 4000 });
    } finally {
      btn.disabled = false;
    }
  }
  $('[data-remix-publish]').addEventListener('click', publish);
  // from a card: remix it, or open it at its tweaks
  async function remixCard(c) {
    const key = c.dataset.key, it = byId.get(c.dataset.id);
    if (key === c.dataset.id) return openEditor(it);
    try { openEditor(it, (await api(`/api/remix/${encodeURIComponent(key)}`)).remix); } catch (e) { showToast('That remix is not here any more.', { ms: 2600 }); }
  }
  function tweakCard(c) {
    if (c.dataset.key !== c.dataset.id) return openRemix(c.dataset.key, true);
    if (!served || !window.QMTweak) return open(c.dataset.id, true);
    wantTweak = true;
    open(c.dataset.id, true);
  }

  /* --- clicks, routing and keys ------------------------------------------------------- */
  document.addEventListener('click', (e) => {
    const save = e.target.closest('.save, [data-save]');
    if (save) {
      e.preventDefault();
      toggleSave(save.closest('.card') ? save.closest('.card').dataset.key : curKey());
      return;
    }
    const like = e.target.closest('.like, [data-like]');
    if (like) {
      e.preventDefault();
      toggleLike(like.closest('.card') ? like.closest('.card').dataset.key : curKey());
      return;
    }
    const rm = e.target.closest('.ca--remix');
    if (rm) { e.preventDefault(); remixCard(rm.closest('.card')); return; }
    const tk = e.target.closest('.ca--tweak');
    if (tk) { e.preventDefault(); tweakCard(tk.closest('.card')); return; }
    const join = e.target.closest('[data-join]');
    if (join) { e.preventDefault(); authMode = 'join'; openAuth(join.dataset.why || ''); return; }
    const signin = e.target.closest('[data-signin]');
    if (signin) { e.preventDefault(); authMode = 'signin'; openAuth(signin.dataset.why || 'more'); return; }
    const browse = e.target.closest('[data-browse]');
    if (browse) { e.preventDefault(); scrollTo({ top: $('#toolbar').offsetTop - 64, behavior: reduced ? 'auto' : 'smooth' }); return; }
    const ex = e.target.closest('.act--export');
    if (ex) {
      e.preventDefault();
      quickFilm(ex.closest('.card').dataset.id);
      return;
    }
    const to = e.target.closest('[data-view-to]');
    if (to) {
      e.preventDefault();
      setView(to.dataset.viewTo, true);
      return;
    }
    const hit = e.target.closest('.card-hit');
    if (!hit || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const c = hit.closest('.card');
    if (c.dataset.key !== c.dataset.id) openRemix(c.dataset.key, true);
    else open(c.dataset.id, true);
  });
  // #/<id> a piece, #/r/<rid> a remix, #community and #bench the pages, anything else the library
  function route() {
    const h = location.hash;
    let m;
    if ((m = h.match(/^#\/r\/(r-[a-z0-9]+)$/))) { if (C.full) openRemix(m[1], false); return; }
    if ((m = h.match(/^#\/(.+)$/)) && byId.has(m[1])) { open(m[1], false); return; }
    closeEditor();
    close(false);
    setPage(h === '#community' ? 'community' : h === '#bench' ? 'bench' : 'library');
  }
  addEventListener('popstate', route);
  addEventListener('hashchange', route);
  addEventListener('keydown', (e) => {
    const typing = e.target.closest('input, textarea, [contenteditable]');
    if (e.key === 'Escape' && !auth.hidden) { closeAuth(); return; }
    if (e.key === 'Escape' && !meMenu.hidden) { setMenu(false); return; }
    if (rxOpen()) { if (e.key === 'Escape') closeEditor(); return; }
    if (!auth.hidden) return;
    if (!sheetOpen) {
      if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        findEl.focus();
        findEl.select();
      }
      return;
    }
    if (e.key === 'Escape') close(true);
    else if (typing || e.target.closest('.scrub, .code, .seg')) return;
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey) toggleSave(curKey());
    else if (e.key.toLowerCase() === 'l' && !e.metaKey && !e.ctrlKey) toggleLike(curKey());
  });

  (function floor() {
    const svg = $('#floor-mark');
    if (!svg || reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const W = 918, XS = [94, 374, 600, 814];
    const paths = $$('path', svg);
    const y = XS.map(() => 0), v = XS.map(() => 0), target = XS.map(() => 0);
    let left = 0, scale = 1, raf = 0, prev = 0;
    const measure = () => { const r = svg.getBoundingClientRect(); left = r.left; scale = W / Math.max(1, r.width); };
    const step = (now) => {
      const dt = Math.min(0.032, (now - (prev || now)) / 1000) || 0.016;
      prev = now;
      let busy = false;
      paths.forEach((p, i) => {
        v[i] += (180 * (target[i] - y[i]) - 14 * v[i]) * dt;
        y[i] += v[i] * dt;
        if (Math.abs(v[i]) > 0.3 || Math.abs(target[i] - y[i]) > 0.3) busy = true;
        p.style.translate = Math.abs(y[i]) < 0.05 ? '' : `0 ${y[i].toFixed(2)}px`;
      });
      raf = busy ? requestAnimationFrame(step) : 0;
      if (!busy) prev = 0;
    };
    const wakeF = () => { if (!raf) raf = requestAnimationFrame(step); };
    const zone = svg.parentElement;
    zone.addEventListener('pointerenter', measure);
    zone.addEventListener('pointermove', (e) => {
      const x = (e.clientX - left) * scale;
      XS.forEach((lx, i) => { const k = Math.max(0, 1 - Math.abs(x - lx) / 300); target[i] = -k * k * 46; });
      wakeF();
    });
    zone.addEventListener('pointerleave', () => { target.fill(0); wakeF(); });
    addEventListener('resize', measure);
  })();

  $$('.page').forEach((el) => (el.hidden = false));   // which page shows is html[data-page] (app.css)
  loadSaved();
  paintSaved();
  renderBench();
  filter();
  route();
})();
