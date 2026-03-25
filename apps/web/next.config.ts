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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.openai.com https://api.anthropic.com https://openrouter.ai http://localhost:*",
              "frame-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
