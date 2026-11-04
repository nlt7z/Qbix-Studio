'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import { STRIP_SAMPLES, type Sample } from '@/lib/samples';

/**
 * The top of /samples as one sentence, with a sample's cover set in it like a word before each kind of
 * business (Qbix Motion's Picture sentence). Pointed at, focused or tapped, a cover grows out of the
 * line on a spring, straightens, and says whose it is. The words rise through their own sleeves and
 * the covers open from the bottom as the page comes in (samples.css); with reduced motion they're
 * simply there and a cover opens without moving.
 */

// numbers are covers: STRIP_SAMPLES, one from each group, in the groups' order
const LINE: (string | number)[] = [
  'Short videos and posters we made for', 0, 'realtors,', 1, 'remodelers,', 2, 'wedding venues,', 3, 'tree farms,', 4,
  'estate sales and', 5, 'auctions.',
];
const TILT = [-4, 3, -3, 4, -2, 3];
const ZOOM = 2.3;

function Cover({ sample, n, open, onPointer, onTap, onFocus, onBlur }: {
  sample: Sample;
  n: number;
  open: boolean;
  onPointer: (e: PointerEvent, on: boolean) => void;
  onTap: () => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const reduced = useReducedMotionSafe();
  const scale = useSpring(1, { stiffness: 260, damping: 17 });
  const rotate = useSpring(TILT[n], { stiffness: 200, damping: 20 });
  // the caption keeps its size while the cover grows
  const unscale = useTransform(scale, (s) => 1 / s);
  useEffect(() => {
    const s = open ? ZOOM : 1, r = open ? 0 : TILT[n];
    if (reduced) {
      scale.jump(s);
      rotate.jump(r);
    } else {
      scale.set(s);
      rotate.set(r);
    }
  }, [open, reduced, n, scale, rotate]);
  const what = `${sample.name}, ${sample.town}`;
  return (
    <motion.button
      type="button"
      className="smp-pic"
      style={{ scale, rotate, zIndex: open ? 5 : undefined, ['--j' as string]: n }}
      data-open={open || undefined}
      aria-expanded={open}
      aria-label={what}
      onPointerEnter={(e) => onPointer(e, true)}
      onPointerLeave={(e) => onPointer(e, false)}
      onClick={onTap}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <span className="smp-pic-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/samples/${sample.slug}/thumb.webp`} alt="" width={540} height={960} decoding="async" draggable={false} />
      </span>
      <motion.span className="smp-pic-tag" style={{ x: '-50%', scale: unscale }} aria-hidden>
        {what}
      </motion.span>
    </motion.button>
  );
}

export default function SamplesSentence({ id }: { id?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const touch = useRef(false);
  let w = 0;
  return (
    <h1 id={id} className="smp-sentence">
      {LINE.map((part, k) => {
        if (typeof part === 'number') {
          const n = part;
          return (
            <span key={k}>
              <Cover
                sample={STRIP_SAMPLES[n]}
                n={n}
                open={open === n}
                onPointer={(e, on) => {
                  touch.current = e.pointerType !== 'mouse';
                  if (e.pointerType === 'mouse') setOpen((o) => (on ? n : o === n ? null : o));
                }}
                // a tap opens it (and closes the open one); a second tap closes it
                onTap={() => touch.current && setOpen((o) => (o === n ? null : n))}
                onFocus={() => !touch.current && setOpen(n)}
                onBlur={() => setOpen((o) => (o === n ? null : o))}
              />{' '}
            </span>
          );
        }
        return part.split(' ').map((word, i) => (
          <span key={`${k}-${i}`}>
            <span className="smp-w">
              <span style={{ ['--i' as string]: w++ }}>{word}</span>
            </span>{' '}
          </span>
        ));
      })}
    </h1>
  );
}
