'use client';

import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { BtnLabel } from '@/components/blocks/Btn';
import { BOOKING_URL, CONTACT_EMAIL } from '@/lib/data';

const TYPES = ['AI product', 'SaaS / web app', 'Marketing site', 'Brand / identity', 'Design service', 'Something else'];
const BUDGETS = ['Not sure yet', 'Under $5k', '$5k to $20k', '$20k to $50k', '$50k+'];
const TIMELINES = ['ASAP', 'In 2 to 4 weeks', '1 to 3 months', 'Flexible / exploring'];
const PARTS = 7;

type Status = 'idle' | 'sending' | 'sent' | 'error';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The hero's two columns: the words (the page's lede, passed in), the qbix cube and a meter that fills as the
 * brief does (seven parts), beside the brief itself. The brief posts to /api/contact as StartProjectForm did
 * (the same fields, `source: 'start-page'`): the sending lasts long enough to read on the button, and the
 * thank-you takes the panel's place once the button has said it's sent. A failed send says so and gives the
 * address. The cube is only drawn where it shows (900px and up).
 */
export default function Brief({ children }: { children: ReactNode }) {
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
  const done = useRef<HTMLHeadingElement>(null);

  // the button that was pressed is gone: the thank-you takes the focus
  useEffect(() => {
    if (thanked) done.current?.focus();
  }, [thanked]);

  const count = [name.trim(), /\S+@\S+\.\S+/.test(email), company.trim(), types.length, budget, timeline, brief.trim()].filter(Boolean).length;
  const toggleType = (t: string) => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : prev.concat(t)));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setStatus('sending');
    setErrorMsg('');
    try {
      const [res] = await Promise.all([
        fetch('/api/contact', {
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
        }),
        wait(reduced ? 0 : 900),
      ]);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setStatus('sent');
      setTimeout(() => setThanked(true), reduced ? 0 : 1400);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  const label = status === 'sending' ? 'Sending brief' : status === 'sent' ? 'Brief sent' : 'Send brief';
  const first = name.trim().split(/\s+/)[0];

  return (
    <div className="hero-row">
      <div className="hero-say">
        {children}
        <div className="meter" aria-hidden="true">
          <span>Your brief</span>
          <span className="meter-bar">
            <i style={{ transform: `scaleX(${count / PARTS})` }} />
          </span>
          <span className="meter-n">
            {count} / {PARTS}
          </span>
        </div>
      </div>

      <div data-up="" style={{ '--ud': '160ms' } as CSSProperties}>
        {thanked ? (
          <div className="brief" data-tone="white">
            <div className="brief-head">
              <h2 className="h3" ref={done} tabIndex={-1}>
                Brief received.
              </h2>
              <p className="lede">
                Thanks{first ? `, ${first}` : ''}. We&rsquo;ll reply from {CONTACT_EMAIL} within 24&nbsp;hours.
              </p>
            </div>
            <div className="brief-acts">
              <a className="btn" href={BOOKING_URL} target="_blank" rel="noreferrer" aria-label="Book a 30-min call too">
                <BtnLabel text="Book a 30-min call too" />
              </a>
            </div>
          </div>
        ) : (
          <form className="brief" data-tone="white" aria-labelledby="brief-t" onSubmit={submit}>
            <div className="brief-head">
              <h2 className="h3" id="brief-t">
                Your brief
              </h2>
            </div>
            <div className="fields">
              <div className="field">
                <label htmlFor="sp-name">Name</label>
                <input id="sp-name" type="text" name="name" required placeholder="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="sp-email">Email</label>
                <input id="sp-email" type="email" name="email" required placeholder="you@company.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field field--wide">
                <label htmlFor="sp-company">Company or product (optional)</label>
                <input
                  id="sp-company"
                  type="text"
                  name="company"
                  placeholder="Where you're building, or a link"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <fieldset className="field field--wide">
                <legend>What are you building? Pick any.</legend>
                <div className="choices">
                  {TYPES.map((t) => (
                    <label key={t}>
                      <input type="checkbox" name="type" value={t} checked={types.includes(t)} onChange={() => toggleType(t)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="field field--wide">
                <legend>Budget</legend>
                <div className="choices">
                  {BUDGETS.map((b) => (
                    <label key={b}>
                      <input type="radio" name="budget" value={b} checked={budget === b} onChange={() => setBudget(b)} />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="field field--wide">
                <legend>Timeline</legend>
                <div className="choices">
                  {TIMELINES.map((t) => (
                    <label key={t}>
                      <input type="radio" name="timeline" value={t} checked={timeline === t} onChange={() => setTimeline(t)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="field field--wide">
                <label htmlFor="sp-brief">Brief</label>
                <textarea
                  id="sp-brief"
                  name="brief"
                  required
                  rows={6}
                  placeholder="What are you trying to build? Stage, goals, links, anything we should know."
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                />
              </div>
            </div>
            <div className="brief-acts">
              {/* the page's one dark button: on the sage panel the sage one wouldn't show */}
              <button className="btn" type="submit" aria-label={label}>
                <BtnLabel text={label} />
              </button>
              <a className="link" href={BOOKING_URL} target="_blank" rel="noreferrer">
                Or book a 30-min call ↗︎
              </a>
            </div>
            <p className="brief-note" role="status" aria-live="polite">
              {status === 'error' && (
                <>
                  Send failed ({errorMsg}). Email us directly at{' '}
                  <a className="link" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>
                  .
                </>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
