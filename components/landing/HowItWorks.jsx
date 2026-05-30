const steps = [
  {
    num: '01',
    icon: '📋',
    title: 'أرسل بياناتك',
    desc: 'أملأ نموذج الاشتراك ببياناتك الأساسية (الوزن، الطول، العمر، هدفك) — لا يستغرق أكثر من دقيقتين.',
    color: 'bg-primary-600',
  },
  {
    num: '02',
    icon: '🎯',
    title: 'استلم خطتك',
    desc: 'في غضون 24 ساعة تستلم برنامجك التدريبي وخطتك الغذائية المخصصة كلياً لهدفك.',
    color: 'bg-emerald-600',
  },
  {
    num: '03',
    icon: '🚀',
    title: 'ابدأ وتابع',
    desc: 'طبّق الخطة مع متابعة أسبوعية منتظمة وتعديلات مستمرة حتى تصل لهدفك.',
    color: 'bg-amber-500',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-primary-600 font-bold text-center text-sm uppercase tracking-wider mb-2">كيف يعمل</p>
        <h2 className="section-title">3 خطوات فقط للبدء</h2>
        <p className="section-sub">عملية بسيطة وسريعة — تبدأ نتائجك من اليوم الأول</p>

        <div className="relative mt-14">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 right-[calc(50%-1px)] w-full h-0.5 bg-gradient-to-l from-amber-400 via-emerald-400 to-primary-400 opacity-30" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative flex flex-col items-center text-center">
                <div className={`w-24 h-24 ${s.color} rounded-3xl flex flex-col items-center justify-center
                  text-white shadow-2xl mb-6 relative z-10`}>
                  <span className="text-3xl mb-1">{s.icon}</span>
                  <span className="text-xs font-bold opacity-70">{s.num}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{s.desc}</p>

                {i < steps.length - 1 && (
                  <div className="md:hidden w-0.5 h-8 bg-gradient-to-b from-slate-300 to-transparent my-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
