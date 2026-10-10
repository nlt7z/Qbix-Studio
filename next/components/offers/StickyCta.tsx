'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Phone-only bottom bar carrying the buy button. Hidden while any element
 * marked [data-cta-zone] (the hero's and the closing buttons) is on screen,
 * so it never doubles up on a visible CTA.
 */
export default function StickyCta({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const zones = Array.from(document.querySelectorAll('[data-cta-zone]'));
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      setShow(seen.size === 0 && window.scrollY > 200);
    });
    zones.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, []);
  return (
    <div className={`offer-sticky${show ? ' is-on' : ''}`} aria-hidden={!show}>
      {children}
    </div>
  );
}
