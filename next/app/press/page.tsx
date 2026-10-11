import type { Metadata } from 'next';
import Colophon from '@/components/Colophon';
import SplitText from '@/components/SplitText';
import { CONTACT_EMAIL, brandLookbook } from '@/lib/data';
import SubHero from '@/components/sub/SubHero';
import SubSection from '@/components/sub/SubSection';

export const metadata: Metadata = {
  title: 'Press kit',
  description:
    'Press kit for Qbix — an independent AI product team in Seattle, WA. Boilerplate, wordmark, brand objects, palette, and press contact for editors, writers, and partners.',
};

const boilerplate =
  'Qbix is a small, independent AI product team based in Seattle. We design and build AI products from strategy to interface to launch — across UX/UI systems, web and mobile experiences, strategic prototypes, and proprietary AI tools.';

const facts = [
  { k: 'Founded',  v: '2026' },
  { k: 'Location', v: 'Seattle' },
  { k: 'Focus',    v: 'AI-native product design & software' },
  { k: 'Team',     v: 'Designers · engineers · strategists' },
  { k: 'Status',   v: 'Booking Q3 — limited slots' },
];

const palette = [
  { name: 'Signal',    hex: '#B8FF00', cssVar: '--signal'     },
  { name: 'Ink',       hex: '#F7F8F8', cssVar: '--ink'        },
  { name: 'Canvas',    hex: '#08090A', cssVar: '--bg'         },
  { name: 'Surface',   hex: '#161718', cssVar: '--bg-card'    },
  { name: 'Charcoal',  hex: '#1F2023', cssVar: '--bg-charcoal'},
  { name: 'Metal',     hex: '#838892', cssVar: '--metal'      },
];

const downloads = [
  { k: 'Wordmark · SVG',       v: 'Qbix — vector' },
  { k: 'Wordmark · PNG',       v: '2x · transparent · dark' },
  { k: 'Brand objects · ZIP',  v: 'Keycaps · vinyl · cassette · chrome' },
  { k: 'Boilerplate · TXT',    v: 'One-liner + long form' },
];

const principles = [
  'Use the lowercase wordmark "Qbix" — capital Q, lime signal accent permitted only on the Q glyph.',
  'Pair the wordmark with at least 16px of clear space on every side. Never recolor or stretch.',
  'On lime backgrounds, switch to the ink (off-white) wordmark. Never place signal-on-signal.',
  'When quoting Qbix, prefer the boilerplate verbatim — split paragraphs are fine, edits are not.',
];

export default function PressKitPage() {
  return (
    <>
      <main className="sp">
        <SubHero
          crumb={{ href: '/', label: 'Qbix' }}
          eyebrow="Press kit"
          title="Press kit."
          lede={
            <>
              Boilerplate, marks, brand objects, and palette for editors, writers, and partners covering{' '}
              <span className="brand-q">Q</span>bix. Everything here is yours to use — credit appreciated, not
              required.
            </>
          }
          actions={
            <a href={`mailto:${CONTACT_EMAIL}?subject=Press%20inquiry`} className="btn btn-primary btn-lg split-cta">
              <SplitText text="Email press" arrow />
            </a>
          }
          meta={facts.slice(0, 3).map((f) => ({ k: f.k, v: f.v }))}
        />

        <SubSection index="P.1 — Boilerplate" title="Qbix, in one paragraph" narrow>
          <p className="sp-statement">{boilerplate}</p>
          <dl className="sp-facts">
            {facts.map((f) => (
              <div key={f.k}>
                <dt className="mono">{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </SubSection>

        <SubSection index="P.2 — Brand objects" title="Identity stills">
          <div className="sp-stills">
            {brandLookbook.map((item) => (
              <figure key={item.src} className="sp-still">
                <div className="sp-still-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.alt} loading="lazy" />
                </div>
                <figcaption className="mono">
                  <span>{item.num}</span>
                  <span>{item.label}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </SubSection>

        <SubSection index="P.3 — Palette" title="Brand colors">
          <ul className="sp-swatches">
            {palette.map((c) => (
              <li key={c.hex}>
                <span className="sp-swatch" style={{ background: c.hex }} aria-hidden />
                <span className="sp-swatch-name">{c.name}</span>
                <span className="sp-swatch-hex mono">
                  {c.hex} · {c.cssVar}
                </span>
              </li>
            ))}
          </ul>
        </SubSection>

        <SubSection index="P.4 — Downloads" title="Marks & assets" narrow>
          <ol className="sp-list">
            {downloads.map((d, i) => (
              <li key={d.k}>
                <span className="n mono">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <strong>{d.k}</strong>
                  <span className="rest">{d.v}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="sp-note">
            Email{' '}
            <a className="text-link" href={`mailto:${CONTACT_EMAIL}?subject=Press%20kit%20assets`}>
              {CONTACT_EMAIL}
            </a>{' '}
            to request the asset bundle.
          </p>
        </SubSection>

        <SubSection tone="lime" index="P.5 — Usage" title="Mark & quoting guidelines" narrow>
          <ol className="sp-list">
            {principles.map((p, i) => (
              <li key={p}>
                <span className="n mono">{String(i + 1).padStart(2, '0')}</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </SubSection>

        <section className="sp-close" data-nav-theme="dark">
          <div className="container sp-close-inner">
            <p className="sp-close-line">
              Writing about Qbix? <span className="accent">Get in touch — fast.</span>
            </p>
            <a href={`mailto:${CONTACT_EMAIL}?subject=Press%20inquiry`} className="btn btn-primary btn-lg split-cta">
              <SplitText text="Email press" arrow />
            </a>
          </div>
        </section>
      </main>
      <Colophon />
    </>
  );
}
