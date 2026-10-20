import type { MetadataRoute } from 'next';

const SITE_URL = 'https://qbix.space';

// Force a static sitemap.xml emitted at build time so it always returns a
// cached 200 — no per-request rendering that could 500 or time out on a cold
// serverless invocation.
export const dynamic = 'force-static';
export const revalidate = false;

// Real content-update dates (bump when the underlying content actually
// changes) rather than `new Date()`, which would make every route look
// "updated today" on each deploy and erode crawl trust.
const HOME_UPDATED = new Date('2026-10-19');     // homepage: flat scenes
const CONTENT_UPDATED = new Date('2026-05-20');  // studio / services / work / labs copy
const STRATA_UPDATED = new Date('2026-10-19');   // Strata product intro page
const OFFERS_UPDATED = new Date('2026-10-19');   // fixed-price offer pages
const BUSINESS_UPDATED = new Date('2026-10-19'); // homepage in its local-business mode

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                 lastModified: HOME_UPDATED,    changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/business`,         lastModified: BUSINESS_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/start`,            lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/products/strata`,  lastModified: STRATA_UPDATED,  changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/listing-kit`,       lastModified: OFFERS_UPDATED,  changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/practice-websites`, lastModified: OFFERS_UPDATED,  changeFrequency: 'monthly', priority: 0.8 },
  ];

  return staticRoutes;
}
