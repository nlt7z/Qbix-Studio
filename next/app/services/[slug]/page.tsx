import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Colophon from '@/components/Colophon';
import BrandText from '@/components/BrandText';
import { services } from '@/lib/data';

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const s = services.find((x) => x.slug === params.slug);
  if (!s) return {};
  return {
    title: `${s.title} — Qbix Studio`,
    description: s.detail.lede,
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) notFound();

  return (
    <>
      <main className="detail">
        <div className="container">
          <Link href="/#services" className="detail-crumb">
            <span className="arrow">←</span> Services
          </Link>

          <header className="detail-head">
            <span className="eyebrow">
              <span className="num">{service.num}</span>
              Service
            </span>
            <h1 className="detail-title"><BrandText>{service.title}</BrandText></h1>
            <p className="detail-lede"><BrandText>{service.detail.lede}</BrandText></p>
            <div className="detail-tags">
              {service.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </header>

          <div className="detail-grid">
            <div className="detail-section">
              <span className="detail-section-label">FIG {service.num}.1 — Deliverables</span>
              <h3>What we hand over</h3>
              <ul className="detail-list">
                {service.detail.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="detail-section">
              <span className="detail-section-label">FIG {service.num}.2 — Engagement</span>
              <h3>How we work together</h3>
              <div className="detail-specs">
                {service.detail.engagement.map((e) => (
                  <div key={e.k} className="detail-spec">
                    <span className="detail-spec-k">{e.k}</span>
                    <span className="detail-spec-v">{e.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-cta">
            <p className="detail-cta-text">
              Need this for your next product? <span className="accent">Start a project.</span>
            </p>
            <Link href="/#contact" className="btn btn-primary btn-lg">
              Start a project
              <span className="arrow">→</span>
            </Link>
            <Link href="/#services" className="btn btn-secondary btn-lg">
              All services
            </Link>
          </div>
        </div>
      </main>
      <Colophon />
    </>
  );
}
