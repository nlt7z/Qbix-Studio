'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import Btn from '@/components/blocks/Btn';

/**
 * The converter (after Wise's): pick what you need, read what it takes and costs, and the button that
 * goes there. Values swap by sliding out of their sleeve and the new one up into it. Arrow keys move the
 * choice. Drawn in the black tone by default (a dark panel set on a white block).
 */
export type ConvItem = {
  k: string;
  label: string;
  sub: string;
  /** 'Ready in' unless given */
  tlabel?: string;
  time: ReactNode;
  plabel: string;
  price: ReactNode;
  get: ReactNode;
  href: string;
  act: string;
};

function Sleeve({ k, children }: { k: string; children: ReactNode }) {
  const [shown, setShown] = useState<{ k: string; node: ReactNode }[]>([{ k, node: children }]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setShown((s) => (s[s.length - 1].k === k ? s : [s[s.length - 1], { k, node: children }]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || shown.length < 2) return;
    const [out, inn] = Array.from(el.children) as HTMLElement[];
    const o = { duration: 560, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' as const };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown((s) => s.slice(-1));
      return;
    }
    out?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-110%)' }], o);
    const a = inn?.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], o);
    if (a) a.onfinish = () => setShown((s) => s.slice(-1));
  }, [shown]);
  return (
    <span className="sw" ref={ref}>
      {shown.map((s) => (
        <span key={s.k}>{s.node}</span>
      ))}
    </span>
  );
}

export default function Converter({
  question = 'What do you need?',
  items,
  foot,
  tone = 'black',
  id = 'conv',
}: {
  question?: string;
  items: ConvItem[];
  foot?: ReactNode;
  tone?: 'black' | 'white';
  id?: string;
}) {
  const [k, setK] = useState(items[0]?.k);
  // a new set of options (the audience switch) starts on its first
  useEffect(() => {
    if (!items.some((x) => x.k === k)) setK(items[0]?.k);
  }, [items, k]);
  const item = items.find((x) => x.k === k) ?? items[0];
  const opts = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const d = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
    const j = (i + d + items.length) % items.length;
    setK(items[j].k);
    opts.current[j]?.focus();
  };
  if (!item) return null;
  return (
    <div className="conv" data-tone={tone}>
      <p className="conv-q" id={`${id}-q`}>
        {question}
      </p>
      <div className="conv-opts" role="radiogroup" aria-labelledby={`${id}-q`} style={{ ['--n' as string]: items.length }}>
        {items.map((x, i) => (
          <button
            key={x.k}
            ref={(el) => {
              opts.current[i] = el;
            }}
            type="button"
            className="conv-opt"
            role="radio"
            aria-checked={x.k === item.k}
            tabIndex={x.k === item.k ? 0 : -1}
            onClick={() => setK(x.k)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {x.label}
            <small>{x.sub}</small>
          </button>
        ))}
      </div>
      <dl className="conv-out">
        <div className="conv-cell">
          <dt>{item.tlabel ?? 'Ready in'}</dt>
          <dd>
            <Sleeve k={`t-${item.k}`}>{item.time}</Sleeve>
          </dd>
        </div>
        <div className="conv-cell">
          <dt>{item.plabel}</dt>
          <dd>
            <Sleeve k={`p-${item.k}`}>{item.price}</Sleeve>
          </dd>
        </div>
      </dl>
      <p className="conv-get" aria-live="polite">
        {item.get}
      </p>
      <Btn key={item.k} href={item.href} wide>
        {item.act}
      </Btn>
      {foot && <p className="conv-foot">{foot}</p>}
    </div>
  );
}
