const testimonials = [
  {
    name: 'أحمد بن علي',
    role: 'خسر 18 كغ في 4 أشهر',
    avatar: 'أ',
    color: 'bg-primary-500',
    stars: 5,
    text: 'كنت أحاول لسنوات بدون نتيجة. مع Amine-Fit وخطة التبادل الغذائي، فقدت 18 كغ في 4 أشهر فقط! المتابعة الأسبوعية غيّرت كل شيء.',
  },
  {
    name: 'سارة بنت محمد',
    role: 'بنت 8 كغ عضلات في 6 أشهر',
    avatar: 'س',
    color: 'bg-pink-500',
    stars: 5,
    text: 'الخطة الغذائية دقيقة جداً ومناسبة لظروفي كأم. الحاسبة الغذائية رائعة وتساعدني على فهم ما آكله بالضبط.',
  },
  {
    name: 'يوسف الأمين',
    role: 'تحسين لياقة عامة',
    avatar: 'ي',
    color: 'bg-emerald-500',
    stars: 5,
    text: 'لوحة التحكم ونظام التبادل شرحا لي التغذية بطريقة ما فهمتها قط. أفضل استثمار في حياتي لصحتي.',
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-primary-600 font-bold text-center text-sm uppercase tracking-wider mb-2">آراء العملاء</p>
        <h2 className="section-title">ماذا يقول مشتركونا</h2>
        <p className="section-sub">قصص نجاح حقيقية من أشخاص غيّروا حياتهم</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {testimonials.map(t => (
            <div key={t.name}
              className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm card-hover">

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-lg">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`w-11 h-11 rounded-full ${t.color} text-white flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-emerald-600 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
