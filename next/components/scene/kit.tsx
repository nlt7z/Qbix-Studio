import type { CSSProperties, ReactNode } from 'react';

/**
 * The drawing kit the scenes are made of: boxes placed in the scene's own
 * px, a browser window, a phone, the pointer, a caret, a few icons. All flat:
 * fills, 1px lines, real type. A box named `k` can be moved by its scene's
 * timeline.
 */

type BoxProps = {
  k?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  /** corner radius */
  r?: number;
  c?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/** A box at (x, y) in the scene, w × h. */
export function A({ k, x = 0, y = 0, w, h, r, c = '', style, children }: BoxProps) {
  return (
    <div
      data-k={k}
      className={`a ${c}`}
      style={{ left: x, top: y, width: w, height: h, ...(r !== undefined ? ({ '--r': `${r}px` } as CSSProperties) : null), ...style }}
    >
      {children}
    </div>
  );
}

/**
 * A clip for a box whose top right corner is cut on the diagonal, its edge kept round the cut as two
 * hairlines (.notch in globals.css): the box inset by [top, right, bottom, left] (% of it), or open
 * `bleed` px past its edges so its shadow shows. Shut, the cut is a point, so a wipe between two of
 * these grows the corner as the box opens.
 */
export function notch(cut: number, [t, r, b, l]: [number, number, number, number] = [0, 0, 0, 0], bleed = 0): string {
  const k = t + b >= 100 || l + r >= 100 ? 0 : 1;
  const x0 = l ? `${l}%` : `${-bleed}px`;
  const x1 = r ? `${100 - r}%` : `calc(100% + ${bleed}px)`;
  const y0 = t ? `${t}%` : `${-bleed}px`;
  const y1 = b ? `${100 - b}%` : `calc(100% + ${bleed}px)`;
  const xr = (d: number) => `calc(${100 - r}% - ${d}px)`;
  const yt = (d: number) => `calc(${t}% + ${d}px)`;
  const c = cut * k;
  return `polygon(evenodd, ${x0} ${y0}, ${x1} ${y0}, ${x1} ${y1}, ${x0} ${y1}, ${x0} ${y0}, ${xr(c - k)} ${yt(k)}, ${xr(k)} ${yt(k)}, ${xr(k)} ${yt(c - k)}, ${xr(c - k)} ${yt(k)}, ${x0} ${y0})`;
}

/**
 * A clip for a box with its top right corner cut off (.cut in globals.css), shown up to `right` % short
 * of its right edge: a wipe from 100 to 0 opens it left to right, the cut riding its edge.
 */
export function cut(size: number, right = 0): string {
  const k = right >= 100 ? 0 : 1;
  const r = `${100 - right}%`;
  return `polygon(0 0, calc(${r} - ${size * k}px) 0, ${r} ${size * k}px, ${r} 100%, 0 100%)`;
}

/** One line of text at (x, y): its box is the line (for typing it out, or wiping it in). */
export function T({ k, x = 0, y = 0, c = '', style, children }: { k?: string; x?: number; y?: number; c?: string; style?: CSSProperties; children: string }) {
  return (
    <span data-k={k} className={`a t ${c}`} style={{ left: x, top: y, ...style }}>
      {children}
    </span>
  );
}

/** A browser window: three dots, an address, and whatever is on the page. */
export function Win({
  k,
  x,
  y,
  w,
  h,
  url,
  kUrl,
  c = '',
  bar,
  children,
}: BoxProps & { url?: string; kUrl?: string; bar?: ReactNode }) {
  return (
    <A k={k} x={x} y={y} w={w} h={h} r={12} c={`win ${c}`}>
      <div className="win-bar">
        <span className="win-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        {url !== undefined && (
          <span className="win-url">
            <span data-k={kUrl} className="win-addr">
              {url}
            </span>
          </span>
        )}
        {bar}
      </div>
      <div className="win-body">{children}</div>
    </A>
  );
}

/** A phone, its screen inside (the screen is w - 16 wide). */
export function Phone({ k, x, y, w = 180, h = 372, c = '', children }: BoxProps) {
  return (
    <A k={k} x={x} y={y} w={w} h={h} r={30} c={`phone ${c}`}>
      <div className="phone-screen">
        <div className="phone-status">
          <span>9:41</span>
          <i className="phone-island" />
          <span className="phone-bars" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        </div>
        {children}
      </div>
    </A>
  );
}

/** The pointer: the system arrow, black with a white edge. Its tip is the box's corner. */
export function Cursor({ k = 'cursor', x = 0, y = 0 }: { k?: string; x?: number; y?: number }) {
  return (
    <span data-k={k} className="a cursor" style={{ left: x, top: y }}>
      <svg width="22" height="28" viewBox="0 0 22 28" aria-hidden>
        <path
          d="M1.5 1.5 L1.5 21.2 L6.3 16.6 L9.6 24.4 L13.2 22.9 L9.9 15.2 L16.4 15.2 Z"
          fill="#0b0c0e"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** A text caret (blinks while still). */
export function Caret({ k, x = 0, y = 0, h = 16 }: { k?: string; x?: number; y?: number; h?: number }) {
  return (
    <span data-k={k} className="a caret" style={{ left: x, top: y, height: h }}>
      <i />
    </span>
  );
}

export const Lock = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden className="ico">
    <rect x="1.5" y="4.5" width="7" height="5" rx="1" fill="currentColor" />
    <path d="M3 4.6V3.3a2 2 0 0 1 4 0v1.3" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const Check = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden className="ico">
    <path d="M2.5 6.4 L5 8.8 L9.6 3.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Play = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden className="ico">
    <path d="M2.5 1.5 L8.5 5 L2.5 8.5 Z" fill="currentColor" />
  </svg>
);
