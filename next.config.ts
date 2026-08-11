import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The dev overlay badge sits exactly where the spectrum rail's first segment
  // is, which makes visual QA of that corner impossible.
  devIndicators: false,
};

export default nextConfig;
