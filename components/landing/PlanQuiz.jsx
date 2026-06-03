'use client'
import { useState } from 'react'
import { ArrowLeft, RotateCcw, Zap } from 'lucide-react'

const QUESTIONS = [
  {
    q: 'ما هدفك الأساسي؟',
    opts: [
      { label: '🔥 حرق الدهون وتخسيس الوزن', val: 'loss' },
      { label: '💪 بناء العضلات والكتلة',      val: 'gain' },
      { label: '⚖️ تحسين اللياقة العامة',      val: 'fitness' },
      { label: '🏆 رفع الأداء الرياضي',         val: 'performance' },
    ],
  },
  {
    q: 'ما مستوى تجربتك الرياضية؟',
    opts: [
      { label: '🌱 مبتدئ — أقل من سنة',         val: 'beginner' },
      { label: '📈 متوسط — 1 إلى 3 سنوات',      val: 'intermediate' },
      { label: '🔥 متقدم — أكثر من 3 سنوات',    val: 'advanced' },
    ],
  },
  {
    q: 'كم الوقت الذي تريد تخصيصه للبرنامج؟',
    opts: [
      { label: '📅 شهر لأرى نتيجة أولية',       val: '1month' },
      { label: '🎯 3 أشهر لتحول جذري كامل',     val: '3months' },
      { label: '💡 أريد البدء بالتدريب أولاً',  val: 'training_only' },
    ],
  },
]

function getRecommendation(answers) {
  const [goal, exp, time] = answers
  if (time === 'training_only') {
    return {
      name: 'برنامج التدريب', emoji: '🏋️', price: '50 د.ت',
      planParam: 'برنامج التدريب',
      why: 'بناءً على إجاباتك، البداية الصحيحة هي بناء عادة تدريبية احترافية أولاً — البرنامج المخصص يعطيك هذا بالضبط.',
    }
  }
  if (time === '3months' || goal === 'performance' || exp === 'advanced') {
    return {
      name: 'باقة 3 أشهر', emoji: '🏆', price: '300 د.ت',
      planParam: 'باقة 3 أشهر',
      why: 'أنت جاهز لتحول حقيقي — 90 يوماً من المتابعة الكاملة مع ضمان النتيجة هو ما يناسبك تماماً.',
    }
  }
  return {
    name: 'الباقة الشهرية', emoji: '⚡', price: '125 د.ت',
    planParam: 'الباقة الشهرية',
    why: 'الخيار الأذكى لك — تدريب + تغذية + متابعة أسبوعية في باقة واحدة متكاملة لنتيجة ملموسة.',
  }
}

export default function PlanQuiz() {
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState([])
  const [started, setStarted] = useState(false)

  function choose(val) {
    const next = [...answers, val]
    if (step < QUESTIONS.length - 1) {
      setAnswers(next)
      setStep(s => s + 1)
    } else {
      setAnswers(next)
      setStep(3)
    }
  }

  function reset() { setStep(0); setAnswers([]); setStarted(false) }

  const rec = step === 3 ? getRecommendation(answers) : null

  return (
    <section className="py-24 bg-[#0d0d0d] border-t border-white/5">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-gold-400 font-bold text-center text-xs uppercase tracking-widest mb-3">اكتشف باقتك</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3 tracking-tight">
          أي باقة تناسبك؟
        </h2>
        <p className="text-white/30 text-center max-w-md mx-auto font-medium text-sm mb-10">
          3 أسئلة فقط — وسيوصي المدرب بالباقة الأنسب لك
        </p>

        {!started ? (
          <div className="text-center">
            <div className="bg-white/3 border border-white/8 rounded-3xl p-10 mb-6">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-white font-extrabold text-lg mb-2">لا تعرف من أين تبدأ؟</p>
              <p className="text-white/40 text-sm leading-relaxed">
                أجب على 3 أسئلة سريعة وسنخبرك بالباقة التي تناسب هدفك ومستواك تماماً
              </p>
            </div>
            <button onClick={() => setStarted(true)}
              className="flex items-center gap-2 mx-auto px-8 py-4 bg-gold-400 text-black font-extrabold rounded-2xl hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20">
              <Zap className="w-5 h-5" fill="black" />
              ابدأ الاختبار
            </button>
          </div>

        ) : step < 3 ? (
          <div>
            <div className="flex gap-2 mb-8">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500
                  ${i < step ? 'bg-gold-400' : i === step ? 'bg-gold-400/50' : 'bg-white/10'}`} />
              ))}
            </div>

            <div className="bg-white/3 border border-white/8 rounded-3xl p-7">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
                السؤال {step + 1} من {QUESTIONS.length}
              </p>
              <h3 className="text-white font-extrabold text-xl mb-6">{QUESTIONS[step].q}</h3>
              <div className="space-y-3">
                {QUESTIONS[step].opts.map(opt => (
                  <button key={opt.val} onClick={() => choose(opt.val)}
                    className="w-full text-right px-5 py-4 bg-white/3 border border-white/8 rounded-2xl text-white/70 font-bold text-sm hover:border-gold-400/40 hover:bg-gold-400/5 hover:text-white transition-all">
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={reset}
              className="flex items-center gap-1.5 mx-auto mt-5 text-white/25 hover:text-white/50 text-xs font-bold transition">
              <RotateCcw className="w-3 h-3" /> إعادة من البداية
            </button>
          </div>

        ) : (
          <div className="text-center">
            <div className="bg-gradient-to-br from-gold-400/10 to-gold-400/5 border border-gold-400/25 rounded-3xl p-8 mb-6">
              <p className="text-gold-400 text-xs font-extrabold uppercase tracking-widest mb-4">✅ توصية المدرب</p>
              <div className="text-6xl mb-3">{rec.emoji}</div>
              <h3 className="text-white font-extrabold text-2xl mb-1">{rec.name}</h3>
              <p className="text-gold-400 font-extrabold text-lg mb-4">{rec.price} / شهر</p>
              <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm mx-auto">{rec.why}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={`/register?plan=${encodeURIComponent(rec.planParam)}`}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gold-400 text-black font-extrabold rounded-2xl hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20">
                  <Zap className="w-5 h-5" fill="black" />
                  ابدأ الآن
                </a>
                <a href="#pricing"
                  className="flex items-center justify-center gap-2 px-8 py-4 border border-white/15 text-white/60 font-bold rounded-2xl hover:bg-white/5 hover:text-white transition-all">
                  مقارنة الباقات
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </div>
            </div>
            <button onClick={reset}
              className="flex items-center gap-1.5 mx-auto text-white/25 hover:text-white/50 text-xs font-bold transition">
              <RotateCcw className="w-3 h-3" /> أعد الاختبار
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
