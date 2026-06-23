const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'

export const metadata = {
  title: 'سجّل الآن — استبيان التقييم الأولي',
  description: 'سجّل بياناتك في 5 خطوات سريعة ليصمم لك المدرب أمين حمدي برنامج تدريب وتغذية مخصص بالكامل حسب هدفك وحالتك الصحية.',
  alternates: { canonical: `${BASE}/register` },
  openGraph: {
    title: 'سجّل الآن في Amine-Fit — استبيان التقييم الأولي',
    description: 'برنامج تدريب وتغذية مخصص بالكامل من المدرب أمين حمدي. سجّل بياناتك الآن وابدأ رحلتك.',
    url: `${BASE}/register`,
    type: 'website',
  },
  robots: { index: false, follow: true },
}

export default function RegisterLayout({ children }) {
  return children
}
