/**
 * Stand-in listing photo for the sample flyer and post — a modern two-volume
 * house at golden hour, drawn as flat vector so the sample reads as finished
 * work. Swap for a real listing photo when one is available.
 */
export default function HouseIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="hi-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c3a5" />
          <stop offset="0.55" stopColor="#efe2cf" />
          <stop offset="1" stopColor="#f7efe3" />
        </linearGradient>
        <linearGradient id="hi-lawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9b48c" />
          <stop offset="1" stopColor="#8d9a6f" />
        </linearGradient>
        <linearGradient id="hi-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe7b0" />
          <stop offset="1" stopColor="#f6c56f" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#hi-sky)" />
      <path d="M0 262 C90 236 170 248 260 240 C360 232 440 214 600 236 L600 300 L0 300 Z" fill="#cdb894" opacity="0.55" />
      <rect y="296" width="600" height="104" fill="url(#hi-lawn)" />
      {/* driveway */}
      <path d="M318 300 L372 300 L470 400 L330 400 Z" fill="#d8d2c6" />
      {/* main volume — white stucco */}
      <rect x="120" y="176" width="236" height="124" fill="#f5f2ec" />
      <rect x="110" y="166" width="262" height="12" fill="#2a2926" />
      <rect x="138" y="202" width="128" height="80" fill="url(#hi-glow)" />
      <path d="M180 202 V282 M222 202 V282 M138 242 H266" stroke="#2a2926" strokeWidth="3" />
      <rect x="290" y="214" width="34" height="86" fill="#2a2926" />
      <rect x="317" y="252" width="3" height="10" fill="#c9a86a" />
      {/* wood volume */}
      <rect x="352" y="126" width="146" height="174" fill="#a6764d" />
      <path d="M366 126 V300 M380 126 V300 M394 126 V300 M408 126 V300 M422 126 V300 M436 126 V300 M450 126 V300 M464 126 V300 M478 126 V300 M492 126 V300" stroke="#8c6240" strokeWidth="2" />
      <rect x="344" y="116" width="162" height="12" fill="#2a2926" />
      <rect x="378" y="150" width="62" height="118" fill="url(#hi-glow)" />
      <path d="M409 150 V268" stroke="#2a2926" strokeWidth="3" />
      {/* planters + tree */}
      <rect x="112" y="286" width="230" height="14" fill="#7a7f69" />
      <rect x="66" y="214" width="8" height="86" fill="#5f4a36" />
      <circle cx="70" cy="196" r="40" fill="#76875a" />
      <circle cx="46" cy="214" r="26" fill="#6b7b51" />
      <circle cx="94" cy="216" r="24" fill="#829364" />
      <ellipse cx="540" cy="292" rx="40" ry="16" fill="#6f8052" />
    </svg>
  );
}
