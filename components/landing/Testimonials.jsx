import { ShieldCheck } from 'lucide-react'

const testimonials = [
  {
    name: 'أ. م.',
    fullRole: 'موظف حكومي — الدوحة، قطر',
    result: 'فقد 18 كغ في 4 أشهر',
    avatar: 'أ',
    source: 'واتساب',
    sourceColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    stars: 5,
    text: 'كنت أحاول لسنوات بدون نتيجة. مع أمين وخطة التبادل الغذائي، فقدت 18 كغ في 4 أشهر فقط. المتابعة الأسبوعية وبوابة العميل غيّرت كل شيء — أرى تقدمي بشكل واضح كل أسبوع.',
  },
  {
    name: 'س. ب.',
    fullRole: 'ربة بيت — تونس',
    result: 'بنت 8 كغ عضلات في 6 أشهر',
    avatar: 'س',
    source: 'إنستغرام',
    sourceColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    stars: 5,
    text: 'الخطة الغذائية دقيقة جداً ومناسبة لظروفي كأم لثلاثة أطفال. ما توقعت أن أقدر أحقق هذا وأنا مشغولة — البرنامج مرن وعملي ومشرح بالتفصيل.',
  },
  {
    name: 'ي. ع.',
    fullRole: 'مهندس — الرياض، السعودية',
    result: 'تحسّن ملحوظ في اللياقة والطاقة',
    avatar: 'ي',
    source: 'واتساب',
    sourceColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    stars: 5,
    text: 'الخلفية العسكرية لأمين تظهر في أسلوبه — منضبط، واضح، ومباشر. لأول مرة أفهم التغذية فعلاً وليس فقط "كل هذا ولا تأكل ذاك". أنصح به بشدة.',
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
        <p className="text-white/30 text-center max-w-xl mx-auto font-medium text-sm">
          تجارب حقيقية من عملاء أتمّوا برامجهم مع أمين حمدي
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">
          {testimonials.map(t => (
            <div key={t.name}
              className="bg-white/3 border border-white/8 rounded-2xl p-7 hover:border-white/20 hover:-translate-y-1 transition-all flex flex-col">

              {/* Header: stars + verified + source */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-gold-400 text-base">★</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.sourceColor}`}>
                    {t.source}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    موثّق
                  </span>
                </div>
              </div>

              {/* Result badge */}
              <div className="bg-gold-400/10 border border-gold-400/20 rounded-xl px-3 py-1.5 mb-4 inline-block self-start">
                <p className="text-gold-400 text-xs font-extrabold">🏆 {t.result}</p>
              </div>

              {/* Text */}
              <p className="text-white/50 text-sm leading-relaxed mb-6 font-medium flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-400 to-amber-500 text-black flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-white/30 font-medium">{t.fullRole}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <p className="text-center text-white/20 text-xs mt-8 font-medium">
          * الأحرف الأولى فقط للحفاظ على خصوصية العملاء — التجارب والنتائج حقيقية وموثّقة
        </p>
      </div>
    </section>
  )
}
