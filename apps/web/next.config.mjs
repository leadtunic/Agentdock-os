/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@agentdock/ui', '@agentdock/shared', '@agentdock/protocol']
};

export default nextConfig;
