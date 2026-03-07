/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable telemetry in sandbox
  env: { NEXT_TELEMETRY_DISABLED: '1' },
  // Hide all Next.js dev indicators (the N icon at bottom-left)
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
};
module.exports = nextConfig;
