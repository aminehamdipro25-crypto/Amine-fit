'use client'
import Link from 'next/link'
import { ArrowRight, Activity, Zap, RotateCcw, BookOpen } from 'lucide-react'

/* ─── Heart Rate Zones ──────────────────────────────────────────────────── */
const HR_ZONES = [
  {
    label:   'Zone 1',
    sub:     'Active Recovery',
    pct:     '50–60% Max HR',
    color:   'bg-blue-500',
    light:   'bg-blue-50 border-blue-200',
    text:    'text-blue-700',
    badge:   'bg-blue-100 text-blue-800',
    desc:    'راحة نشطة — المشي الخفيف، التمدد. يحسّن الدورة الدموية ويقلل آلام العضلات بعد التمرين.',
    feel:    'يمكنك التحدث بجمل كاملة بسهولة.',
    arabic:  'المنطقة الأولى',
  },
  {
    label:   'Zone 2',
    sub:     'Aerobic Base',
    pct:     '60–70% Max HR',
    color:   'bg-emerald-500',
    light:   'bg-emerald-50 border-emerald-200',
    text:    'text-emerald-700',
    badge:   'bg-emerald-100 text-emerald-800',
    desc:    'القاعدة الهوائية — الجري الهادئ، الدراجة المتوسطة. يحرق الدهون ويبني التحمل القلبي الأساسي.',
    feel:    'تتحدث بجمل قصيرة، غير مجهد.',
    arabic:  'المنطقة الثانية',
  },
  {
    label:   'Zone 3',
    sub:     'Aerobic Capacity',
    pct:     '70–80% Max HR',
    color:   'bg-yellow-400',
    light:   'bg-yellow-50 border-yellow-200',
    text:    'text-yellow-700',
    badge:   'bg-yellow-100 text-yellow-800',
    desc:    'القدرة الهوائية — وتيرة Tempo. يرفع VO₂max ويطور كفاءة الاستهلاك الأوكسجيني.',
    feel:    'صعب الكلام، تتنفس بعمق.',
    arabic:  'المنطقة الثالثة',
  },
  {
    label:   'Zone 4',
    sub:     'Lactate Threshold',
    pct:     '80–90% Max HR',
    color:   'bg-orange-500',
    light:   'bg-orange-50 border-orange-200',
    text:    'text-orange-700',
    badge:   'bg-orange-100 text-orange-800',
    desc:    'عتبة اللاكتات — مجهود عالٍ. يزيد السرعة والقوة، يحسن القدرة على تحمل الأحماض.',
    feel:    'لا تستطيع الكلام، تشعر بحرق في العضلات.',
    arabic:  'المنطقة الرابعة',
  },
  {
    label:   'Zone 5',
    sub:     'VO₂ Max / Redline',
    pct:     '90–100% Max HR',
    color:   'bg-red-600',
    light:   'bg-red-50 border-red-200',
    text:    'text-red-700',
    badge:   'bg-red-100 text-red-800',
    desc:    'الحد الأقصى — عدو سريع، تكرارات شديدة. أقصى قدرة هوائية وأناروبية.',
    feel:    'مستحيل الكلام، أقصى مجهود ممكن.',
    arabic:  'المنطقة الخامسة',
  },
]

/* ─── Training Methods ──────────────────────────────────────────────────── */
const METHODS = [
  {
    term:  'HIIT',
    full:  'High-Intensity Interval Training',
    icon:  '⚡',
    desc:  'تدريب متقطع شديد — فترات جهد عالٍ (80-95%) تتبعها فترات راحة أو مجهود خفيف. مدة الجلسة 20-30 دقيقة.',
    example: '30s sprint → 90s walk × 8 rounds',
    science: 'يرفع معدل EPOC (الحرق بعد التمرين) حتى 24 ساعة. (Gibala et al., 2012)',
  },
  {
    term:  'LISS',
    full:  'Low-Intensity Steady State',
    icon:  '🚶',
    desc:  'كارديو هادئ ومستمر عند نبض منخفض (Zone 1-2) لمدة 30-60 دقيقة. ممتاز للتعافي وحرق الدهون.',
    example: '45 min brisk walk at Zone 2',
    science: 'يحسن تأكسد الدهون ويطور الشعيرات الدموية في العضلات.',
  },
  {
    term:  'Tabata',
    full:  'Tabata Protocol',
    icon:  '🔥',
    desc:  'بروتوكول ياباني محدد: 20 ثانية جهد أقصى ثم 10 ثواني راحة × 8 جولات = 4 دقائق فقط.',
    example: '20s max effort → 10s rest × 8 = 4 min',
    science: 'أثبت Tabata et al. (1996) رفع VO₂max وتحمل اللاكتات بشكل متوازٍ.',
  },
  {
    term:  'Zone 2 Training',
    full:  'Aerobic Base Building',
    icon:  '🫀',
    desc:  'تدريب مطوّل عند نبض Zone 2 (60-70%) لمدة 45-90 دقيقة. يُعدّ أساس كل البرامج التحملية الاحترافية.',
    example: '60 min run keeping HR 130-145 bpm',
    science: 'San Millán & Brooks (2018): يُحسّن الميتوكوندريا ومسارات الأكسدة الدهنية.',
  },
  {
    term:  'MetCon',
    full:  'Metabolic Conditioning',
    icon:  '💥',
    desc:  'تكييف الجهاز الأيضي — تمارين مركّبة بوتيرة عالية تستهدف الطاقة الهوائية والأنيروبية معاً.',
    example: 'AMRAP 15 min: 10 KB Swings + 10 Box Jumps + 10 Burpees',
    science: 'يُحسّن حساسية الأنسولين والكفاءة الأيضية الكلية.',
  },
  {
    term:  'Polarized Training',
    full:  '80/20 Polarized Model',
    icon:  '📊',
    desc:  'النموذج الاستقطابي: 80% من التدريب عند Zone 1-2، 20% عند Zone 4-5. يتجنب "الوسط الرمادي" (Zone 3).',
    example: '4 easy sessions + 1 hard session per week',
    science: 'Seiler (2010): أثبت تفوّقه على التدريب المتوسط الشدة في رياضيي التحمل.',
  },
  {
    term:  'Periodization',
    full:  'Structured Training Cycles',
    icon:  '📅',
    desc:  'التدريج الدوري — تخطيط التدريب على أسابيع وأشهر بتصاعد تدريجي للحمل ثم أسابيع تعافٍ.',
    example: '3 weeks progressive load → 1 deload week',
    science: 'يمنع الإفراط في التدريب ويحقق تكيفاً مستداماً. (Stone et al., 2007)',
  },
  {
    term:  'Circuit Training',
    full:  'Station-Based Training',
    icon:  '🔄',
    desc:  'تمارين متتالية في محطات دون راحة أو بفترات راحة قصيرة. يجمع بين القوة والكارديو.',
    example: '5 exercises × 45s each, 15s rest between',
    science: 'يرفع معدل ضربات القلب ويطور القوة العضلية والتحمل معاً.',
  },
]

/* ─── Terminology ────────────────────────────────────────────────────────── */
const TERMS = [
  {
    term: 'Sets',
    arabic: 'المجموعات',
    desc: 'عدد مرات تنفيذ التمرين كاملاً. مثال: 3 Sets = تنفيذ التمرين 3 مرات مع راحة بينها.',
  },
  {
    term: 'Reps',
    arabic: 'التكرارات',
    desc: 'عدد مرات تكرار الحركة داخل المجموعة الواحدة. مثال: 12 Reps = الحركة 12 مرة متتالية.',
  },
  {
    term: 'Rest',
    arabic: 'فترة الراحة',
    desc: 'الوقت بين المجموعات أو التمارين. عادةً 60-120 ثانية للقوة، 30-60 ثانية للتحمل.',
  },
  {
    term: 'WARM UP',
    arabic: 'الإحماء',
    desc: 'تمارين خفيفة قبل الجلسة الرئيسية لرفع درجة الحرارة وتهيئة المفاصل والعضلات وتقليل خطر الإصابة.',
  },
  {
    term: 'COOL DOWN',
    arabic: 'التهدئة',
    desc: 'تمارين ببطء بعد الجلسة لإعادة ضربات القلب للطبيعي وتمديد العضلات وتسريع التعافي.',
  },
  {
    term: 'AMRAP',
    arabic: 'أكبر عدد ممكن',
    desc: 'As Many Reps As Possible — أكبر عدد من التكرارات ضمن وقت محدد دون التوقف.',
  },
  {
    term: 'EMOM',
    arabic: 'كل دقيقة',
    desc: 'Every Minute On the Minute — تبدأ عدداً محدداً من التكرارات كل دقيقة، والباقي راحة.',
  },
  {
    term: 'RPE',
    arabic: 'مقياس المجهود',
    desc: 'Rate of Perceived Exertion — مقياس ذاتي من 1 إلى 10. RPE 7 = مجهود عالٍ، RPE 3 = خفيف جداً.',
  },
  {
    term: 'RIR',
    arabic: 'التكرارات المتبقية',
    desc: 'Reps In Reserve — كم تكراراً تستطيع إضافتها لو أردت. RIR 2 = توقفت وعندك 2 تكرار احتياطي.',
  },
  {
    term: 'Superset',
    arabic: 'السوبر ست',
    desc: 'تنفيذ تمرينين متتاليين دون راحة بينهما. إما عضلتان متعاكستان (Chest + Back) أو نفس المجموعة.',
  },
  {
    term: 'EPOC',
    arabic: 'الحرق بعد التمرين',
    desc: 'Excess Post-Exercise Oxygen Consumption — ارتفاع معدل الحرق بعد التمرين الشديد يدوم 12-48 ساعة.',
  },
  {
    term: 'Progressive Overload',
    arabic: 'الزيادة التدريجية',
    desc: 'مبدأ زيادة الحمل التدريجي أسبوعياً (وزن، تكرارات، سرعة) لإجبار الجسم على التكيف والنمو.',
  },
  {
    term: '1RM',
    arabic: 'أقصى وزن مرة واحدة',
    desc: '1 Rep Max — أقصى وزن تستطيع رفعه مرة واحدة في تمرين معين. يُستخدم لحساب نسب الحمل.',
  },
  {
    term: 'TUT',
    arabic: 'الزمن تحت التوتر',
    desc: 'Time Under Tension — إجمالي الوقت الذي تكون فيه العضلة تحت ضغط خلال المجموعة. يزيد التحفيز العضلي.',
  },
  {
    term: 'Periodization',
    arabic: 'التدريج الدوري',
    desc: 'تنظيم التدريب في دورات (أسابيع/أشهر) بتصاعد تدريجي للحمل وأسابيع راحة مدروسة.',
  },
  {
    term: 'VO₂ Max',
    arabic: 'الحد الأقصى للأكسجين',
    desc: 'أقصى كمية أكسجين يستطيع الجسم استهلاكها خلال التمرين. مؤشر رئيسي للياقة القلبية التنفسية.',
  },
]

/* ─── Components ────────────────────────────────────────────────────────── */
function ZoneRow({ zone }) {
  return (
    <div className={`border rounded-2xl p-4 ${zone.light}`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl ${zone.color} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-extrabold text-xs">{zone.label}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className={`font-extrabold text-sm ${zone.text}`} dir="ltr">{zone.sub}</p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${zone.badge}`} dir="ltr">{zone.pct}</span>
          </div>
          <p className="text-slate-700 text-xs leading-relaxed mb-1">{zone.desc}</p>
          <p className="text-slate-500 text-xs italic">{zone.feel}</p>
        </div>
      </div>
    </div>
  )
}

function MethodCard({ m }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl flex-shrink-0">{m.icon}</span>
        <div>
          <p className="font-extrabold text-slate-900 text-sm" dir="ltr">{m.term}</p>
          <p className="text-slate-400 text-xs" dir="ltr">{m.full}</p>
        </div>
      </div>
      <p className="text-slate-600 text-xs leading-relaxed mb-2">{m.desc}</p>
      {m.example && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">EXAMPLE</p>
          <p className="text-slate-700 text-xs font-mono" dir="ltr">{m.example}</p>
        </div>
      )}
      {m.science && (
        <p className="text-amber-700 text-[10px] leading-relaxed">🔬 {m.science}</p>
      )}
    </div>
  )
}

function TermRow({ t }) {
  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="min-w-[110px] flex-shrink-0">
        <p className="font-extrabold text-slate-900 text-xs" dir="ltr">{t.term}</p>
        <p className="text-slate-400 text-[10px] mt-0.5">{t.arabic}</p>
      </div>
      <p className="text-slate-600 text-xs leading-relaxed">{t.desc}</p>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function GuidePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/client/lab"
          className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition flex-shrink-0">
          <ArrowRight className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-extrabold text-slate-900 text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold-400" />
            GLOSSARY & GUIDE
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">كل المصطلحات والاختصارات موضحة</p>
        </div>
      </div>

      {/* HR Zones section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-red-500" />
          <h2 className="font-extrabold text-slate-900 text-base">HEART RATE ZONES</h2>
        </div>

        {/* Visual bar */}
        <div className="flex h-4 rounded-full overflow-hidden gap-px mb-5 shadow-inner">
          {HR_ZONES.map(z => (
            <div key={z.label} className={`${z.color} flex-1 flex items-center justify-center`}>
              <span className="text-white text-[9px] font-extrabold">
                {z.label.split(' ')[1]}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {HR_ZONES.map(z => <ZoneRow key={z.label} zone={z} />)}
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500 leading-relaxed" dir="ltr">
            <span className="font-bold">Tanaka Formula:</span> Max HR = 208 − (0.7 × age)
            <br />
            More accurate than the classic 220−age formula, especially for adults over 40.
            <span className="block mt-1 text-slate-400">(Tanaka et al., 2001 — JACC)</span>
          </p>
        </div>
      </section>

      {/* Training Methods */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="font-extrabold text-slate-900 text-base">TRAINING METHODS</h2>
        </div>
        <div className="space-y-3">
          {METHODS.map(m => <MethodCard key={m.term} m={m} />)}
        </div>
      </section>

      {/* Terminology */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <RotateCcw className="w-5 h-5 text-emerald-500" />
          <h2 className="font-extrabold text-slate-900 text-base">KEY TERMINOLOGY</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 px-4 divide-y divide-slate-100 shadow-sm">
          {TERMS.map(t => <TermRow key={t.term} t={t} />)}
        </div>
      </section>

      {/* Back link */}
      <div className="flex justify-center">
        <Link href="/client/lab"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-gold-400 font-bold text-sm rounded-2xl hover:bg-black transition">
          <ArrowRight className="w-4 h-4" />
          العودة إلى المختبر
        </Link>
      </div>

    </div>
  )
}
