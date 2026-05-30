'use client'
import { ArrowLeft } from 'lucide-react'

const services = [
  {
    icon: '🏋️',
    title: 'التدريب الشخصي',
    desc: 'برامج تدريبية مخصصة بالكامل لجسمك وهدفك — سواء كان خسارة وزن، بناء عضلات، أو تحسين اللياقة العامة.',
    features: ['تمارين مكيّفة مع مستواك', 'جدول أسبوعي مرن', 'شرح كامل لكل تمرين', 'تعديل دوري حسب تقدمك'],
    cta: 'ابدأ التدريب',
    href: '/register',
  },
  {
    icon: '🥗',
    title: 'التخطيط الغذائي',
    desc: 'خطط غذائية دقيقة بنظام جداول التبادل المعتمد — توزيع مثالي للسعرات والماكرو على وجباتك اليومية.',
    features: ['حاسبة BMR/TDEE دقيقة', 'نظام التبادل الغذائي الـ 6', 'توزيع 5 وجبات يومياً', 'أمثلة تطبيقية واضحة'],
    cta: 'احصل على خطتك',
    href: '/register',
    featured: true,
  },
  {
    icon: '📊',
    title: 'المتابعة والدعم',
    desc: 'متابعة منتظمة لقياساتك ونتائجك — تقارير تفصيلية وتواصل مستمر لضمان وصولك للهدف في الوقت المحدد.',
    features: ['قياسات جسم دورية', 'تقارير تقدم مفصلة', 'دعم مباشر عبر الهاتف', 'تعديلات حسب النتائج'],
    cta: 'ابدأ المتابعة',
    href: '/register',
  },
]

export default function Services() {
  return (
    <section id="services" className="py-24 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-gold-400 font-bold text-center text-xs uppercase tracking-widest mb-3">خدماتنا</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3 tracking-tight">
          كل ما تحتاجه لتحقيق هدفك
        </h2>
        <p className="text-white/30 text-center max-w-xl mx-auto font-medium">
          نقدم حلاً متكاملاً يجمع بين التدريب والتغذية والمتابعة المستمرة
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">
          {services.map(s => (
            <div key={s.title}
              className={`relative rounded-2xl p-7 border flex flex-col transition-all hover:-translate-y-1
                ${s.featured
                  ? 'bg-gold-400 border-gold-400 shadow-2xl shadow-gold-400/20'
                  : 'bg-white/3 border-white/8 hover:border-white/20'}`}>

              {s.featured && (
                <div className="absolute -top-3 right-6 bg-[#0a0a0a] text-gold-400 text-xs font-extrabold px-3 py-1 rounded-full border border-gold-400/30">
                  ⚡ الأكثر طلباً
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5
                ${s.featured ? 'bg-black/10' : 'bg-white/5'}`}>
                {s.icon}
              </div>

              <h3 className={`text-xl font-extrabold mb-3 ${s.featured ? 'text-black' : 'text-white'}`}>
                {s.title}
              </h3>
              <p className={`text-sm leading-relaxed mb-5 ${s.featured ? 'text-black/60' : 'text-white/40'}`}>
                {s.desc}
              </p>

              <ul className="space-y-2.5 flex-1 mb-6">
                {s.features.map(f => (
                  <li key={f} className={`flex items-center gap-2.5 text-sm font-medium
                    ${s.featured ? 'text-black/80' : 'text-white/50'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0
                      ${s.featured ? 'bg-black/10 text-black' : 'bg-gold-400/10 text-gold-400'}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a href={s.href}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm transition-all
                  ${s.featured
                    ? 'bg-black text-gold-400 hover:bg-black/80 shadow-lg shadow-black/20'
                    : 'bg-gold-400 text-black hover:bg-gold-300 shadow-lg shadow-gold-400/10'}`}>
                {s.cta} <ArrowLeft className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
