import { Cairo } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import WhatsAppButton from '@/components/landing/WhatsAppButton'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
})

const BASE_URL = 'https://amine-fit.vercel.app'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Amine-Fit | مدرب شخصي ومستشار تغذية — الدوحة، قطر',
    template: '%s | Amine-Fit',
  },
  description: 'أمين حمدي — مدرب لياقة بدنية معتمد بخلفية عسكرية نخبوية. برامج تدريب وتغذية مخصصة في الدوحة قطر. أكثر من 10 سنوات خبرة مع القوات الخاصة والغواصين البحريين.',
  keywords: [
    'مدرب شخصي قطر', 'تدريب شخصي الدوحة', 'مستشار تغذية قطر',
    'كوتش لياقة', 'تخسيس وزن', 'بناء عضلات', 'يوغا علاجية',
    'personal trainer qatar', 'fitness coach doha', 'nutrition coach',
    'أمين حمدي', 'amine hamdi fitness',
  ],
  authors: [{ name: 'أمين حمدي', url: BASE_URL }],
  creator: 'أمين حمدي',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'ar_QA',
    alternateLocale: 'en_US',
    url: BASE_URL,
    siteName: 'Amine-Fit',
    title: 'Amine-Fit | مدرب شخصي ومستشار تغذية — الدوحة، قطر',
    description: 'أمين حمدي — 10+ سنوات تدريب القوات الخاصة والغواصين. برامج تدريب وتغذية مخصصة لتحقيق هدفك.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Amine-Fit — مدرب شخصي ومستشار تغذية' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amine-Fit | مدرب شخصي ومستشار تغذية',
    description: 'أمين حمدي — برامج تدريب وتغذية مخصصة في الدوحة، قطر',
    images: ['/og-image.png'],
    creator: '@aminefit',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <meta name="theme-color" content="#fbbf24" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-cairo antialiased">
        {GA_ID && <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}</Script>
        </>}
        {children}
        <WhatsAppButton />
      </body>
    </html>
  )
}
