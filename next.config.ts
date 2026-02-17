import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
    ],
    // Allow serving images from the /disk directory
    localPatterns: [
      {
        pathname: "/disk/uploads/**",
      },
    ],
  },
  // Expose the /disk directory as static files
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/disk/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
