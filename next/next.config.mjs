/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // Canonical host is the apex https://qbix.space. Permanently redirect the
  // www subdomain to it so link equity and crawl signals consolidate on one
  // host. (http→https is handled by the platform/CDN.)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.qbix.space' }],
        destination: 'https://qbix.space/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
