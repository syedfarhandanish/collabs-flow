import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // This allows production builds to successfully complete even if the linter crashes.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;