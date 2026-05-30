const plans = [
  {
    name: 'الباقة الأساسية',
    price: '500',
    desc: 'مثالية للمبتدئين',
    features: ['2 جلسات تدريب أسبوعياً', 'خطة غذائية أساسية', 'متابعة شهرية', 'دعم عبر الواتساب'],
    missing: ['قياسات جسم دورية', 'تقارير مفصلة', 'أولوية الدعم'],
  },
  {
    name: 'الباقة المتقدمة',
    price: '900',
    desc: 'الخيار الأمثل للنتائج السريعة',
    featured: true,
    features: ['4 جلسات تدريب أسبوعياً', 'خطة غذائية بنظام التبادل', 'متابعة أسبوعية', 'قياسات جسم شهرية', 'تقارير تقدم مفصلة', 'بوابة عميل شخصية'],
    missing: ['أولوية الدعم'],
  },
  {
    name: 'الباقة الاحترافية',
    price: '1,500',
    desc: 'للمحترفين فقط',
    features: ['6 جلسات تدريب أسبوعياً', 'خطة غذائية + تكيفات دورية', 'متابعة يومية', 'قياسات + تقارير مفصلة', 'أولوية الدعم المباشر', 'استشارات غير محدودة'],
    missing: [],
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-gold-400 font-bold text-center text-xs uppercase tracking-widest mb-3">الأسعار</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3 tracking-tight">
          اختر الباقة المناسبة لك
        </h2>
        <p className="text-white/30 text-center max-w-xl mx-auto font-medium">
          باقات مرنة بأسعار في متناول الجميع — بدون عقود ملزمة
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14 items-start">
          {plans.map(p => (
            <div key={p.name}
              className={`relative rounded-2xl p-7 border transition-all
                ${p.featured
                  ? 'bg-gold-400 border-gold-400 scale-[1.03] shadow-2xl shadow-gold-400/20'
                  : 'bg-white/3 border-white/8 hover:border-white/20'}`}>

              {p.featured && (
                <div className="absolute -top-3.5 right-6 bg-[#0a0a0a] text-gold-400 text-xs font-extrabold px-3 py-1 rounded-full border border-gold-400/30">
                  ⭐ الأكثر طلباً
                </div>
              )}

              <h3 className={`font-extrabold text-lg mb-1 ${p.featured ? 'text-black' : 'text-white'}`}>
                {p.name}
              </h3>
              <p className={`text-sm mb-5 ${p.featured ? 'text-black/50' : 'text-white/30'}`}>{p.desc}</p>

              <div className="flex items-end gap-1 mb-6">
                <span className={`text-4xl font-extrabold ${p.featured ? 'text-black' : 'text-white'}`}>
                  {p.price}
                </span>
                <span className={`text-sm mb-1 ${p.featured ? 'text-black/50' : 'text-white/30'}`}>ر.ق / شهر</span>
              </div>

              <a href="/register"
                className={`block text-center font-extrabold py-3 rounded-xl mb-6 transition-all text-sm
                  ${p.featured
                    ? 'bg-black text-gold-400 hover:bg-black/80'
                    : 'bg-gold-400 text-black hover:bg-gold-300'}`}>
                اشترك الآن
              </a>

              <ul className="space-y-2.5">
                {p.features.map(f => (
                  <li key={f} className={`flex items-center gap-2.5 text-sm font-medium
                    ${p.featured ? 'text-black/80' : 'text-white/50'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0
                      ${p.featured ? 'bg-black/10 text-black' : 'bg-gold-400/10 text-gold-400'}`}>✓</span>
                    {f}
                  </li>
                ))}
                {p.missing.map(f => (
                  <li key={f} className={`flex items-center gap-2.5 text-sm line-through
                    ${p.featured ? 'text-black/25' : 'text-white/15'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0
                      ${p.featured ? 'bg-black/5' : 'bg-white/5'}`}>✕</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-white/20 text-sm mt-10">
          لست متأكداً؟{' '}
          <a href="#contact" className="text-gold-400 font-bold hover:text-gold-300 transition">
            تواصل معنا للحصول على استشارة مجانية
          </a>
        </p>
      </div>
    </section>
  )
}
