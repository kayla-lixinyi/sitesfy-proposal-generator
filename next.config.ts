import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer", "@sparticuz/chromium", "pg", "@prisma/adapter-pg"],
  outputFileTracingIncludes: {
    "/api/proposals/[id]/export-pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
