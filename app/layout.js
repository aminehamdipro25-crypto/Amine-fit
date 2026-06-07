import { Cairo } from 'next/font/google'
import Script from 'next/script'
import SwRegister from '@/components/SwRegister'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Amine-Fit | مدرب شخصي ومدرب تغذية — قطر والعالم العربي',
    template: '%s | Amine-Fit',
  },
  description: 'أمين حمدي — مدرب لياقة بدنية ومدرب تغذية معتمد بخلفية عسكرية نخبوية. الدوحة، قطر. برامج تدريب وتغذية مخصصة أونلاين للعالم العربي. أكثر من 10 سنوات خبرة مع القوات الخاصة والغواصين البحريين.',
  keywords: [
    'مدرب شخصي قطر', 'كوتش لياقة قطر', 'مدرب تغذية قطر', 'مدرب شخصي الدوحة',
    'مدرب شخصي تونس', 'كوتش لياقة تونس', 'مدرب تغذية تونس',
    'برنامج تغذية اونلاين', 'تخسيس وزن', 'بناء عضلات', 'كوتش اونلاين عربي',
    'personal trainer qatar', 'coach sportif doha', 'coach nutrition qatar',
    'coach sportif tunisie', 'coach nutrition tunisie', 'programme fitness',
    'أمين حمدي', 'amine hamdi fitness', 'aminefit',
  ],
  authors: [{ name: 'أمين حمدي', url: BASE_URL }],
  creator: 'أمين حمدي',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'ar_QA',
    alternateLocale: 'ar_TN',
    url: BASE_URL,
    siteName: 'Amine-Fit',
    title: 'Amine-Fit | مدرب شخصي ومدرب تغذية — الدوحة، قطر',
    description: 'أمين حمدي — خبرة عسكرية نخبوية + 10 سنوات تدريب. برامج تدريب وتغذية مخصصة أونلاين للعالم العربي من الدوحة.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Amine-Fit — مدرب شخصي ومدرب تغذية، الدوحة قطر' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amine-Fit | مدرب شخصي ومدرب تغذية — الدوحة، قطر',
    description: 'أمين حمدي — خبرة عسكرية نخبوية. برامج تدريب وتغذية مخصصة أونلاين للعالم العربي من الدوحة.',
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Amine-Fit',
  description: 'أمين حمدي — مدرب لياقة بدنية ومدرب تغذية معتمد بخلفية عسكرية نخبوية. برامج تدريب وتغذية مخصصة أونلاين.',
  url: 'https://amine-fit.com',
  telephone: '+97430653759',
  address: { '@type': 'PostalAddress', addressLocality: 'الدوحة', addressCountry: 'QA' },
  priceRange: '50–300 TND',
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '5', reviewCount: '100', bestRating: '5' },
  founder: {
    '@type': 'Person',
    name: 'أمين حمدي',
    jobTitle: 'مدرب شخصي ومدرب تغذية معتمد',
    sameAs: ['https://amine-fit.com'],
  },
  offers: [
    { '@type': 'Offer', name: 'برنامج التدريب', price: '50', priceCurrency: 'TND' },
    { '@type': 'Offer', name: 'الباقة الشهرية', price: '125', priceCurrency: 'TND' },
    { '@type': 'Offer', name: 'باقة 3 أشهر',    price: '300', priceCurrency: 'TND' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <meta name="theme-color" content="#fbbf24" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AmineFit" />
        <link rel="apple-touch-icon" href="/icon" />
      </head>
      <body className="font-cairo antialiased">
        {GA_ID && <>
          {/* Define gtag synchronously so trackEvent() calls in useEffect are never dropped */}
          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}` }} />
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}</Script>
        </>}
        <SwRegister />
        {children}
      </body>
    </html>
  )
}
