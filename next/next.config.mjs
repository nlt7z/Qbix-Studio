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

  // Permanent redirects for routes that have been removed, so old links and
  // search-index entries land somewhere live instead of 404ing.
  async redirects() {
    return [
      { source: '/studio', destination: '/', permanent: true },
      { source: '/studio/:path*', destination: '/', permanent: true },
      // /work/bidking has a live counterpart at the games route — keep it useful.
      { source: '/work/bidking', destination: '/games/bidking', permanent: true },
      { source: '/work/:path*', destination: '/', permanent: true },
      { source: '/labs/:path*', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
