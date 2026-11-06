import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { BtnLabel } from '@/components/blocks/Btn';
import Chapter, { Steps } from '@/components/blocks/Chapter';
import Footer from '@/components/blocks/Footer';
import { Line, Mark, Rise } from '@/components/blocks/Rise';
import { StrataHero, StrataTour } from '@/components/scenes/Strata';
import Film from './Film';
import './strata.css';

const SITE_URL = 'https://qbix.space';
const STRATA_URL = 'https://stratadesign.app';
const DESC =
  'Strata turns a moodboard into a working design system — tokens, components, and code, ready to hand to AI or your library. A Qbix Labs product, live at stratadesign.app.';

const SHARE_TITLE = 'Strata: one image in, a working design system out';

export const metadata: Metadata = {
  title: 'Strata — image to design system',
  description: DESC,
  alternates: { canonical: '/products/strata' },
  // Its own share card, so a shared link previews Strata rather than the studio.
  openGraph: {
    type: 'website',
    siteName: 'Qbix',
    locale: 'en_US',
    images: [{ url: '/og/strata.png', width: 1200, height: 630, alt: 'Strata: one image in, a working system out.' }],
    url: `${SITE_URL}/products/strata`,
    title: SHARE_TITLE,
    description: DESC,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@QbixStudio',
    creator: '@QbixStudio',
    images: ['/og/strata.png'],
    title: SHARE_TITLE,
    description: DESC,
  },
};

const strataJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${SITE_URL}/products/strata/#software`,
  name: 'Strata',
  description: DESC,
  url: STRATA_URL,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  creator: { '@id': `${SITE_URL}/#organization` },
};

const STEPS = ['Read the image.', 'Draft the system.', 'Ship the code.'];

// the fitted headlines' marked word comes in after the others
const late = { '--wd': '.7s' } as CSSProperties;

/** Strata's own button: it opens stratadesign.app in a new tab. */
const OpenStrata = () => (
  <a className="btn" href={STRATA_URL} target="_blank" rel="noopener noreferrer" aria-label="Open Strata">
    <BtnLabel text="Open Strata" />
  </a>
);

export default function StrataPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(strataJsonLd) }} />
      <main className="blocks pg-strata" data-stack="">
        {/* 01 · white: the claim, then Strata itself, its film in a window and two of its tokens */}
        <section className="block block--flat hero" data-tone="white" data-chapter="" id="top">
          <div className="in">
            <Rise as="h1" className="display hero-h" fit={{ max: 150, min: 30 }}>
              <Line>One image in.</Line>{' '}
              <Line>
                <span className="ph">A working</span>{' '}
                <span className="ph">
                  <span className="mark" data-wipe="" style={late}>
                    system
                  </span>{' '}
                  out.
                </span>
              </Line>
            </Rise>
            <div className="hero-row">
              <div className="hero-say">
                <p className="kicker" data-up="">
                  Strata <span>· A Qbix Labs product, live at stratadesign.app</span>
                </p>
                <p className="lede" data-up="">
                  Strata turns a moodboard into a design system you can actually ship: tokens, components, and code, ready to hand to AI or your library.
                </p>
                <div className="acts" data-up="" style={{ '--ud': '120ms' } as CSSProperties}>
                  <OpenStrata />
                  <a className="link" href="#how">
                    How it works
                  </a>
                </div>
                <dl className="facts" data-up="" style={{ '--ud': '200ms' } as CSSProperties}>
                  <div>
                    <dt>Input</dt>
                    <dd>Any image or moodboard</dd>
                  </div>
                  <div>
                    <dt>Output</dt>
                    <dd>Tokens, components, code</dd>
                  </div>
                </dl>
              </div>
              <div className="scene hero-scene" data-tone="paper">
                <StrataHero />
              </div>
            </div>
          </div>
        </section>

        {/* 02 · black: how it works, an image read, drafted into a system, shipped as code */}
        <Chapter
          id="how"
          tone="black"
          sceneTone="dark"
          moves={2}
          steps
          caps={STEPS}
          copy={
            <>
              <p className="kicker">How it works</p>
              <Rise className="h2">
                Drop in an image. <Mark>Ship a system.</Mark>
              </Rise>
              <Steps items={STEPS} />
              <div className="notes">
                <p>
                  Drop in a moodboard, a screenshot, a photo. Strata pulls color, type, spacing, and mood out of it: <b>taste becomes measurements.</b>
                </p>
                <p>
                  Tokens first, then components: buttons, cards, forms <b>drawn from the same measurements,</b> not lifted from a template.
                </p>
                <p>
                  Export CSS variables, Tailwind config, and component code. <b>Hand it to your library, or straight to AI.</b>
                </p>
              </div>
            </>
          }
          scene={<StrataTour />}
        />

        {/* 03 · white: what comes out */}
        <section className="block" id="outputs" data-tone="white">
          <div className="in">
            <div className="head">
              <p className="kicker">What you get</p>
              <Rise className="h1">
                Everything a <Mark>system</Mark> needs.
              </Rise>
            </div>
            <ol className="outs" data-up="">
              <li>
                <h3 className="h3">Design tokens</h3>
                <p>Color, type, spacing, and radius as named scales, as CSS variables ready to theme.</p>
              </li>
              <li>
                <h3 className="h3">Component library</h3>
                <p>Buttons, cards, forms, and nav drafted inside your system, not on top of one.</p>
              </li>
              <li>
                <h3 className="h3">Code export</h3>
                <p>Copy CSS, Tailwind config, or component code straight into the repo.</p>
              </li>
              <li>
                <h3 className="h3">AI handoff</h3>
                <p>A prompt-ready spec of the whole system, so the model builds in your language.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* 04 · black: Strata's own film, in a plain window */}
        <section className="block" id="run" data-tone="black">
          <div className="in">
            <div className="head head--split">
              <Rise className="h1">
                Watch it <Mark>work.</Mark>
              </Rise>
              <p className="lede" data-up="">
                Strata itself, live at stratadesign.app. One image in, a working system out.
              </p>
            </div>
            <Film />
          </div>
        </section>

        {/* 05 · white: the sign-off */}
        <section className="block sign" id="contact" data-tone="white">
          <div className="in">
            <p className="kicker">Your next product already has a moodboard.</p>
            <Rise className="display sign-h" fit={{ max: 150, min: 30 }}>
              <Line>
                <span className="ph">Feed it to</span>{' '}
                <span className="ph">
                  <span className="mark" data-wipe="" style={late}>
                    Strata.
                  </span>
                </span>
              </Line>
            </Rise>
            <div className="acts">
              <OpenStrata />
              <Link className="link" href="/#products">
                All products
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
