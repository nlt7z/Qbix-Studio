'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/lib/data';

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function HudNav() {
  const pathname = usePathname();

  return (
    <nav className="hud-nav" aria-label="section">
      {navItems.map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <Link
            key={item.num}
            href={item.href}
            className={`hud-item ${active ? 'active' : ''}`}
            data-section={item.cool.toLowerCase()}
          >
            <span className="hud-num">{item.num}</span>
            <span className="hud-cool">{item.cool}</span>
            <span className="hud-plain">{item.plain}</span>
          </Link>
        );
      })}
    </nav>
  );
}
