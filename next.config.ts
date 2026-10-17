import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/heratmap",
  assetPrefix: "/heratmap",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
