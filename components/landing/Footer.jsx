import Link from 'next/link'
import { Dumbbell } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-emerald-500 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-extrabold text-lg">Amine-Fit</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              منصة متكاملة للتدريب الشخصي والتغذية — برامج مخصصة بنظام التبادل الغذائي المعتمد، مع متابعة يومية لضمان وصولك لهدفك.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['#services', 'الخدمات'],
                ['#pricing',  'الأسعار'],
                ['#contact',  'تواصل معنا'],
                ['/dashboard','لوحة التحكم'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-slate-400 hover:text-white transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">قانوني</h4>
            <ul className="space-y-2 text-sm">
              {['سياسة الخصوصية', 'شروط الاستخدام', 'سياسة الإلغاء'].map(t => (
                <li key={t}>
                  <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Amine-Fit. جميع الحقوق محفوظة.</p>
          <p>صُنع بـ ❤️ من أجل صحتك ولياقتك</p>
        </div>
      </div>
    </footer>
  )
}
