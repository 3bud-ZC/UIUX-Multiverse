import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is ten static websites and a lobby — no server work happens at
  // request time, so it is exported to plain files and served from the edge.
  // `npm run build` writes `out/`, which is what Cloudflare Pages publishes.
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  // The dev overlay badge sits exactly where the spectrum rail's first segment
  // is, which makes visual QA of that corner impossible.
  devIndicators: false,
};

export default nextConfig;
