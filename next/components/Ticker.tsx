'use client';

import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
  wrap,
} from 'framer-motion';
import { tickerItems } from '@/lib/data';

// The track holds four identical copies of the item set, so it is composed of
// four equal 25% segments. Wrapping x within [-25%, 0] slides exactly one
// segment; because the copies are identical the loop is seamless.
const COPIES = 4;

export default function Ticker({ baseVelocity = 3 }: { baseVelocity?: number }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className="ticker">
        <div className="ticker-track ticker-track--static">
          {tickerItems.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ticker">
      <ParallaxTrack baseVelocity={baseVelocity} />
    </div>
  );
}

function ParallaxTrack({ baseVelocity }: { baseVelocity: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  // Smooth the raw scroll velocity so the marquee glides rather than jerks.
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  // Map scroll velocity into a speed multiplier; clamp:false lets fast scrolls
  // overtake the base drift and flip the marquee's direction.
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);

  // Sign of the base drift. Scrolling down keeps it going one way; scrolling up
  // reverses it — the band reads the direction of the page.
  const directionFactor = useRef(1);
  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;

    // Scroll velocity adds on top of the constant drift.
    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <motion.div className="ticker-track" style={{ x }}>
      {Array.from({ length: COPIES }).flatMap((_, c) =>
        tickerItems.map((t, i) => <span key={`${c}-${i}`}>{t}</span>),
      )}
    </motion.div>
  );
}
