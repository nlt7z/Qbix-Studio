import type { Metadata } from 'next';
import Link from 'next/link';
import Colophon from '@/components/Colophon';
import SplitText from '@/components/SplitText';
import { CONTACT_EMAIL, brandLookbook } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Press kit',
  description:
    'Press kit for Qbix Studio — an AI-native product design and software studio in Seattle, WA. Studio boilerplate, wordmark, brand objects, palette, and press contact for editors, writers, and partners.',
};

const boilerplate =
  'Qbix Studio LLC is a small AI-native product design and software studio based in Seattle. We design and build AI products from strategy to interface to launch — across UX/UI systems, web and mobile experiences, strategic prototypes, and proprietary AI tools.';

const facts = [
  { k: 'Founded',  v: '2026' },
  { k: 'Location', v: 'Seattle' },
  { k: 'Focus',    v: 'AI-native product design & software' },
  { k: 'Team',     v: 'Designers · engineers · strategists' },
  { k: 'Status',   v: 'Booking Q3 — limited slots' },
];

const palette = [
  { name: 'Signal',    hex: '#B7FF3C', cssVar: '--signal'     },
  { name: 'Ink',       hex: '#F7F8F8', cssVar: '--ink'        },
  { name: 'Canvas',    hex: '#08090A', cssVar: '--bg'         },
  { name: 'Surface',   hex: '#161718', cssVar: '--bg-card'    },
  { name: 'Charcoal',  hex: '#1F2023', cssVar: '--bg-charcoal'},
  { name: 'Metal',     hex: '#62666D', cssVar: '--metal'      },
];

const downloads = [
  { k: 'Wordmark · SVG',       v: 'Qbix / Studio — vector' },
  { k: 'Wordmark · PNG',       v: '2x · transparent · dark' },
  { k: 'Brand objects · ZIP',  v: 'Keycaps · vinyl · cassette · chrome' },
  { k: 'Boilerplate · TXT',    v: 'Studio one-liner + long form' },
];

const principles = [
  'Use the lowercase wordmark "Qbix / Studio" — capital Q, lime signal accent permitted only on the Q glyph.',
  'Pair the wordmark with at least 16px of clear space on every side. Never recolor or stretch.',
  'On lime backgrounds, switch to the ink (off-white) wordmark. Never place signal-on-signal.',
  'When quoting the studio, prefer the boilerplate verbatim — split paragraphs are fine, edits are not.',
];

export default function PressKitPage() {
  return (
    <>
      <main className="detail">
        <div className="container">
          <Link href="/" className="detail-crumb">
            <span className="arrow">←</span> Qbix Studio
          </Link>

          <header className="detail-head">
            <span className="eyebrow">
              <span className="num">PRESS</span>
              Studio kit
            </span>
            <h1 className="detail-title">Press kit.</h1>
            <p className="detail-lede">
              Boilerplate, marks, brand objects, and palette for editors, writers, and
              partners covering <span className="brand-q">Q</span>bix Studio. Everything
              here is yours to use — credit appreciated, not required.
            </p>
            <div className="detail-tags">
              <span className="tag">Press</span>
              <span className="tag">Brand</span>
              <span className="tag">Downloads</span>
              <span className="tag">Boilerplate</span>
            </div>
          </header>

          <div className="detail-grid">
            <div className="detail-section">
              <span className="detail-section-label">FIG P.1 — Boilerplate</span>
              <h3>Studio, in one paragraph</h3>
              <p
                style={{
                  color: 'var(--text)',
                  fontSize: 'clamp(14px, 1.5vw, 15px)',
                  lineHeight: 1.65,
                  letterSpacing: '-0.011em',
                  maxWidth: 620,
                  margin: 0,
                }}
              >
                {boilerplate}
              </p>
            </div>

            <div className="detail-section">
              <span className="detail-section-label">FIG P.2 — Studio facts</span>
              <h3>Quick reference</h3>
              <div className="detail-specs">
                {facts.map((f) => (
                  <div key={f.k} className="detail-spec">
                    <span className="detail-spec-k">{f.k}</span>
                    <span className="detail-spec-v">{f.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-section" style={{ marginBottom: 'clamp(40px, 5vw, 56px)' }}>
            <span className="detail-section-label">FIG P.3 — Brand objects</span>
            <h3 style={{ marginBottom: 20 }}>Identity stills</h3>
            <div className="brand-grid">
              {brandLookbook.map((item) => (
                <figure key={item.src} className="brand-card">
                  <div className="brand-card-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="brand-card-img"
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="brand-card-caption">
                    <span className="brand-card-num">{item.num}</span>
                    <span className="brand-card-label">{item.label}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <span className="detail-section-label">FIG P.4 — Palette</span>
              <h3>Studio colors</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 'clamp(8px, 1.2vw, 12px)',
                }}
              >
                {palette.map((c) => (
                  <div
                    key={c.hex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-card-sm)',
                      boxShadow: 'var(--highlight)',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--r-card-sm)',
                        background: c.hex,
                        border: '1px solid var(--line-2)',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 13,
                          fontWeight: 500,
                          letterSpacing: '-0.011em',
                          color: 'var(--ink)',
                        }}
                      >
                        {c.name}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          letterSpacing: 0,
                          color: 'var(--text-2)',
                        }}
                      >
                        {c.hex} · {c.cssVar}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <span className="detail-section-label">FIG P.5 — Downloads</span>
              <h3>Marks &amp; assets</h3>
              <div className="detail-specs">
                {downloads.map((d) => (
                  <div key={d.k} className="detail-spec">
                    <span className="detail-spec-k">{d.k}</span>
                    <span className="detail-spec-v">{d.v}</span>
                  </div>
                ))}
              </div>
              <p
                style={{
                  marginTop: 12,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-3)',
                  letterSpacing: 0,
                }}
              >
                Email{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Press%20kit%20assets`}
                  style={{ color: 'var(--signal-hover)' }}
                >
                  {CONTACT_EMAIL}
                </a>{' '}
                to request the asset bundle.
              </p>
            </div>
          </div>

          <div className="detail-section" style={{ maxWidth: 820, marginBottom: 'clamp(40px, 5vw, 56px)' }}>
            <span className="detail-section-label">FIG P.6 — Usage</span>
            <h3>Mark &amp; quoting guidelines</h3>
            <ul className="detail-list">
              {principles.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="detail-cta">
            <p className="detail-cta-text">
              Writing about the studio? <span className="accent">Get in touch — fast.</span>
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Press%20inquiry`}
              className="btn btn-primary btn-lg split-cta"
            >
              <SplitText text="Email press" arrow />
            </a>
            <Link href="/#about" className="btn btn-secondary btn-lg split-cta">
              <SplitText text="About the studio" />
            </Link>
          </div>
        </div>
      </main>
      <Colophon />
    </>
  );
}
