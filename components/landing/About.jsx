'use client'
import { useState } from 'react'
import { Award, BookOpen, Globe, ChevronDown, ChevronUp, Shield, Zap } from 'lucide-react'

const certifications = [
  { title: 'مدرب تغذية معتمد',           org: 'Diet Masters Association',     year: '2026', icon: '🥗' },
  { title: 'النشاط البدني والتوحد',        org: 'شهادة معتمدة دولياً',           year: '2026', icon: '🤝' },
  { title: 'التأهيل التخاطبي لأطفال ADHD', org: 'شهادة متخصصة',               year: '2025', icon: '🧠' },
  { title: 'علم النفس الرياضي',           org: 'شهادة معتمدة دولياً',           year: '2025', icon: '🎯' },
  { title: 'اليوغا العلاجية',             org: 'شهادة معتمدة',                 year: '2024', icon: '🧘' },
  { title: 'مدرب يوغا هوائية',            org: 'Aerial Yoga Instructor',       year: '2023', icon: '🪂' },
  { title: 'إعداد بدني احترافي',          org: 'شهادة عسكرية معتمدة',          year: '2018', icon: '🏋️' },
  { title: 'مدرب شخصي معتمد',            org: 'Personal Trainer Certificate', year: '2018', icon: '💪' },
  { title: 'شهادة مشاة البحرية',          org: 'Marines Certificate',          year: '2014', icon: '⚓' },
  { title: 'شهادة الغوص المحترف',        org: 'Diver\'s Certificate',         year: '2012', icon: '🤿' },
]

const experience = [
  {
    role: 'مدرب لياقة — القوات الخاصة والغواصين البحريين',
    place: 'البحرية التونسية، تونس',
    period: '2013 – 2025 (11+ سنة)',
    icon: '⚓',
    color: 'border-gold-400',
    highlight: true,
    points: [
      'تصميم وتنفيذ برامج التأهيل البدني لوحدات القوات الخاصة والغواصين (20–40 عنصراً)',
      'متابعة المؤشرات الفردية وتعديل الخطط التدريبية وفق معايير الاستعداد القتالي',
      'تحقيق معدل صفر إصابات تدريبية على مدار كامل سنوات الخدمة',
    ],
  },
  {
    role: 'أستاذ تربية بدنية — المدرسة العسكرية للرياضة',
    place: 'تونس',
    period: '2016 – 2022',
    icon: '🎖️',
    color: 'border-white/20',
    points: [
      'تدريس مادة التأهيل البدني واليوغا العلاجية والوقاية من الإصابات للطلاب العسكريين',
      'تطبيق بروتوكولات الوقاية المستندة إلى الأدلة العلمية للحد من الإصابات العضلية',
    ],
  },
  {
    role: 'مدرب يوغا ويوغا هوائية',
    place: 'Private Fitness M.CLUB، تونس',
    period: '2023 – 2025',
    icon: '🧘',
    color: 'border-white/20',
    points: [
      'إدارة 3 جلسات جماعية أسبوعية (8–15 مشاركاً) بمعدل استمرارية يتجاوز 85%',
      'تطوير برامج متخصصة في تخفيف التوتر، وتقوية العضلات العميقة، وتصحيح القوام',
    ],
  },
]

export default function About() {
  const [showAllCerts, setShowAllCerts] = useState(false)
  const visibleCerts = showAllCerts ? certifications : certifications.slice(0, 6)

  return (
    <section id="about" className="py-24 bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-gold-400 font-bold text-xs uppercase tracking-widest mb-3">المدرب</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            من هو <span className="text-gold-400">أمين حمدي</span>؟
          </h2>
          <p className="text-white/30 max-w-2xl mx-auto font-medium text-sm leading-relaxed">
            متخصص يجمع بين الانضباط العسكري النخبوي والمعرفة الأكاديمية المعتمدة في الرياضة والتغذية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">

          {/* Left — bio + quote */}
          <div>
            {/* Avatar card */}
            <div className="bg-gradient-to-br from-[#111] to-[#1a1a1a] border border-white/8 rounded-3xl p-7 mb-6">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center text-black font-extrabold text-3xl flex-shrink-0 shadow-xl shadow-gold-400/20">
                  أ
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">أمين حمدي</h3>
                  <p className="text-gold-400 text-sm font-bold mt-0.5">مدرب شخصي ومدرب تغذية معتمد</p>
                  <p className="text-white/30 text-xs mt-1 font-medium">الدوحة، قطر 🏅</p>
                </div>
              </div>

              <p className="text-white/55 text-sm leading-relaxed mb-5">
                متخصص في التربية البدنية بخبرة تتجاوز <strong className="text-white/80">10 سنوات</strong>،
                يجمع بين التأهيل البدني العسكري النخبوي والحركة العلاجية — من تصميم برامج الجاهزية القتالية
                للقوات الخاصة والغواصين البحريين، إلى تقديم اليوغا العلاجية والإرشاد الغذائي في البيئة المدنية.
              </p>

              {/* Quote */}
              <blockquote className="border-r-4 border-gold-400 pr-4">
                <p className="text-white/60 text-sm italic leading-relaxed">
                  "نحن ما نفعله مراراً وتكراراً؛ فالتميز إذن ليس فعلاً بل عادة."
                </p>
                <cite className="text-white/30 text-xs font-bold mt-2 block">— أرسطو، فيلسوف يوناني (384–322 ق.م)</cite>
              </blockquote>
            </div>

            {/* Languages */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-gold-400" />
                <span className="text-white font-extrabold text-sm uppercase tracking-wide">اللغات</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { lang: 'العربية', level: 'لغة أم',        flag: '🇹🇳', fill: 100 },
                  { lang: 'الفرنسية', level: 'طليق',          flag: '🇫🇷', fill: 90 },
                  { lang: 'الإنجليزية', level: 'احترافي',     flag: '🇬🇧', fill: 80 },
                ].map(l => (
                  <div key={l.lang} className="text-center">
                    <div className="text-2xl mb-1">{l.flag}</div>
                    <p className="text-white font-extrabold text-xs">{l.lang}</p>
                    <p className="text-white/30 text-[10px] font-medium">{l.level}</p>
                    <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-gold-400 rounded-full" style={{ width: `${l.fill}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — experience timeline */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-4 h-4 text-gold-400" />
              <span className="text-white font-extrabold text-sm uppercase tracking-wide">المسيرة المهنية</span>
            </div>
            <div className="space-y-4">
              {experience.map((e) => (
                <div key={e.role}
                  className={`bg-white/3 border border-r-4 ${e.color} rounded-2xl p-5 transition-all hover:bg-white/5`}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl flex-shrink-0">{e.icon}</span>
                    <div>
                      <p className={`font-extrabold text-sm leading-tight ${e.highlight ? 'text-gold-400' : 'text-white'}`}>
                        {e.role}
                      </p>
                      <p className="text-white/35 text-xs font-medium mt-0.5">{e.place}</p>
                      <p className="text-white/25 text-[10px] font-bold mt-0.5 uppercase tracking-wide">{e.period}</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mr-9">
                    {e.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/40 font-medium">
                        <span className="text-gold-400 mt-0.5 flex-shrink-0">›</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="mt-5 bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-gold-400" />
                <span className="text-white font-extrabold text-sm uppercase tracking-wide">التعليم</span>
              </div>
              <div className="space-y-3">
                {[
                  { deg: 'الإجازة الوطنية في علوم وتقنيات الأنشطة البدنية والرياضية (STAPS)', inst: 'المعهد العالي للرياضة والتربية البدنية صفاقس', year: '2022–23' },
                  { deg: 'الإجازة الوطنية في الحقوق والعلوم السياسية', inst: 'المعهد العالي للدراسات القانونية بقابس', year: '2020–23' },
                  { deg: 'شهادة مربي رياضي عسكري',                inst: 'المدرسة العسكرية', year: '2014–16' },
                ].map(d => (
                  <div key={d.deg} className="flex items-start gap-3">
                    <span className="text-gold-400 font-extrabold text-sm flex-shrink-0 mt-0.5">🎓</span>
                    <div>
                      <p className="text-white/70 text-xs font-bold leading-tight">{d.deg}</p>
                      <p className="text-white/30 text-[10px] font-medium mt-0.5">{d.inst} · {d.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Certifications grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-400" />
              <span className="text-white font-extrabold text-sm uppercase tracking-wide">
                الشهادات والاعتمادات ({certifications.length})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {visibleCerts.map((cert) => (
              <div key={cert.title}
                className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center hover:border-gold-400/30 hover:bg-white/5 transition-all group">
                <div className="text-3xl mb-2">{cert.icon}</div>
                <p className="text-white/70 text-xs font-bold leading-tight mb-1">{cert.title}</p>
                <p className="text-white/25 text-[10px] font-medium">{cert.org}</p>
                <p className="text-gold-400 text-[10px] font-extrabold mt-1">{cert.year}</p>
              </div>
            ))}
          </div>

          {certifications.length > 6 && (
            <div className="flex justify-center mt-5">
              <button
                onClick={() => setShowAllCerts(v => !v)}
                className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white/40 font-bold text-sm rounded-xl hover:bg-white/5 hover:text-white transition">
                {showAllCerts
                  ? <><ChevronUp className="w-4 h-4" /> عرض أقل</>
                  : <><ChevronDown className="w-4 h-4" /> عرض كل الشهادات ({certifications.length})</>
                }
              </button>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 bg-gradient-to-r from-gold-400/10 via-gold-400/5 to-transparent border border-gold-400/20 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 text-center sm:text-right">
            <p className="text-white font-extrabold text-xl mb-1">
              جاهز لتجربة تدريب مختلف؟
            </p>
            <p className="text-white/40 text-sm font-medium">
              خبرة عسكرية + شهادات أكاديمية = نتائج مضمونة لك
            </p>
          </div>
          <a href="/register"
            className="flex items-center gap-2 px-7 py-3.5 bg-gold-400 text-black font-extrabold rounded-2xl hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20 flex-shrink-0">
            <Zap className="w-4 h-4" fill="black" />
            اشترك الآن
          </a>
        </div>
      </div>
    </section>
  )
}
