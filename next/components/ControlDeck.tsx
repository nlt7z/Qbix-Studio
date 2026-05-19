'use client';

import { motion } from 'framer-motion';
import StatusPanel from './StatusPanel';
import TerminalButton from './TerminalButton';
import { heroLineVariants, fadeUp } from '@/lib/motion';

const titleLines = [
  { text: 'Small games.', accent: false },
  { text: 'Sharp systems.', accent: false },
  { text: 'Strange worlds.', accent: true },
];

export default function ControlDeck() {
  return (
    <section className="hero" id="control">
      <div className="hero-main">
        <div className="grid-bg" />

        <div className="hero-art" aria-hidden>
          <div className="hero-art-frame">
            <span className="hero-art-tag">// LIVE FEED · SECTOR 04</span>
            <span className="hero-art-coords">37.42°N / 122.08°W</span>
          </div>
          <div className="hero-art-img" />
          <div className="hero-art-scan" />
          <div className="hero-art-mask" />
        </div>

        <div className="hero-eyebrow">
          <span className="bracket">[</span>
          <span>independent game studio</span>
          <span className="divider" />
          <span>est. 2026</span>
          <span className="bracket">]</span>
        </div>

        <h1 className="hero-title">
          {titleLines.map((line, i) => (
            <span key={i} className="line">
              <motion.span
                style={{ display: 'inline-block' }}
                custom={i}
                variants={heroLineVariants}
                initial="hidden"
                animate="show"
                className={line.accent ? 'accent' : ''}
              >
                {line.text}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="hero-sub"
          custom={0.5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          An independent game studio making compact, replayable web and mobile games with tactical interfaces and strange little worlds.{' '}
          <span style={{ color: 'var(--off)' }}>
            Currently 4 projects in the archive — 1 playable, 3 in development.
          </span>
        </motion.p>

        <motion.div
          className="hero-cta"
          custom={0.7}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <TerminalButton href="/games/bidking" label="Play BidKing" icon="▶" />
          <TerminalButton href="/games" label="Explore archive" icon="→" ghost />
        </motion.div>
      </div>

      <StatusPanel />
    </section>
  );
}
