'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Lime blocks and tags: the buttons, Live, Exclusive offer, /start's label,
// and the ones that are lime on phones only (Explore, /start's first step,
// the footer's status).
const LIME = [
  '.btn-primary',
  '.product-status',
  '.offer-badge',
  '.start-sprint-eyebrow',
  '.product-explore',
  '.start-next-step:first-child .start-next-k',
  '.ft-taking',
].join(', ');

/**
 * Every lime block wipes in, left to right, when it comes into view, not on
 * page load, where most of them sit below the fold and the wipe plays unseen.
 * Each node is registered once ('lime-wait': masked shut) and opened
 * ('is-lit') the first time it's half on screen; when the wipe ends both
 * classes come off, so nothing (a focus ring, say) stays masked. Nodes mounted
 * after the scan keep the CSS load wipe, so nothing is ever left hidden.
 * Re-scans on every route (and audience) change.
 *
 * A mask, not a clip-path: Chrome's IntersectionObserver counts the target's
 * own clip-path, so a node clipped shut never reports itself on screen.
 */
export default function LimeIn() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Played once, never again (a re-scan after an audience switch skips it).
    const done = (el: HTMLElement) => {
      el.classList.remove('lime-wait', 'is-lit');
      el.dataset.lit = '';
    };
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          el.classList.add('is-lit');
          const end = (ev: Event) => {
            if (ev.target !== el) return;   // a child's own transition
            el.removeEventListener('transitionend', end);
            done(el);
          };
          el.addEventListener('transitionend', end);
          window.setTimeout(() => done(el), 1400);   // in case it never fires
        }),
      { threshold: 0.5 },
    );
    document.querySelectorAll<HTMLElement>(LIME).forEach((el) => {
      if (el.classList.contains('is-lit') || 'lit' in el.dataset) return;
      el.classList.add('lime-wait');
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
