'use client';

import { motion } from 'framer-motion';
import SplitText from '@/components/SplitText';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';

/**
 * The /start form's send button, through the life of one send (Qbix Motion's Button life cycle):
 * the label slides up out of the button as a progress bar slides in and the button shrinks to a
 * block; when the brief is in, it widens again with a drawn tick and the done words. Three layers
 * in one clipped box, each on its own spring; the width springs from the space it has to 64px and
 * back. The fill stays lime throughout (it's the screen's one lime); the cut corner holds at every
 * width.
 */

export type BriefPhase = 'idle' | 'sending' | 'sent';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const LAYER = { type: 'spring', stiffness: 300, damping: 28 } as const;

export default function BriefButton({ phase, label, done }: { phase: BriefPhase; label: string; done: string }) {
  const reduced = useReducedMotionSafe();
  const still = reduced ? { duration: 0 } : undefined;
  // where each layer is: 0 in the button, -100% gone up, 100% waiting below
  const at = (on: BriefPhase, before: BriefPhase[]) => (phase === on ? '0%' : before.includes(phase) ? '100%' : '-100%');

  return (
    <div className="bbtn-wrap">
      <motion.button
        type="submit"
        className="btn btn-primary btn-lg split-cta cut bbtn"
        disabled={phase !== 'idle'}
        aria-label={phase === 'idle' ? label : phase === 'sending' ? 'Sending your brief' : done}
        initial={false}
        animate={{ width: phase === 'sending' ? '64px' : '100%' }}
        transition={still ?? { type: 'spring', stiffness: 240, damping: 22 }}
      >
        <motion.span className="bbtn-ly" initial={false} animate={{ y: at('idle', []) }} transition={still ?? LAYER} aria-hidden={phase !== 'idle'}>
          <SplitText text={label} arrow />
        </motion.span>
        <motion.span className="bbtn-ly" initial={false} animate={{ y: at('sending', ['idle']) }} transition={still ?? LAYER} aria-hidden>
          <span className="bbtn-bar">
            <motion.i
              initial={false}
              animate={{ scaleX: phase === 'sending' ? 0.85 : phase === 'sent' ? 1 : 0 }}
              transition={still ?? (phase === 'sending' ? { duration: 2.4, ease: EASE_OUT } : { duration: 0.3, ease: EASE_OUT })}
            />
          </span>
        </motion.span>
        <motion.span className="bbtn-ly" initial={false} animate={{ y: at('sent', ['idle', 'sending']) }} transition={still ?? LAYER} aria-hidden={phase !== 'sent'}>
          <svg className="bbtn-tick" viewBox="0 0 22 22" aria-hidden>
            <motion.path
              d="M5 11.5 9.2 15.5 17 6.5"
              initial={false}
              animate={{ pathLength: phase === 'sent' ? 1 : 0 }}
              transition={still ?? { delay: 0.18, duration: 0.4, ease: EASE_OUT }}
            />
          </svg>
          <span>{done}</span>
        </motion.span>
      </motion.button>
    </div>
  );
}
