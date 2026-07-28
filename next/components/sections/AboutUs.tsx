'use client';

import { Reveal, Wipe } from '@/components/Reveal';
import SitePreviewFrame from '@/components/SitePreviewFrame';

const SITES = [
  { href: 'https://nltstudio7.space', title: 'nltstudio7.space' },
  { href: 'https://hancao.space', title: 'hancao.space' },
];

/** Founder-site preview — browser-chrome frame, no domain text, device-adaptive
 *  live iframe (shows the phone layout on phones, desktop on wide screens). */
function SitePreview({ src, title }: { src: string; title: string }) {
  return (
    <a
      className="about-preview"
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${title}`}
    >
      <span className="about-preview-bar" aria-hidden>
        <span className="about-preview-dots">
          <i /><i /><i />
        </span>
        <span className="about-preview-arrow">↗</span>
      </span>
      <div className="about-preview-frame">
        <SitePreviewFrame src={src} title={`${title} preview`} />
      </div>
    </a>
  );
}

export default function AboutUs() {
  return (
    <section id="about" className="about section-pad" data-nav-theme="dark">
      <div className="container">
        <header className="section-head">
          <div>
            <Reveal as="span" className="eyebrow" speed="fast">
              About Qbix
            </Reveal>
            <Wipe as="h2" style={{ marginTop: 14 }}>
              Our story is simple.
            </Wipe>
          </div>
        </header>

        <div className="about-grid">
          {/* Two founder sites, stacked — the work speaks, not the URLs. */}
          <Reveal className="about-previews" speed="base" delay={0.15}>
            {SITES.map((s) => (
              <SitePreview key={s.href} src={s.href} title={s.title} />
            ))}
          </Reveal>

          {/* Story, right — key phrases lit lime, sweeping in on hover. */}
          <Reveal as="p" className="about-body lede" speed="base" delay={0.3}>
            AI has lowered the technical barrier, but the fact that anyone can
            build does not mean anyone can <span className="about-hi">build well</span>.
            We bring <span className="about-hi">unusually sharp instincts</span>, more
            than ten years of training toward the <span className="about-hi">best taste</span>{' '}
            in the industry, real curiosity about new things (which means you get
            the <span className="about-hi">newest tech</span>), and respect for every
            idea that comes in. We put weight on early exploration and research,
            because <span className="about-hi">no idea deserves to be wasted</span>.
          </Reveal>
        </div>
      </div>
    </section>
  );
}
