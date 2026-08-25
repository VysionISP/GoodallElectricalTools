import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Self-hosted, single-server deployment serving files straight from
    // /public/uploads — skip Next's image optimizer (and its sharp
    // dependency) rather than requiring it in every deployment target.
    unoptimized: true,
  },
};

export default nextConfig;
