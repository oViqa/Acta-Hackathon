import type { Metadata } from 'next'
import { Inter, Lexend } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' })

export const metadata: Metadata = {
  title: 'Pudding mit Gabel - Find your pudding people',
  description: 'Connect with pudding enthusiasts and join meetups across Germany',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lexend.variable} font-sans`}>
        <ThemeProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
