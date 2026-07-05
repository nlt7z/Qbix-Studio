'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Reveal, Scatter } from '@/components/Reveal';
import { testimonials } from '@/lib/data';

const ROTATE_MS = 7000;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function Testimonial() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const many = testimonials.length > 1;

  useEffect(() => {
    if (!many) return;
    const id = window.setInterval(
      () => setIndex((n) => (n + 1) % testimonials.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [many]);

  if (testimonials.length === 0) return null;
  const t = testimonials[index];

  return (
    <section className="testimonial section-pad" aria-label="Client testimonials" data-nav-theme="dark">
      <div className="container">
        <Reveal as="div" className="testimonial-inner" speed="slow">
          <motion.span
            className="testimonial-mark"
            aria-hidden
            initial={reduce ? false : { opacity: 0, scale: 0.3, rotate: -14 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{ duration: 0.9, ease: [0.34, 1.4, 0.46, 1], delay: 0.15 }}
            style={{ display: 'inline-block' }}
          >
            &ldquo;
          </motion.span>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              {/* The quote swirls together from scattered characters — the
                  one place on the page that earns the particle treatment. */}
              <Scatter
                as="p"
                className="testimonial-quote"
                text={t.quote}
                highlight={t.highlight}
                speed="fast"
                step={0.012}
              />
              <div className="testimonial-meta">
                <span className="testimonial-rule" aria-hidden />
                <span className="testimonial-attrib">
                  <span className="testimonial-attrib-name">{t.name}</span>
                  <span className="testimonial-attrib-role mono">{t.org}</span>
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {many && (
            <div className="testimonial-dots" role="tablist" aria-label="Testimonials">
              {testimonials.map((item, n) => (
                <motion.button
                  initial={reduce ? false : { opacity: 0, y: 8, scale: 0.6 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                  transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.5 + n * 0.07 }}
                  key={item.name + item.org}
                  type="button"
                  role="tab"
                  aria-selected={n === index}
                  aria-label={`Show quote from ${item.name}, ${item.org}`}
                  className={`testimonial-dot${n === index ? ' is-active' : ''}`}
                  onClick={() => setIndex(n)}
                />
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
