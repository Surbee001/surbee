import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore TS errors during production build while we integrate large codebase
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // Redirect /dashboard to /home for backwards compatibility
      {
        source: '/dashboard',
        destination: '/home',
        permanent: true,
      },
      // Redirect old /dashboard/projects to /projects
      {
        source: '/dashboard/projects/:path*',
        destination: '/projects/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/projects',
        destination: '/projects',
        permanent: true,
      },
      // Redirect old /dashboard/marketplace to /marketplace
      {
        source: '/dashboard/marketplace/:path*',
        destination: '/marketplace/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/marketplace',
        destination: '/marketplace',
        permanent: true,
      },
      // Redirect remaining /dashboard paths to /home
      {
        source: '/dashboard/:path*',
        destination: '/home/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'surbee.dev',
      },
      {
        protocol: 'https',
        hostname: '*.surbee.dev',
      },
      {
        protocol: 'https',
        hostname: 'dashboard.surbee.dev',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },
};

export default nextConfig;