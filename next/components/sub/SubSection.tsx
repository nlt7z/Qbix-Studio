import type { ReactNode } from 'react';
import DitherField from '@/components/DitherField';

/**
 * Secondary-page section. Dark by default; `tone="lime"` makes it a full-bleed
 * electric-lime panel with the dither field and dark ink — the same rhythm as
 * the landing's alternating panels.
 */
export default function SubSection({
  index,
  title,
  children,
  tone = 'dark',
  narrow = false,
  id,
}: {
  index?: string;
  title: ReactNode;
  children: ReactNode;
  tone?: 'dark' | 'lime';
  narrow?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={`sp-section sp-section--${tone}`} data-nav-theme={tone === 'lime' ? 'light' : 'dark'}>
      {tone === 'lime' && <DitherField />}
      <div className={`container${narrow ? ' sp-narrow' : ''}`}>
        <header className="sp-section-head">
          {index && <span className="sp-index mono">{index}</span>}
          <h2 className="sp-h2">{title}</h2>
        </header>
        {children}
      </div>
    </section>
  );
}
