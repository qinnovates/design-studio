import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Launchable',
  description: 'Open-source build orchestration platform — tighter visibility, control, and integration of your builds at scale',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
