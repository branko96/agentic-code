import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Sign in with your existing backend account.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-foreground antialiased">{children}</body>
    </html>
  );
}
