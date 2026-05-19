'use client';

import { motion } from 'framer-motion';

/**
 * Qbix's proprietary totem: a true-isometric (axonometric) cube rendered as
 * thick glass. Three visible faces, lime-emissive top, light-trap interior,
 * soft ground glow. This is the studio's signature 3D form — not a re-used
 * shape pulled off some UI kit. The "01" on the top face labels AI Product
 * as the lit capability per cubeCells in data.ts.
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
  return (
    <motion.div
      className={className}
      style={{
        width: '100%',
        maxWidth: size,
        aspectRatio: '220 / 240',
        position: 'relative',
        margin: '0 auto',
        // breathing — barely perceptible; the cube is alive but never busy
      }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
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
          {/* LEFT face — deep, with a hint of lime bounce */}
          <linearGradient id="gc-left" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#1A2406" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#0A0E02" stopOpacity="0.98" />
          </linearGradient>
          {/* RIGHT face — even deeper, almost in shadow */}
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
        </defs>

        {/* Ground glow */}
        <ellipse
          cx="110"
          cy="210"
          rx="98"
          ry="14"
          fill="url(#gc-glow)"
          filter="url(#gc-blur)"
        />

        {/* TOP face: top (110,37.06) → upR (187.94,70) → mid (110,115) → upL (32.06,70) */}
        <path
          d="M 110 37.06 L 187.94 70 L 110 115 L 32.06 70 Z"
          fill="url(#gc-top)"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="0.7"
        />

        {/* LEFT face: upL → mid → bot (110,192.94) → loL (32.06,160) */}
        <path
          d="M 32.06 70 L 110 115 L 110 192.94 L 32.06 160 Z"
          fill="url(#gc-left)"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.7"
        />

        {/* RIGHT face: upR → mid → bot → loR (187.94,160) */}
        <path
          d="M 187.94 70 L 110 115 L 110 192.94 L 187.94 160 Z"
          fill="url(#gc-right)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.7"
        />

        {/* Specular highlight along the top-left lit edge */}
        <path
          d="M 110 37.06 L 32.06 70"
          stroke="rgba(232, 255, 122, 0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Softer rim on top-right edge */}
        <path
          d="M 110 37.06 L 187.94 70"
          stroke="rgba(184, 255, 0, 0.32)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />

        {/* Light-trap: an inner ghosted cube floating ~40% scale inside the volume */}
        <g opacity="0.55">
          {/* Inner top — small lime-tinted rhombus on the front face's surface */}
          <path
            d="M 110 80 L 142 93 L 110 110 L 78 93 Z"
            fill="url(#gc-inner-top)"
            stroke="rgba(217, 255, 90, 0.32)"
            strokeWidth="0.5"
          />
          {/* Inner left edge */}
          <path
            d="M 78 93 L 110 110 L 110 140 L 78 123 Z"
            fill="rgba(184, 255, 0, 0.04)"
            stroke="rgba(184, 255, 0, 0.18)"
            strokeWidth="0.5"
          />
          {/* Inner right edge */}
          <path
            d="M 142 93 L 110 110 L 110 140 L 142 123 Z"
            fill="rgba(0, 0, 0, 0.18)"
            stroke="rgba(184, 255, 0, 0.12)"
            strokeWidth="0.5"
          />
        </g>

        {/* Numeric label on the top face — Qbix's lit capability cue */}
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

        {/* Bottom vertex micro-detail — a single lime dot, the brand atom */}
        <circle cx="110" cy="192.94" r="1.8" fill="#B8FF00" />
      </svg>
    </motion.div>
  );
}
