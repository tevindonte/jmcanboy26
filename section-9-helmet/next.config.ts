import type { NextConfig } from "next";

const BASE = "/section-9-helmet";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE,
  assetPrefix: BASE,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE: BASE },
};

export default nextConfig;
