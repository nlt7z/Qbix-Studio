'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';
import { testimonials } from '@/lib/data';

const ROTATE_MS = 7000;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Wrap `highlight` in the lime signal style when it appears verbatim in the quote.
function renderQuote(quote: string, highlight?: string): ReactNode {
  if (!highlight || !quote.includes(highlight)) return quote;
  const [before, after] = quote.split(highlight);
  return (
    <>
      {before}
      <span className="signal-bg">{highlight}</span>
      {after}
    </>
  );
}

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
    <section className="testimonial section-pad" aria-label="Client testimonials">
      <div className="container">
        <Reveal as="div" className="testimonial-inner" speed="slow">
          <span className="testimonial-mark" aria-hidden>
            &ldquo;
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduce ? undefined : { opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            >
              <p className="testimonial-quote">{renderQuote(t.quote, t.highlight)}</p>
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
                <button
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
