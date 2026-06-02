import Link from 'next/link'
import { Zap } from 'lucide-react'

const legalLinks = [
  { href: '/legal/privacy',      label: 'سياسة الخصوصية' },
  { href: '/legal/terms',        label: 'شروط الاستخدام' },
  { href: '/legal/cancellation', label: 'سياسة الإلغاء' },
]

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gold-400 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" fill="black" />
              </div>
              <span className="text-white font-extrabold text-lg tracking-wider uppercase">
                Amine<span className="text-gold-400">Fit</span>
              </span>
            </div>
            <p className="text-white/25 text-sm leading-relaxed max-w-sm font-medium mb-5">
              منصة متكاملة للتدريب الشخصي والتغذية — برامج مخصصة بنظام التبادل
              الغذائي المعتمد، مع متابعة يومية لضمان وصولك لهدفك.
            </p>
            <a href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-400 text-black font-extrabold text-sm rounded-xl hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20">
              <Zap className="w-4 h-4" fill="black" />
              ابدأ رحلتك الآن
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-extrabold mb-4 text-sm uppercase tracking-wide">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['#services',      'الخدمات'],
                ['#how',           'كيف يعمل'],
                ['#pricing',       'الأسعار'],
                ['#contact',       'تواصل معنا'],
                ['/register',      'التسجيل'],
                ['/client/login',  'دخول العميل'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-white/30 hover:text-gold-400 transition-colors font-medium">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-extrabold mb-4 text-sm uppercase tracking-wide">قانوني</h4>
            <ul className="space-y-2.5 text-sm">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/30 hover:text-gold-400 transition-colors font-medium">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-3 bg-white/3 rounded-xl border border-white/5">
              <p className="text-white/30 text-xs font-medium leading-relaxed">
                🔒 بياناتك محمية ومشفرة بالكامل. لا نشارك معلوماتك مع أي طرف ثالث.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/20 text-sm font-medium">
          <p>© {new Date().getFullYear()} AmineFit. جميع الحقوق محفوظة.</p>
          <p dir="ltr" className="text-right sm:text-left">
            <a href="tel:+97430653759" className="hover:text-gold-400 transition">+974 3065 3759</a>
            {' '}· تونس
          </p>
        </div>
      </div>
    </footer>
  )
}
