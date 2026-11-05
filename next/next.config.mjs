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
      // Qbix Motion, the motion library: a static copy in public/motion/, made by the library's
      // tools/site.py (~/Desktop/qbix/motion). Its index.html sets <base href="/motion/">.
      { source: '/motion', destination: '/motion/index.html' },
    ];
  },
};

export default nextConfig;
