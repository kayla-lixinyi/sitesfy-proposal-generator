import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer", "@sparticuz/chromium", "pg", "@prisma/adapter-pg"],
};

export default nextConfig;
