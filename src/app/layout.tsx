import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/Toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BuildingBrilliance AI - Financial Creator Economy Platform',
  description: 'AI-driven, enterprise-ready financial creator economy platform where creators are rewarded for empowering their audience with valuable financial education.',
  keywords: [
    'fintech',
    'financial education',
    'creator economy',
    'blockchain',
    'NFT',
    'investment',
    'personal finance',
    'cryptocurrency',
    'AI',
    'machine learning'
  ],
  authors: [{ name: 'BuildingBrilliance AI Team' }],
  creator: 'BuildingBrilliance AI',
  publisher: 'BuildingBrilliance AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://buildingbrilliance.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://buildingbrilliance.ai',
    title: 'BuildingBrilliance AI - Financial Creator Economy Platform',
    description: 'AI-driven, enterprise-ready financial creator economy platform where creators are rewarded for empowering their audience with valuable financial education.',
    siteName: 'BuildingBrilliance AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BuildingBrilliance AI Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuildingBrilliance AI - Financial Creator Economy Platform',
    description: 'AI-driven, enterprise-ready financial creator economy platform where creators are rewarded for empowering their audience with valuable financial education.',
    images: ['/twitter-image.png'],
    creator: '@buildingbrilliance',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}