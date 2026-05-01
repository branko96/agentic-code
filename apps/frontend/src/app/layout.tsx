import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bienvenido de nuevo',
  description: 'Introduce tus credenciales para acceder a tu cuenta',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-foreground antialiased">{children}</body>
    </html>
  );
}
