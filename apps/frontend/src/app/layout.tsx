import type { Metadata } from 'next'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agentic Code Auth',
  description: 'Frontend auth flow for the Agentic Code monorepo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
