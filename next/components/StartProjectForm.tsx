'use client';

import { useEffect, useState } from 'react';
import { CONTACT_EMAIL, BOOKING_URL } from '@/lib/data';
import SplitText from '@/components/SplitText';
import NotchField from '@/components/NotchField';
import BriefButton from '@/components/BriefButton';
import { useReducedMotionSafe } from '@/components/useReducedMotionSafe';
import '@/app/start-form.css';

/** How far the brief has got (for the meter beside the form). */
export type BriefDraft = {
  name: boolean;
  email: boolean;
  company: boolean;
  types: string[];
  budget: number;     // -1 = not chosen
  timeline: number;   // -1 = not chosen
  brief: number;      // characters typed
  status: 'idle' | 'sending' | 'sent' | 'error';
};

const PROJECT_TYPES = [
  'AI product',
  'SaaS / web app',
  'Marketing site',
  'Brand / identity',
  'Design service',
  'Something else',
];
const BUDGETS = ['Not sure yet', 'Under $5k', '$5k – $20k', '$20k – $50k', '$50k+'];
const TIMELINES = ['ASAP', 'In 2 – 4 weeks', '1 – 3 months', 'Flexible / exploring'];

type Status = 'idle' | 'sending' | 'sent' | 'error';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The full-page project intake form. Richer than the quick ContactModal —
 * project type, budget, and timeline on top of the core name/email/brief — and
 * posts to the same /api/contact endpoint with the extra fields plus a source
 * tag so submissions can be told apart.
 *
 * Each field's label sits inside it and rises onto its edge (NotchField); the
 * send button plays the send through (BriefButton), so the sending lasts long
 * enough to read and the done state shows before the thank-you replaces the form.
 */
export default function StartProjectForm({ onDraft }: { onDraft?: (d: BriefDraft) => void } = {}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [brief, setBrief] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  // the thank-you, once the button has shown the brief is in
  const [thanked, setThanked] = useState(false);
  const reduced = useReducedMotionSafe();

  // Tell the 3D brief what has been filled in so far.
  useEffect(() => {
    onDraft?.({
      name: name.trim().length > 0,
      email: /\S+@\S+/.test(email),
      company: company.trim().length > 0,
      types,
      budget: BUDGETS.indexOf(budget),
      timeline: TIMELINES.indexOf(timeline),
      brief: brief.trim().length,
      status,
    });
  }, [onDraft, name, email, company, types, budget, timeline, brief, status]);

  const toggleType = (t: string) =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const [res] = await Promise.all([fetch('/api/contact', {
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
      }), wait(reduced ? 0 : 900)]);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setStatus('sent');
      setTimeout(() => setThanked(true), reduced ? 0 : 1400);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (status === 'sent' && thanked) {
    const first = name.trim().split(' ')[0];
    return (
      <div className="contact-form-success start-success">
        <div className="contact-form-success-mark" aria-hidden>
          ✓
        </div>
        <h3>Brief received.</h3>
        <p>
          Thanks{first ? `, ${first}` : ''}. We&rsquo;ll reply from {CONTACT_EMAIL} within
          24&nbsp;hours.
        </p>
        <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg split-cta">
          <SplitText text="Book a 30-min call too" arrow />
        </a>
      </div>
    );
  }

  return (
    <form className="contact-form start-form" onSubmit={submit}>
      <div className="start-form-row">
        <NotchField id="sp-name" label="Name" filled={name.length > 0}>
          <input
            id="sp-name"
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </NotchField>
        <NotchField id="sp-email" label="Email" filled={email.length > 0}>
          <input
            id="sp-email"
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </NotchField>
      </div>

      <NotchField id="sp-company" label="Company or product (optional)" filled={company.length > 0}>
        <input
          id="sp-company"
          type="text"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Where you're building, or a link"
          autoComplete="organization"
        />
      </NotchField>

      <fieldset className="start-fieldset">
        <legend className="start-legend">What are you building? Pick any.</legend>
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
        <NotchField id="sp-budget" label="Budget" filled={budget !== ''}>
          <select id="sp-budget" className="start-select" name="budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
            {/* nothing chosen: the label sits in the field */}
            <option value="" disabled hidden />
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <span className="start-select-caret" aria-hidden>
            ▾
          </span>
        </NotchField>
        <NotchField id="sp-timeline" label="Timeline" filled={timeline !== ''}>
          <select id="sp-timeline" className="start-select" name="timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)}>
            <option value="" disabled hidden />
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className="start-select-caret" aria-hidden>
            ▾
          </span>
        </NotchField>
      </div>

      <NotchField id="sp-brief" label="Brief" filled={brief.length > 0} tall>
        <textarea
          id="sp-brief"
          name="brief"
          required
          rows={6}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="What are you trying to build? Stage, goals, links, anything we should know."
        />
      </NotchField>

      {status === 'error' && (
        <p className="contact-form-error">
          Send failed ({errorMsg}). Email us directly at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      )}

      <div className="contact-form-actions">
        <BriefButton phase={status === 'sending' ? 'sending' : status === 'sent' ? 'sent' : 'idle'} label="Send brief" done="Brief sent" />
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-lg split-cta"
        >
          <SplitText text="Or book a 30-min call" arrow />
        </a>
      </div>
    </form>
  );
}
