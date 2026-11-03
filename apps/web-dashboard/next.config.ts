import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  // output: 'standalone' hanya diaktifkan di Docker/Linux CI (di Windows symlink memicu EPERM tanpa izin admin/developer mode)
  output: process.env.BUILD_STANDALONE === 'true' || process.platform !== 'win32' ? 'standalone' : undefined,
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
  async rewrites() {
    const apiTarget = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
      .replace(/\/api\/v1\/?$/, '');
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiTarget}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
