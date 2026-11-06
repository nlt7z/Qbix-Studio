'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Btn from '@/components/blocks/Btn';
import Wordmark from '@/components/blocks/Wordmark';
import { CONTACT_EMAIL } from '@/lib/data';

/**
 * The bar: the logo left; in the middle, at one spacing, the two audiences (Wise's Personal and Business),
 * Services (a panel: the four services and the samples), Products and About; the outline Start a project
 * right. The chosen word is a colour, not a line (ink on white, lime on the dark). The bar takes the tone of
 * the block under it and fills once the page has moved. Under 900px it is the logo and a Menu that opens a
 * sheet of the same links.
 *
 * On the homepage (/ and /business) the audiences switch the page in place: the bar sends `qb:audience` and
 * the homepage's AudienceProvider answers (it moves the address between / and /business).
 */
const SERVICES = [
  {
    group: 'For AI teams',
    items: [
      { href: '/#services', name: 'Design service', line: 'From moodboard to a live domain. From $500.' },
      { href: '/#brand', name: 'Brand upgrade', line: 'From usable to worth sharing. From $5,000.' },
    ],
  },
  {
    group: 'For business',
    items: [
      { href: '/listing-kit', name: 'Listing Launch Kit', line: 'Ready to share in 48 hours. $99 per listing.' },
      { href: '/practice-websites', name: 'Practice Website Refresh', line: 'A calm website, live in 7 days. $600 flat.' },
      { href: '/samples', name: 'Samples', line: 'Short videos and posters we made for local businesses.' },
    ],
  },
];
const BUSINESS_PAGES = ['/listing-kit', '/practice-websites', '/samples'];
// the sheet's two lists: each homepage, then what it offers
const SHEET: { title: string; href: string; aud: 'ai' | 'business'; items: { name: string; note: string; href: string }[] }[] = [
  {
    title: 'For AI teams',
    href: '/',
    aud: 'ai',
    items: [
      { name: 'Design service', note: 'From $500', href: '/#services' },
      { name: 'Brand upgrade', note: 'From $5,000', href: '/#brand' },
      { name: 'Products', note: 'Strata, AI Bidding and more', href: '/products/strata' },
    ],
  },
  {
    title: 'For business',
    href: '/business',
    aud: 'business',
    items: [
      { name: 'Listing Launch Kit', note: '$99 per listing', href: '/listing-kit' },
      { name: 'Practice Website Refresh', note: '$600 flat', href: '/practice-websites' },
      { name: 'Samples', note: '18 local businesses', href: '/samples' },
    ],
  },
];

type Aud = 'ai' | 'business';
const sendAudience = (a: Aud) => window.dispatchEvent(new CustomEvent('qb:audience', { detail: a }));

export default function Nav() {
  const pathname = usePathname() || '/';
  const home = pathname === '/' || pathname === '/business';
  // which audience the page belongs to (on the homepage, the one it shows)
  const aud: Aud | null = pathname === '/business' || BUSINESS_PAGES.includes(pathname) ? 'business' : pathname === '/' || pathname.startsWith('/products') ? 'ai' : null;

  // About is on both homepages: stay on the one shown
  const about = pathname === '/business' ? '/business#about' : '/#about';

  const navRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLLIElement>(null);
  const [tone, setTone] = useState('white');
  const [filled, setFilled] = useState(false);
  const [sub, setSub] = useState(false);
  const [menu, setMenu] = useState(false);

  // the tone under the bar, and whether the page has moved
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const nav = navRef.current;
      if (!nav) return;
      const hit = document.elementsFromPoint(innerWidth / 2, Math.round(nav.offsetHeight / 2));
      const block = hit.find((x) => !nav.contains(x) && x.closest('.block'))?.closest<HTMLElement>('.block');
      setTone(block?.dataset.tone || 'white');
      setFilled(scrollY > 8);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick);
    kick();
    const t = setTimeout(kick, 300); // after the page's blocks have settled
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      removeEventListener('scroll', kick);
      removeEventListener('resize', kick);
    };
  }, [pathname]);

  // a new page closes whatever was open
  useEffect(() => {
    setSub(false);
    setMenu(false);
  }, [pathname]);

  // the sheet: inert while shut, the page held still while open, Escape and a wide window shut it
  useEffect(() => {
    if (sheetRef.current) (sheetRef.current as HTMLElement & { inert: boolean }).inert = !menu;
    document.documentElement.classList.toggle('menu-open', menu);
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    const mq = matchMedia('(min-width: 900px)');
    const onWide = (m: MediaQueryListEvent) => m.matches && setMenu(false);
    addEventListener('keydown', onKey);
    mq.addEventListener('change', onWide);
    return () => {
      removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onWide);
    };
  }, [menu]);

  // Services: pointed at (with a mouse), clicked, or the keys; shut by Escape, a click outside, leaving it
  useEffect(() => {
    if (!sub) return;
    const onDoc = (e: MouseEvent) => subRef.current && !subRef.current.contains(e.target as Node) && setSub(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSub(false);
    document.addEventListener('click', onDoc);
    addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      removeEventListener('keydown', onKey);
    };
  }, [sub]);
  const leave = useRef(0);
  const canHover = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

  const audItems = (onPick?: () => void) =>
    home ? (
      <>
        {(['ai', 'business'] as const).map((a) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={aud === a}
            onClick={() => {
              sendAudience(a);
              onPick?.();
            }}
          >
            {a === 'ai' ? 'AI teams' : 'Business'}
          </button>
        ))}
      </>
    ) : (
      <>
        <Link href="/" aria-current={aud === 'ai' ? 'true' : undefined} onClick={onPick}>
          AI teams
        </Link>
        <Link href="/business" aria-current={aud === 'business' ? 'true' : undefined} onClick={onPick}>
          Business
        </Link>
      </>
    );

  const navTone = menu ? 'black' : tone;
  return (
    <>
      <header ref={navRef} className={`nav${filled || sub || menu ? ' is-filled' : ''}`} data-tone={navTone}>
        <Link className="nav-logo" href="/" aria-label="Qbix, home">
          <Wordmark />
        </Link>
        <nav className="nav-mid" aria-label="Main">
          <span className="aud" role={home ? 'radiogroup' : undefined} aria-label={home ? 'Who this page is for' : "Who it's for"}>
            {audItems()}
          </span>
          <ul className="nav-links">
            <li
              ref={subRef}
              className={`nav-has-sub${sub ? ' is-open' : ''}`}
              data-current={BUSINESS_PAGES.includes(pathname) ? '' : undefined}
              onPointerEnter={() => {
                if (!canHover()) return;
                clearTimeout(leave.current);
                setSub(true);
              }}
              onPointerLeave={() => {
                if (!canHover()) return;
                clearTimeout(leave.current);
                leave.current = window.setTimeout(() => setSub(false), 180);
              }}
              onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setSub(false)}
            >
              <button type="button" className="nav-sub-btn" aria-expanded={sub} aria-controls="nav-sub" onClick={() => setSub((v) => !v)}>
                Services
                <svg viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M1.5 3.5 5 7l3.5-3.5" />
                </svg>
              </button>
              <div className="nav-sub" id="nav-sub">
                {SERVICES.map((g) => (
                  <div key={g.group} className="nav-sub-col">
                    <p className="nav-sub-k">{g.group}</p>
                    {g.items.map((it) => (
                      <Link key={it.name} href={it.href} onClick={() => setSub(false)}>
                        <b>{it.name}</b>
                        <span>{it.line}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </li>
            <li>
              <Link href="/products/strata" aria-current={pathname.startsWith('/products') ? 'page' : undefined}>
                Products
              </Link>
            </li>
            <li>
              <Link href={about}>About</Link>
            </li>
          </ul>
        </nav>
        <div className="nav-end">
          <Btn href="/start" variant="line" small>Start a project</Btn>
          <button type="button" className="nav-menu" aria-expanded={menu} aria-controls="nav-sheet" onClick={() => setMenu((v) => !v)}>
            <span>{menu ? 'Close' : 'Menu'}</span>
            <i aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* the sheet (under 900px): no switch; the two homepages head the two lists, each with its services */}
      <div ref={sheetRef} className={`nav-sheet${menu ? ' is-open' : ''}`} id="nav-sheet" data-tone="black">
        <div className="nav-sheet-lists">
          {SHEET.map((g) => (
            <div key={g.title} className="nav-sheet-group">
              <Link className="nav-sheet-k" href={g.href} aria-current={aud === g.aud ? 'true' : undefined} onClick={() => setMenu(false)}>
                {g.title}
              </Link>
              {g.items.map((it) => (
                <Link key={it.name} className="mid" href={it.href} onClick={() => setMenu(false)}>
                  {it.name}
                  <span>{it.note}</span>
                </Link>
              ))}
            </div>
          ))}
          <Link className="big" href={about} onClick={() => setMenu(false)}>
            About
          </Link>
        </div>
        <div className="nav-sheet-foot">
          <Btn href="/start" variant="line" onClick={() => setMenu(false)}>
            Start a project
          </Btn>
          <a className="link" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </>
  );
}
