import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer", "@sparticuz/chromium", "pg", "@prisma/adapter-pg"],
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
