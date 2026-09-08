import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── Hostinger static export ──────────────────────────────────────────────
  // Generates a fully static `out/` folder that can be uploaded to any
  // shared hosting (Hostinger, cPanel, etc.) without needing Node.js.
  output: 'export',
  // trailingSlash produces /tienda/abc/index.html which Apache serves reliably
  trailingSlash: true,

  // Preserve scroll position when navigating back with the browser button
  experimental: {
    scrollRestoration: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    unoptimized: true, // required for static export — Next/Image optimization needs a server
  },
};

export default nextConfig;
