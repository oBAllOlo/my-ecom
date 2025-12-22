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
    // Minimize image optimization in production to save memory
    minimumCacheTTL: 60,
  },
  
  // Reduce memory during build
  experimental: {
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
