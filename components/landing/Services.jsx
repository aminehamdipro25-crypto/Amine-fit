const services = [
  {
    icon: '🏋️',
    title: 'التدريب الشخصي',
    desc: 'برامج تدريبية مخصصة بالكامل لجسمك وهدفك — سواء كان خسارة وزن، بناء عضلات، أو تحسين اللياقة العامة.',
    features: ['تمارين مكيّفة مع مستواك', 'جدول أسبوعي مرن', 'شرح كامل لكل تمرين', 'تعديل دوري حسب تقدمك'],
    color: 'from-primary-500 to-primary-700',
    bg: 'bg-primary-50',
    border: 'border-primary-100',
  },
  {
    icon: '🥗',
    title: 'التخطيط الغذائي',
    desc: 'خطط غذائية دقيقة بنظام جداول التبادل المعتمد — توزيع مثالي للسعرات والماكرو على وجباتك اليومية.',
    features: ['حاسبة BMR/TDEE دقيقة', 'نظام التبادل الغذائي الـ 6', 'توزيع 5 وجبات يومياً', 'أمثلة تطبيقية واضحة'],
    color: 'from-emerald-500 to-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    featured: true,
  },
  {
    icon: '📊',
    title: 'المتابعة والدعم',
    desc: 'متابعة منتظمة لقياساتك ونتائجك — تقارير تفصيلية وتواصل مستمر لضمان وصولك للهدف في الوقت المحدد.',
    features: ['قياسات جسم دورية', 'تقارير تقدم مفصلة', 'دعم مباشر عبر الهاتف', 'تعديلات حسب النتائج'],
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
]

export default function Services() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-primary-600 font-bold text-center text-sm uppercase tracking-wider mb-2">خدماتنا</p>
        <h2 className="section-title">كل ما تحتاجه لتحقيق هدفك</h2>
        <p className="section-sub">نقدم حلاً متكاملاً يجمع بين التدريب والتغذية والمتابعة المستمرة</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {services.map(s => (
            <div key={s.title}
              className={`relative rounded-3xl border ${s.border} ${s.bg} p-7 card-hover
                ${s.featured ? 'ring-2 ring-emerald-400 shadow-xl shadow-emerald-100' : ''}`}>

              {s.featured && (
                <div className="absolute -top-3 right-6 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  الأكثر طلباً
                </div>
              )}

              <div className={`w-14 h-14 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg`}>
                {s.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{s.desc}</p>

              <ul className="space-y-2">
                {s.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm text-xs">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
