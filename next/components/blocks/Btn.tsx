import Link from 'next/link';
import type { MouseEvent } from 'react';
import type { CSSProperties } from 'react';

/** A button's words, each letter twice (the hover wave) and the drawn arrow twice (it slides out and back in). */
export function BtnLabel({ text, arrow = true }: { text: string; arrow?: boolean }) {
  return (
    <>
      {Array.from(text).map((c, d) => (
        <span key={d} className="ch" aria-hidden="true" style={{ '--d': d } as CSSProperties}>
          <i>{c}</i>
          <i>{c}</i>
        </span>
      ))}
      {arrow && (
        <span className="arr" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M4 12 12 4M5.5 4H12v6.5" />
          </svg>
          <svg viewBox="0 0 16 16">
            <path d="M4 12 12 4M5.5 4H12v6.5" />
          </svg>
        </span>
      )}
    </>
  );
}

type BtnProps = {
  href: string;
  children: string;
  /** '2' the other button (sage on white, lifted dark on the dark); 'line' the outline */
  variant?: '2' | 'line';
  small?: boolean;
  wide?: boolean;
  arrow?: boolean;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  tabIndex?: number;
};

/** The site's button: the cut corner, the letter wave, the arrow. Internal paths go through next/link. */
export default function Btn({ href, children, variant, small, wide, arrow = true, className = '', onClick, tabIndex }: BtnProps) {
  const cls = ['btn', variant === '2' && 'btn--2', variant === 'line' && 'btn--line', small && 'btn--s', wide && 'btn--wide', className]
    .filter(Boolean)
    .join(' ');
  const label = <BtnLabel text={children} arrow={arrow} />;
  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link className={cls} href={href} aria-label={children} onClick={onClick} tabIndex={tabIndex}>
        {label}
      </Link>
    );
  }
  return (
    <a className={cls} href={href} aria-label={children} onClick={onClick} tabIndex={tabIndex}>
      {label}
    </a>
  );
}
