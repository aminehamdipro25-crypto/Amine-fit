import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import WhatsAppButton from '@/components/landing/WhatsAppButton'
import KidsTrialGift from '@/components/landing/KidsTrialGift'
import { Brain, Activity, HeartHandshake, Target, Clock, User, Sparkles, CheckCircle2, LogIn, GraduationCap, Video, ClipboardList, Gamepad2, FileText } from 'lucide-react'

// The live Amine Academy platform. Set NEXT_PUBLIC_ACADEMY_URL to academy.amine-fit.com
// once the subdomain is connected — until then it points to the current deployment.
const ACADEMY_URL = process.env.NEXT_PUBLIC_ACADEMY_URL || 'https://amine-academy.vercel.app'

export const metadata = {
  title: 'Amine Academy | برنامج تدريب الأطفال — طيف التوحّد و ADHD',
  description: 'أكاديمية أمين لتدريب الأطفال: برنامج علمي وعملي مخصّص لأطفال طيف التوحّد (ASD المستوى 1 و2)، فرط النشاط ونقص الانتباه (ADHD)، وصعوبات السلوك — جلسات فرديّة وأنشطة حركيّة حسّية لتعزيز الانتباه والتركيز والثقة بالنفس.',
  alternates: { canonical: '/academy' },
}

const CONDITIONS = [
  { icon: Brain, emoji: '🧩', title: 'اضطراب طيف التوحّد', sub: 'ASD — المستوى 1 و2', desc: 'تعزيز التواصل والتفاعل الاجتماعي والمهارات الحركيّة عبر أنشطة منظّمة ومتدرّجة.' },
  { icon: Activity, emoji: '⚡', title: 'فرط النشاط ونقص الانتباه', sub: 'ADHD', desc: 'أنشطة حركيّة حسّية تُفرّغ الطاقة وتبني الانتباه والتركيز والتحكّم في الاندفاع.' },
  { icon: HeartHandshake, emoji: '💛', title: 'صعوبات السلوك والانفعالات', sub: 'تنظيم ذاتي', desc: 'استراتيجيات لتنظيم الانفعالات وبناء الثقة بالنفس والانضباط الهادئ.' },
]

const FEATURES = [
  'جلسات تدريب فرديّة مخصّصة لكل طفل',
  'أنشطة حركيّة حسّية (Sensory-Motor)',
  'تعزيز الانتباه والتركيز والذاكرة العاملة',
  'بناء الثقة بالنفس والمهارات الاجتماعية',
  'خطّة متدرّجة وأهداف واضحة قابلة للقياس',
  'تواصل مستمر مع الأولياء ومتابعة التقدّم',
]

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-16"
          style={{ background: 'linear-gradient(135deg,#1a1035 0%,#12082a 55%,#0a0a0a 100%)' }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.14]"
            style={{ background: 'radial-gradient(circle at 15% 25%, #7C5CFC 0%, transparent 45%), radial-gradient(circle at 85% 70%, #9A7BFD 0%, transparent 45%)' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-violet-300 bg-violet-400/10 border border-violet-400/25 px-3 py-1 rounded-full uppercase tracking-widest mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Amine Academy
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              برنامج تدريب علمي وعملي{' '}
              <span className="text-violet-300">مخصّص للأطفال</span>
            </h1>
            <p className="text-white/60 text-base sm:text-lg mt-5 max-w-2xl mx-auto leading-relaxed font-medium">
              طوّر تركيز طفلك وثقته بنفسه — جلسات فرديّة وأنشطة حركيّة حسّية لأطفال طيف التوحّد،
              فرط النشاط ونقص الانتباه، وصعوبات السلوك.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <a href={`${ACADEMY_URL}/register`} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-l from-violet-500 to-purple-500 text-white font-extrabold text-sm shadow-lg shadow-violet-400/25 hover:scale-[1.03] transition">
                <GraduationCap className="w-4 h-4" /> سجّل طفلك في الأكاديمية
              </a>
              <a href="#trial" className="px-6 py-3.5 rounded-2xl bg-white/10 border border-violet-400/30 text-violet-200 font-bold text-sm hover:bg-white/15 transition">
                🎁 شهر مجاني تجريبي
              </a>
              <a href={`${ACADEMY_URL}/parent/login`} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white font-bold text-sm hover:bg-white/10 transition">
                <LogIn className="w-4 h-4" /> دخول الأولياء
              </a>
            </div>
          </div>
        </section>

        {/* Conditions */}
        <section className="py-16 bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-3">لمن هذا البرنامج؟</h2>
            <p className="text-white/40 text-center text-sm max-w-xl mx-auto mb-12 font-medium">برنامج متخصّص يُصمَّم حول احتياجات كل طفل الفرديّة</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {CONDITIONS.map((c, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 hover:border-violet-400/30 transition">
                  <div className="w-12 h-12 rounded-2xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center text-2xl mb-4">{c.emoji}</div>
                  <h3 className="text-white font-extrabold text-lg">{c.title}</h3>
                  <p className="text-violet-300 text-xs font-bold mt-0.5" dir="ltr">{c.sub}</p>
                  <p className="text-white/45 text-sm mt-3 leading-relaxed font-medium">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features + session info */}
        <section className="py-16" style={{ background: 'linear-gradient(180deg,#0a0a0a,#150a30)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">ماذا يشمل البرنامج؟</h2>
              <ul className="space-y-3">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70 font-medium text-sm leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: User,   label: 'نوع الجلسة', val: 'فرديّة' },
                { icon: Clock,  label: 'مدّة الجلسة', val: 'ساعة' },
                { icon: Target, label: 'الأهداف', val: 'انتباه · تركيز · ثقة' },
                { icon: Activity, label: 'الأسلوب', val: 'حركي حسّي' },
              ].map((s, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-center">
                  <s.icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                  <p className="text-white font-extrabold text-sm">{s.val}</p>
                  <p className="text-white/35 text-[11px] font-bold mt-1 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The interactive Amine Academy platform */}
        <section className="py-16 bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-violet-300 bg-violet-400/10 border border-violet-400/25 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                منصّة تفاعليّة
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">منصّة الأكاديمية الرقميّة</h2>
              <p className="text-white/40 text-sm mt-2 max-w-xl mx-auto font-medium">كل ما يحتاجه طفلك وأنت في مكان واحد — بوّابة للأولياء وأخرى للطالب</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon: Video,        t: 'جلسات مباشرة', s: 'تفاعليّة عبر الإنترنت' },
                { icon: ClipboardList,t: 'تقييمات معتمدة', s: 'APA / ABA / CBT' },
                { icon: Gamepad2,     t: 'ألعاب معرفيّة', s: 'حسب تشخيص الطفل' },
                { icon: FileText,     t: 'تقارير أسبوعيّة', s: 'متابعة التقدّم' },
              ].map((f, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-center">
                  <f.icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                  <p className="text-white font-extrabold text-sm">{f.t}</p>
                  <p className="text-white/35 text-[11px] font-medium mt-1">{f.s}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href={`${ACADEMY_URL}/register`} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-l from-violet-500 to-purple-500 text-white font-extrabold text-sm hover:scale-[1.03] transition">
                <GraduationCap className="w-4 h-4" /> سجّل طفلك الآن
              </a>
              <a href={`${ACADEMY_URL}/parent/login`} className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white font-bold text-sm hover:bg-white/10 transition">
                <LogIn className="w-4 h-4" /> بوّابة الأولياء
              </a>
              <a href={`${ACADEMY_URL}/student/login`} className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white font-bold text-sm hover:bg-white/10 transition">
                <User className="w-4 h-4" /> بوّابة الطالب
              </a>
              <a href={`${ACADEMY_URL}/demo`} className="px-5 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white/70 font-bold text-sm hover:bg-white/10 transition">
                جرّب العرض التوضيحي
              </a>
            </div>
          </div>
        </section>

        {/* Free trial CTA (gated by invitation code) */}
        <div id="trial"><KidsTrialGift /></div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
