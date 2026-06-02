import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Colophon from '@/components/Colophon';
import BrandText from '@/components/BrandText';
import StartProjectButton from '@/components/StartProjectButton';
import { DeliverableGrid, ProcessFlow } from '@/components/ServiceVisuals';
import ServiceCases from '@/components/ServiceCases';
import { projects, services } from '@/lib/data';

const SITE_URL = 'https://qbix.space';

// "$20k" / "$2k" → 20000 / 2000 (for Offer.price); undefined if unparseable.
function parsePriceFrom(price: string): number | undefined {
  const m = price.match(/([\d.]+)\s*k?/i);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  return /k/i.test(price) ? n * 1000 : n;
}

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
    title: s.title,
    description: s.detail.lede,
    alternates: { canonical: `/services/${s.slug}` },
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) notFound();

  const price = parsePriceFrom(service.priceFrom);
  const cases = (service.caseSlugs ?? [])
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/services/${service.slug}/#service`,
    name: service.title,
    description: service.detail.lede,
    serviceType: service.tags,
    url: `${SITE_URL}/services/${service.slug}`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: [
      { '@type': 'Place', name: 'Seattle, WA' },
      { '@type': 'Place', name: 'United States' },
      { '@type': 'Place', name: 'Worldwide (remote)' },
    ],
    ...(price !== undefined && {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price,
        url: `${SITE_URL}/services/${service.slug}`,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
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

          <dl className="detail-meta">
            <div className="detail-meta-cell">
              <dt>Starting from</dt>
              <dd>{service.priceFrom}</dd>
            </div>
            <div className="detail-meta-cell">
              <dt>Typical run</dt>
              <dd>{service.typical}</dd>
            </div>
            <div className="detail-meta-cell">
              <dt>Built for</dt>
              <dd>{service.audience}</dd>
            </div>
          </dl>

          <section className="detail-section">
            <span className="detail-section-label">FIG {service.num}.1 — Deliverables</span>
            <h3>What we hand over</h3>
            <DeliverableGrid items={service.detail.deliverables} />
          </section>

          <section className="detail-section detail-section--flow">
            <span className="detail-section-label">FIG {service.num}.2 — Engagement</span>
            <h3>How we work together</h3>
            <ProcessFlow steps={service.detail.engagement} />
          </section>

          {cases.length > 0 && (
            <section className="detail-section">
              <span className="detail-section-label">FIG {service.num}.3 — Selected work</span>
              <h3>From this practice</h3>
              <ServiceCases cases={cases} />
            </section>
          )}

          <div className="detail-cta">
            <p className="detail-cta-text">
              Need this for your next product? <span className="accent">Start a project.</span>
            </p>
            <StartProjectButton />
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
