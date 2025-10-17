import type { Metadata } from 'next';
import { Inter, Lexend } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const lexend = Lexend({ 
  subsets: ['latin'],
  variable: '--font-lexend',
});

export const metadata: Metadata = {
  title: 'PmitG - Find Your Pudding People',
  description: 'Location-based social platform for organizing and discovering pudding meetup events across Germany',
  keywords: ['pudding', 'meetup', 'social', 'events', 'germany', 'community'],
  authors: [{ name: 'PmitG Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'PmitG - Find Your Pudding People',
    description: 'Location-based social platform for organizing and discovering pudding meetup events across Germany',
    type: 'website',
    locale: 'en_US',
    siteName: 'PmitG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PmitG - Find Your Pudding People',
    description: 'Location-based social platform for organizing and discovering pudding meetup events across Germany',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
