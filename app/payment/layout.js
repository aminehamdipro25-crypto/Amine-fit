const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'

export const metadata = {
  title: 'الدفع والاشتراك',
  description: 'اختر باقتك وأكمل الدفع عبر D17، البريد التونسي، فورا، أو البطاقة البنكية. تفعيل فوري لحسابك في Amine-Fit بعد التأكيد.',
  alternates: { canonical: `${BASE}/payment` },
  openGraph: {
    title: 'الدفع والاشتراك — Amine-Fit',
    description: 'اختر باقتك وأكمل الدفع لتفعيل حسابك في Amine-Fit فوراً.',
    url: `${BASE}/payment`,
    type: 'website',
  },
  robots: { index: false, follow: true },
}

export default function PaymentLayout({ children }) {
  return children
}
