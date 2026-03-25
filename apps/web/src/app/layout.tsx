import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Design Studio',
  description: 'Open-source design tool with AI — easier than Figma, bring your own AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
