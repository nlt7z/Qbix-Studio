import type { CSSProperties } from 'react';

/**
 * SplitText — per-character stagger slide for CTA labels.
 *
 * Each character sits in its own overflow-hidden box with two stacked copies:
 * the resting copy is visible; a duplicate waits just below. On hover the host
 * CTA slides both copies up by one line-height, and the per-character
 * `--d` (transition-delay) makes the letters ripple one after another — a wave
 * across the word.
 *
 * The hover is pure CSS, keyed off the host's `.split-cta:hover`, so this works
 * inside both Server and Client components. The host element must carry the
 * `split-cta` class (see globals.css → "SPLIT CTA").
 *
 * Include a trailing arrow by passing `arrow` — it joins the wave as the last
 * character, spaced away from the word.
 */
export default function SplitText({
  text,
  arrow = false,
  stagger = 18,
}: {
  text: string;
  arrow?: boolean;
  stagger?: number;
}) {
  const chars = text.split('');
  return (
    <span className="split-text">
      {/* Accessible name — the animated layer below is aria-hidden. */}
      <span className="split-sr">{arrow ? `${text} ↗` : text}</span>
      <span aria-hidden className="split-anim">
        {chars.map((ch, i) => (
          <Char key={i} ch={ch} delay={i * stagger} />
        ))}
        {arrow && <Char ch="↗" delay={chars.length * stagger} isArrow />}
      </span>
    </span>
  );
}

function Char({
  ch,
  delay,
  isArrow = false,
}: {
  ch: string;
  delay: number;
  isArrow?: boolean;
}) {
  const glyph = ch === ' ' ? ' ' : ch;
  const style = { '--d': `${delay}ms` } as CSSProperties;
  return (
    <span className={`split-char${isArrow ? ' split-arrow' : ''}`} style={style}>
      <span className="split-char-rest">{glyph}</span>
      <span className="split-char-next">{glyph}</span>
    </span>
  );
}
