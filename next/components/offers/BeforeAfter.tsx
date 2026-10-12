'use client';

import { useState } from 'react';

/** The dated site: crowded nav, shouting banner, dense columns, a 2019 footer. */
function OldSite() {
  return (
    <div className="ba-site ba-old" aria-hidden>
      <div className="ba-old-top">
        <span className="ba-old-name">Dana Reyes, MA, LMFT ~ Counseling &amp; Psychotherapy Services</span>
        <span className="ba-old-phone">Call (555) 014-2290</span>
      </div>
      <div className="ba-old-nav">
        {['Home', 'About', 'Services', 'Specialties', 'Fees', 'Insurance', 'Forms', 'Blog', 'Links', 'Contact'].map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <div className="ba-old-banner">Welcome!! Now accepting new clients!!</div>
      <div className="ba-old-body">
        <div className="ba-old-photo" />
        <div className="ba-old-cols">
          {[0, 1, 2].map((c) => (
            <div key={c} className="ba-old-col">
              <span className="ba-old-h">{['Individual Therapy', 'Couples Counseling', 'Teens & Families'][c]}</span>
              {Array.from({ length: 7 }).map((_, i) => (
                <i key={i} style={{ width: `${70 + ((i * 37 + c * 13) % 30)}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="ba-old-foot">© 2019 Dana Reyes Counseling · All Rights Reserved · Site Map · Privacy</div>
    </div>
  );
}

/** The calm site: a photo, a sentence, one clear next step, room to breathe.
 *  Copy sits on the right so it's what the divider uncovers first. */
function NewSite() {
  return (
    <div className="ba-site ba-new" aria-hidden>
      <div className="ba-new-nav">
        <span className="ba-new-name">Dana Reyes, LMFT</span>
        <span className="ba-new-links">
          <span>About</span>
          <span>Specialties</span>
          <span>Fees</span>
          <span>Contact</span>
        </span>
      </div>
      <div className="ba-new-hero">
        <div className="ba-new-photo" />
        <div className="ba-new-copy">
          <span className="ba-new-kicker">Therapy in Oakland and online</span>
          <span className="ba-new-title">Feel more like yourself again.</span>
          <span className="ba-new-sub">Individual and couples therapy for anxiety, life changes, and relationships.</span>
          <span className="ba-new-btn">Book a free consultation</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Before / after homepage comparison. The new site sits underneath; the old
 * one is clipped from the right by a draggable divider (a native range input,
 * so it works by touch, mouse and keyboard).
 */
export default function BeforeAfter() {
  const [pos, setPos] = useState(45);   // just left of the calm headline
  return (
    <figure className="ba" aria-label="Before and after: a dated practice website and its calm rebuild">
      <div className="ba-frame">
        <div className="ba-chrome">
          <i /><i /><i />
        </div>
        <div className="ba-stage" style={{ ['--ba' as string]: `${pos}%` }}>
          <NewSite />
          <div className="ba-before">
            <OldSite />
          </div>
          <span className="ba-divider" aria-hidden />
          <span className="ba-label ba-label--before">Before</span>
          <span className="ba-label ba-label--after">After</span>
          <input
            className="ba-range"
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label="Drag to compare the old and new homepage"
          />
        </div>
      </div>
      <figcaption className="ba-cap">
        Drag to compare. Sample homepage, before and after.
        <span className="ba-note">Sample redesign of an invented practice.</span>
      </figcaption>
    </figure>
  );
}
