'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { CONTACT_EMAIL, BOOKING_URL } from '@/lib/data';
import SplitText from '@/components/SplitText';

const EASE = [0.16, 1, 0.3, 1] as const;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [brief, setBrief] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, brief }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="contact-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          <motion.div
            className="contact-modal"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="contact-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>

            <div className="contact-modal-head">
              <span className="eyebrow">
                <span className="signal-dot" />
                Start a project
              </span>
              <h2 id="contact-modal-title" className="contact-modal-title">
                Tell us what you&rsquo;re building.
              </h2>
              <p className="contact-modal-sub">
                We read every brief. Replies usually within 24 hours.
              </p>
            </div>

            {status !== 'sent' ? (
              <form className="contact-form" onSubmit={submit}>
                <label className="contact-field">
                  <span className="contact-field-label">Name</span>
                  <input
                    type="text"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
                <label className="contact-field">
                  <span className="contact-field-label">Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </label>
                <label className="contact-field">
                  <span className="contact-field-label">Brief</span>
                  <textarea
                    name="brief"
                    required
                    rows={5}
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="What are you trying to build? Stage, timeline, anything we should know."
                  />
                </label>

                {status === 'error' && (
                  <p className="contact-form-error">
                    Send failed — {errorMsg}. Email us directly at{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                  </p>
                )}

                <div className="contact-form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg split-cta"
                    disabled={status === 'sending'}
                  >
                    <SplitText text={status === 'sending' ? 'Sending…' : 'Send brief'} arrow />
                  </button>
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-lg split-cta"
                  >
                    <SplitText text="Or book a 30-min call" arrow />
                  </a>
                </div>

                <p className="contact-modal-alt">
                  Prefer more detail?{' '}
                  <Link href="/start" onClick={onClose} className="contact-modal-alt-link">
                    Open the full project form ↗
                  </Link>
                </p>
              </form>
            ) : (
              <div className="contact-form-success">
                <div className="contact-form-success-mark" aria-hidden>
                  ✓
                </div>
                <h3>Brief received.</h3>
                <p>We&rsquo;ll reply from {CONTACT_EMAIL} within 24 hours.</p>
                <button type="button" className="btn btn-secondary btn-lg split-cta" onClick={onClose}>
                  <SplitText text="Close" arrow />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
