'use client';

import { useCallback, useState } from 'react';
import StartProjectForm from '@/components/StartProjectForm';
import BlockFigure from '@/components/BlockFigure';
import type { BriefDraft } from '@/components/three/briefScene';

const PARTS = 7;
const filled = (d: BriefDraft) =>
  [d.name, d.email, d.company, d.types.length > 0, d.budget >= 0, d.timeline >= 0, d.brief > 0].filter(Boolean).length;

/**
 * The /start form beside the site's blocks (the cube), with a meter that
 * fills as the brief does.
 */
export default function StartStudio() {
  const [count, setCount] = useState(0);
  const onDraft = useCallback((d: BriefDraft) => setCount(filled(d)), []);

  return (
    <div className="container start-studio">
      <div className="start-studio-stage">
        <div className="start-stage-pin">
          <BlockFigure form="cube" label="The Qbix cube: 27 blocks, one of them lime" />
          <div className="start-stage-hud mono" aria-hidden>
            <span>Your brief</span>
            <span className="start-stage-meter">
              <i style={{ transform: `scaleX(${count / PARTS})` }} />
            </span>
            <span>
              {count} / {PARTS}
            </span>
          </div>
        </div>
      </div>
      <div className="start-studio-form">
        <StartProjectForm onDraft={onDraft} />
      </div>
    </div>
  );
}
