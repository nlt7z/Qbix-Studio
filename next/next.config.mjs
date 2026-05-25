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
};

export default nextConfig;
