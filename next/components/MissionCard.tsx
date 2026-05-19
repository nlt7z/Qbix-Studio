'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { Mission } from '@/lib/data';
import { previews } from './MissionPreviews';
import { missionReveal } from '@/lib/motion';

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________';

function useScrambleText(original: string, active: boolean, enabled: boolean) {
  const [text, setText] = useState(original);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setText(original);
      return;
    }
    if (active) {
      frameRef.current = 0;
      const loop = () => {
        let out = '';
        for (let i = 0; i < original.length; i++) {
          if (i < frameRef.current) out += original[i];
          else if (original[i] === ' ') out += ' ';
          else out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        setText(out);
        frameRef.current += 0.8;
        if (frameRef.current < original.length + 4) {
          rafRef.current = requestAnimationFrame(loop);
        } else {
          setText(original);
        }
      };
      rafRef.current = requestAnimationFrame(loop);
    } else {
      setText(original);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, original, enabled]);

  return text;
}

export default function MissionCard({ mission, index }: { mission: Mission; index: number }) {
  const [hover, setHover] = useState(false);
  const Preview = previews[mission.preview];
  const isLocked = mission.cardClass === 'locked';
  const hasLink = !!mission.href && !isLocked;
  const scrambledTitle = useScrambleText(mission.title, hover, !isLocked);

  const titleClass = isLocked ? 'mission-title mission-locked-title' : 'mission-title';
  const hookClass = isLocked ? 'mission-hook mission-locked-hook' : 'mission-hook';

  const cardInner = (
    <motion.article
      className={`mission ${mission.cardClass || ''}`}
      data-mission={mission.id}
      data-status={mission.status}
      custom={index}
      variants={missionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={hasLink ? { y: -4 } : undefined}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <span className="status-line" />
      <div className="mission-meta">
        <span className="num">{mission.num}</span>
        <span className={`status-tag ${mission.statusTagClass || ''}`}>
          <span className="dot" />
          {mission.statusLabel}
        </span>
      </div>
      <h3 className={titleClass}>{isLocked ? mission.title : scrambledTitle}</h3>
      <p className={hookClass}>{mission.hook}</p>
      <div className="mission-preview">
        <div className="scan-bar" />
        <Preview />
      </div>
      <div className="mission-foot">
        <div className="tags">
          {mission.tags.map((t, i) => (
            <Fragment key={i}>
              {i > 0 && <span>·</span>}
              <span>{t}</span>
            </Fragment>
          ))}
        </div>
        <span className="mission-enter">
          {mission.cta} <span>{mission.ctaIcon}</span>
        </span>
      </div>
    </motion.article>
  );

  if (!hasLink) return cardInner;

  return (
    <Link
      href={mission.href!}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      aria-label={`Open ${mission.title} mission`}
    >
      {cardInner}
    </Link>
  );
}
