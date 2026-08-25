import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Self-hosted, single-server deployment serving files straight from
    // /public/uploads — skip Next's image optimizer (and its sharp
    // dependency) rather than requiring it in every deployment target.
    unoptimized: true,
  },
  // `next dev` only accepts requests to its hostname (localhost by default)
  // and 403s its own JS bundles otherwise — which silently breaks every
  // button (Server Actions never load) while plain links keep working —
  // when the app is opened from another device's IP on the LAN (e.g.
  // testing on a phone during development). Production (`next start`) has
  // no such restriction; this only affects `npm run dev`. Next only
  // matches exact hosts or a literal "*" per dot-segment (no CIDR), so
  // list the common private-LAN patterns explicitly.
  allowedDevOrigins: [
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "172.17.*.*",
    "172.18.*.*",
    "172.19.*.*",
    "172.20.*.*",
    "172.21.*.*",
    "172.22.*.*",
    "172.23.*.*",
    "172.24.*.*",
    "172.25.*.*",
    "172.26.*.*",
    "172.27.*.*",
    "172.28.*.*",
    "172.29.*.*",
    "172.30.*.*",
    "172.31.*.*",
  ],
};

export default nextConfig;
