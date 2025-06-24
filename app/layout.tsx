import type { Metadata } from 'next'
import { Inter, Poppins, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-poppins',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: {
    default: '90days. - Build Better Habits',
    template: '%s | 90days.'
  },
  description: 'A 3 month journey to build better habits with 90days. Track your daily habits, build streaks, and transform your life one day at a time.',
  keywords: ['habits', 'productivity', '90 days', 'habit tracker', 'self improvement', 'daily habits', 'streak tracker'],
  authors: [{ name: '90days Team' }],
  creator: '90days',
  publisher: '90days',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' }
  ],
  colorScheme: 'light dark',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '90days.',
    startupImage: [
      {
        url: '/apple-touch-icon.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)'
      }
    ]
  },
  applicationName: '90days. Habit Tracker',
  referrer: 'origin-when-cross-origin',
  category: 'productivity',
  classification: 'Productivity App',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: '90days. - Build Better Habits',
    title: '90days. - Build Better Habits',
    description: 'A 3 month journey to build better habits. Track your daily habits, build streaks, and transform your life one day at a time.',
    images: [
      {
        url: '/strive.png',
        width: 1200,
        height: 630,
        alt: '90days. Habit Tracker App'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '90days. - Build Better Habits',
    description: 'A 3 month journey to build better habits. Track your daily habits, build streaks, and transform your life.',
    images: ['/strive.png'],
    creator: '@90daysapp'
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#0ea5e9'
      }
    ]
  },
  manifest: '/manifest.json',
  other: {
    'msapplication-TileColor': '#0ea5e9',
    'msapplication-config': '/browserconfig.xml'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="90days." />
        <meta name="application-name" content="90days." />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${spaceGrotesk.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
