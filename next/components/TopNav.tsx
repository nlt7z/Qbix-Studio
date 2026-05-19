'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { navItems } from '@/lib/data';

const HEADER_OFFSET = 64;            // 56px nav + 8px breathing room
const sectionIds = navItems
  .map((n) => (n.href.startsWith('#') ? n.href.slice(1) : null))
  .filter((s): s is string => !!s);

function smoothScrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) {
    // Not on the landing page — route home with the hash so the browser can resolve it.
    window.location.assign(`/#${id}`);
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: 'smooth' });
  if (window.location.hash !== `#${id}`) {
    history.replaceState(null, '', `#${id}`);
  }
}

export default function TopNav() {
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: `-${HEADER_OFFSET + 8}px 0px -55% 0px`, threshold: [0, 0.2, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    e.preventDefault();
    smoothScrollToId(href.slice(1));
  };

  return (
    <nav className={`topnav-fixed ${scrolled ? 'is-scrolled' : ''}`} aria-label="primary">
      <a href="#top" className="topnav-brand" onClick={(e) => onAnchorClick(e, '#top')} aria-label="Qbix Studio — home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="topnav-logo" src="/qbix-keyboard.png" alt="" aria-hidden />
        <span className="slash"> / </span>Studio
      </a>

      <div className="topnav-links" onMouseLeave={() => setHovered(null)}>
        {navItems.map((item) => {
          const id = item.href.startsWith('#') ? item.href.slice(1) : '';
          const isActive = id ? active === id : false;
          const isHovered = hovered === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => onAnchorClick(e, item.href)}
              onMouseEnter={() => setHovered(item.href)}
              onFocus={() => setHovered(item.href)}
              className={`topnav-link ${isActive ? 'active' : ''}`}
            >
              {isHovered && (
                <motion.span
                  layoutId="topnav-hover"
                  className="topnav-link-bg"
                  transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.6 }}
                />
              )}
              <span className="topnav-link-label">{item.label}</span>
              {isActive && (
                <motion.span
                  layoutId="topnav-active"
                  className="topnav-link-underline"
                  transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }}
                />
              )}
            </a>
          );
        })}
      </div>

      <div className="topnav-status" aria-hidden>
        <span className="dot" />
        Open Q3
      </div>

      <a
        href="#contact"
        className="topnav-cta"
        onClick={(e) => onAnchorClick(e, '#contact')}
      >
        Start a project
        <span className="arrow" aria-hidden>→</span>
      </a>
    </nav>
  );
}
