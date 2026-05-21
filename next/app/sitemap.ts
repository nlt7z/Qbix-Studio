import type { MetadataRoute } from 'next';
import { services, labCards } from '@/lib/data';

const SITE_URL = 'https://qbix.space';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                 lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/studio`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/press`,            lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/games`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/games/bidking`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/work/bidking`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/work/ai-character-chat`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const labRoutes: MetadataRoute.Sitemap = labCards.map((l) => ({
    url: `${SITE_URL}/labs/${l.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...labRoutes];
}
