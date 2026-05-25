'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { navItems } from '@/lib/data';
import QbixMark from '@/components/QbixMark';
import { useContactModal } from '@/components/ContactModalProvider';

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
  const { open: openContactModal } = useContactModal();
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Brand pulse: each time the active section changes, re-key the
  // motion wrapper so the pulse animation re-fires. "The brand
  // recognizes you arriving in a new section."
  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => {
    if (active === null) return;
    setPulseKey((k) => k + 1);
  }, [active]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

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
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      setScrolling(true);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setScrolling(false), 160);
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  const onAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    e.preventDefault();
    smoothScrollToId(href.slice(1));
  };

  const onMobileItemClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    onAnchorClick(e, href);
  };

  return (
    <nav
      className={`topnav-fixed ${scrolled ? 'is-scrolled' : ''} ${scrolling ? 'is-scrolling' : ''}`}
      aria-label="primary"
    >
      <a
        href="#top"
        className="topnav-brand"
        onClick={(e) => onAnchorClick(e, '#top')}
        aria-label="Qbix Studio — home"
      >
        <motion.span
          key={pulseKey}
          initial={{ scale: 1, filter: 'brightness(1)' }}
          animate={{
            scale: [1, 1.08, 1],
            filter: [
              'brightness(1) drop-shadow(0 0 0 transparent)',
              'brightness(1.35) drop-shadow(0 0 10px rgba(184,255,0,0.55))',
              'brightness(1) drop-shadow(0 0 0 transparent)',
            ],
          }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], times: [0, 0.4, 1] }}
          style={{ display: 'inline-flex', alignItems: 'center', willChange: 'transform, filter' }}
        >
          <QbixMark variant="wordmark" height={22} title="Qbix" />
        </motion.span>
        <span className="topnav-brand-suffix">
          <span className="slash">/</span>
          <em>studio</em>
        </span>
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
        onClick={(e) => {
          e.preventDefault();
          openContactModal();
        }}
      >
        Start a project
        <span className="arrow" aria-hidden>→</span>
      </a>

      <button
        type="button"
        className={`topnav-burger ${menuOpen ? 'is-open' : ''}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="topnav-mobile-panel"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span className="topnav-burger-bar" />
        <span className="topnav-burger-bar" />
      </button>

      <div
        id="topnav-mobile-panel"
        className={`topnav-mobile-panel ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
        role="dialog"
      >
        <ul className="topnav-mobile-list">
          {navItems.map((item) => {
            const id = item.href.startsWith('#') ? item.href.slice(1) : '';
            const isActive = id ? active === id : false;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => onMobileItemClick(e, item.href)}
                  className={`topnav-mobile-link ${isActive ? 'active' : ''}`}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  {item.label}
                  <span className="arrow" aria-hidden>→</span>
                </a>
              </li>
            );
          })}
          <li>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                openContactModal();
              }}
              className="topnav-mobile-link is-cta"
              tabIndex={menuOpen ? 0 : -1}
            >
              Start a project
              <span className="arrow" aria-hidden>→</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
