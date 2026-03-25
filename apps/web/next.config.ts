import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@design-studio/canvas',
    '@design-studio/components',
    '@design-studio/tokens',
    '@design-studio/ai',
    '@design-studio/a11y',
    '@design-studio/export',
    '@design-studio/collab',
    '@design-studio/db',
    '@design-studio/app',
    '@design-studio/plugins',
    '@design-studio/ui',
  ],
};

export default nextConfig;
