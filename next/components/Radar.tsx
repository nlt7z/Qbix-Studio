export default function Radar() {
  return (
    <div className="radar" aria-hidden="true">
      <svg viewBox="0 0 320 320">
        <defs>
          <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FCE000" stopOpacity="0" />
            <stop offset="80%" stopColor="#FCE000" stopOpacity="0" />
            <stop offset="100%" stopColor="#FCE000" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        <circle cx="160" cy="160" r="150" fill="none" stroke="#353a47" strokeWidth="1" />
        <circle cx="160" cy="160" r="110" fill="none" stroke="#242833" strokeWidth="1" />
        <circle cx="160" cy="160" r="70" fill="none" stroke="#242833" strokeWidth="1" />
        <circle cx="160" cy="160" r="30" fill="none" stroke="#242833" strokeWidth="1" />
        <line x1="10" y1="160" x2="310" y2="160" stroke="#242833" strokeWidth="1" />
        <line x1="160" y1="10" x2="160" y2="310" stroke="#242833" strokeWidth="1" />
        <g className="sweep">
          <path d="M160 160 L310 160 A150 150 0 0 0 244 30 Z" fill="url(#sweepGrad)" />
          <line x1="160" y1="160" x2="310" y2="160" stroke="#FCE000" strokeWidth="1.5" opacity="0.7" />
        </g>
        <circle cx="220" cy="100" r="3.5" fill="#FCE000" />
        <circle cx="100" cy="200" r="3" fill="#ff8a1f" />
        <circle cx="240" cy="220" r="3" fill="#f6c542" />
        <circle cx="80" cy="100" r="3" fill="#b8472e" />
        <circle cx="160" cy="160" r="4" fill="#FCE000" />
        <circle cx="160" cy="160" className="ping" fill="none" stroke="#FCE000" strokeWidth="1" />
        <text x="226" y="94" fontFamily="JetBrains Mono" fontSize="7" fill="#8a8f98" letterSpacing="1">M.001</text>
        <text x="106" y="194" fontFamily="JetBrains Mono" fontSize="7" fill="#8a8f98" letterSpacing="1">M.002</text>
        <text x="246" y="214" fontFamily="JetBrains Mono" fontSize="7" fill="#8a8f98" letterSpacing="1">M.003</text>
        <text x="86" y="94" fontFamily="JetBrains Mono" fontSize="7" fill="#b8472e" letterSpacing="1">M.004</text>
      </svg>
    </div>
  );
}
