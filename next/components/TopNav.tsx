'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { navItems, CONTACT_EMAIL } from '@/lib/data';
import { useContactModal } from '@/components/ContactModalProvider';
import SplitText from '@/components/SplitText';

const HEADER_OFFSET = 64;            // 56px nav + 8px breathing room
const sectionIds = navItems
  .map((n) => (n.href.startsWith('#') ? n.href.slice(1) : null))
  .filter((s): s is string => !!s);

/**
 * Where a section starts in the document. The homepage panels are sticky, so
 * once one is stuck its rect says "top: 0" wherever the page is; measure its
 * flow position from the panels before it instead. A stacked panel fills the
 * screen and is scrolled to exactly; anything else clears the nav bar.
 */
export function sectionTop(el: HTMLElement) {
  // A story chapter: its top is where its object has just finished forming.
  if (el.hasAttribute('data-chapter')) return el.getBoundingClientRect().top + window.scrollY;
  if (getComputedStyle(el).position !== 'sticky' || !el.parentElement) {
    return el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  }
  let y = el.parentElement.getBoundingClientRect().top + window.scrollY;
  for (let s = el.parentElement.firstElementChild; s && s !== el; s = s.nextElementSibling) {
    if (s instanceof HTMLElement) y += s.offsetHeight + parseFloat(getComputedStyle(s).marginBottom);
  }
  return y;
}

export function smoothScrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) {
    // Not on the landing page — route home with the hash so the browser can resolve it.
    window.location.assign(`/#${id}`);
    return;
  }
  window.scrollTo({ top: sectionTop(el), behavior: 'smooth' });
  if (window.location.hash !== `#${id}`) {
    history.replaceState(null, '', `#${id}`);
  }
}

export default function TopNav() {
  const { open: openContactModal } = useContactModal();
  // The homepage's local-business mode (/business) has no Products panel, so
  // the links to it go too. usePathname follows the in-place audience switch.
  const pathname = usePathname();
  const forBusiness = pathname === '/business';
  const items = forBusiness ? navItems.filter((n) => n.href !== '#products') : navItems;
  // The two CTAs speak to the same audience as the page under them.
  const second = forBusiness ? { label: 'See the offers', href: '#services' } : { label: 'Use our products', href: '#products' };
  const firstLabel = forBusiness ? 'Tell us what you need' : 'Tell us your idea';
  const [active, setActive] = useState<string | null>(null);
  const [navTheme, setNavTheme] = useState<'dark' | 'light'>('dark');
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

  // Section-driven nav theme — whichever `[data-nav-theme]` section sits under
  // the nav's baseline decides the bar's skin. Computed directly on scroll
  // rather than via IntersectionObserver: with the stacked panels, covered
  // sections stay pinned at the top forever, so they never re-fire an
  // intersection event when scrolling back up — the theme got stuck and the
  // bar "vanished" (dark ink over a dark panel). Scanning in DOM order and
  // keeping the LAST section that spans the detection line matches paint
  // order (later panels cover earlier ones), so it's always the visible one.
  // The active link is resolved the same way, for the same reason.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      // Read fresh each time: the homepage story swaps its chapters when the
      // audience switches, and stale nodes would leave the bar's skin stuck.
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-theme]'));
      // Active link: the section under the nav bar. Later panels cover earlier
      // stuck ones, so the last match in page order is the one on screen.
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => !!el);
      const line = HEADER_OFFSET; // just below the nav bar
      let current: string | null = null;
      for (const el of sections) {
        const r = el.getBoundingClientRect();
        if (r.top <= line + 8 && r.bottom > line + 8) current = el.id;
      }
      setActive(current);
      let theme: 'dark' | 'light' = 'dark';
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom >= line) {
          theme = el.getAttribute('data-nav-theme') === 'light' ? 'light' : 'dark';
        }
      }
      setNavTheme(theme);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
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
      data-theme={navTheme}
      aria-label="primary"
    >
      <a
        href="#top"
        className="topnav-brand"
        onClick={(e) => onAnchorClick(e, '#top')}
        aria-label="Qbix — home"
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
          <Image
            src="/qbix-wordmark.svg"
            alt="Qbix"
            width={59}
            height={22}
            priority
            className="topnav-logo"
          />
        </motion.span>
      </a>

      <div className="topnav-links" onMouseLeave={() => setHovered(null)}>
        {items.map((item) => {
          const id = item.href.startsWith('#') ? item.href.slice(1) : '';
          const isActive = id ? active === id : false;
          const isHovered = hovered === item.href;
          if (item.disabled) {
            return (
              <span
                key={item.label}
                className="topnav-link is-disabled"
                aria-disabled="true"
                title={item.tip}
              >
                <span className="topnav-link-label">{item.label}</span>
                <span className="ft-soon mono">Soon</span>
              </span>
            );
          }
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => onAnchorClick(e, item.href)}
              onMouseEnter={() => setHovered(item.href)}
              onFocus={() => setHovered(item.href)}
              className={`topnav-link split-cta ${isActive ? 'active' : ''}`}
            >
              {isHovered && (
                <motion.span
                  layoutId="topnav-hover"
                  className="topnav-link-bg"
                  transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.6 }}
                />
              )}
              <span className="topnav-link-label">
                <SplitText text={item.label} stagger={16} />
              </span>
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

      {/* One quiet action, as text: the nav is on every screen and never the emphasis. */}
      <div className="topnav-ctas">
        <a
          href="#contact"
          className="topnav-cta topnav-cta-text split-cta"
          onClick={(e) => {
            e.preventDefault();
            openContactModal();
          }}
        >
          <SplitText key={firstLabel} text={firstLabel} arrow />
        </a>
      </div>

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
          {items.map((item, i) => {
            const id = item.href.startsWith('#') ? item.href.slice(1) : '';
            const isActive = id ? active === id : false;
            if (item.disabled) {
              return (
                <li key={item.label} style={{ '--i': i } as CSSProperties}>
                  <span className="topnav-mobile-link is-disabled" aria-disabled="true">
                    <span className="topnav-mobile-num mono">{item.num}</span>
                    {item.label}
                    <span className="ft-soon mono">Soon</span>
                  </span>
                </li>
              );
            }
            return (
              <li key={item.href} style={{ '--i': i } as CSSProperties}>
                <a
                  href={item.href}
                  onClick={(e) => onMobileItemClick(e, item.href)}
                  className={`topnav-mobile-link ${isActive ? 'active' : ''}`}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <span className="topnav-mobile-num mono">{item.num}</span>
                  {item.label}
                  <span className="arrow" aria-hidden>↗︎</span>
                </a>
              </li>
            );
          })}
          <li className="topnav-mobile-gap" style={{ '--i': navItems.length } as CSSProperties}>
            <a
              href={second.href}
              onClick={(e) => onMobileItemClick(e, second.href)}
              className="topnav-mobile-link split-cta"
              tabIndex={menuOpen ? 0 : -1}
            >
              {second.label}
              <span className="arrow" aria-hidden>↗︎</span>
            </a>
          </li>
          <li style={{ '--i': navItems.length + 1 } as CSSProperties}>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                openContactModal();
              }}
              className="topnav-mobile-link is-cta split-cta"
              tabIndex={menuOpen ? 0 : -1}
            >
              {firstLabel}
              <span className="arrow" aria-hidden>↗︎</span>
            </a>
          </li>
        </ul>
        <div className="topnav-mobile-foot mono" style={{ '--i': navItems.length + 2 } as CSSProperties}>
          <a href={`mailto:${CONTACT_EMAIL}`} tabIndex={menuOpen ? 0 : -1}>{CONTACT_EMAIL}</a>
          <span><i aria-hidden /> Taking new projects</span>
        </div>
      </div>
    </nav>
  );
}
