'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Qbix's proprietary totem: a true-isometric glass cube with three motion
 * layers running on top of each other —
 *   1. drift     : 14s ambient micro-rotation + bob (the cube has volume + time)
 *   2. specular  : 7s highlight band that sweeps across the lit top face
 *   3. parallax  : cursor-driven 4px shift on the inner light-trap
 *   4. heartbeat : ground glow pulses with the studio heartbeat (CSS)
 *
 * All animation respects prefers-reduced-motion via the wrapper CSS rule.
 *
 * Coordinates use a 220×240 viewBox. Cube center (110, 115), r = 90, true
 * isometric (30° edges). Apex points pre-computed in the paths below.
 */
export default function GlassCube({
  label = '01',
  className,
  size = 280,
}: {
  label?: string;
  className?: string;
  size?: number;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Cursor parallax — we read pointer position relative to the cube's bounding
  // box and translate the inner light-trap a few pixels. Spring it so it
  // settles, doesn't snap.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 80, damping: 18, mass: 0.6 });
  const innerX = useTransform(sx, [-1, 1], [-5, 5]);
  const innerY = useTransform(sy, [-1, 1], [-3, 3]);

  // Pause specular when offscreen — saves paint on long pages.
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <motion.div
      ref={rootRef}
      className={className}
      style={{
        width: '100%',
        maxWidth: size,
        aspectRatio: '220 / 240',
        position: 'relative',
        margin: '0 auto',
      }}
      onPointerMove={(e) => {
        const el = rootRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Normalize to roughly [-1, 1] over the cube's footprint.
        mx.set(((e.clientX - cx) / (r.width / 2)) * 0.9);
        my.set(((e.clientY - cy) / (r.height / 2)) * 0.9);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      animate={
        visible
          ? { rotate: [0, 0.6, 0, -0.6, 0], y: [0, -4, -6, -4, 0] }
          : { rotate: 0, y: 0 }
      }
      transition={{
        duration: 14,
        ease: [0.45, 0, 0.55, 1],
        repeat: Infinity,
        repeatType: 'loop',
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 220 240"
        width="100%"
        height="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* TOP face — lime emissive, brightest at upper-front vertex */}
          <radialGradient id="gc-top" cx="42%" cy="64%" r="70%">
            <stop offset="0%"  stopColor="#E8FF7A" stopOpacity="0.95" />
            <stop offset="48%" stopColor="#B8FF00" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#3D5A00" stopOpacity="0.65" />
          </radialGradient>
          {/* LEFT face */}
          <linearGradient id="gc-left" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#1A2406" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#0A0E02" stopOpacity="0.98" />
          </linearGradient>
          {/* RIGHT face */}
          <linearGradient id="gc-right" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#0F1503" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#040600" stopOpacity="1" />
          </linearGradient>
          {/* Inner-cube refraction — the "light trap" floating inside */}
          <linearGradient id="gc-inner-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D9FF5A" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#B8FF00" stopOpacity="0.06" />
          </linearGradient>
          {/* Ground glow */}
          <radialGradient id="gc-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#B8FF00" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#B8FF00" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#B8FF00" stopOpacity="0" />
          </radialGradient>
          <filter id="gc-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>

          {/* Specular highlight gradient — a thin angled band */}
          <linearGradient id="gc-specular" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Clip path: only let the specular show on the TOP face's rhombus */}
          <clipPath id="gc-top-clip">
            <path d="M 110 37.06 L 187.94 70 L 110 115 L 32.06 70 Z" />
          </clipPath>
        </defs>

        {/* Ground glow — pulses with studio heartbeat (CSS class below) */}
        <ellipse
          className="gc-ground-glow"
          cx="110"
          cy="210"
          rx="98"
          ry="14"
          fill="url(#gc-glow)"
          filter="url(#gc-blur)"
        />

        {/* TOP face */}
        <path
          d="M 110 37.06 L 187.94 70 L 110 115 L 32.06 70 Z"
          fill="url(#gc-top)"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="0.7"
        />

        {/* LEFT face */}
        <path
          d="M 32.06 70 L 110 115 L 110 192.94 L 32.06 160 Z"
          fill="url(#gc-left)"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.7"
        />

        {/* RIGHT face */}
        <path
          d="M 187.94 70 L 110 115 L 110 192.94 L 187.94 160 Z"
          fill="url(#gc-right)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.7"
        />

        {/* Specular sweep — clipped to the top face. Translates left → right
            via CSS animation. Only painted when cube is visible. */}
        {visible && (
          <g clipPath="url(#gc-top-clip)">
            <rect
              className="gc-specular"
              x="-60"
              y="20"
              width="80"
              height="110"
              fill="url(#gc-specular)"
              transform="rotate(28 0 80)"
            />
          </g>
        )}

        {/* Specular highlight along the top-left lit edge */}
        <path
          d="M 110 37.06 L 32.06 70"
          stroke="rgba(232, 255, 122, 0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M 110 37.06 L 187.94 70"
          stroke="rgba(184, 255, 0, 0.32)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />

        {/* Inner light-trap — cursor parallax target. Wrapping <g> gets the
            sprung translate. */}
        <motion.g
          style={{ x: innerX, y: innerY }}
          opacity={0.55}
        >
          <path
            d="M 110 80 L 142 93 L 110 110 L 78 93 Z"
            fill="url(#gc-inner-top)"
            stroke="rgba(217, 255, 90, 0.32)"
            strokeWidth="0.5"
          />
          <path
            d="M 78 93 L 110 110 L 110 140 L 78 123 Z"
            fill="rgba(184, 255, 0, 0.04)"
            stroke="rgba(184, 255, 0, 0.18)"
            strokeWidth="0.5"
          />
          <path
            d="M 142 93 L 110 110 L 110 140 L 142 123 Z"
            fill="rgba(0, 0, 0, 0.18)"
            stroke="rgba(184, 255, 0, 0.12)"
            strokeWidth="0.5"
          />
        </motion.g>

        {/* Numeric label on the top face */}
        <text
          x="110"
          y="78"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="600"
          letterSpacing="0.12em"
          fill="#0F1A00"
          opacity="0.78"
        >
          {label}
        </text>

        {/* Bottom vertex micro-detail */}
        <circle cx="110" cy="192.94" r="1.8" fill="#B8FF00" />
      </svg>

      <style jsx>{`
        :global(.gc-specular) {
          animation: gc-specular-sweep 7s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        :global(.gc-ground-glow) {
          animation: gc-glow-pulse 11s cubic-bezier(0.45, 0, 0.55, 1) infinite;
          transform-origin: 110px 210px;
        }
        @keyframes gc-specular-sweep {
          0%   { transform: translate(-60px, 0)   rotate(28deg); opacity: 0; }
          15%  {                                                opacity: 0.55; }
          50%  { transform: translate(200px, 0)   rotate(28deg); opacity: 0.55; }
          65%  {                                                opacity: 0; }
          100% { transform: translate(260px, 0)   rotate(28deg); opacity: 0; }
        }
        @keyframes gc-glow-pulse {
          0%, 87%, 100% { opacity: 1; transform: scale(1); }
          90%           { opacity: 1.35; transform: scale(1.08); }
          93%           { opacity: 1; transform: scale(1); }
          95%           { opacity: 1.18; transform: scale(1.04); }
          97%           { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.gc-specular),
          :global(.gc-ground-glow) {
            animation: none;
          }
        }
      `}</style>
    </motion.div>
  );
}
