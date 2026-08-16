import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
    unoptimized: true, // requerido: la optimización de next/image no funciona en export estático
  },
};

export default nextConfig;
