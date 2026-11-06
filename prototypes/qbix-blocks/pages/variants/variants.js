/* =============================================================================
   QBIX · BLOCKS, the options board: the hero, the footer and the way the sections
   switch colour, five of each, picked on the page itself. The choice is kept per
   viewer (localStorage) and in the address (?hero=2&footer=4&switch=3), so it
   carries from page to page.
     hero N    homepage only: variants/hero-N.html takes the place of [data-slot="hero"]
     footer N  every page: variants/footer-N.html takes the place of [data-slot="footer"]
     switch N  every page: html[data-switch="N"]; variants/switch.css and switch.js do it
   The pages carry the chosen ones (2026-11-05): hero 2, footer 2, and switch 1+4
   (into the dark by the 45° wipe, back to white by the cover). The rest are files.
   A variant file is a fragment: its own
   <style>, its markup (carrying the same data-slot), and any <script>, which runs on
   insertion and hands its setup to block.js through window.BlocksAfter.
   block.js boots once window.BlocksReady settles.
   ============================================================================= */
(() => {
  const NAMES = {
    hero: ['换算器 · Wise 首页式', '居中大画面 · Wise Platform 式', '黑底方块 · 现网站式', '键帽字标 · 旧 landing 式', '二选一 · AI teams / business'],
    footer: ['字标 · 现版', '浅色多栏 · Wise 式', '幕布揭开', '字标互动', '联系为主'],
    switch: ['覆盖', '整页渐变', '卡片展开', '斜切擦除', '方块翻转'],
    dock: ['悬挂按钮', '移动线索'],
  };
  const LABEL = { hero: 'Hero', footer: 'Footer', switch: '切换', dock: '底部' };
  const KEY = 'qbix-blocks.options.v2'; // v2: the choice made on 2026-11-05 is the default
  const DEFAULT = { hero: 2, footer: 2, switch: 14, dock: 1 };
  const SWITCH14 = '1+4 · 进深色斜切，回白色覆盖';
  const root = document.documentElement;

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {}
  const params = new URLSearchParams(location.search);
  const pick = (k) => {
    const v = Number(params.get(k) || saved[k] || DEFAULT[k]);
    if (k === 'dock') return v === 1 || v === 2 ? v : DEFAULT.dock;
    return (v >= 1 && v <= 5) || (k === 'switch' && v === 14) ? v : DEFAULT[k];
  };
  const state = { hero: pick('hero'), footer: pick('footer'), switch: pick('switch'), dock: pick('dock') };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  root.dataset.switch = String(state.switch);
  root.dataset.heroOption = String(state.hero);
  root.dataset.footerOption = String(state.footer);
  root.dataset.dockOption = String(state.dock);

  /** Put a variant fragment in place of the page's slot; its scripts run as it goes in. */
  async function swapIn(slot, url) {
    const el = document.querySelector(`[data-slot="${slot}"]`);
    if (!el) return;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    const frag = document.createRange().createContextualFragment(await res.text());
    el.replaceWith(frag);
  }
  window.BlocksAfter = window.BlocksAfter || [];
  window.BlocksReady = (async () => {
    const jobs = [];
    if (state.hero !== DEFAULT.hero) jobs.push(swapIn('hero', `variants/hero-${state.hero}.html`));
    if (state.footer !== DEFAULT.footer) jobs.push(swapIn('footer', `variants/footer-${state.footer}.html`));
    (await Promise.allSettled(jobs)).forEach((r) => r.status === 'rejected' && console.warn('variant not loaded:', r.reason));
  })();

  /* ---- the board: a chip in the corner, the three rows when open ---------------------------- */
  const css = `
  .opts { position: fixed; z-index: 70; left: 16px; bottom: 16px; font: 500 13px/1.2 var(--font-sans, system-ui); color: #fff; }
  .opts-chip { appearance: none; border: 0; display: flex; align-items: center; gap: 10px; height: 36px; padding: 0 14px; background: #0f1a00; color: #fff; font: inherit; cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 0 100%); }
  .opts-chip b { font-weight: 500; color: #b8ff00; font-variant-numeric: tabular-nums; }
  .opts-panel { position: absolute; left: 0; bottom: 44px; width: min(92vw, 430px); display: grid; gap: 12px; padding: 16px; background: #0f1a00;
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
  .opts-panel[hidden] { display: none; }
  .opts-row { display: grid; grid-template-columns: 44px auto; align-items: center; gap: 6px 12px; }
  .opts-k { color: rgba(255,255,255,.62); }
  .opts-n { display: flex; gap: 4px; }
  .opts-n button { appearance: none; border: 0; width: 34px; height: 30px; background: #1b260d; color: #fff; font: inherit; font-variant-numeric: tabular-nums; cursor: pointer; }
  .opts-n button:hover { background: #25321a; }
  .opts-n button[aria-pressed='true'] { background: #b8ff00; color: #0f1a00; }
  .opts-name { grid-column: 2; color: rgba(255,255,255,.62); font-weight: 400; }
  .opts-note { margin: 0; color: rgba(255,255,255,.42); font-weight: 400; }
  @media (max-width: 600px) { .opts { left: 8px; bottom: 84px; } }
  `;
  function board() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.append(style);
    const wrap = document.createElement('div');
    wrap.className = 'opts';
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'opts-chip';
    chip.setAttribute('aria-expanded', 'false');
    chip.innerHTML = `方案 <b>H${state.hero} · F${state.footer} · 切${state.switch === 14 ? '1+4' : state.switch} · 底${state.dock}</b>`;
    const panel = document.createElement('div');
    panel.className = 'opts-panel';
    panel.hidden = true;
    const onHome = /home\.html$/.test(location.pathname);
    for (const k of ['hero', 'footer', 'switch', 'dock']) {
      const row = document.createElement('div');
      row.className = 'opts-row';
      const name = k === 'switch' && state[k] === 14 ? SWITCH14 : `${state[k]} · ${NAMES[k][state[k] - 1]}`;
      row.innerHTML = `<span class="opts-k">${LABEL[k]}</span><span class="opts-n" role="group" aria-label="${LABEL[k]}"></span><span class="opts-name">${name}${state[k] === DEFAULT[k] ? '（选定）' : ''}${k === 'hero' && !onHome ? '（只在首页）' : ''}</span>`;
      const n = row.querySelector('.opts-n');
      for (const i of k === 'switch' ? [1, 2, 3, 4, 5, 14] : k === 'dock' ? [1, 2] : [1, 2, 3, 4, 5]) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = i === 14 ? '1+4' : String(i);
        b.title = i === 14 ? SWITCH14 : NAMES[k][i - 1];
        if (i === 14) b.style.width = '46px';
        b.setAttribute('aria-pressed', String(state[k] === i));
        b.addEventListener('click', () => {
          const next = { ...state, [k]: i };
          try {
            localStorage.setItem(KEY, JSON.stringify(next));
          } catch {}
          const p = new URLSearchParams(location.search);
          p.set('hero', next.hero);
          p.set('footer', next.footer);
          p.set('switch', next.switch);
          p.set('dock', next.dock);
          try {
            sessionStorage.setItem('qbix-blocks.board-open', '1');
          } catch {}
          location.search = p.toString();
        });
        n.append(b);
      }
      panel.append(row);
    }
    const note = document.createElement('p');
    note.className = 'opts-note';
    note.textContent = '选择会带到其他页面。Hero 只换首页。';
    panel.append(note);
    chip.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      chip.setAttribute('aria-expanded', String(!panel.hidden));
    });
    let reopen = false;
    try {
      reopen = !!sessionStorage.getItem('qbix-blocks.board-open');
      sessionStorage.removeItem('qbix-blocks.board-open');
    } catch {}
    if (reopen) {
      panel.hidden = false;
      chip.setAttribute('aria-expanded', 'true');
    }
    wrap.append(panel, chip);
    document.body.append(wrap);
  }
  if (document.body) board();
  else addEventListener('DOMContentLoaded', board);
})();
