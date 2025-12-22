import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for smaller bundle & lower memory usage
  output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 60,
  },
  
  experimental: {
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
