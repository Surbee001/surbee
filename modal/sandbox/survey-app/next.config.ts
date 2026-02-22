import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow Modal tunnel origins to connect to dev server
  allowedDevOrigins: ["*.modal.run"],
};

export default nextConfig;
