import type { Metadata } from 'next';
import Link from 'next/link';
import Colophon from '@/components/Colophon';
import StartProjectButton from '@/components/StartProjectButton';

export const metadata: Metadata = {
  title: 'AI Character Platform — case study',
  description:
    'Case study: a premium interactive product showroom for enterprise users to explore LLM character capabilities — memory, ritual, conversation. Designed by Qbix Studio.',
};

const SITE_URL = 'https://qbix.space';

const tags = ['AI Product', 'Web', 'LLM UI', 'Agent workflow'];

const caseStudyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  '@id': `${SITE_URL}/work/ai-character-chat/#case-study`,
  name: 'AI Character Platform',
  headline: 'AI Character Platform — case study',
  description:
    'A premium interactive product showroom for enterprise users to explore LLM character capabilities — memory, ritual, and conversation. Designed by Qbix Studio.',
  url: `${SITE_URL}/work/ai-character-chat`,
  inLanguage: 'en-US',
  datePublished: '2025',
  keywords: tags.join(', '),
  creator: { '@id': `${SITE_URL}/#organization` },
  author: { '@id': `${SITE_URL}/#organization` },
  publisher: { '@id': `${SITE_URL}/#organization` },
};

const overview = [
  { k: 'Year',     v: '2025' },
  { k: 'Client',   v: 'Internal' },
  { k: 'Role',     v: 'AI Product Design · Web Experience' },
  { k: 'Category', v: 'AI Product' },
];

const moments = [
  'Character roster as a navigable canvas, not a sidebar list.',
  'Memory threads surfaced as inline objects you can pin, prune, or thread back.',
  'Conversation rituals — opening, deepening, closing — designed as first-class UI states.',
  'Capability inspector exposing tool calls, persona prompts, and guardrails to power users.',
];

export default function AiCharacterChatPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudyJsonLd) }}
      />
      <main className="detail">
        <div className="container">
          <Link href="/#work" className="detail-crumb">
            <span className="arrow">←</span> Selected work
          </Link>

          <header className="detail-head">
            <span className="eyebrow">
              <span className="num">FILE / 001</span>
              Case study
            </span>
            <h1 className="detail-title">AI Character Platform.</h1>
            <p className="detail-lede">
              A premium interactive product showroom for enterprise users to explore LLM
              character capabilities. Designed around memory, ritual, and conversation —
              not a chatbox bolted to a model.
            </p>
            <div className="detail-tags">
              {tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </header>

          <div className="detail-media">
            <div className="detail-media-status">
              <span className="dot" />
              <span>BUILD 0.4.1 · INTERNAL SHOWROOM</span>
            </div>
            <video
              src="/ai-character-chat.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <span className="detail-section-label">FIG 1.1 — Brief</span>
              <h3>What this is</h3>
              <p
                style={{
                  color: 'var(--text)',
                  fontSize: 'clamp(14px, 1.5vw, 15px)',
                  lineHeight: 1.65,
                  letterSpacing: '-0.011em',
                  maxWidth: 620,
                  margin: '0 0 16px',
                }}
              >
                Most LLM character apps reduce to a portrait + chat input. We wanted enterprise
                evaluators to feel the actual capability — how memory accumulates, how persona
                drift is bounded, how tool calls surface, and how the conversation has structure
                beyond turn-taking.
              </p>
              <p
                style={{
                  color: 'var(--text)',
                  fontSize: 'clamp(14px, 1.5vw, 15px)',
                  lineHeight: 1.65,
                  letterSpacing: '-0.011em',
                  maxWidth: 620,
                  margin: 0,
                }}
              >
                The result reads as part product, part showroom — designed to be navigated,
                not scrolled.
              </p>
            </div>

            <div className="detail-section">
              <span className="detail-section-label">FIG 1.2 — Project</span>
              <h3>Overview</h3>
              <div className="detail-specs">
                {overview.map((o) => (
                  <div key={o.k} className="detail-spec">
                    <span className="detail-spec-k">{o.k}</span>
                    <span className="detail-spec-v">{o.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-section" style={{ maxWidth: 820, marginBottom: 'clamp(40px, 5vw, 56px)' }}>
            <span className="detail-section-label">FIG 1.3 — Design moments</span>
            <h3>Four design decisions</h3>
            <ul className="detail-list">
              {moments.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>

          <div className="detail-cta">
            <p className="detail-cta-text">
              Building something AI-native? <span className="accent">Let&apos;s talk.</span>
            </p>
            <StartProjectButton />
            <Link href="/#work" className="btn btn-secondary btn-lg">
              More work
            </Link>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, lineHeight: 1.6, color: 'var(--text-2)' }}>
            This was an{' '}
            <Link href="/services/ai-products" className="text-link">AI product design</Link>{' '}
            engagement by <Link href="/studio" className="text-link">Qbix Studio</Link>, an
            AI product design studio in Seattle.
          </p>
        </div>
      </main>
      <Colophon />
    </>
  );
}
