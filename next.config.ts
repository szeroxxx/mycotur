import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ["localhost", "images.unsplash.com", "avilamycotour.es"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/server/api/image/**',
      },
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "mycotur-secret-key",
    NEXTAUTH_BACKEND_URL: process.env.NEXTAUTH_BACKEND_URL,
  },
};

export default nextConfig;
