const steps = [
  {
    num: '01',
    icon: '📋',
    title: 'أرسل بياناتك',
    desc: 'أملأ نموذج الاشتراك ببياناتك الأساسية — لا يستغرق أكثر من دقيقتين.',
  },
  {
    num: '02',
    icon: '⚡',
    title: 'استلم خطتك',
    desc: 'في غضون 24 ساعة تستلم برنامجك التدريبي وخطتك الغذائية المخصصة كلياً.',
  },
  {
    num: '03',
    icon: '🚀',
    title: 'ابدأ وتابع',
    desc: 'سجّل دخولك لبوابتك الشخصية وتابع خطتك مع دعم أسبوعي مستمر.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 bg-[#0a0a0a] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-gold-400 font-bold text-center text-xs uppercase tracking-widest mb-3">كيف يعمل</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3 tracking-tight">
          3 خطوات فقط للبدء
        </h2>
        <p className="text-white/30 text-center max-w-xl mx-auto font-medium">
          عملية بسيطة وسريعة — تبدأ نتائجك من اليوم الأول
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 relative">
          {/* Connector */}
          <div className="hidden md:block absolute top-10 left-[16.7%] right-[16.7%] h-px bg-gradient-to-r from-gold-400/20 via-gold-400/40 to-gold-400/20" />

          {steps.map((s, i) => (
            <div key={s.num} className="relative flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-[#111] border border-white/10 group-hover:border-gold-400/40 rounded-2xl flex flex-col items-center justify-center mb-6 relative z-10 transition-all">
                <span className="text-3xl mb-0.5">{s.icon}</span>
                <span className="text-gold-400 text-[10px] font-extrabold tracking-widest">{s.num}</span>
              </div>
              <h3 className="text-lg font-extrabold text-white mb-2">{s.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed max-w-xs font-medium">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <a href="#pricing"
            className="flex items-center gap-2 px-8 py-4 bg-gold-400 text-black font-extrabold rounded-2xl hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20">
            ابدأ الآن ⚡
          </a>
        </div>
      </div>
    </section>
  )
}
