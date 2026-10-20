'use client';

import '@/app/scenes-listing.css';
import type { ReactNode } from 'react';
import Scene, { type Pick } from '@/components/scene/Scene';
import { A, T, Cursor, Caret, Check } from '@/components/scene/kit';
import { E, type Props, type Timeline } from '@/lib/scene/timeline';

/**
 * The Listing Launch Kit, for 1428 Alder Street: one flyer, and everything
 * made from it. The flyer is the anchor: it prints, front and back; the
 * pictures on it are cropped into five posts (the back's two pictures go
 * down into the feed, two crops lift out of the front's photo, the last post
 * comes in beside them); the posts fold away and a phone rises with the
 * 30-second video, its pictures wiping through as its captions type. On the
 * kit's own page the tour goes on: the editable copy opens beside the flyer
 * and a new price typed into it rolls over on the flyer; then a change asked
 * for in a message lands on the flyer's open house line.
 *
 * Everything printed or posted is ink on paper, in either tone. One lime per
 * state, handed on as the story moves: the flyer's tag; the Just Listed post's
 * tag (the flyer's is reprinted in ink first); the video's running time; the
 * field being edited; the reply that says it's done. What changed on the
 * flyer is underlined in ink.
 */

/* =============================================================================
   The drawings: ink on paper, geometric. Each is one SVG drawing that a
   viewBox crops (the photo on the flyer, a square for a post, a tall frame
   for the video).
   ============================================================================= */

// the roof's pitch, and its underside (where the siding stops)
const PITCH = 68 / 70;
const roofIn = (x: number) => 67.8 + Math.abs(x - 206) * PITCH;
const SIDING = Array.from({ length: 15 }, (_, i) => 157 + i * 7);
const LAP = Array.from({ length: 8 }, (_, i) => 157 + i * 6);

/** The house: a two-storey gable, a low wing, three trees, the walk to the door. (400 x 240) */
function HouseArt() {
  return (
    <>
      <rect className="s" y="-200" width="400" height="440" />
      <rect className="g" y="206" width="400" height="200" />
      <line className="l gl" x1="0" x2="400" y1="206" y2="206" />
      {/* trees */}
      <circle className="t" cx="56" cy="182" r="18" />
      <rect className="t" x="55.3" y="196" width="1.4" height="10" />
      <ellipse className="t" cx="112" cy="157" rx="15" ry="45" />
      <rect className="t" x="111.3" y="198" width="1.4" height="8" />
      <circle className="t" cx="367" cy="166" r="22" />
      <rect className="t" x="366.3" y="184" width="1.4" height="22" />
      {/* the wing */}
      <rect className="w" x="262" y="150" width="78" height="56" />
      {LAP.map((y) => (
        <line key={y} className="l" x1="262" x2="340" y1={y} y2={y} />
      ))}
      <rect className="k" x="276" y="161" width="50" height="29" />
      <line className="m" x1="292.7" x2="292.7" y1="161" y2="190" />
      <line className="m" x1="309.3" x2="309.3" y1="161" y2="190" />
      <rect className="t" x="268" y="196" width="66" height="10" rx="5" />
      <rect className="k" x="258" y="143" width="86" height="7" />
      {/* the house: its chimney, its gable, the siding, the roof */}
      <rect className="k" x="238" y="72" width="12" height="30" />
      <path className="w" d="M150 206V120L206 67L262 120V206Z" />
      {SIDING.map((x) => (
        <line key={x} className="l" x1={x} x2={x} y1={roofIn(x) + 2} y2="206" />
      ))}
      <path className="k" d="M136 126L206 58L276 126H266L206 67.8L146 126Z" />
      {/* the windows, the door under its canopy, the steps, the walk */}
      <rect className="k" x="196" y="86" width="20" height="26" />
      <line className="m" x1="196" x2="216" y1="99" y2="99" />
      <rect className="k" x="160" y="136" width="34" height="50" />
      <line className="m" x1="177" x2="177" y1="136" y2="186" />
      <line className="m" x1="160" x2="194" y1="168" y2="168" />
      <rect className="k" x="208" y="139" width="36" height="4" />
      <rect className="k" x="214" y="147" width="24" height="59" />
      <rect className="w" x="232.6" y="173" width="1.6" height="9" />
      <rect className="k" x="210" y="206" width="32" height="3.5" />
      <rect className="k" x="206" y="209.5" width="40" height="3.5" />
      <path className="w" d="M212 213H240L269 300H183Z" />
    </>
  );
}

/** The front door, close: siding, the canopy, the house number, a lamp, a planter, the steps. (113 x 240) */
function DoorArt() {
  return (
    <>
      <rect className="w" width="113" height="206" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} className="l" x1={4.5 + i * 9.4} x2={4.5 + i * 9.4} y1="0" y2="206" />
      ))}
      <rect className="g" y="206" width="113" height="34" />
      <line className="l gl" x1="0" x2="113" y1="206" y2="206" />
      <rect className="k" x="16" y="62" width="74" height="5" />
      <rect className="k" x="33" y="76" width="38" height="120" />
      <line className="m" x1="39" x2="39" y1="84" y2="188" />
      <rect className="w" x="63.4" y="128" width="2.2" height="20" />
      <text className="k lst-num" x="78" y="104">
        1428
      </text>
      <rect className="k" x="85" y="120" width="2" height="8" />
      <rect className="k" x="82" y="128" width="8" height="13" rx="1" />
      <rect className="k" x="25" y="196" width="54" height="5" />
      <rect className="k" x="19" y="201" width="66" height="5" />
      <ellipse className="t" cx="101" cy="167" rx="8.5" ry="16" />
      <rect className="k" x="93" y="181" width="16" height="25" />
      <path className="w" d="M24 206H80L92 240H12Z" />
    </>
  );
}

/** The kitchen: an island under three pendants, the window between the cabinets. (240 x 240) */
function KitchenArt() {
  return (
    <>
      <rect className="s" y="-200" width="240" height="440" />
      <rect className="g" y="204" width="240" height="36" />
      <line className="ol" x1="0" x2="240" y1="-8" y2="-8" />
      {/* the window, the cabinets either side */}
      <rect className="w" x="92" y="30" width="56" height="74" />
      <rect className="ol" x="92.5" y="30.5" width="55" height="73" />
      <line className="ol" x1="120" x2="120" y1="30" y2="104" />
      <rect className="w" x="14" y="30" width="66" height="54" />
      <rect className="ol" x="14.5" y="30.5" width="65" height="53" />
      <line className="ol" x1="47" x2="47" y1="30" y2="84" />
      <rect className="w" x="160" y="30" width="66" height="54" />
      <rect className="ol" x="160.5" y="30.5" width="65" height="53" />
      <line className="ol" x1="193" x2="193" y1="30" y2="84" />
      {/* the counter along the back, its cabinets */}
      <rect className="w" x="0" y="130" width="240" height="74" />
      {[40, 80, 160, 200].map((x) => (
        <line key={x} className="ol" x1={x} x2={x} y1="130" y2="204" />
      ))}
      <rect className="k" x="0" y="127.5" width="240" height="2.5" />
      {/* the pendants */}
      {[78, 120, 162].map((x) => (
        <g key={x}>
          <line className="cord" x1={x} x2={x} y1="-8" y2="88" />
          <path className="k" d={`M${x - 11} 100a11 11 0 0 1 22 0Z`} />
        </g>
      ))}
      {/* the island, two stools */}
      <rect className="w" x="44" y="152" width="152" height="52" />
      <rect className="ol" x="44.5" y="152.5" width="151" height="51" />
      <rect className="k" x="34" y="145" width="172" height="8" />
      {[78, 150].map((x) => (
        <g key={x}>
          <rect className="k" x={x - 14} y="170" width="28" height="4.5" />
          <rect className="k" x={x - 11} y="174" width="1.6" height="40" />
          <rect className="k" x={x + 9.4} y="174" width="1.6" height="40" />
          <rect className="k" x={x - 11} y="196" width="22" height="1.4" />
        </g>
      ))}
    </>
  );
}

/** The neighborhood: the streets around Alder Street, a park, the house pinned. (240 x 240) */
function MapArt() {
  return (
    <>
      <rect className="b" width="240" height="240" />
      <rect className="p" x="164" y="142" width="38" height="50" />
      <rect className="w" x="0" y="44" width="240" height="8" />
      <rect className="w" x="0" y="122" width="240" height="14" />
      <rect className="w" x="0" y="198" width="240" height="8" />
      <rect className="w" x="50" y="0" width="8" height="240" />
      <rect className="w" x="150" y="0" width="10" height="240" />
      <rect className="w" x="206" y="0" width="7" height="240" />
      <path className="w" d="M0 178L240 82V92L0 188Z" />
      <path className="k" d="M104 129c-7.6-8.6-11.5-14.4-11.5-19.4a11.5 11.5 0 0 1 23 0c0 5-3.9 10.8-11.5 19.4Z" />
      <circle className="w" cx="104" cy="109.6" r="4.2" />
    </>
  );
}

type ArtProps = { k?: string; vb?: string; w: number; h: number; line?: boolean };

function Art({ k, vb, w, h, line, base, children }: ArtProps & { base: string; children: ReactNode }) {
  return (
    <svg
      data-k={k}
      className={`lst-art${line ? ' lst-art--line' : ''}`}
      width={w}
      height={h}
      viewBox={vb ?? base}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {children}
    </svg>
  );
}
const House = (p: ArtProps) => (
  <Art {...p} base="0 0 400 240">
    <HouseArt />
  </Art>
);
const Kitchen = (p: ArtProps) => (
  <Art {...p} base="0 0 240 240">
    <KitchenArt />
  </Art>
);
const Door = (p: ArtProps) => (
  <Art {...p} base="0 0 113 240">
    <DoorArt />
  </Art>
);
const Hood = (p: ArtProps) => (
  <Art {...p} base="0 0 240 240">
    <MapArt />
  </Art>
);

/** A QR code, drawn: 21 x 21 modules, its three finders, timing rows, and the rest a fixed scatter. */
const QR_PATH = (() => {
  let seed = 1428;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const finder = (fx: number, fy: number, x: number, y: number) => {
    const dx = x - fx, dy = y - fy;
    if (dx < -1 || dy < -1 || dx > 7 || dy > 7) return null;
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
    return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
  };
  let d = '';
  for (let y = 0; y < 21; y++)
    for (let x = 0; x < 21; x++) {
      let v = finder(0, 0, x, y) ?? finder(14, 0, x, y) ?? finder(0, 14, x, y);
      if (v === null) v = y === 6 ? x % 2 === 0 : x === 6 ? y % 2 === 0 : rnd() < 0.48;
      if (v) d += `M${x} ${y}h1v1h-1z`;
    }
  return d;
})();

function QR({ k }: { k?: string }) {
  return (
    <span data-k={k} className="a lst-qr">
      <svg width="42" height="42" viewBox="0 0 21 21" shapeRendering="crispEdges" aria-hidden>
        <path d={QR_PATH} />
      </svg>
    </span>
  );
}

const FileIco = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden className="ico">
    <path d="M1.5 1.5h4.6L8.5 4v6.5h-7Z M6 1.5V4h2.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
  </svg>
);

const LinkIco = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="ico">
    <path
      d="M5.1 6.9 6.9 5.1M5.6 3.5l1-1a2 2 0 0 1 2.9 2.9l-1 1M6.4 8.5l-1 1a2 2 0 0 1-2.9-2.9l1-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

/* =============================================================================
   The pieces of the kit
   ============================================================================= */

// a sheet (8.5 x 11) and the photo across its top (the house at 0.75)
const SHEET = { w: 300, h: 388 };
// the posts: a lead square (its picture over a band) and a story beside it, three squares under them
const LEAD = 221;
const STORY = { w: 124, h: 221, top: 97 };
const SQ = 111;
const GAP = 12;
const BLOCK_H = LEAD + GAP + SQ;
const PHONE = { w: 240, h: 494 };
// the crops of the house (in its own units; the front's photo shows it at 0.75): the lead's
// clears the flyer's tag, the story's is the gable and its door; In Escrow draws the house in line
type Rect = { x: number; y: number; w: number; h: number };
const LEAD_PIC = { w: LEAD, h: 165 };
const LEAD_VB: Rect = { x: 128, y: 48, w: 258, h: 192 };
const STORY_VB: Rect = { x: 146, y: 56, w: 160, h: 160 };
const ESC_VB: Rect = { x: 96, y: 0, w: 240, h: 240 };
const onPhoto = (c: Rect) => ({ x: c.x * 0.75, y: c.y * 0.75, w: c.w * 0.75, h: c.h * 0.75 });
const vb = (c: Rect) => `${c.x} ${c.y} ${c.w} ${c.h}`;
// the back's two pictures (on the back, 123 square)
const BACK_PIC = [
  { x: 18, y: 166 },
  { x: 159, y: 166 },
];
const BACK_S = 123;
// the price on the front (the marks behind what changes are measured when the timeline is built)
const PRICE = { x: 18, y: 226 };

/** The flyer's front: the photo, the words, the agent's band. `ink`: its tag in ink, never lime (where the page has its own lime). */
function Front({ k, ink = false }: { k: string; ink?: boolean }) {
  return (
    <>
      <A k={`${k}.photo`} x={0} y={0} w={300} h={180} c="lst-photo">
        <House w={300} h={180} />
      </A>
      <A k={`${k}.tag`} x={14} y={14} c={`lst-tag${ink ? ' lst-tag--ink' : ''}`}>
        Just listed
      </A>
      {!ink && (
        <A k={`${k}.tag2`} x={14} y={14} c="lst-tag lst-tag--ink">
          Just listed
        </A>
      )}
      <T k={`${k}.addr`} x={18} y={193} c="f-head lst-addr">
        1428 Alder Street
      </T>
      <A k={`${k}.mark`} c="lst-mark" />
      <A k={`${k}.mark2`} c="lst-mark" />
      <A k={`${k}.price`} x={PRICE.x} y={PRICE.y} c="f-head lst-price lst-line">
        $8
        <span className="lst-roll">
          <span data-k={`${k}.p4`} style={{ display: 'inline-block' }}>
            4
          </span>
          <span data-k={`${k}.p2`} className="lst-roll-new">
            2
          </span>
        </span>
        9,000
      </A>
      <T k={`${k}.facts`} x={18} y={262} c="lst-facts">
        3 bd · 2 ba · 1,850 sq ft
      </T>
      <A k={`${k}.oh`} x={18} y={285} c="lst-oh lst-line">
        <span className="lst-oh-k">Open house </span>
        <span className="lst-roll lst-roll--end">
          <span data-k={`${k}.sat`} style={{ display: 'inline-block' }}>
            Sat, 1 to 4
          </span>
          <span data-k={`${k}.sun`} className="lst-roll-new">
            Sun, 1 to 4
          </span>
        </span>
      </A>
      <A k={`${k}.band`} x={0} y={318} w={300} h={70} c="lst-band">
        <span className="lst-band-name">Dana Lee, Realtor</span>
        <span className="lst-band-org">Alder &amp; Co. Realty · DRE 02145578</span>
        <QR k={`${k}.qr`} />
      </A>
    </>
  );
}

/** The flyer's back: the facts, the open house, two more pictures (laid over it: they become posts), the agent. */
function Back({ k }: { k: string }) {
  return (
    <>
      <T k={`${k}.kick`} x={18} y={20} c="lst-kicker">
        The details
      </T>
      <T k={`${k}.kick2`} x={18} y={20} c="lst-kicker" style={{ left: 'auto', right: 18 }}>
        1428 Alder Street
      </T>
      <A k={`${k}.facts`} x={18} y={44} w={264} c="lst-facts3">
        <span className="lst-fact">
          <b>3</b>
          <span>Bedrooms</span>
        </span>
        <span className="lst-fact">
          <b>2</b>
          <span>Baths</span>
        </span>
        <span className="lst-fact">
          <b>1,850</b>
          <span>Sq ft</span>
        </span>
      </A>
      <A k={`${k}.rule`} x={18} y={104} w={264} h={1} c="lst-rule" />
      <A k={`${k}.oh`} x={18} y={118} c="lst-back-oh">
        <span className="lst-kicker">Open house</span>
        <b className="f-head">Sat, 1 to 4</b>
      </A>
      <T k={`${k}.c1`} x={BACK_PIC[0].x} y={295} c="lst-pcap">
        The kitchen
      </T>
      <T k={`${k}.c2`} x={BACK_PIC[1].x} y={295} c="lst-pcap">
        The neighborhood
      </T>
      <A k={`${k}.band`} x={0} y={318} w={300} h={70} c="lst-band">
        <span className="lst-band-name">Dana Lee, Realtor</span>
        <span className="lst-band-org">Alder &amp; Co. Realty · DRE 02145578</span>
      </A>
    </>
  );
}

/** The crop drawn on the photo: a hairline and its four corners (w x h). */
function Crop({ k, x = 0, y = 0, w, h }: { k: string; x?: number; y?: number; w: number; h: number }) {
  const t = 12;
  return (
    <A k={k} x={x} y={y} w={w} h={h} c="lst-crop">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
        <rect data-k={`${k}.r`} x="0.5" y="0.5" width={w - 1} height={h - 1} pathLength={1} />
        <path d={`M1.25 ${t}V1.25H${t}M${w - t} 1.25H${w - 1.25}V${t}M${w - 1.25} ${h - t}V${h - 1.25}H${w - t}M${t} ${h - 1.25}H1.25V${h - t}`} />
      </svg>
    </A>
  );
}

/** Just Listed: the house, its tag, the address and the price. (221 square) */
function LeadPost({ k }: { k: string }) {
  return (
    <>
      <House vb={vb(LEAD_VB)} w={LEAD_PIC.w} h={LEAD_PIC.h} />
      <A k={`${k}.tag`} x={12} y={12} c="lst-tag" style={{ left: 'auto', right: 12 }}>
        Just listed
      </A>
      <A k={`${k}.band`} x={0} y={LEAD_PIC.h} w={LEAD} h={LEAD - LEAD_PIC.h} c="lst-pband">
        <span className="f-head lst-pband-addr">1428 Alder Street</span>
        <span className="lst-pband-sub">$849,000 · 3 bd · 2 ba</span>
      </A>
      <Crop k={`${k}.crop`} w={LEAD_PIC.w} h={LEAD_PIC.h} />
    </>
  );
}

/** Open House Sat, sized for Stories: an ink block over a crop of the house. (124 x 221) */
function StoryPost({ k }: { k: string }) {
  return (
    <>
      <A x={0} y={0} w={STORY.w} h={STORY.top} c="lst-story-top">
        <span className="lst-sbars">
          <i className="is-on" />
          <i />
          <i />
        </span>
        <span className="f-head lst-story-h">Open house</span>
        <span className="lst-story-d">Sat, 1 to 4</span>
        <span className="lst-story-a">1428 Alder Street</span>
      </A>
      <A x={0} y={STORY.top} w={STORY.w} h={STORY.w}>
        <House vb={vb(STORY_VB)} w={STORY.w} h={STORY.w} />
      </A>
      <Crop k={`${k}.crop`} y={STORY.top} w={STORY.w} h={STORY.w} />
    </>
  );
}

/** A square post: its picture and a small label along its foot. (111 square) */
function SquarePost({ k, art, label }: { k: string; art: ReactNode; label: string }) {
  return (
    <>
      {art}
      <A k={`${k}.lab`} x={0} y={SQ - 24} w={SQ} h={24} c="lst-label">
        {label}
      </A>
    </>
  );
}

/** The 30-second video on a phone: three pictures, story bars, a running time, captions. */
function Reel({ k, x, y, tc = '0:00', lime = false }: { k: string; x: number; y: number; tc?: string; lime?: boolean }) {
  const W = PHONE.w - 14, H = PHONE.h - 14;
  return (
    <A k={k} x={x} y={y} w={PHONE.w} h={PHONE.h} r={32} c="phone">
      <div className="phone-screen lst-reel" style={{ ['--r' as string]: '25px' }}>
        <A k={`${k}.f1`} x={0} y={0} w={W} h={H} c="lst-frame">
          <House k={`${k}.a1`} vb="106 -80 200 425" w={W} h={H} />
        </A>
        <A k={`${k}.f2`} x={0} y={0} w={W} h={H} c="lst-frame">
          <Kitchen k={`${k}.a2`} vb="43 -86 154 327" w={W} h={H} />
        </A>
        <A k={`${k}.f3`} x={0} y={0} w={W} h={H} c="lst-frame">
          <Door k={`${k}.a3`} w={W} h={H} />
        </A>
        <div className="phone-status lst-reel-status">
          <span>9:41</span>
          <i className="phone-island" />
          <span className="phone-bars" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        </div>
        <span className="lst-bars">
          {[1, 2, 3].map((i) => (
            <i key={i}>
              <b data-k={`${k}.b${i}`} />
            </i>
          ))}
        </span>
        <span className="a lst-reel-who">Dana Lee</span>
        <span data-k={`${k}.tc`} className={`a lst-tc${lime ? ' lst-tc--lime' : ''}`}>
          {tc}
        </span>
        <T k={`${k}.c1`} x={12} y={366} c="lst-cap">
          1428 Alder Street
        </T>
        <T k={`${k}.c2`} x={12} y={366} c="lst-cap">
          3 bd · 2 ba
        </T>
        <T k={`${k}.c3a`} x={12} y={334} c="lst-cap">
          Open house
        </T>
        <T k={`${k}.c3b`} x={12} y={366} c="lst-cap">
          Sat, 1 to 4
        </T>
      </div>
    </A>
  );
}

/* =============================================================================
   The kit on a stage 720 wide (the homepage's chapter: three states; the
   kit's page: five)
   ============================================================================= */

function kitLayout(H: number) {
  const sy = Math.round((H - SHEET.h) / 2);
  const py = Math.round((H - BLOCK_H) / 2);
  const bx = 344;
  return {
    sy,
    py,
    // the front, from state 2 on (in state 1 it stands `shift` further right, beside its back)
    front: { x: 20, y: sy },
    shift: 30,
    back: { x: 370, y: sy },
    lead: { x: bx, y: py },
    story: { x: bx + LEAD + GAP, y: py },
    row: [0, 1, 2].map((i) => ({ x: bx + i * (SQ + GAP), y: py + LEAD + GAP })),
    phone: { x: 402, y: Math.round((H - PHONE.h) / 2) },
    ed: { x: 362, y: Math.round((H - 290) / 2), w: 320, h: 290 },
    chat: { x: 360, y: sy + 194 - 112 },
  };
}

function Kit({ H, tour }: { H: number; tour: boolean }) {
  const L = kitLayout(H);
  const capY = L.sy + SHEET.h + 14;
  return (
    <>
      <A k="f.cap" x={L.front.x + L.shift} y={capY} c="lst-cap-row">
        <b>Front</b>
        <span>8.5 x 11 in</span>
      </A>
      <A k="b.cap" x={L.back.x} y={capY} c="lst-cap-row">
        <b>Back</b>
        <span>PDF, ready to print</span>
      </A>
      <A k="b" x={L.back.x} y={L.back.y} w={SHEET.w} h={SHEET.h} r={2} c="lst-sheet">
        <Back k="b" />
      </A>
      <A k="f" x={L.front.x} y={L.front.y} w={SHEET.w} h={SHEET.h} r={2} c="lst-sheet">
        <Front k="f" />
      </A>

      {/* the five posts, where they end up in the feed (until they're dealt, they stand where they come from) */}
      <A k="p.esc" x={L.row[2].x} y={L.row[2].y} w={SQ} h={SQ} c="lst-post lst-post--ink">
        <SquarePost k="p.esc" art={<House line vb={vb(ESC_VB)} w={SQ} h={SQ} />} label="In Escrow" />
      </A>
      <A k="p.kit" x={L.row[0].x} y={L.row[0].y} w={SQ} h={SQ} c="lst-post">
        <SquarePost k="p.kit" art={<Kitchen w={SQ} h={SQ} />} label="The kitchen" />
      </A>
      <A k="p.map" x={L.row[1].x} y={L.row[1].y} w={SQ} h={SQ} c="lst-post">
        <SquarePost k="p.map" art={<Hood w={SQ} h={SQ} />} label="The neighborhood" />
      </A>
      <A k="p.oh" x={L.story.x} y={L.story.y} w={STORY.w} h={STORY.h} c="lst-post">
        <StoryPost k="p.oh" />
      </A>
      <A k="p.lead" x={L.lead.x} y={L.lead.y} w={LEAD} h={LEAD} c="lst-post">
        <LeadPost k="p.lead" />
      </A>

      <Reel k="ph" x={L.phone.x} y={L.phone.y} lime />

      {tour && (
        <>
          {/* the editable copy */}
          <A k="ed" x={L.ed.x} y={L.ed.y} w={L.ed.w} h={L.ed.h} r={12} c="lst-ed">
            <div className="lst-ed-head">
              <span className="lst-ed-title">Flyer, front</span>
              <span className="lst-ed-link">
                <LinkIco /> Editable copy
              </span>
            </div>
            <span className="a lst-ed-label" style={{ left: 20, top: 66 }}>
              Price
            </span>
            <A x={20} y={86} w={280} h={48} r={8} c="lst-field">
              <span>$</span>
              <span className="lst-dig">
                <i data-k="ed.sel" className="lst-sel" />
                <span data-k="ed.old">849</span>
                <span data-k="ed.new" className="lst-dig-new">
                  829
                </span>
                <Caret k="ed.caret" x={0} y={1} h={22} />
              </span>
              <span>,000</span>
            </A>
            <A k="ed.ring" x={20} y={86} w={280} h={48} r={8} c="lst-ring" />
            <span className="a lst-ed-label" style={{ left: 20, top: 152 }}>
              Open house
            </span>
            <A x={20} y={172} w={280} h={48} r={8} c="lst-field">
              Sat, 1 to 4
            </A>
            <div className="lst-ed-foot">
              <Check size={12} /> Saved
              <span className="pill pill--ink">Download PDF</span>
            </div>
          </A>

          {/* the round of changes */}
          <A k="ch.a" x={L.chat.x} y={L.chat.y} w={340} c="lst-msg">
            <span className="lst-who">Dana Lee</span>
            <span className="lst-bub lst-bub--them">Can the open house say Sunday instead?</span>
          </A>
          <A k="ch.b" x={L.chat.x} y={L.chat.y + 128} w={340} c="lst-msg lst-msg--us">
            <span className="lst-who">Qbix</span>
            <span className="lst-bub lst-bub--us">Done. New files are in your inbox.</span>
          </A>
          <A k="ch.files" x={L.chat.x} y={L.chat.y + 206} w={340} c="lst-files">
            {['Flyer.pdf', 'Posts.zip', 'Reel.mp4'].map((n, i) => (
              <span key={n} data-k={`ch.file${i}`} className="lst-file">
                <FileIco />
                {n}
              </span>
            ))}
          </A>

          <Cursor />
        </>
      )}
    </>
  );
}

/* --- the dope sheet's little phrases ---------------------------------------- */

type El = HTMLElement | SVGElement | null | undefined;
const CLIPS = {
  down: [[0, 0, 100, 0], [0, 0, 0, 0]],
  up: [[100, 0, 0, 0], [0, 0, 0, 0]],
  right: [[0, 100, 0, 0], [0, 0, 0, 0]],
  left: [[0, 0, 0, 100], [0, 0, 0, 0]],
} as const;

/** An entrance by a clip wipe (down: from the top edge; right: from the left edge; …). */
function wipe(tl: Timeline, el: El, dir: keyof typeof CLIPS, at: number, dur: number, ease: string = E.out) {
  const [a, b] = CLIPS[dir];
  tl.from(el as Element, { clip: [...a] as [number, number, number, number] }).to(el as Element, { clip: [...b] as [number, number, number, number] }, at, dur, ease);
}

/** A sheet coming out of the printer: wiped in from its top edge as it slides down the last bit. */
function print(tl: Timeline, el: El, at: number, from: Props = {}, dur = 0.26) {
  tl.from(el as Element, { y: -14, clip: 'inset(0% 0% 100% 0% round 2px)', ...from }).to(
    el as Element,
    { y: 0, clip: 'inset(0% 0% 0% 0% round 2px)' },
    at,
    dur,
    E.out,
  );
}

/** A window's or a phone's clip once it's in: past its edges, so its shadow shows. */
const OPEN = (r: number) => `inset(-64px -64px -64px -64px round ${r}px)`;

/** Folded away: up into its top edge. */
function fold(tl: Timeline, el: El, at: number, dur = 0.1, r = 3) {
  tl.to(el as Element, { y: -6, clip: `inset(0% 0% 100% 0% round ${r}px)` }, at, dur, E.in);
}

/** The flyer's front, its parts setting in from `at`. */
function frontIn(tl: Timeline, q: Pick, k: string, at: number, sp = 1) {
  wipe(tl, q(`${k}.photo`), 'down', at, 0.22 * sp);
  wipe(tl, q(`${k}.tag`), 'right', at + 0.16 * sp, 0.08 * sp);
  tl.type(q(`${k}.addr`), at + 0.17 * sp, 0.13 * sp);
  wipe(tl, q(`${k}.price`), 'right', at + 0.27 * sp, 0.1 * sp);
  wipe(tl, q(`${k}.facts`), 'right', at + 0.31 * sp, 0.1 * sp);
  wipe(tl, q(`${k}.oh`), 'right', at + 0.35 * sp, 0.1 * sp);
  wipe(tl, q(`${k}.band`), 'right', at + 0.26 * sp, 0.16 * sp);
  wipe(tl, q(`${k}.qr`), 'down', at + 0.38 * sp, 0.1 * sp);
  tl.from(q(`${k}.tag2`), { clip: [0, 100, 0, 0] });
  tl.from(q(`${k}.mark`), { clip: [0, 100, 0, 0] });
  tl.from(q(`${k}.mark2`), { clip: [0, 100, 0, 0] });
}

/** An ink underline laid under a phrase on the flyer (what changed), measured: just under its baseline. */
function markUnder(mark: HTMLElement | null, phrase: Element | null, sheet: HTMLElement, root: HTMLElement, w?: number) {
  if (!mark || !phrase) return;
  const p = where(phrase, root), s = where(sheet, root);
  const t = p.h > 24 ? 2 : 1.5;
  Object.assign(mark.style, {
    left: `${p.x - s.x}px`,
    top: `${Math.round(p.y - s.y + p.h * 0.86)}px`,
    width: `${w ?? p.w}px`,
    height: `${t}px`,
  });
}

/** The reel plays from `at` to `at + 0.66`: three pictures wipe through, the bars fill, the captions type, the time runs to 0:30. */
function playReel(tl: Timeline, q: Pick, k: string, at: number) {
  const seg = 0.22;
  for (let i = 0; i < 3; i++) {
    const t0 = at + i * seg;
    // each shot pushes in slowly while it's on
    if (i > 0) wipe(tl, q(`${k}.f${i + 1}`), 'left', t0 - 0.02, 0.07, E.move);
    tl.from(q(`${k}.a${i + 1}`), { s: 1 }).to(q(`${k}.a${i + 1}`), { s: 1.08 }, t0 - (i ? 0.02 : 0.2), seg + (i ? 0.02 : 0.2), E.lin);
    tl.from(q(`${k}.b${i + 1}`), { sx: 0 }).to(q(`${k}.b${i + 1}`), { sx: 1 }, t0, seg, E.lin);
  }
  tl.type(q(`${k}.c1`), at + 0.03, 0.1);
  tl.to(q(`${k}.c1`), { clip: [0, 100, 0, 0] }, at + seg - 0.05, 0.03, E.in);
  tl.type(q(`${k}.c2`), at + seg + 0.04, 0.07);
  tl.to(q(`${k}.c2`), { clip: [0, 100, 0, 0] }, at + 2 * seg - 0.05, 0.03, E.in);
  tl.type(q(`${k}.c3a`), at + 2 * seg + 0.04, 0.06);
  tl.type(q(`${k}.c3b`), at + 2 * seg + 0.1, 0.07);
  const tc = q(`${k}.tc`);
  tl.on((t) => {
    const p = Math.min(1, Math.max(0, (t - at) / (3 * seg)));
    const s = `0:${String(Math.round(p * 30)).padStart(2, '0')}`;
    if (tc && tc.textContent !== s) tc.textContent = s;
  });
}

/** Where an element is in the scene, in the scene's own px. */
function where(el: Element | null | undefined, root: HTMLElement) {
  if (!el) return { x: 0, y: 0, w: 0, h: 0 };
  const r = el.getBoundingClientRect(), R = root.getBoundingClientRect();
  const z = R.width / root.offsetWidth || 1;
  return { x: (r.left - R.left) / z, y: (r.top - R.top) / z, w: r.width / z, h: r.height / z };
}

function buildKit(q: Pick, tl: Timeline, H: number, tour: boolean) {
  const L = kitLayout(H);
  const f = q('f'), b = q('b');
  const root = f?.closest<HTMLElement>('.scn');
  if (!f || !b || !root) return;
  const lead = q('p.lead'), story = q('p.oh'), kit = q('p.kit'), map = q('p.map'), esc = q('p.esc');

  /* 0 → 1 · the flyer prints, front then back, and their parts set in */
  print(tl, f, 0, { x: L.shift });
  print(tl, b, 0.1);
  frontIn(tl, q, 'f', 0.16);
  wipe(tl, q('b.kick'), 'right', 0.3, 0.08);
  wipe(tl, q('b.kick2'), 'left', 0.32, 0.08);
  wipe(tl, q('b.facts'), 'right', 0.34, 0.14);
  tl.from(q('b.rule'), { sx: 0 }).to(q('b.rule'), { sx: 1 }, 0.4, 0.14, E.soft);
  wipe(tl, q('b.oh'), 'right', 0.44, 0.1);
  wipe(tl, q('b.band'), 'right', 0.48, 0.16);
  wipe(tl, q('b.c1'), 'right', 0.6, 0.08);
  wipe(tl, q('b.c2'), 'right', 0.63, 0.08);
  // the back's two pictures (they are the kitchen's and the neighborhood's posts, set on the back)
  const k0 = BACK_S / SQ;
  [kit, map].forEach((p, i) => {
    tl.from(p, {
      x: L.back.x + BACK_PIC[i].x - L.row[i].x,
      y: L.back.y + BACK_PIC[i].y - L.row[i].y,
      s: k0,
      clip: 'inset(0% 0% 100% 0% round 3px)',
    }).to(p, { clip: 'inset(0% 0% 0% 0% round 3px)' }, 0.46 + i * 0.05, 0.2, E.out);
  });
  ['p.kit.lab', 'p.map.lab', 'p.esc.lab'].forEach((l) => tl.from(q(l), { clip: [0, 100, 0, 0] }));
  wipe(tl, q('f.cap'), 'right', 0.62, 0.1);
  wipe(tl, q('b.cap'), 'right', 0.66, 0.1);

  /* 1 → 2 · five posts: the back folds away around its two pictures, which go down into the feed;
     two crops lift out of the front's photo; the last post comes in beside them */
  fold(tl, b, 1.0, 0.1, 2);
  tl.to(q('f.cap'), { clip: [0, 100, 0, 0] }, 1.0, 0.05, E.in);
  tl.to(q('b.cap'), { clip: [0, 100, 0, 0] }, 1.0, 0.05, E.in);
  tl.to(f, { x: 0 }, 1.04, 0.16, E.move);
  tl.to(kit, { x: 0, y: 0, s: 1 }, 1.08, 0.2, E.move);
  tl.to(map, { x: 0, y: 0, s: 1 }, 1.11, 0.2, E.move);
  wipe(tl, q('p.kit.lab'), 'right', 1.27, 0.09);
  wipe(tl, q('p.map.lab'), 'right', 1.3, 0.09);
  // a crop drawn on the photo, lifted out to its place in the feed (the post's picture is the crop: `pic` is where it is in the post)
  const lift = (post: HTMLElement | null, k: string, c: Rect, pic: Rect, postH: number, at: number) => {
    const ph = onPhoto(c);
    const s = ph.w / pic.w;
    const to = k === 'p.oh' ? L.story : L.lead;
    tl.from(post, {
      x: L.front.x + ph.x - pic.x * s - to.x,
      y: L.front.y + ph.y - pic.y * s - to.y,
      s,
      clip: 'inset(0px 0px 100% 0px round 3px)',
    });
    tl.set(post, { clip: `inset(${pic.y}px 0px ${postH - pic.y - pic.h}px 0px round 3px)` }, at);
    tl.from(q(`${k}.crop`), { o: 0 }).set(q(`${k}.crop`), { o: 1 }, at).set(q(`${k}.crop`), { o: 0 }, at + 0.3);
    tl.from(q(`${k}.crop.r`), { dash: 1 }).to(q(`${k}.crop.r`), { dash: 0 }, at, 0.08, E.soft);
    tl.to(post, { x: 0, y: 0, s: 1 }, at + 0.1, 0.2, E.move);
  };
  lift(story, 'p.oh', STORY_VB, { x: 0, y: STORY.top, w: STORY.w, h: STORY.w }, STORY.h, 1.3);
  lift(lead, 'p.lead', LEAD_VB, { x: 0, y: 0, ...LEAD_PIC }, LEAD, 1.45);
  // the story's ink block opens over its picture; the lead post's band and tag
  tl.to(story, { clip: 'inset(0px 0px 0px 0px round 3px)' }, 1.6, 0.12, E.out);
  tl.set(lead, { clip: 'inset(0px 0px 0px 0px round 3px)' }, 1.75);
  wipe(tl, q('f.tag2'), 'right', 1.7, 0.06);
  wipe(tl, q('p.lead.band'), 'up', 1.75, 0.12);
  wipe(tl, q('p.lead.tag'), 'right', 1.79, 0.07);
  // In Escrow, last
  tl.from(esc, { clip: 'inset(0% 0% 100% 0% round 3px)' }).to(esc, { clip: 'inset(0% 0% 0% 0% round 3px)' }, 1.8, 0.13, E.out);
  wipe(tl, q('p.esc.lab'), 'right', 1.88, 0.08);

  /* 2 → 3 · the posts fold away, the phone rises, the video plays */
  [lead, story, map, kit, esc].forEach((p, i) => fold(tl, p, 2.0 + i * 0.018, 0.09));
  const ph = q('ph');
  tl.from(ph, { y: 90, clip: 'inset(0% 0% 100% 0% round 32px)' }).to(ph, { y: 0, clip: OPEN(32) }, 2.16, 0.26, E.out);
  playReel(tl, q, 'ph', 2.32);

  if (!tour) return;

  /* 3 → 4 · the editable copy: the price typed into it rolls over on the flyer */
  const ed = q('ed'), cur = q('cursor');
  fold(tl, ph, 3.0, 0.1, 32);
  tl.from(ed, { y: 14, clip: 'inset(0% 0% 100% 0% round 12px)' }).to(ed, { y: 0, clip: OPEN(12) }, 3.1, 0.16, E.out);
  const dig = where(q('ed.old'), root);
  const aim = { x: dig.x + dig.w * 0.55, y: dig.y + dig.h * 0.55 };
  tl.from(cur, { x: 760, y: H + 40, o: 0 });
  tl.to(cur, { o: 1 }, 3.2, 0.02, E.lin)
    .to(cur, { x: aim.x, y: aim.y }, 3.2, 0.16, E.move)
    .to(cur, { s: 0.86 }, 3.36, 0.03, E.lin)
    .to(cur, { s: 1 }, 3.39, 0.03, E.lin);
  tl.from(q('ed.ring'), { o: 0 }).set(q('ed.ring'), { o: 1 }, 3.37);
  tl.from(q('ed.sel'), { sx: 0 }).to(q('ed.sel'), { sx: 1 }, 3.4, 0.04, E.out).set(q('ed.sel'), { o: 0 }, 3.48);
  tl.set(q('ed.old'), { o: 0 }, 3.48);
  tl.from(q('ed.caret'), { o: 0 }).set(q('ed.caret'), { o: 1 }, 3.48);
  tl.type(q('ed.new'), 3.48, 0.1, q('ed.caret'));
  tl.set(q('ed.caret'), { o: 0 }, 3.62);
  // on the flyer, the 4 rolls over to a 2, and is underlined
  markUnder(q('f.mark'), q('f.price'), f, root);
  markUnder(q('f.mark2'), q('f.sat'), f, root, q('f.sun')?.offsetWidth);
  tl.to(q('f.p4'), { y: -30 }, 3.6, 0.1, E.in);
  tl.from(q('f.p2'), { y: 30 }).to(q('f.p2'), { y: 0 }, 3.63, 0.12, E.out);
  tl.to(q('f.mark'), { clip: [0, 0, 0, 0] }, 3.72, 0.12, E.out);
  tl.to(cur, { x: aim.x + 120, y: aim.y + 16 }, 3.76, 0.18, E.soft);

  /* 4 → 5 · one round of changes: asked for, made on the flyer, done */
  tl.to(cur, { x: 760, y: H + 40 }, 4.0, 0.12, E.in).to(cur, { o: 0 }, 4.1, 0.02, E.lin);
  fold(tl, ed, 4.02, 0.1, 12);
  const ask = q('ch.a'), done = q('ch.b');
  const arrive = (el: HTMLElement | null, at: number) =>
    tl.from(el, { y: 14, clip: [0, 0, 100, 0] }).to(el, { y: 0, clip: [0, 0, 0, 0] }, at, 0.14, E.out);
  arrive(ask, 4.16);
  // the price is done changing; the open house line rolls over to Sunday, and is underlined
  tl.to(q('f.mark'), { clip: [0, 0, 0, 100] }, 4.3, 0.06, E.in);
  tl.to(q('f.sat'), { y: -22 }, 4.36, 0.1, E.in);
  tl.from(q('f.sun'), { y: 22 }).to(q('f.sun'), { y: 0 }, 4.39, 0.12, E.out);
  tl.to(q('f.mark2'), { clip: [0, 0, 0, 0] }, 4.48, 0.12, E.out);
  arrive(done, 4.58);
  [0, 1, 2].forEach((i) => wipe(tl, q(`ch.file${i}`), 'right', 4.7 + i * 0.04, 0.1));
}

/* =============================================================================
   The scenes
   ============================================================================= */

/** The homepage (for business): the flyer, its five posts, its video. */
export function ListingStory() {
  return (
    <Scene
      n={3}
      w={720}
      h={560}
      label="A flyer for 1428 Alder Street prints, front and back; its pictures are cropped into five social posts; then its 30-second video plays on a phone"
      build={(q, tl) => buildKit(q, tl, 560, false)}
    >
      <Kit H={560} tour={false} />
    </Scene>
  );
}

/** The kit's page, What you get: the flyer, the posts, the video, the editable copy, a round of changes. */
export function ListingTour() {
  return (
    <Scene
      n={5}
      w={720}
      h={640}
      label="The listing kit for 1428 Alder Street: the flyer front and back, five posts made from its pictures, a 30-second video, an editable copy where the price is changed, and a change asked for and made on the flyer"
      build={(q, tl) => buildKit(q, tl, 640, true)}
    >
      <Kit H={640} tour />
    </Scene>
  );
}

/* --- the kit at a glance (the kit's page, top): no lime here, the page's button beside it is the one --- */

// the kit at a glance: the flyer over two posts, the phone beside them, 14 apart
const HG = 14;
const HZ = 0.96;
const HF0 = { w: Math.round(SHEET.w * HZ), h: Math.round(SHEET.h * HZ) };
const HPS = (HF0.w - HG) / 2;
const HPZ = (HF0.h + HG + HPS) / PHONE.h;
const HW = HF0.w + HG + Math.round(PHONE.w * HPZ);
const HH = HF0.h + HG + HPS;
const HF = { x: Math.round((600 - HW) / 2), y: Math.round((600 - HH) / 2), z: HZ, ...HF0 };
const HP = { y: HF.y + HF.h + HG, s: HPS };
const HPH = { x: HF.x + HF.w + HG, y: HF.y, z: HPZ };

export function ListingHero() {
  return (
    <Scene
      n={1}
      w={600}
      h={600}
      intro="load"
      label="The listing kit for 1428 Alder Street: the printed flyer, its posts, and its video on a phone"
      build={(q, tl) => {
        const sp = 0.55;
        print(tl, q('f'), 0, {}, 0.24);
        frontIn(tl, q, 'f', 0.1, sp);
        tl.from(q('kit'), { y: 18, clip: 'inset(0% 0% 100% 0% round 3px)' }).to(q('kit'), { y: 0, clip: 'inset(0% 0% 0% 0% round 3px)' }, 0.34, 0.22, E.out);
        tl.from(q('esc'), { y: 18, clip: 'inset(0% 0% 100% 0% round 3px)' }).to(q('esc'), { y: 0, clip: 'inset(0% 0% 0% 0% round 3px)' }, 0.4, 0.22, E.out);
        tl.from(q('ph'), { y: 70, clip: 'inset(0% 0% 100% 0% round 32px)' }).to(q('ph'), { y: 0, clip: OPEN(32) }, 0.42, 0.3, E.out);
        tl.type(q('ph.c1'), 0.66, 0.14);
        tl.from(q('ph.b1'), { sx: 0 }).to(q('ph.b1'), { sx: 0.4 }, 0.5, 0.5, E.out);
        tl.from(q('ph.a1'), { s: 1 }).to(q('ph.a1'), { s: 1.05 }, 0.42, 0.58, E.out);
        ['ph.f2', 'ph.f3', 'ph.c2', 'ph.c3a', 'ph.c3b'].forEach((k) => tl.from(q(k), { clip: [0, 100, 0, 0] }));
        ['ph.b2', 'ph.b3'].forEach((k) => tl.from(q(k), { sx: 0 }));
      }}
    >
      <A k="f" x={HF.x} y={HF.y} w={HF.w} h={HF.h} r={2} c="lst-sheet">
        <div style={{ zoom: HF.z, position: 'relative', width: SHEET.w, height: SHEET.h }}>
          <Front k="f" ink />
        </div>
      </A>
      <A k="kit" x={HF.x} y={HP.y} w={HP.s} h={HP.s} c="lst-post">
        <div style={{ zoom: HP.s / SQ, position: 'relative', width: SQ, height: SQ }}>
          <SquarePost k="kit" art={<Kitchen w={SQ} h={SQ} />} label="The kitchen" />
        </div>
      </A>
      <A k="esc" x={HF.x + HP.s + HG} y={HP.y} w={HP.s} h={HP.s} c="lst-post lst-post--ink">
        <div style={{ zoom: HP.s / SQ, position: 'relative', width: SQ, height: SQ }}>
          <SquarePost k="esc" art={<House line vb={vb(ESC_VB)} w={SQ} h={SQ} />} label="In Escrow" />
        </div>
      </A>
      <A k="phwrap" x={HPH.x} y={HPH.y} w={Math.round(PHONE.w * HPH.z)} h={Math.round(PHONE.h * HPH.z)}>
        <div style={{ zoom: HPH.z, position: 'relative', width: PHONE.w, height: PHONE.h }}>
          <Reel k="ph" x={0} y={0} tc="0:30" />
        </div>
      </A>
    </Scene>
  );
}
