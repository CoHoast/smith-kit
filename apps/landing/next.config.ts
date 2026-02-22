import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use default server mode for Railway deployment
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
