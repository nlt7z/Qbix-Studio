'use client';

import { motion } from 'framer-motion';
import { cubeCells } from '@/lib/data';

const ease = [0.22, 1, 0.36, 1] as const;

export default function CubeGrid() {
  return (
    <div className="capability-list" aria-label="Capabilities">
      {cubeCells.map((c, i) => (
        <motion.div
          key={c.num}
          className="capability-row"
          data-lit={c.lit ?? ''}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.42, ease, delay: 0.05 + i * 0.05 }}
        >
          <span className="capability-num">{c.num}</span>
          <span className="capability-label">{c.label}</span>
          <span className="capability-meta">{c.meta}</span>
        </motion.div>
      ))}
    </div>
  );
}
