'use client';

import { motion } from 'framer-motion';
import { CONTACT_EMAIL, BOOKING_URL, CONTACT_NOTE } from '@/lib/data';

const ease = [0.16, 1, 0.3, 1] as const;

export default function ContactCTA() {
  return (
    <section id="contact" className="contact section-pad">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="contact-decoration"
        src="/qbix-cube.png"
        alt=""
        aria-hidden
        loading="lazy"
      />
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.32, ease }}
        >
          <span className="eyebrow">
            <span className="num">09</span>
            Contact
          </span>
          <h2 className="contact-heading" style={{ marginTop: 14 }}>
            <span className="line">Have an idea?</span>
            <span className="line accent">
              Let’s turn it into something people can use.
            </span>
          </h2>
        </motion.div>

        <motion.p
          className="contact-sub"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.28, ease, delay: 0.1 }}
        >
          {CONTACT_NOTE}
        </motion.p>

        <motion.div
          className="contact-ctas"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.28, ease, delay: 0.18 }}
        >
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-primary btn-lg">
            Start a project
            <span className="arrow">→</span>
          </a>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-lg"
          >
            Book an intro call ↗
          </a>
        </motion.div>

        <div className="contact-meta">
          <span>{CONTACT_EMAIL}</span>
          <span>·</span>
          <span>Seattle · NY</span>
        </div>
      </div>
    </section>
  );
}
