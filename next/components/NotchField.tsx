'use client';

import { useLayoutEffect, useRef, useState, type FocusEvent, type ReactNode } from 'react';

/**
 * A form field whose label sits inside it until the field is focused or filled, then rises onto the
 * top edge, its letters hopping one after another (Qbix Motion's Notched label). The edge is drawn
 * only on focus, white on the black, and opens under the risen label from the middle outward: two
 * strokes close the notch at rest and slide away (pathLength 1, dashoffset 0 → −1). The edge is two
 * runs that meet at the bottom middle, so it's always whole; it's measured from the field's size and
 * the label's own width, again whenever either changes.
 *
 * The control is the child (an input, textarea or select with the given id); the label is its label.
 */

const LX = 14;   // the label's left inset
const S = 0.8;   // the risen label's scale (15px → 12px)
const IN = 0.75; // half the 1.5px stroke

export default function NotchField({ id, label, filled, tall, className = '', children }: {
  id: string;
  label: string;
  filled: boolean;
  tall?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const lab = useRef<HTMLLabelElement>(null);
  const [focus, setFocus] = useState(false);
  const [d, setD] = useState<{ w: number; h: number; ring: [string, string]; gap: [string, string] } | null>(null);

  useLayoutEffect(() => {
    const el = box.current, l = lab.current;
    if (!el || !l) return;
    const draw = () => {
      const w = el.offsetWidth, h = el.offsetHeight, lw = l.offsetWidth;
      const x0 = LX - 6, x1 = LX + lw * S + 6, nm = (x0 + x1) / 2, mid = w / 2, R = w - IN, B = h - IN;
      setD({
        w,
        h,
        ring: [`M${x1},${IN} L${R},${IN} L${R},${B} L${mid},${B}`, `M${x0},${IN} L${IN},${IN} L${IN},${B} L${mid},${B}`],
        gap: [`M${nm},${IN} L${x0},${IN}`, `M${nm},${IN} L${x1},${IN}`],
      });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    ro.observe(l);
    return () => ro.disconnect();
  }, []);

  const onBlur = (e: FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus(false);
  };

  return (
    <div
      ref={box}
      className={`nfield${tall ? ' nfield--tall' : ''} ${className}`}
      data-up={focus || filled || undefined}
      data-focus={focus || undefined}
      onFocus={() => setFocus(true)}
      onBlur={onBlur}
    >
      {d && (
        <svg className="nfield-edge" width={d.w} height={d.h} viewBox={`0 0 ${d.w} ${d.h}`} aria-hidden>
          <path d={d.ring[0]} />
          <path d={d.ring[1]} />
          <path className="nfield-gap" d={d.gap[0]} pathLength={1} />
          <path className="nfield-gap" d={d.gap[1]} pathLength={1} />
        </svg>
      )}
      <label ref={lab} htmlFor={id} className="nfield-label">
        {label.split('').map((c, i) => (
          <span key={i} style={{ ['--i' as string]: i }}>
            {c}
          </span>
        ))}
      </label>
      {children}
    </div>
  );
}
