'use client';

import { useState } from 'react';
import { CONTACT_EMAIL, BOOKING_URL } from '@/lib/data';

const PROJECT_TYPES = [
  'AI product',
  'SaaS / web app',
  'Marketing site',
  'Brand / identity',
  '48-hour sprint',
  'Something else',
];
const BUDGETS = ['Not sure yet', 'Under $5k', '$5k – $20k', '$20k – $50k', '$50k+'];
const TIMELINES = ['ASAP', 'In 2 – 4 weeks', '1 – 3 months', 'Flexible / exploring'];

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * The full-page project intake form. Richer than the quick ContactModal —
 * project type, budget, and timeline on top of the core name/email/brief — and
 * posts to the same /api/contact endpoint with the extra fields plus a source
 * tag so submissions can be told apart.
 */
export default function StartProjectForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [brief, setBrief] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleType = (t: string) =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          brief,
          company,
          projectTypes: types,
          budget,
          timeline,
          source: 'start-page',
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (status === 'sent') {
    const first = name.trim().split(' ')[0];
    return (
      <div className="contact-form-success start-success">
        <div className="contact-form-success-mark" aria-hidden>
          ✓
        </div>
        <h3>Brief received.</h3>
        <p>
          Thanks{first ? `, ${first}` : ''} — we&rsquo;ll reply from {CONTACT_EMAIL} within
          24&nbsp;hours.
        </p>
        <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg">
          Book a 30-min call too
        </a>
      </div>
    );
  }

  return (
    <form className="contact-form start-form" onSubmit={submit}>
      <div className="start-form-row">
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
      </div>

      <label className="contact-field">
        <span className="contact-field-label">
          Company / product <span className="contact-field-opt">— optional</span>
        </span>
        <input
          type="text"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Where you're building, or a link"
          autoComplete="organization"
        />
      </label>

      <fieldset className="start-fieldset">
        <legend className="contact-field-label">
          What are you building? <span className="contact-field-opt">— pick any</span>
        </legend>
        <div className="start-chips">
          {PROJECT_TYPES.map((t) => {
            const on = types.includes(t);
            return (
              <button
                key={t}
                type="button"
                className={`start-chip ${on ? 'is-on' : ''}`}
                aria-pressed={on}
                onClick={() => toggleType(t)}
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="start-form-row">
        <label className="contact-field">
          <span className="contact-field-label">Budget</span>
          <div className="start-select-wrap">
            <select
              className="start-select"
              name="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            >
              <option value="">Select a range…</option>
              {BUDGETS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <span className="start-select-caret" aria-hidden>
              ▾
            </span>
          </div>
        </label>
        <label className="contact-field">
          <span className="contact-field-label">Timeline</span>
          <div className="start-select-wrap">
            <select
              className="start-select"
              name="timeline"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            >
              <option value="">When do you need it…</option>
              {TIMELINES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span className="start-select-caret" aria-hidden>
              ▾
            </span>
          </div>
        </label>
      </div>

      <label className="contact-field">
        <span className="contact-field-label">Brief</span>
        <textarea
          name="brief"
          required
          rows={6}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="What are you trying to build? Stage, goals, links, anything we should know."
        />
      </label>

      {status === 'error' && (
        <p className="contact-form-error">
          Send failed — {errorMsg}. Email us directly at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      )}

      <div className="contact-form-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send brief'}
          <span className="arrow">→</span>
        </button>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-lg"
        >
          Or book a 30-min call
        </a>
      </div>
    </form>
  );
}
