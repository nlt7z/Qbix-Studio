import type { ReactNode } from 'react';

/**
 * The two live products, drawn (no screenshots or films), flat on the dark: the pictures the About block's
 * ideas show when pointed at (Ideas.tsx).
 *
 * Strata: a moodboard on the left (a lime disc, type, a swatch, a ceramic ring, a motion line, three
 * chips) and the system it makes on the right (colour and type tokens, a button, a card).
 *
 * AI Bidding: six blind boxes, one opened on its lime, a round's clue and a sealed bid.
 */

// the board's pieces
const BOARD: ReactNode[] = [
  <circle key="disc" cx="100" cy="120" r="44" fill="#b8ff00" />,
  <g key="type">
    <rect x="150" y="60" width="116" height="92" fill="#f4f5f2" />
    <text x="208" y="122" className="art-aa art-ink" textAnchor="middle">
      Aa
    </text>
  </g>,
  <rect key="swatch" x="50" y="200" width="90" height="110" fill="#dadfd6" />,
  <circle key="ring" cx="230" cy="230" r="38" fill="none" stroke="#f4f5f2" strokeWidth="14" />,
  <path key="motion" d="M60 368c30-40 60 40 92 0s60-40 92 0 30 20 46 10" fill="none" stroke="#f4f5f2" strokeWidth="3" strokeLinecap="round" />,
  <g key="chips">
    <rect x="160" y="300" width="18" height="18" fill="#b8ff00" />
    <rect x="184" y="300" width="18" height="18" fill="#f4f5f2" />
    <rect x="208" y="300" width="18" height="18" fill="#5a5d62" />
  </g>,
];

export function StrataArt() {
  const row = (y: number, chip: string, name: string, value: string) => (
    <g>
      <circle cx="392" cy={y} r="9" fill={chip} />
      <text x="412" y={y + 4} className="art-mono">
        {name}
      </text>
      <text x="584" y={y + 4} className="art-mono art-dim" textAnchor="end">
        {value}
      </text>
    </g>
  );
  return (
    <svg className="art strata-art" viewBox="0 0 640 440" aria-hidden="true">
      {/* the system */}
      <rect x="360" y="56" width="248" height="328" fill="#222427" />
      <text x="380" y="90" className="art-label">
        Tokens
      </text>
      {row(122, '#b8ff00', 'color.lime', '#B8FF00')}
      {row(160, '#dadfd6', 'color.mist', '#DADFD6')}
      {row(198, '#f4f5f2', 'color.chalk', '#F4F5F2')}
      <g>
        <text x="383" y="242" className="art-aa small">
          Aa
        </text>
        <text x="412" y="240" className="art-mono">
          type.display
        </text>
        <text x="584" y="240" className="art-mono art-dim" textAnchor="end">
          Outfit 200
        </text>
      </g>
      <g>
        <rect x="380" y="290" width="96" height="36" fill="#f4f5f2" />
        <text x="428" y="313" className="art-btn" textAnchor="middle">
          Button
        </text>
      </g>
      <g>
        <rect x="488" y="276" width="100" height="88" fill="#2e3034" />
        <rect x="500" y="290" width="76" height="34" fill="#3a3c40" />
        <rect x="500" y="334" width="56" height="6" fill="#4a4c50" />
        <rect x="500" y="346" width="40" height="6" fill="#4a4c50" />
      </g>

      {/* the moodboard */}
      {BOARD}
    </svg>
  );
}

export function BidArt() {
  const boxes = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 44 + (i % 3) * 120, y: 72 + Math.floor(i / 3) * 150, i }));
  return (
    <svg className="art bid-art" viewBox="0 0 640 440" aria-hidden="true">
      {boxes.map(({ x, y, i }) => {
        const pick = i === 4;
        return (
          <g key={i} opacity={pick ? 1 : 0.6}>
            <rect x={x} y={y + 20} width="100" height="92" fill="#26282b" />
            {pick ? (
              <rect x={x + 14} y={y + 34} width="72" height="64" fill="#b8ff00" />
            ) : (
              <text x={x + 50} y={y + 84} className="art-q" textAnchor="middle">
                ?
              </text>
            )}
            <rect x={x - 5} y={pick ? y - 26 : y} width="110" height="24" fill="#34363a" />
            <text x={x} y={y + 132} className="art-mono art-dim">
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        );
      })}
      <text x="430" y="92" className="art-label">
        Round 2
      </text>
      {[0, 1, 2, 3, 4].map((k) => (
        <rect key={k} x={430 + k * 34} y="104" width="28" height="4" fill={k < 2 ? '#f4f5f2' : '#3a3c40'} />
      ))}
      <rect x="430" y="132" width="164" height="112" fill="#f4f5f2" />
      <text x="446" y="158" className="art-label art-ink">
        Clue
      </text>
      <rect x="446" y="176" width="128" height="7" fill="#c9ccc5" />
      <rect x="446" y="192" width="112" height="7" fill="#c9ccc5" />
      <rect x="446" y="208" width="80" height="7" fill="#c9ccc5" />
      <rect x="430" y="264" width="164" height="100" fill="#222427" />
      <text x="446" y="290" className="art-label">
        Sealed bid
      </text>
      <circle cx="576" cy="286" r="7" fill="#b8ff00" />
      <text x="446" y="344" className="art-num">
        $120
      </text>
    </svg>
  );
}
