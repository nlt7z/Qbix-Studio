'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * What the blocks do as the page moves, set on the DOM (as data attributes and CSS variables, which React
 * leaves alone), again on every new page:
 *  - entrances: [data-rise] headlines (words split by <Rise>), [data-up] blocks of words, .mark[data-wipe]
 *    get data-in as they come into view
 *  - display type: [data-fit] headlines set their longest .line to the container's width; a page has one XL
 *    size (the smallest of them, never past data-max × --u), carried to other XL text by --t-xl-fit
 *  - the switch: each block's join to the next (data-flow: same tone, scrolls on; data-cont: carries on the
 *    tone before, no gap or cut), back to white by the cover (data-stick: the dark block sticks, --stick its
 *    offset) and into the dark by the wipe (data-wipe: the tone before over its top, cut back by a 45° edge,
 *    --wc, scrubbed by the scroll). With reduced motion, the plain cut.
 */
export default function Runtime() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.toggle('sw-live', !reduced);
    const flag = (el: Element, name: string, on: boolean) => (on ? el.setAttribute(name, '') : el.removeAttribute(name));

    // entrances
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute('data-in', '');
          io.unobserve(e.target);
        }),
      { rootMargin: '0px 0px -8% 0px' },
    );
    const watch = () =>
      document.querySelectorAll('[data-rise]:not([data-in]), [data-up]:not([data-in]), .mark[data-wipe]:not([data-in])').forEach((el) => io.observe(el));

    // split letters (Rise wave) back where the font's kerning sets them: each word set once as a plain run and
    // measured, each letter nudged (in em, so it holds at any size) to its place in that run
    const kern = () => {
      const r = document.createRange();
      document.querySelectorAll<HTMLElement>('.wave .w > i').forEach((word) => {
        const lts = Array.from(word.querySelectorAll<HTMLElement>(':scope > .lt'));
        if (lts.length < 2) return;
        lts.forEach((l) => (l.style.marginLeft = ''));
        const run = lts.map((l) => l.firstElementChild?.textContent ?? '').join('');
        const probe = document.createElement('span');
        probe.textContent = run;
        probe.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;white-space:pre';
        word.appendChild(probe);
        const node = probe.firstChild as Text;
        const base = probe.getBoundingClientRect().left;
        const at: number[] = [];
        for (let k = 0; k < run.length; k++) {
          r.setStart(node, k);
          r.setEnd(node, k + 1);
          at.push(r.getBoundingClientRect().left - base);
        }
        probe.remove();
        if (at.length !== lts.length) return;
        const fs = parseFloat(getComputedStyle(word).fontSize) || 16;
        const x0 = lts[0].getBoundingClientRect().left;
        const now = lts.map((l) => l.getBoundingClientRect().left - x0);
        let shift = 0;
        lts.forEach((l, k) => {
          if (!k) return;
          const d = at[k] - (now[k] + shift);
          shift += d;
          if (Math.abs(d) > 0.1) l.style.marginLeft = `${(d / fs).toFixed(4)}em`;
        });
      });
    };

    // one XL size a page
    const fit = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-fit]')).filter((el) => el.offsetParent !== null && el.querySelector('.line'));
      if (!els.length) return;
      const k = parseFloat(getComputedStyle(root).getPropertyValue('--u')) || 1;
      els.forEach((el) => (el.style.fontSize = '100px'));
      const sizes = els.map((el) => {
        const widest = Math.max(...Array.from(el.querySelectorAll('.line')).map((l) => l.getBoundingClientRect().width));
        const room = el.clientWidth * (Number(el.dataset.fit) || 1);
        const max = Number(el.dataset.max || 999) * k;
        const min = Number(el.dataset.min || 30);
        return Math.max(min, Math.min(max, (100 * room) / widest));
      });
      const size = Math.floor(Math.min(...sizes) * 2) / 2;
      els.forEach((el) => (el.style.fontSize = size + 'px'));
      root.style.setProperty('--t-xl-fit', size + 'px');
    };

    // the blocks' joins and switches
    let wiped: HTMLElement[] = [];
    const measure = () => {
      const vh = innerHeight;
      const shown = Array.from(document.querySelectorAll<HTMLElement>('.blocks[data-stack] > .block')).filter((b) => !b.hidden && b.offsetParent !== null);
      wiped = [];
      shown.forEach((b, i) => {
        const prev = shown[i - 1];
        const next = shown[i + 1];
        b.style.setProperty('--stick', Math.min(0, vh - b.offsetHeight) + 'px');
        flag(b, 'data-flow', next?.dataset.tone === b.dataset.tone);
        flag(b, 'data-cont', !!prev && prev.dataset.tone === b.dataset.tone);
        flag(b, 'data-stick', !!next && next.dataset.tone === 'white' && b.dataset.tone !== 'white');
        const wipe = !reduced && !!prev && prev.dataset.tone === 'white' && b.dataset.tone !== 'white';
        flag(b, 'data-wipe', wipe);
        if (wipe) {
          b.style.setProperty('--sw-prev', getComputedStyle(prev).backgroundColor);
          b.style.setProperty('--wh', Math.min(b.offsetHeight, vh * 1.1) + 'px');
          wiped.push(b);
        }
      });
      kick();
    };
    // into the dark: the tone before, cut back by a 45° edge from the bottom right of the screen to the block's top left
    let raf = 0;
    const frame = () => {
      raf = 0;
      const vh = innerHeight;
      for (const b of wiped) {
        const top = b.getBoundingClientRect().top;
        const p = Math.min(1, Math.max(0, (vh - top) / (vh * 0.8)));
        if (p >= 1) b.style.setProperty('--wc', '0px');
        else if (top >= vh) b.style.removeProperty('--wc');
        else {
          const W = b.clientWidth;
          const k = W + vh - p * W - 0.8 * vh * p * p;
          b.style.setProperty('--wc', `${Math.round(k - top)}px`);
        }
      }
    };
    const kick = () => {
      if (!raf && wiped.length) raf = requestAnimationFrame(frame);
    };

    const all = () => {
      watch();
      kern();
      fit();
      measure();
    };
    // the page's own pieces may still be arriving (scenes mount, audiences swap): watch the blocks change
    const ro = new ResizeObserver(() => measure());
    document.querySelectorAll('.blocks > .block').forEach((b) => ro.observe(b));
    // (only what shows or hides a block or a line, the audience switch; one re-measure a frame)
    let later = 0;
    const mo = new MutationObserver(() => {
      if (!later) later = requestAnimationFrame(() => ((later = 0), all()));
    });
    document.querySelectorAll('.blocks').forEach((b) => mo.observe(b, { attributes: true, attributeFilter: ['hidden'], subtree: true }));
    const onResize = () => {
      fit();
      measure();
    };
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', onResize);
    addEventListener('qb:relayout', all);
    all();
    document.fonts?.ready.then(() => {
      kern();
      fit();
      measure();
    });
    return () => {
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(later);
      removeEventListener('scroll', kick);
      removeEventListener('resize', onResize);
      removeEventListener('qb:relayout', all);
    };
  }, [pathname]);
  return null;
}
