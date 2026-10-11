import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Colophon from '@/components/Colophon';
import BrandText from '@/components/BrandText';
import StartProjectButton from '@/components/StartProjectButton';
import SplitText from '@/components/SplitText';
import ServiceCases from '@/components/ServiceCases';
import { projects, services } from '@/lib/data';
import SubHero from '@/components/sub/SubHero';
import SubSection from '@/components/sub/SubSection';
import ServiceHeroScene from '@/components/sub/ServiceHeroScene';

const SITE_URL = 'https://qbix.space';

// "$20k" / "$2k" → 20000 / 2000 (for Offer.price); undefined if unparseable.
function parsePriceFrom(price: string): number | undefined {
  const m = price.replace(/,/g, '').match(/([\d.]+)\s*k?/i);   // "$5,000" → 5000
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

  const pad = (n: number) => String(n).padStart(2, '0');
  const split = (t: string) => {
    const i = t.indexOf(' — ');
    return i === -1 ? { lead: t, rest: '' } : { lead: t.slice(0, i), rest: t.slice(i + 3) };
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <main className="sp">
        <SubHero
          crumb={{ href: '/#services', label: 'Services' }}
          eyebrow={`Service ${service.num}`}
          title={<BrandText>{service.title}</BrandText>}
          lede={<BrandText>{service.detail.lede}</BrandText>}
          actions={
            <>
              <StartProjectButton />
              <Link href="/#services" className="btn btn-secondary btn-lg split-cta">
                <SplitText text="All services" arrow />
              </Link>
            </>
          }
          visual={<ServiceHeroScene slug={service.slug} />}
          meta={[
            { k: 'Starting from', v: service.priceFrom },
            { k: 'Typical run', v: service.typical },
            { k: 'Built for', v: service.audience },
          ]}
        />

        <SubSection index={`${service.num}.1 — Deliverables`} title="What we hand over" narrow>
          <ol className="sp-list">
            {service.detail.deliverables.map((d, i) => {
              const { lead, rest } = split(d);
              return (
                <li key={d}>
                  <span className="n mono">{pad(i + 1)}</span>
                  <span>
                    <strong>{lead}</strong>
                    {rest && <span className="rest">{rest}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </SubSection>

        <SubSection tone="lime" index={`${service.num}.2 — Engagement`} title="How we work together">
          <ol className="sp-steps">
            {service.detail.engagement.map((step, i) => (
              <li key={step.k}>
                <span className="sp-step-n">{pad(i + 1)}</span>
                <span className="sp-step-k">{step.k}</span>
                <span className="sp-step-v">{step.v}</span>
              </li>
            ))}
          </ol>
        </SubSection>

        {cases.length > 0 && (
          <SubSection index={`${service.num}.3 — Selected work`} title="From this practice">
            <ServiceCases cases={cases} />
          </SubSection>
        )}

        <section className="sp-close" data-nav-theme="dark">
          <div className="container sp-close-inner">
            <p className="sp-close-line">
              Need this for your next product? <span className="accent">Start a project.</span>
            </p>
            <StartProjectButton />
          </div>
        </section>
      </main>
      <Colophon />
    </>
  );
}
