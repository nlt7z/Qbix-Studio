'use client';

import { Reveal } from '@/components/Reveal';

export default function Testimonial() {
  return (
    <section className="testimonial section-pad" aria-label="Client testimonial">
      <div className="container">
        <Reveal as="div" className="testimonial-inner" speed="slow">
          <span className="testimonial-mark" aria-hidden>
            &ldquo;
          </span>
          <p className="testimonial-quote">
            Qbix is one of the few studios that grew up inside the AI era. Their
            fluency with AI in the workflow — and their grasp of what AI products
            should feel like — is <span className="signal-bg">next level</span>.
          </p>
          <div className="testimonial-meta">
            <span className="testimonial-rule" aria-hidden />
            <span className="testimonial-attrib">Alibaba Cloud</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
