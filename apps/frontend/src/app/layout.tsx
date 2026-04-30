import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login page',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-foreground antialiased">{children}</body>
    </html>
  );
}
