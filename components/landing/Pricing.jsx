const plans = [
  {
    name: 'الباقة الأساسية',
    price: '3,000',
    period: 'دج / شهر',
    desc: 'مثالية للمبتدئين الذين يريدون الانطلاق',
    color: 'border-slate-200',
    btn: 'bg-slate-800 hover:bg-slate-900',
    features: [
      '2 جلسات تدريب أسبوعياً',
      'خطة غذائية أساسية',
      'متابعة شهرية',
      'دعم عبر الواتساب',
    ],
    missing: ['قياسات جسم دورية', 'تقارير مفصلة', 'أولوية الدعم'],
  },
  {
    name: 'الباقة المتقدمة',
    price: '6,000',
    period: 'دج / شهر',
    desc: 'الخيار الأمثل للحصول على نتائج سريعة',
    featured: true,
    color: 'border-primary-500',
    btn: 'bg-gradient-to-r from-primary-600 to-emerald-500 hover:from-primary-700 hover:to-emerald-600',
    features: [
      '4 جلسات تدريب أسبوعياً',
      'خطة غذائية بنظام التبادل',
      'متابعة أسبوعية',
      'قياسات جسم شهرية',
      'تقارير تقدم مفصلة',
    ],
    missing: ['أولوية الدعم'],
  },
  {
    name: 'الباقة الاحترافية',
    price: '10,000',
    period: 'دج / شهر',
    desc: 'للمحترفين الذين يريدون الأفضل فقط',
    color: 'border-amber-400',
    btn: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    features: [
      '6 جلسات تدريب أسبوعياً',
      'خطة غذائية + تكيفات دورية',
      'متابعة يومية',
      'قياسات + تقارير مفصلة',
      'أولوية الدعم المباشر',
      'استشارات غير محدودة',
    ],
    missing: [],
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-primary-600 font-bold text-center text-sm uppercase tracking-wider mb-2">الأسعار</p>
        <h2 className="section-title">اختر الباقة المناسبة لك</h2>
        <p className="section-sub">باقات مرنة بأسعار في متناول الجميع — بدون عقود ملزمة</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 items-start">
          {plans.map(p => (
            <div key={p.name}
              className={`relative rounded-3xl border-2 ${p.color} p-7
                ${p.featured ? 'shadow-2xl shadow-primary-100 scale-105' : 'shadow-sm hover:shadow-md'}
                transition-all duration-300`}>

              {p.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2
                  bg-gradient-to-r from-primary-600 to-emerald-500 text-white text-sm font-bold
                  px-6 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                  ⭐ الأكثر طلباً
                </div>
              )}

              <h3 className="font-bold text-slate-900 text-xl mb-1">{p.name}</h3>
              <p className="text-slate-500 text-sm mb-5">{p.desc}</p>

              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                <span className="text-slate-500 text-sm mb-1">{p.period}</span>
              </div>

              <a href="/register"
                className={`block text-center text-white font-bold py-3 rounded-2xl ${p.btn} transition-all mb-7 shadow-md`}>
                اشترك الآن
              </a>

              <ul className="space-y-2.5">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                    {f}
                  </li>
                ))}
                {p.missing.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-400 line-through">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs">✕</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-400 text-sm mt-10">
          لست متأكداً؟ <a href="#contact" className="text-primary-600 font-semibold hover:underline">تواصل معنا للحصول على استشارة مجانية</a>
        </p>
      </div>
    </section>
  )
}
