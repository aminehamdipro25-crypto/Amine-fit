import Link from 'next/link'
import { Zap } from 'lucide-react'

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
            <p className="text-white/25 text-sm leading-relaxed max-w-sm font-medium">
              منصة متكاملة للتدريب الشخصي والتغذية — برامج مخصصة بنظام التبادل
              الغذائي المعتمد، مع متابعة يومية لضمان وصولك لهدفك.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-extrabold mb-4 text-sm uppercase tracking-wide">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['#services', 'الخدمات'],
                ['#pricing',  'الأسعار'],
                ['#contact',  'تواصل معنا'],
                ['/dashboard','لوحة التحكم'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-white/30 hover:text-white transition-colors font-medium">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-extrabold mb-4 text-sm uppercase tracking-wide">قانوني</h4>
            <ul className="space-y-2.5 text-sm">
              {['سياسة الخصوصية', 'شروط الاستخدام', 'سياسة الإلغاء'].map(t => (
                <li key={t}>
                  <span className="text-white/30 hover:text-white transition-colors cursor-pointer font-medium">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/20 text-sm font-medium">
          <p>© {new Date().getFullYear()} AmineFit. جميع الحقوق محفوظة.</p>
          <p>الدوحة، قطر · +974 3065 3759</p>
        </div>
      </div>
    </footer>
  )
}
