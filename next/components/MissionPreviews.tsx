export function BidkingPreview() {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill="#0f1116" />
      <g transform="translate(80,30)">
        <g fill="#1a1e26" stroke="#353a47" strokeWidth="1">
          <rect x="0" y="0" width="32" height="32" />
          <rect x="36" y="0" width="32" height="32" />
          <rect x="72" y="0" width="32" height="32" />
          <rect x="108" y="0" width="32" height="32" />
          <rect x="0" y="36" width="32" height="32" fill="#FCE000" fillOpacity="0.3" />
          <rect x="36" y="36" width="32" height="32" />
          <rect x="72" y="36" width="32" height="32" fill="#ff8a1f" fillOpacity="0.4" />
          <rect x="108" y="36" width="32" height="32" />
          <rect x="0" y="72" width="32" height="32" />
          <rect x="36" y="72" width="32" height="32" fill="#b8472e" fillOpacity="0.3" />
          <rect x="72" y="72" width="32" height="32" />
          <rect x="108" y="72" width="32" height="32" />
          <rect x="0" y="108" width="32" height="32" fill="#FCE000" fillOpacity="0.15" />
          <rect x="36" y="108" width="32" height="32" />
          <rect x="72" y="108" width="32" height="32" />
          <rect x="108" y="108" width="32" height="32" fill="#4dd0ff" fillOpacity="0.25" />
        </g>
        <text x="0" y="-8" fontFamily="JetBrains Mono" fontSize="7" fill="#8a8f98" letterSpacing="1">VAULT 04 / BID 240</text>
      </g>
      <g transform="translate(240,30)" fontFamily="JetBrains Mono" fontSize="7" fill="#8a8f98" letterSpacing="1">
        <text y="0">PLAYER 1</text>
        <text y="10" fill="#FCE000">▰▰▰▰▱</text>
        <text y="30">PLAYER 2</text>
        <text y="40" fill="#ff8a1f">▰▰▱▱▱</text>
        <text y="60">PLAYER 3</text>
        <text y="70" fill="#4dd0ff">▰▰▰▱▱</text>
      </g>
    </svg>
  );
}

export function LucienPreview() {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill="#0f1116" />
      <text x="20" y="22" fontFamily="JetBrains Mono" fontSize="6" fill="#8a8f98" letterSpacing="2">SESSION 014 / LUCIEN</text>
      <text x="300" y="22" textAnchor="end" fontFamily="JetBrains Mono" fontSize="6" fill="#4dd0ff" letterSpacing="2">MEMORY · WARM</text>

      {/* portrait frame */}
      <g transform="translate(20,32)">
        <rect width="92" height="112" fill="#14171e" stroke="#353a47" />
        <g stroke="#FCE000" strokeWidth="1" opacity="0.65" fill="none">
          {/* abstract face wireframe */}
          <ellipse cx="46" cy="50" rx="22" ry="28" />
          <line x1="38" y1="44" x2="42" y2="44" />
          <line x1="50" y1="44" x2="54" y2="44" />
          <path d="M 38 64 Q 46 70 54 64" />
        </g>
        <text x="6" y="106" fontFamily="JetBrains Mono" fontSize="6" fill="#8a8f98" letterSpacing="1.5">LUCIEN · 24</text>
      </g>

      {/* dialogue */}
      <g transform="translate(124,36)" fontFamily="JetBrains Mono" fontSize="7" letterSpacing="1">
        <text fill="#6b7180">[ lucien ]</text>
        <rect x="0" y="6" width="172" height="32" fill="#14171e" stroke="#353a47" />
        <text x="6" y="20" fill="#FCE000">&quot;you came back. i wasn&apos;t</text>
        <text x="6" y="32" fill="#FCE000">sure you would.&quot;</text>

        <text y="54" fill="#6b7180">[ you ]</text>
        <rect x="0" y="60" width="172" height="20" fill="#1a1e26" stroke="#353a47" strokeDasharray="2 2" />
        <text x="6" y="74" fill="#8a8f98">&gt; type your reply_</text>

        <g transform="translate(0,90)">
          <text fill="#6b7180">[ choices ]</text>
          <text y="12" fill="#4dd0ff">▸ &quot;i kept thinking about you.&quot;</text>
          <text y="24" fill="#ff8a1f">▸ &quot;don&apos;t make it weird.&quot;</text>
          <text y="36" fill="#b8472e">▸ &quot;who are you, really?&quot;</text>
        </g>
      </g>
    </svg>
  );
}

export function OmikujiPreview() {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill="#0f1116" />
      <text x="20" y="22" fontFamily="JetBrains Mono" fontSize="6" fill="#8a8f98" letterSpacing="2">OMIKUJI · 御神籤</text>
      <text x="300" y="22" textAnchor="end" fontFamily="JetBrains Mono" fontSize="6" fill="#4dd0ff" letterSpacing="2">SEED · SUNRISE 0512</text>

      {/* drawer of slips */}
      <g transform="translate(20,40)">
        <rect width="120" height="120" fill="#14171e" stroke="#353a47" />
        {/* slip stack */}
        {[0,1,2,3,4,5].map((i) => (
          <rect
            key={i}
            x={10 + i*2}
            y={12 + i*2}
            width="36"
            height="96"
            fill="#1a1e26"
            stroke="#353a47"
          />
        ))}
        {/* drawn slip */}
        <g transform="translate(64,16)">
          <rect width="44" height="92" fill="#FCE000" />
          <text x="22" y="14" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="#07080a" fontWeight="700">大吉</text>
          <line x1="6" y1="20" x2="38" y2="20" stroke="#07080a" strokeWidth="0.5" />
          <text x="22" y="34" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="5" fill="#07080a" letterSpacing="1">GREAT</text>
          <text x="22" y="44" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="5" fill="#07080a" letterSpacing="1">BLESSING</text>
          <line x1="6" y1="52" x2="38" y2="52" stroke="#07080a" strokeWidth="0.3" />
          <text x="22" y="64" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="4" fill="#07080a">No.07</text>
          <text x="22" y="74" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="4" fill="#07080a">/047</text>
          <text x="22" y="86" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="3.5" fill="#07080a">2026.05.17</text>
        </g>
      </g>

      {/* readout */}
      <g transform="translate(160,46)" fontFamily="JetBrains Mono" fontSize="7" letterSpacing="1">
        <text fill="#6b7180">[ today&apos;s draw ]</text>
        <text y="16" fill="#FCE000">FORTUNE 大吉</text>
        <text y="28" fill="#8a8f98">strength: ▰▰▰▰▰</text>
        <text y="40" fill="#8a8f98">domain:   travel · luck</text>
        <text y="52" fill="#8a8f98">caution:  trust the slow road</text>

        <line x1="0" y1="62" x2="140" y2="62" stroke="#242833" />

        <text y="76" fill="#6b7180">[ deck ]</text>
        <text y="88" fill="#4dd0ff">46 / 47 sealed</text>
        <text y="100" fill="#b8472e">next reshuffle: 06:00</text>
      </g>
    </svg>
  );
}

export function TherapyPreview() {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill="#0f1116" />
      <text x="20" y="22" fontFamily="JetBrains Mono" fontSize="6" fill="#8a8f98" letterSpacing="2">THERAPY ROOM · SESSION 003</text>
      <text x="300" y="22" textAnchor="end" fontFamily="JetBrains Mono" fontSize="6" fill="#4dd0ff" letterSpacing="2">ROOM · OPEN</text>

      {/* heartbeat line */}
      <g transform="translate(20,34)">
        <rect width="280" height="22" fill="#07080a" stroke="#242833" />
        <polyline
          points="0,11 30,11 36,4 42,18 48,11 90,11 96,2 102,20 108,11 160,11 166,6 172,16 178,11 240,11 246,8 252,14 258,11 280,11"
          fill="none"
          stroke="#4dd0ff"
          strokeWidth="1.2"
        />
        <text x="4" y="-2" fontFamily="JetBrains Mono" fontSize="5" fill="#6b7180" letterSpacing="1.5">CALM INDEX · 62 / 100</text>
      </g>

      {/* chat */}
      <g transform="translate(20,72)" fontFamily="JetBrains Mono" fontSize="7" letterSpacing="0.5">
        {/* listener bubble */}
        <text fill="#6b7180">[ listener ]</text>
        <rect x="0" y="6" width="172" height="22" fill="#14171e" stroke="#353a47" />
        <text x="6" y="20" fill="#8a8f98">&quot;take your time. what brought</text>
        <text x="6" y="28" fill="#8a8f98">you in tonight?&quot;</text>

        {/* user bubble */}
        <text y="48" x="108" fill="#6b7180">[ you ]</text>
        <rect x="108" y="54" width="172" height="22" fill="#1a1e26" stroke="#FCE000" strokeOpacity="0.4" />
        <text x="114" y="68" fill="#FCE000">&quot;i can&apos;t sleep again. small</text>
        <text x="114" y="76" fill="#FCE000">things, mostly. it adds up.&quot;</text>

        {/* tools */}
        <g transform="translate(0,88)">
          <text fill="#6b7180">[ tools ]</text>
          <text y="12" fill="#4dd0ff">▸ breathing · 4-7-8</text>
          <text y="12" x="120" fill="#ff8a1f">▸ end session</text>
        </g>
      </g>
    </svg>
  );
}

export const previews = {
  bidking: BidkingPreview,
  lucien: LucienPreview,
  omikuji: OmikujiPreview,
  therapy: TherapyPreview,
} as const;
