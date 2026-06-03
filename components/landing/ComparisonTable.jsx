'use client'
import { useState } from 'react'
import { Check, X, ChevronDown } from 'lucide-react'

const features = [
  { label: 'برنامج تدريب مخصص 100%',           basic: true,  standard: true,  premium: true  },
  { label: 'خطة غذائية كاملة (نظام التبادل ADA)', basic: false, standard: true,  premium: true  },
  { label: 'متابعة أسبوعية مفصّلة',              basic: false, standard: true,  premium: true  },
  { label: 'دعم واتساب',                          basic: true,  standard: true,  premium: true  },
  { label: 'تعديل البرنامج كل أسبوعين',           basic: true,  standard: true,  premium: true  },
  { label: 'بوابة عميل شخصية متكاملة',            basic: true,  standard: true,  premium: true  },
  { label: 'تقرير تقدم شهري بالأرقام',            basic: false, standard: true,  premium: true  },
  { label: 'قياسات جسم دورية وتحليل',            basic: false, standard: false, premium: true  },
  { label: 'مكالمة تقييم شهرية (15–20 دق)',      basic: false, standard: false, premium: true  },
  { label: 'استشارات غير محدودة (رد بساعات)',     basic: false, standard: false, premium: true  },
  { label: 'إعادة تصميم البرنامج شهرياً',         basic: false, standard: false, premium: true  },
  { label: 'ضمان النتيجة أو تمديد مجاناً',        basic: false, standard: false, premium: true  },
  { label: '7 أيام ضمان استرداد',                 basic: false, standard: true,  premium: true  },
]

const cols = [
  { key: 'basic',    label: 'التدريب',     price: '50', emoji: '🏋️', color: 'text-white',    bg: 'bg-white/5',    border: 'border-white/10' },
  { key: 'standard', label: 'الشهرية',     price: '125', emoji: '⚡', color: 'text-black',    bg: 'bg-gold-400',   border: 'border-gold-400', highlight: true },
  { key: 'premium',  label: '3 أشهر',      price: '300', emoji: '🏆', color: 'text-white',    bg: 'bg-white/5',    border: 'border-white/10' },
]

function Cell({ val, highlight }) {
  if (val) return <Check className={`w-4 h-4 mx-auto ${highlight ? 'text-gold-400' : 'text-emerald-400'}`} />
  return <X className="w-4 h-4 mx-auto text-white/15" />
}

export default function ComparisonTable() {
  const [open, setOpen] = useState(false)

  return (
    <section className="py-16 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-center gap-3 py-4 border border-white/10 rounded-2xl text-white/50 hover:text-white hover:border-white/20 transition-all font-bold text-sm">
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          مقارنة تفصيلية بين الباقات
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right px-5 py-4 text-white/30 font-bold text-xs uppercase tracking-widest w-1/2">الميزة</th>
                  {cols.map(c => (
                    <th key={c.key} className={`px-4 py-4 text-center w-[16%] ${c.highlight ? 'bg-gold-400/10' : ''}`}>
                      <div className="text-xl mb-1">{c.emoji}</div>
                      <div className={`font-extrabold text-sm ${c.highlight ? 'text-gold-400' : 'text-white'}`}>{c.label}</div>
                      <div className={`text-xs font-bold mt-0.5 ${c.highlight ? 'text-gold-400/70' : 'text-white/30'}`}>{c.price} د.ت</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                    <td className="px-5 py-3 text-white/60 font-medium text-right">{f.label}</td>
                    {cols.map(c => (
                      <td key={c.key} className={`px-4 py-3 text-center ${c.highlight ? 'bg-gold-400/5' : ''}`}>
                        <Cell val={f[c.key]} highlight={c.highlight} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="px-5 py-4" />
                  {cols.map(c => (
                    <td key={c.key} className={`px-4 py-4 text-center ${c.highlight ? 'bg-gold-400/5' : ''}`}>
                      <a href={`/register?plan=${encodeURIComponent(c.label === 'التدريب' ? 'برنامج التدريب' : c.label === 'الشهرية' ? 'الباقة الشهرية' : 'باقة 3 أشهر')}`}
                        className={`inline-block px-4 py-2 rounded-xl font-extrabold text-xs transition-all
                          ${c.highlight ? 'bg-gold-400 text-black hover:bg-gold-300' : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'}`}>
                        اختر هذه
                      </a>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
