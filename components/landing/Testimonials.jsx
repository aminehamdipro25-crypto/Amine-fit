const testimonials = [
  {
    name: 'أحمد بن علي',
    role: 'خسر 18 كغ في 4 أشهر',
    avatar: 'أ',
    text: 'كنت أحاول لسنوات بدون نتيجة. مع Amine-Fit وخطة التبادل الغذائي، فقدت 18 كغ في 4 أشهر فقط! المتابعة الأسبوعية غيّرت كل شيء.',
  },
  {
    name: 'سارة بنت محمد',
    role: 'بنت 8 كغ عضلات في 6 أشهر',
    avatar: 'س',
    text: 'الخطة الغذائية دقيقة جداً ومناسبة لظروفي كأم. الحاسبة الغذائية رائعة وتساعدني على فهم ما آكله بالضبط.',
  },
  {
    name: 'يوسف الأمين',
    role: 'تحسين لياقة عامة',
    avatar: 'ي',
    text: 'البوابة الشخصية ونظام التبادل شرحا لي التغذية بطريقة ما فهمتها قط. أفضل استثمار في حياتي لصحتي.',
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-gold-400 font-bold text-center text-xs uppercase tracking-widest mb-3">آراء العملاء</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3 tracking-tight">
          ماذا يقول مشتركونا
        </h2>
        <p className="text-white/30 text-center max-w-xl mx-auto font-medium">
          قصص نجاح حقيقية من أشخاص غيّروا حياتهم
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">
          {testimonials.map(t => (
            <div key={t.name}
              className="bg-white/3 border border-white/8 rounded-2xl p-7 hover:border-white/20 hover:-translate-y-1 transition-all">

              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-gold-400 text-base">★</span>
                ))}
              </div>

              <p className="text-white/40 text-sm leading-relaxed mb-6 font-medium">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-11 h-11 rounded-full bg-gold-400 text-black flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-gold-400 font-semibold">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
