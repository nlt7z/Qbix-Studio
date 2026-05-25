import type { MetadataRoute } from 'next';
import { services } from '@/lib/data';

const SITE_URL = 'https://qbix.space';

// Force a static sitemap.xml emitted at build time so it always returns a
// cached 200 — no per-request rendering that could 500 or time out on a cold
// serverless invocation.
export const dynamic = 'force-static';
export const revalidate = false;

// Real content-update dates (bump when the underlying content actually
// changes) rather than `new Date()`, which would make every route look
// "updated today" on each deploy and erode crawl trust.
const HOME_UPDATED = new Date('2026-05-24');     // homepage + selected work refresh
const CONTENT_UPDATED = new Date('2026-05-20');  // studio / services / work / labs copy

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                 lastModified: HOME_UPDATED,    changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/studio`,           lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/press`,            lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/games`,            lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/games/bidking`,    lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/work/bidking`,     lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/work/ai-character-chat`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Lab detail pages are disabled for now, so they're omitted from the sitemap.

  return [...staticRoutes, ...serviceRoutes];
}
