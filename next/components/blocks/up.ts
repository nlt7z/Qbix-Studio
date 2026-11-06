import type { CSSProperties } from 'react';

/** Words that slide up as they come in (blocks.css [data-up]), after `delay` ms. Usable from server pages. */
export const up = (delay?: number) => ({ 'data-up': '', style: delay ? ({ '--ud': `${delay}ms` } as CSSProperties) : undefined });
