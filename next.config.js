/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase the body size limit for server actions
    },
  },
};

module.exports = nextConfig;
