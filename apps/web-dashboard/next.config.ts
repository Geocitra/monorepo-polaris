import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Memangkas dependensi monorepo ke ukuran minimal
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
