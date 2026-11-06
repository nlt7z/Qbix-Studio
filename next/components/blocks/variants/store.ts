'use client';

import { useEffect, useState } from 'react';

/**
 * Five ways each homepage section could behave, for Yuan to pick from (1 is the page as built). Chosen in the
 * 方案 panel or with ?v=hero:2,services:3, and kept for the visit. Local review only: the ones not chosen come
 * out before the push.
 */
export type VKey = 'hero' | 'services' | 'brand' | 'products' | 'about' | 'cross' | 'contact' | 'footer';
const DRIVE = ['滚动播放（现在）', '点步骤切换', '自动播放', '拖动进度条', '鼠标划过画面'];
export const SECTIONS: { k: VKey; name: string; opts: string[] }[] = [
  { k: 'services', name: 'Design service', opts: DRIVE },
  { k: 'brand', name: 'Brand upgrade', opts: DRIVE },
];

const KEY = 'qb-variants';
type Picks = Partial<Record<VKey, number>>;

function read(): Picks {
  let picks: Picks = {};
  try {
    picks = JSON.parse(sessionStorage.getItem(KEY) || '{}') as Picks;
  } catch {}
  try {
    const q = new URLSearchParams(location.search).get('v');
    if (q)
      q.split(',').forEach((pair) => {
        const [k, n] = pair.split(':');
        if (SECTIONS.some((s) => s.k === k) && /^[1-5]$/.test(n)) picks[k as VKey] = Number(n);
      });
    sessionStorage.setItem(KEY, JSON.stringify(picks));
  } catch {}
  return picks;
}

export function setVariant(k: VKey, n: number) {
  const picks = read();
  picks[k] = n;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(picks));
  } catch {}
  dispatchEvent(new CustomEvent('qb:variants', { detail: picks }));
}

/** The option a section is on (1 until the page has read the visit's picks). */
export function useVariant(k: VKey): number {
  const [n, set] = useState(1);
  useEffect(() => {
    set(read()[k] ?? 1);
    const on = (e: Event) => set((e as CustomEvent<Picks>).detail[k] ?? 1);
    addEventListener('qb:variants', on);
    return () => removeEventListener('qb:variants', on);
  }, [k]);
  return n;
}

export function usePicks(): Picks {
  const [p, set] = useState<Picks>({});
  useEffect(() => {
    set(read());
    const on = (e: Event) => set({ ...(e as CustomEvent<Picks>).detail });
    addEventListener('qb:variants', on);
    return () => removeEventListener('qb:variants', on);
  }, []);
  return p;
}

/** Ask the runtime to measure the page again (a section changed its size or its parts). */
export const relayout = () => requestAnimationFrame(() => dispatchEvent(new Event('qb:relayout')));
