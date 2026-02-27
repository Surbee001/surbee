/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable telemetry in sandbox
  env: { NEXT_TELEMETRY_DISABLED: '1' },
};
module.exports = nextConfig;
