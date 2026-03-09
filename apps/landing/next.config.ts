import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use default server mode for Railway deployment
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
