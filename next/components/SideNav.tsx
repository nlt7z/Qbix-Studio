'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/lib/data';

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="side-nav" aria-label="primary">
      <Link href="/" className="side-brand" aria-label="qbix home">
        q<span className="slash">/</span>
      </Link>
      {navItems.map((item) => (
        <Link
          key={item.num}
          href={item.href}
          data-tip={item.tip}
          className={isActive(item.href, pathname) ? 'active' : ''}
        >
          <span className="nav-num">{item.num}</span>
          <span className="nav-label">{item.side}</span>
        </Link>
      ))}
    </nav>
  );
}
