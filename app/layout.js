import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata = {
  title: 'Amine-Fit | التدريب الشخصي الاحترافي',
  description: 'برامج تدريب وتغذية مخصصة لتحقيق أهدافك — خطط غذائية بنظام التبادل مع متابعة يومية',
  keywords: 'تدريب شخصي, تغذية, حمية, لياقة بدنية, كوتش, مدرب شخصي',
  openGraph: {
    title: 'Amine-Fit',
    description: 'برامج تدريب وتغذية مخصصة',
    locale: 'ar',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased">{children}</body>
    </html>
  )
}
