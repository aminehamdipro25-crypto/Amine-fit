'use client'
import { useEffect, useState } from 'react'
import { ACTIVITY_FACTORS, GOALS, EX, calcIdealWeight } from '@/lib/nutritionEngine'

const GENDER_LABEL = { male: 'ذكر', female: 'أنثى' }

const MONTHS_TN = ['جانفي','فيفري','مارس','أفريل','ماي','جوان','جويليه','أوت','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
function formatDate(isoStr) {
  const d = isoStr ? new Date(isoStr) : new Date()
  if (isNaN(d.getTime())) return new Date().toLocaleDateString()
  return `${d.getDate()} ${MONTHS_TN[d.getMonth()]} ${d.getFullYear()}`
}

export default function PlanReport() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('amineFitPlan')
      if (raw) setPlan(JSON.parse(raw))
    } catch {}
    setLoading(false)
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-lg">جارٍ التحميل...</p>
    </div>
  )

  if (!plan) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <p className="text-red-600 text-xl font-bold">لا توجد خطة غذائية للعرض</p>
      <p className="text-gray-500">يرجى إنشاء الخطة من لوحة التحكم أولاً</p>
      <button onClick={() => window.close()} className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
        إغلاق
      </button>
    </div>
  )

  const { form, bmr, tdee, target, ex, menu } = plan
  const date = formatDate(plan.date)
  const goal     = GOALS.find(g => g.key === form.goal)     || GOALS[1]
  const activity = ACTIVITY_FACTORS.find(a => a.key === form.activity) || ACTIVITY_FACTORS[2]
  const idealW   = calcIdealWeight(+form.height)
  const currentW = +form.weight
  const aboveIdeal = currentW > idealW.max
  const belowIdeal = currentW < idealW.min

  const EX_ROWS = [
    { key: 'starches',   label: 'النشويات',         icon: '🌾', srv: ex.starches,   ...EX.starch   },
    { key: 'meats',      label: 'اللحوم والبروتين',  icon: '🥩', srv: ex.meats,     ...EX.meat     },
    { key: 'dairy',      label: 'منتجات الألبان',    icon: '🥛', srv: ex.dairy,     ...EX.milk     },
    { key: 'fats',       label: 'الدهون',            icon: '🫒', srv: ex.fats,      ...EX.fat      },
    { key: 'fruits',     label: 'الفواكه',           icon: '🍎', srv: ex.fruits,    ...EX.fruit    },
    { key: 'vegetables', label: 'الخضروات',          icon: '🥦', srv: ex.vegetables,...EX.vegetable },
  ]

  const totalKcal = EX_ROWS.reduce((s, r) => s + r.srv * r.kcal, 0)
  const totalC    = EX_ROWS.reduce((s, r) => s + r.srv * r.carbs, 0)
  const totalP    = EX_ROWS.reduce((s, r) => s + r.srv * r.protein, 0)
  const totalF    = EX_ROWS.reduce((s, r) => s + r.srv * r.fat, 0)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        * { font-family: 'Cairo', sans-serif; box-sizing: border-box; }
        body { background: #f8f8f8; margin: 0; }
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>

      {/* Print Button */}
      <div className="no-print fixed top-4 left-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm"
        >
          🖨️ طباعة / حفظ PDF
        </button>
        <button
          onClick={() => window.close()}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-3 rounded-xl shadow-lg text-sm"
        >
          ✕ إغلاق
        </button>
      </div>

      <div dir="rtl" style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 60px', background: 'white', minHeight: '100vh' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #c9973b', paddingBottom: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
              🏋️ Amine<span style={{ color: '#c9973b' }}>Fit</span>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>مدرب شخصي ومدرب تغذية معتمد</div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: '#999' }}>تاريخ الإصدار</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#555' }}>{date}</div>
          </div>
        </div>

        {/* ── Plan Title ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#c9973b', margin: 0 }}>
            الخطة الغذائية الشخصية
          </h1>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: '6px 0 0' }}>
            {form.name}
          </p>
        </div>

        {/* ── Client Profile ─────────────────────────────────────────────── */}
        <SectionTitle num="1" title="البيانات الشخصية" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }} className="avoid-break">
          <InfoCard label="الجنس"      value={GENDER_LABEL[form.gender] || form.gender} />
          <InfoCard label="العمر"       value={`${form.age} سنة`} />
          <InfoCard label="الوزن الحالي" value={`${form.weight} كغ`} />
          <InfoCard label="الطول"       value={`${form.height} سم`} />
          <InfoCard label="مستوى النشاط" value={activity.label.split('—')[0].trim()} />
          <InfoCard label="الهدف"       value={goal.label} icon={goal.icon} />
        </div>

        {/* Ideal weight banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 18px', marginBottom: 12 }} className="avoid-break">
          <span style={{ fontSize: 22 }}>⚖️</span>
          <div>
            <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700 }}>الوزن المثالي المستهدف (BMI 18.5–24.9)</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#1e40af' }}>{idealW.min} – {idealW.max} كغ</div>
          </div>
          <div style={{ marginRight: 'auto' }}>
            {aboveIdeal && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '6px 14px' }}>
                <span style={{ color: '#c2410c', fontWeight: 700, fontSize: 13 }}>↑ الوزن الحالي أعلى بـ {currentW - idealW.max} كغ</span>
              </div>
            )}
            {belowIdeal && (
              <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 8, padding: '6px 14px' }}>
                <span style={{ color: '#1d4ed8', fontWeight: 700, fontSize: 13 }}>↓ الوزن الحالي أقل بـ {idealW.min - currentW} كغ</span>
              </div>
            )}
            {!aboveIdeal && !belowIdeal && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 14px' }}>
                <span style={{ color: '#15803d', fontWeight: 700, fontSize: 13 }}>✅ الوزن في النطاق المثالي</span>
              </div>
            )}
          </div>
        </div>

        {(form.preferred || form.avoided || form.notes) && (
          <div style={{ display: 'grid', gridTemplateColumns: form.preferred && form.avoided ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 12 }}>
            {form.preferred && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginBottom: 4 }}>✅ الأطعمة المفضلة</div>
                <div style={{ fontSize: 13, color: '#166534' }}>{form.preferred}</div>
              </div>
            )}
            {form.avoided && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, marginBottom: 4 }}>🚫 الأطعمة الممنوعة</div>
                <div style={{ fontSize: 13, color: '#991b1b' }}>{form.avoided}</div>
              </div>
            )}
          </div>
        )}
        {form.notes?.trim() && (
          <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 10, padding: '10px 16px', marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, marginBottom: 4 }}>🤖 ملاحظات خاصة</div>
            <div style={{ fontSize: 13, color: '#4c1d95' }}>{form.notes}</div>
          </div>
        )}
        {!(form.preferred || form.avoided || form.notes) && <div style={{ marginBottom: 28 }} />}

        {/* ── BMR / TDEE ─────────────────────────────────────────────────── */}
        <SectionTitle num="2" title="حسابات الطاقة — معادلة هاريس بنيديكت" />
        <div style={{ background: '#fffbf0', border: '1px solid #e8d5a0', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }} className="avoid-break">
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#666', marginBottom: 12, background: '#f5f5f5', padding: '10px 14px', borderRadius: 8, lineHeight: 1.8 }}>
            {form.gender === 'male'
              ? `BMR = 66.47 + (13.75 × ${form.weight}) + (5.003 × ${form.height}) − (6.755 × ${form.age})`
              : `BMR = 655.1 + (9.563 × ${form.weight}) + (1.850 × ${form.height}) − (4.676 × ${form.age})`
            }
            <br />
            {`BMR = ${Math.round(bmr)} سعرة حرارية/يوم`}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <MetricCard label="معدل الأيض الأساسي" value={`${Math.round(bmr)}`} unit="سعرة/يوم" color="#c9973b" />
            <MetricCard label="إجمالي الطاقة المحروقة" value={`${tdee}`} unit="سعرة/يوم" color="#2563eb" />
            <MetricCard label="السعرات المستهدفة" value={`${target}`} unit="سعرة/يوم" color={goal.key === 'loss' ? '#dc2626' : goal.key === 'gain' ? '#16a34a' : '#6b7280'} />
          </div>
          <div style={{ marginTop: 14, fontSize: 13, color: '#777', textAlign: 'center' }}>
            {goal.key === 'loss'   && `عجز ${Math.abs(tdee - target)} سعرة/يوم لخسارة الوزن`}
            {goal.key === 'gain'   && `فائض ${target - tdee} سعرة/يوم لبناء العضلات`}
            {goal.key === 'maintain' && 'الحفاظ على الوزن الحالي'}
          </div>
        </div>

        {/* ── Exchange Table ──────────────────────────────────────────────── */}
        <SectionTitle num="3" title="جدول وحدات التبادل الغذائي" />
        <div style={{ marginBottom: 28 }} className="avoid-break">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#1a1a1a', color: 'white' }}>
                <Th>المجموعة الغذائية</Th>
                <Th>الوحدات</Th>
                <Th>السعرات</Th>
                <Th>الكربوهيدرات</Th>
                <Th>البروتين</Th>
                <Th>الدهون</Th>
              </tr>
            </thead>
            <tbody>
              {EX_ROWS.map((r, i) => r.srv === 0 ? (
                <tr key={r.key} style={{ background: '#fef2f2', opacity: 0.6 }}>
                  <Td bold style={{ textDecoration: 'line-through', color: '#dc2626' }}>{r.icon} {r.label}</Td>
                  <Td center colSpan={5} style={{ color: '#dc2626', fontSize: 12 }}>🚫 ممنوع</Td>
                </tr>
              ) : (
                <tr key={r.key} style={{ background: i % 2 === 0 ? '#fafafa' : 'white', borderBottom: '1px solid #eee' }}>
                  <Td bold>{r.icon} {r.label}</Td>
                  <Td center>
                    <span style={{ background: '#c9973b', color: 'white', borderRadius: 20, padding: '2px 12px', fontWeight: 700, fontSize: 14 }}>
                      {r.srv}
                    </span>
                  </Td>
                  <Td center>{r.srv * r.kcal} سعرة</Td>
                  <Td center>{r.srv * r.carbs} غ</Td>
                  <Td center>{r.srv * r.protein} غ</Td>
                  <Td center>{r.srv * r.fat} غ</Td>
                </tr>
              ))}
              <tr style={{ background: '#c9973b', color: 'white', fontWeight: 700 }}>
                <Td bold style={{ color: 'white' }}>الإجمالي</Td>
                <Td center style={{ color: 'white' }}>—</Td>
                <Td center style={{ color: 'white' }}>{Math.round(totalKcal)} سعرة</Td>
                <Td center style={{ color: 'white' }}>{Math.round(totalC)} غ</Td>
                <Td center style={{ color: 'white' }}>{Math.round(totalP)} غ</Td>
                <Td center style={{ color: 'white' }}>{Math.round(totalF)} غ</Td>
              </tr>
            </tbody>
          </table>

          {/* Macro distribution bar */}
          <div style={{ marginTop: 16, background: '#f5f5f5', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8, fontWeight: 600 }}>توزيع الماكروز</div>
            <div style={{ display: 'flex', gap: 0, borderRadius: 6, overflow: 'hidden', height: 18 }}>
              <div style={{ width: `${ex.pct?.carbs || 50}%`, background: '#f59e0b' }} title={`كربوهيدرات ${ex.pct?.carbs}%`} />
              <div style={{ width: `${ex.pct?.protein || 25}%`, background: '#3b82f6' }} title={`بروتين ${ex.pct?.protein}%`} />
              <div style={{ width: `${ex.pct?.fat || 25}%`, background: '#8b5cf6' }} title={`دهون ${ex.pct?.fat}%`} />
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 6, fontSize: 11, color: '#666' }}>
              <span><span style={{ color: '#f59e0b', fontWeight: 700 }}>■</span> كربوهيدرات {ex.pct?.carbs || 50}% — {Math.round(totalC)} غ</span>
              <span><span style={{ color: '#3b82f6', fontWeight: 700 }}>■</span> بروتين {ex.pct?.protein || 25}% — {Math.round(totalP)} غ</span>
              <span><span style={{ color: '#8b5cf6', fontWeight: 700 }}>■</span> دهون {ex.pct?.fat || 25}% — {Math.round(totalF)} غ</span>
            </div>
          </div>
        </div>

        {/* ── Meal Distribution ───────────────────────────────────────────── */}
        <div className="page-break" />
        <SectionTitle num="4" title={`توزيع الوجبات — ${menu.length} وجبات يومياً`} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 28 }}>
          {menu.map((meal, i) => (
            <div key={i} className="avoid-break" style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ background: '#1a1a1a', color: 'white', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{meal.icon} {meal.name}</span>
                <span style={{ fontSize: 11, color: '#ccc' }}>{meal.time}</span>
              </div>
              <div style={{ padding: '10px 14px', background: '#fafafa' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 11, color: '#888', borderBottom: '1px solid #eee', paddingBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: '#c9973b' }}>{meal.kcal} سعرة</span>
                  <span>ك: {meal.carbs}غ</span>
                  <span>ب: {meal.protein}غ</span>
                  <span>د: {meal.fat}غ</span>
                </div>
                {meal.items.map((item, j) => (
                  <div key={j} style={{ fontSize: 12, color: '#444', padding: '3px 0', borderBottom: j < meal.items.length - 1 ? '1px dashed #f0f0f0' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.icon} {item.food}</span>
                    <span style={{ color: '#888', fontSize: 11 }}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Detailed Menu ───────────────────────────────────────────────── */}
        <SectionTitle num="5" title="القائمة التفصيلية — الكميات بالجرام" />
        {menu.map((meal, i) => (
          <div key={i} className="avoid-break" style={{ marginBottom: 20, border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', color: 'white', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 800 }}>{meal.icon} {meal.name}</span>
                <span style={{ fontSize: 12, color: '#aaa', marginRight: 10 }}>⏰ {meal.time}</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ background: '#c9973b', color: 'white', borderRadius: 20, padding: '3px 12px', fontSize: 13, fontWeight: 700 }}>
                  {meal.kcal} سعرة
                </span>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f3f4f6', color: '#374151' }}>
                  <Th light>الفئة الغذائية</Th>
                  <Th light>الطعام</Th>
                  <Th light center>الوحدات</Th>
                  <Th light center>الكمية</Th>
                </tr>
              </thead>
              <tbody>
                {meal.items.map((item, j) => (
                  <tr key={j} style={{ borderBottom: '1px solid #f0f0f0', background: j % 2 === 0 ? 'white' : '#fafafa' }}>
                    <Td>{item.icon} {item.group}</Td>
                    <Td bold>{item.food}</Td>
                    <Td center>{item.servings}</Td>
                    <Td center>
                      <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 6, padding: '2px 10px', fontWeight: 700, fontSize: 12 }}>
                        {item.amount}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ background: '#fffbf0', padding: '8px 20px', display: 'flex', gap: 20, fontSize: 11, color: '#888' }}>
              <span>كربوهيدرات: <strong style={{ color: '#f59e0b' }}>{meal.carbs} غ</strong></span>
              <span>بروتين: <strong style={{ color: '#3b82f6' }}>{meal.protein} غ</strong></span>
              <span>دهون: <strong style={{ color: '#8b5cf6' }}>{meal.fat} غ</strong></span>
            </div>
          </div>
        ))}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 40, borderTop: '2px solid #e5e7eb', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#c9973b' }}>🏋️ AmineFit</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>هذه الخطة مُعدّة بشكل شخصي وتخضع للمراجعة الدورية</div>
          </div>
          <div style={{ textAlign: 'left', fontSize: 11, color: '#bbb' }}>
            <div>أمين حمدي — مدرب تغذية معتمد</div>
            <div>www.amine-fit.com</div>
          </div>
        </div>

      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ num, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ background: '#c9973b', color: 'white', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
        {num}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
    </div>
  )
}

function InfoCard({ label, value, icon }) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{icon && `${icon} `}{value}</div>
    </div>
  )
}

function MetricCard({ label, value, unit, color }) {
  return (
    <div style={{ background: 'white', border: `2px solid ${color}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{unit}</div>
    </div>
  )
}

function Th({ children, center, light, style: s }) {
  return (
    <th style={{ padding: '10px 14px', textAlign: center ? 'center' : 'right', fontWeight: 700, fontSize: 13, background: light ? '#f3f4f6' : undefined, color: light ? '#374151' : undefined, ...s }}>
      {children}
    </th>
  )
}

function Td({ children, bold, center, style: s }) {
  return (
    <td style={{ padding: '9px 14px', textAlign: center ? 'center' : 'right', fontWeight: bold ? 600 : 400, ...s }}>
      {children}
    </td>
  )
}
