import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Site Analyzer Pro',
  description: 'Analyze websites for CTA functionality, forms, SEO, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-gray-50">{children}</body>
    </html>
  );
}
