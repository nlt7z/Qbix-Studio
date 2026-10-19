/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // Note: www↔apex canonicalization is handled at the Vercel platform level
  // (domain settings), so we deliberately do NOT add an app-level host
  // redirect here — doing so conflicts with the platform redirect and causes
  // an infinite loop.

  // Client sample pages are static files in public/samples/<slug>/index.html;
  // serve them at /samples/<slug> without the index.html.
  async rewrites() {
    return [
      { source: '/samples/:slug', destination: '/samples/:slug/index.html' },
    ];
  },

  // Permanent redirects for routes that have been removed, so old links and
  // search-index entries land somewhere live instead of 404ing.
  async redirects() {
    return [
      { source: '/studio', destination: '/', permanent: true },
      { source: '/studio/:path*', destination: '/', permanent: true },
      { source: '/work/:path*', destination: '/', permanent: true },
      { source: '/labs/:path*', destination: '/', permanent: true },
      { source: '/games', destination: '/', permanent: true },
      { source: '/games/:path*', destination: '/', permanent: true },
      { source: '/press', destination: '/', permanent: true },
      { source: '/services/:path*', destination: '/#services', permanent: true },
    ];
  },
};

export default nextConfig;
