import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Colophon from '@/components/Colophon';
import BrandText from '@/components/BrandText';
import { labCards } from '@/lib/data';

// Lab detail (secondary) pages are disabled for now. Returning no static
// params plus dynamicParams=false makes every /labs/* path 404, while the
// card data in lib/data.ts stays intact so this is easy to re-enable.
export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const c = labCards.find((x) => x.slug === params.slug);
  if (!c) return {};
  return {
    title: `${c.title} — Qbix Labs`,
    description: c.detail.lede,
    alternates: { canonical: `/labs/${c.slug}` },
  };
}

export default function LabPage({ params }: { params: { slug: string } }) {
  const lab = labCards.find((c) => c.slug === params.slug);
  if (!lab) notFound();

  return (
    <>
      <main className="detail">
        <div className="container">
          <Link href="/#labs" className="detail-crumb">
            <span className="arrow">←</span> <span><span className="brand-q">Q</span>bix Labs</span>
          </Link>

          <header className="detail-head">
            <span className="eyebrow">
              <span className="num">{lab.num}</span>
              Lab
            </span>
            <h1 className="detail-title"><BrandText>{lab.title}</BrandText></h1>
            <p className="detail-lede"><BrandText>{lab.detail.lede}</BrandText></p>
          </header>

          <div className="detail-media" style={{ aspectRatio: '16 / 9' }}>
            <div className="detail-media-status">
              <span className="dot" />
              <span>{lab.detail.status}</span>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <span className="detail-section-label">FIG {lab.num}.1 — Brief</span>
              <h3>What this is</h3>
              <p
                style={{
                  color: 'var(--text)',
                  fontSize: 'clamp(14px, 1.5vw, 15px)',
                  lineHeight: 1.6,
                  letterSpacing: '-0.011em',
                  maxWidth: 620,
                }}
              >
                <BrandText>{lab.body}</BrandText>
              </p>
            </div>

            <div className="detail-section">
              <span className="detail-section-label">FIG {lab.num}.2 — Highlights</span>
              <h3>Where it stands</h3>
              <div className="detail-specs">
                {lab.detail.highlights.map((h) => (
                  <div key={h.k} className="detail-spec">
                    <span className="detail-spec-k">{h.k}</span>
                    <span className="detail-spec-v">{h.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-cta">
            <p className="detail-cta-text">
              Curious or want to collaborate? <span className="accent">Reach out.</span>
            </p>
            <Link href="/#contact" className="btn btn-primary btn-lg">
              Contact studio
              <span className="arrow">→</span>
            </Link>
            <Link href="/#labs" className="btn btn-secondary btn-lg">
              Back to <span className="brand-q">Q</span>bix Labs
            </Link>
          </div>
        </div>
      </main>
      <Colophon />
    </>
  );
}
