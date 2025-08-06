import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Handle images properly
  images: {
    domains: ['localhost'],
    unoptimized: false
  },
  
  // Transpile packages for Socket.IO compatibility
  transpilePackages: ['socket.io'],
  
  // Enable webpack 5 for better compatibility
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  }
};

export default nextConfig;