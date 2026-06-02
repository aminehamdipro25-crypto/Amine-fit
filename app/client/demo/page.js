'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Zap, LayoutDashboard, Utensils, Dumbbell, TrendingUp, BookOpen,
  FlaskConical, ArrowLeft, Clock, Droplets, CheckCircle2,
  Menu, X, Heart, Flame, ChevronDown, ChevronUp,
  ShoppingCart, Camera, Paperclip, ClipboardList, Send, Scale,
  Star, AlertTriangle
} from 'lucide-react'

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
  { id: 'nutrition',  icon: Utensils,        label: 'الخطة الغذائية' },
  { id: 'training',   icon: Dumbbell,        label: 'الخطة التدريبية' },
  { id: 'lab',        icon: FlaskConical,    label: 'المختبر 🔬' },
  { id: 'progress',   icon: TrendingUp,      label: 'متابعة التقدم' },
  { id: 'journal',    icon: BookOpen,        label: 'يوميتي 💧' },
  { id: 'shopping',   icon: ShoppingCart,    label: 'قائمة التسوق 🛒' },
  { id: 'photos',     icon: Camera,          label: 'صوري 📸' },
  { id: 'resources',  icon: Paperclip,       label: 'ملفاتي 📎' },
]

const INTENSITY_CONFIG = {
  low:        { label: 'Low',       bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-200' },
  moderate:   { label: 'Moderate',  bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  high:       { label: 'High',      bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200' },
  'very-high':{ label: 'Very High', bg: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-200' },
}

const DEMO = { name: 'محمد أحمد', age: 26, weight: 88, targetWeight: 75, height: 178 }

const MEALS = [
  { name: 'الإفطار',      time: '08:00', calories: 450, items: ['بيض مسلوق × 3','خبز توست × 2','لبن خالي الدسم 200ml','موزة'] },
  { name: 'وجبة خفيفة',  time: '11:00', calories: 280, items: ['مكسرات 30g','تفاحة','قهوة سوداء'] },
  { name: 'الغداء',       time: '13:30', calories: 620, items: ['صدر دجاج مشوي 200g','أرز بني 100g','سلطة خضراء','زيت زيتون 10ml'] },
  { name: 'وجبة مسائية', time: '17:00', calories: 250, items: ['شوفان 50g','عسل 10g','مكسرات 20g'] },
  { name: 'العشاء',       time: '20:00', calories: 250, items: ['تونا 150g','خبز توست × 2','طماطم','خيار'] },
]

const TRAINING_DAYS = [
  {
    day: 'الإثنين', type: 'Upper Body — Push', intensity: 'high',
    exercises: [
      { name: 'Bench Press',            sets: 4, reps: '8',  rpe: 8 },
      { name: 'Overhead Press',         sets: 3, reps: '10', rpe: 7 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '12', rpe: 8 },
      { name: 'Lateral Raise',          sets: 4, reps: '15', rpe: 7 },
      { name: 'Tricep Pushdown',        sets: 3, reps: '12', rpe: 7 },
    ]
  },
  {
    day: 'الأربعاء', type: 'Lower Body — Strength', intensity: 'very-high',
    exercises: [
      { name: 'Barbell Squat',     sets: 4, reps: '8',  rpe: 9 },
      { name: 'Romanian Deadlift', sets: 3, reps: '10', rpe: 8 },
      { name: 'Leg Press',         sets: 3, reps: '12', rpe: 7 },
      { name: 'Leg Curl',          sets: 3, reps: '12', rpe: 7 },
      { name: 'Calf Raise',        sets: 4, reps: '15', rpe: 6 },
    ]
  },
  {
    day: 'الجمعة', type: 'Upper Body — Pull', intensity: 'high',
    exercises: [
      { name: 'Pull Up',     sets: 4, reps: '8',  rpe: 8 },
      { name: 'Barbell Row', sets: 3, reps: '10', rpe: 8 },
      { name: 'Face Pull',   sets: 3, reps: '15', rpe: 7 },
      { name: 'Bicep Curl',  sets: 3, reps: '12', rpe: 7 },
      { name: 'Hammer Curl', sets: 3, reps: '12', rpe: 6 },
    ]
  },
  {
    day: 'السبت', type: 'Zone 2 Cardio + Core', intensity: 'moderate',
    exercises: [
      { name: 'Light Jogging', sets: 1, reps: '40 دقيقة', rpe: 5, zone: 'Zone 2' },
      { name: 'Plank Hold',    sets: 3, reps: '60s',       rpe: 6 },
      { name: 'Crunches',      sets: 3, reps: '20',        rpe: 6 },
      { name: 'Russian Twist', sets: 3, reps: '16',        rpe: 6 },
    ]
  },
]

const HR_ZONES = [
  { zone: 'Z1', label: 'Zone 1 — Active Recovery',  range: '92–111 bpm',  pct: '50–60%', color: 'bg-sky-300' },
  { zone: 'Z2', label: 'Zone 2 — Aerobic Base',      range: '111–130 bpm', pct: '60–70%', color: 'bg-emerald-400' },
  { zone: 'Z3', label: 'Zone 3 — Aerobic Capacity',  range: '130–148 bpm', pct: '70–80%', color: 'bg-yellow-400' },
  { zone: 'Z4', label: 'Zone 4 — Lactate Threshold', range: '148–167 bpm', pct: '80–90%', color: 'bg-orange-500' },
  { zone: 'Z5', label: 'Zone 5 — VO₂ Max',           range: '167–185 bpm', pct: '90–100%',color: 'bg-red-500' },
]

const LAB_SESSIONS = [
  { day: 'Monday',    type: 'Zone 2 Cardio',       duration: '45 دقيقة', intensity: 'low',       zone: 'Zone 2 — 111–130 bpm', exercises: ['Brisk Walking','Light Jogging'] },
  { day: 'Wednesday', type: 'HIIT',                duration: '25 دقيقة', intensity: 'very-high', zone: 'Zone 4–5 — 148–185 bpm', exercises: ['Sprint Intervals','Burpee','Mountain Climber','Jump Squat'] },
  { day: 'Friday',    type: 'Zone 2 + Zone 3',     duration: '40 دقيقة', intensity: 'moderate',  zone: 'Zone 2–3 — 111–148 bpm', exercises: ['Cycling','Elliptical'] },
  { day: 'Saturday',  type: 'HIIT + Core',         duration: '30 دقيقة', intensity: 'high',      zone: 'Zone 4 — 148–167 bpm', exercises: ['Battle Rope','Box Jump','Plank Hold','Mountain Climber'] },
]

const MOCK_PROGRESS = [
  { date: '2026-05-05', weight: 91.0 },
  { date: '2026-05-12', weight: 90.2 },
  { date: '2026-05-19', weight: 89.5 },
  { date: '2026-05-26', weight: 88.8 },
  { date: '2026-06-02', weight: 88.0 },
]

const MOCK_SHOPPING = [
  { category: 'بروتينات 🥩', items: [
    { food: 'صدر دجاج',    qty: 1400, unit: 'غ' },
    { food: 'بيض',         qty: 21,   unit: 'بيضة' },
    { food: 'تونا معلبة',  qty: 4,    unit: 'علبة' },
    { food: 'لحم بقري',    qty: 700,  unit: 'غ' },
  ]},
  { category: 'خضروات وفواكه 🥦', items: [
    { food: 'طماطم',       qty: 7,    unit: 'حبة' },
    { food: 'خيار',        qty: 14,   unit: 'حبة' },
    { food: 'سبانخ',       qty: 350,  unit: 'غ' },
    { food: 'موز',         qty: 7,    unit: 'حبة' },
    { food: 'تفاح',        qty: 7,    unit: 'حبة' },
  ]},
  { category: 'حبوب ونشويات 🌾', items: [
    { food: 'أرز بني',     qty: 700,  unit: 'غ' },
    { food: 'شوفان',       qty: 350,  unit: 'غ' },
    { food: 'خبز توست',   qty: 2,    unit: 'رغيف' },
  ]},
  { category: 'ألبان 🥛', items: [
    { food: 'لبن خالي',    qty: 1400, unit: 'ml' },
    { food: 'جبن قريش',   qty: 350,  unit: 'غ' },
  ]},
]

const MOCK_RESOURCES = [
  { name: 'دليل نظام التبادل الغذائي.pdf',    size: '2.1 MB', icon: '📄', color: 'text-red-500' },
  { name: 'خطة التدريب — الشهر الأول.pdf',    size: '1.4 MB', icon: '📋', color: 'text-blue-500' },
  { name: 'نصائح الاسترداد والنوم.pdf',        size: '0.8 MB', icon: '📘', color: 'text-violet-500' },
]

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function IntensityBadge({ level }) {
  const cfg = INTENSITY_CONFIG[level] || INTENSITY_CONFIG.moderate
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}

function RPEBadge({ value }) {
  const color = value >= 9 ? 'bg-red-100 text-red-700 border-red-200'
    : value >= 8 ? 'bg-orange-100 text-orange-700 border-orange-200'
    : value >= 7 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${color}`}>
      RPE {value}
    </span>
  )
}

function DemoBadge() {
  return (
    <span className="text-xs font-bold text-amber-500 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">تجريبي</span>
  )
}

function CTACard() {
  return (
    <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-3xl p-8 text-center border border-white/5">
      <div className="text-4xl mb-4">⚡</div>
      <h2 className="text-2xl font-extrabold text-white mb-3">هل أنت مستعد لبدء رحلتك الحقيقية؟</h2>
      <p className="text-white/50 text-sm mb-6 font-medium leading-relaxed">
        سجّل استبيانك وسيراجع المدرب أمين بياناتك ويعدّ لك خطة مخصصة
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/#pricing"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-gold-400 hover:bg-gold-300 text-black font-extrabold rounded-2xl transition-all shadow-lg shadow-gold-400/20 text-base">
          <Zap className="w-5 h-5" fill="black" />
          اختر خطتك الآن
        </Link>
        <a href="https://wa.me/97430653759"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-2xl transition-all text-base">
          تواصل مع المدرب
        </a>
      </div>
    </div>
  )
}

// ─── WATER DEMO ───────────────────────────────────────────────────────────────
function WaterDemo({ standalone = false }) {
  const [water, setWater] = useState(5)
  const goal = 8
  const pct = Math.round((water / goal) * 100)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="font-extrabold text-slate-800 text-sm">شرب الماء اليوم</p>
            <p className="text-[10px] text-slate-400 font-medium">اضغط كوب لتسجيله</p>
          </div>
        </div>
        <DemoBadge />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from({ length: goal }).map((_, i) => (
          <button key={i}
            onClick={() => setWater(i < water ? i : i + 1)}
            className={`w-9 h-9 rounded-xl text-lg transition-all active:scale-90 select-none
              ${i < water ? 'bg-blue-500 shadow-sm' : 'bg-slate-100 grayscale opacity-40'}`}>
            💧
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-extrabold text-slate-800">{water} / {goal} أكواب</span>
          <span className="text-xs font-bold text-slate-400">{(water * 0.25).toFixed(2)} لتر · {pct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>
        {pct >= 100 && <p className="text-xs font-bold text-blue-600 text-center">🎉 وصلت هدف اليوم! ممتاز</p>}
      </div>
    </div>
  )
}

// ─── CHECK-IN DEMO ────────────────────────────────────────────────────────────
const ENERGY_LABELS = ['', '😩 سيء', '😔 ضعيف', '😐 متوسط', '😊 جيد', '😁 ممتاز']
const STRESS_LABELS = ['', '😌 هادئ', '🙂 عادي', '😐 متوسط', '😟 مرتفع', '😤 شديد']

function CheckinDemo() {
  const [open, setOpen]   = useState(false)
  const [done, setDone]   = useState(false)
  const [form, setForm]   = useState({
    energy: 3, sleep: 7, trainingDone: 3, nutritionDays: 5,
    weight: '', stress: 3, pain: '', note: '',
  })

  function fakeSubmit() {
    setDone(true)
    setTimeout(() => { setOpen(false); setDone(false) }, 1800)
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 text-sm">تقرير الأسبوع</p>
              <p className="text-[10px] text-slate-400 font-medium">لم تُرسل تقريرك هذا الأسبوع بعد</p>
            </div>
          </div>
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200 transition">
            <Send className="w-3.5 h-3.5" />
            أرسل تقريرك
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">تقرير الأسبوع 📋</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">أخبر مدربك كيف كان الأسبوع</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
              {/* Energy */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">مستوى الطاقة العامة</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(p => ({...p, energy: n}))}
                      className={`flex-1 py-2.5 rounded-xl text-lg font-bold border-2 transition-all
                        ${form.energy === n ? 'border-amber-400 bg-amber-50 scale-105' : 'border-slate-100 hover:border-slate-200'}`}>
                      {['😩','😔','😐','😊','😁'][n-1]}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-bold text-slate-400 mt-1.5">{ENERGY_LABELS[form.energy]}</p>
              </div>

              {/* Sleep */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">
                  متوسط ساعات النوم: <span className="text-blue-600">{form.sleep} ساعة</span>
                </label>
                <input type="range" min="3" max="12" step="0.5" value={form.sleep}
                  onChange={e => setForm(p => ({...p, sleep: +e.target.value}))}
                  className="w-full accent-blue-500" />
                <div className="flex justify-between text-[10px] text-slate-300 font-medium mt-1">
                  <span>3 ساعات</span><span>12 ساعة</span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">
                  وزنك هذا الأسبوع <span className="text-slate-300 font-medium normal-case">(اختياري)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" min="30" max="300" step="0.1"
                    value={form.weight}
                    onChange={e => setForm(p => ({...p, weight: e.target.value}))}
                    placeholder="مثال: 88.5"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-400 transition font-medium" />
                  <span className="text-sm font-bold text-slate-400 flex-shrink-0">كغ</span>
                </div>
              </div>

              {/* Stress */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">مستوى الضغط والتوتر</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(p => ({...p, stress: n}))}
                      className={`flex-1 py-2.5 rounded-xl text-lg font-bold border-2 transition-all
                        ${form.stress === n ? 'border-purple-400 bg-purple-50 scale-105' : 'border-slate-100 hover:border-slate-200'}`}>
                      {['😌','🙂','😐','😟','😤'][n-1]}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-bold text-slate-400 mt-1.5">{STRESS_LABELS[form.stress]}</p>
              </div>

              {/* Training */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">
                  أيام التدريب المنجزة: <span className="text-emerald-600">{form.trainingDone} أيام</span>
                </label>
                <div className="flex gap-2">
                  {[0,1,2,3,4,5,6,7].map(n => (
                    <button key={n} onClick={() => setForm(p => ({...p, trainingDone: n}))}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold border-2 transition-all
                        ${form.trainingDone === n ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nutrition */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">
                  أيام الالتزام بالتغذية: <span className="text-rose-600">{form.nutritionDays}/7</span>
                </label>
                <div className="flex gap-2">
                  {[0,1,2,3,4,5,6,7].map(n => (
                    <button key={n} onClick={() => setForm(p => ({...p, nutritionDays: n}))}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold border-2 transition-all
                        ${form.nutritionDays === n ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pain */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">
                  ألم أو إصابة؟ <span className="text-slate-300 font-medium normal-case">(اتركه فارغاً إن لم يكن هناك شيء)</span>
                </label>
                <input type="text" value={form.pain}
                  onChange={e => setForm(p => ({...p, pain: e.target.value}))}
                  placeholder="مثال: ألم في الركبة اليسرى..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 transition font-medium" />
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">ملاحظات للمدرب (اختياري)</label>
                <textarea rows={2} value={form.note}
                  onChange={e => setForm(p => ({...p, note: e.target.value}))}
                  placeholder="أي شيء تريد إخبار مدربك به..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 transition font-medium resize-none" />
              </div>
            </div>

            <div className="px-6 pb-6 flex-shrink-0">
              <button onClick={fakeSubmit} disabled={done}
                className="w-full py-3.5 bg-[#0a0a0a] text-white rounded-xl font-extrabold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-black transition">
                {done
                  ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> تم الإرسال! (تجريبي)</>
                  : <><Send className="w-4 h-4" /> إرسال التقرير</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardTab() {
  return (
    <div className="space-y-5">
      <div className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#111827 60%,#0a0a0a 100%)', minHeight: 180 }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {[
            { e: '🥗', top: '5%',  left: '1%',  size: 60, deg: -15 },
            { e: '🍎', top: '50%', left: '2%',  size: 50, deg: 10  },
            { e: '🏋️', top: '5%',  right: '2%', size: 64, deg: 15  },
            { e: '💪',  top: '50%', right: '3%', size: 52, deg: -10 },
          ].map((item, i) => (
            <span key={i} className="absolute opacity-[0.12]"
              style={{ top: item.top, left: item.left, right: item.right, fontSize: item.size, lineHeight: 1, transform: `rotate(${item.deg}deg)` }}>
              {item.e}
            </span>
          ))}
        </div>
        <div className="relative z-10 px-6 py-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-gold-400/70 text-xs font-bold uppercase tracking-widest mb-3">منصة Amine-Fit الشخصية</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              أهلاً بك، عميلنا الكريم
            </h1>
            <p className="text-white/50 text-sm mt-2 font-medium leading-relaxed max-w-xs">
              خطتك الغذائية والتدريبية المخصصة جاهزة — نحن معك في كل خطوة نحو هدفك
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold">حسابك نشط</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-gold-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-gold-400/20">
            <Zap className="w-7 h-7 text-black" fill="black" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'الوزن الحالي',   val: `${DEMO.weight} كغ`,       emoji: '⚖️' },
          { label: 'الوزن المستهدف', val: `${DEMO.targetWeight} كغ`, emoji: '🎯' },
          { label: 'الطول',          val: `${DEMO.height} سم`,        emoji: '📏' },
          { label: 'العمر',          val: `${DEMO.age} سنة`,          emoji: '🎂' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <div className="text-2xl mb-1">{s.emoji}</div>
            <p className="text-xl font-extrabold text-slate-900">{s.val}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 160 }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#064e3b,#065f46,#059669)' }} />
          <div className="relative z-10 p-5">
            <div className="text-4xl mb-3">🥗</div>
            <h3 className="font-extrabold text-lg mb-1 text-white">الخطة الغذائية</h3>
            <p className="text-sm font-medium text-emerald-200">1850 سعرة • 5 وجبات</p>
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 160 }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0a0a0a,#1f2937,#111827)' }} />
          <div className="relative z-10 p-5">
            <div className="text-4xl mb-3">🏋️</div>
            <h3 className="font-extrabold text-lg mb-1 text-white">الخطة التدريبية</h3>
            <p className="text-sm font-medium text-gold-400/80">4 أيام / أسبوع</p>
          </div>
        </div>
      </div>

      {/* Streak demo */}
      <div className="bg-gradient-to-l from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4">
        <div className="text-4xl flex-shrink-0">🔥</div>
        <div className="flex-1">
          <p className="font-extrabold text-slate-900 text-base">7 أيام متتالية! أسبوع كامل!</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">سجّلت يومياتك 7 أيام متواصل — حافظ على الاستمرار</p>
        </div>
        <span className="text-xs font-bold text-amber-600"><DemoBadge /></span>
      </div>

      <WaterDemo />
      <CheckinDemo />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
        <div className="text-3xl flex-shrink-0">📉</div>
        <div className="flex-1">
          <p className="font-extrabold text-slate-900 text-sm">هدفك: خسارة وزن ✅ نشط</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">متبقي 13 كغ للوصول للهدف</p>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> نشط
        </div>
      </div>

      <CTACard />
    </div>
  )
}

// ─── NUTRITION TAB ────────────────────────────────────────────────────────────
function NutritionTab() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-extrabold text-slate-900 text-base mb-4">إجمالي المغذيات اليومية</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'السعرات',    val: '1850 kcal', color: 'text-gold-500',    bg: 'bg-amber-50' },
            { label: 'بروتين',     val: '140g',      color: 'text-blue-600',    bg: 'bg-blue-50' },
            { label: 'كربوهيدرات', val: '185g',      color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'دهون',       val: '55g',       color: 'text-amber-600',   bg: 'bg-amber-50' },
          ].map(m => (
            <div key={m.label} className={`${m.bg} rounded-xl p-3 text-center`}>
              <p className={`text-xl font-extrabold ${m.color}`}>{m.val}</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[
            { label: 'Protein',       val: '140g', pct: 35, color: 'bg-blue-500' },
            { label: 'Carbohydrates', val: '185g', pct: 45, color: 'bg-emerald-500' },
            { label: 'Fat',           val: '55g',  pct: 27, color: 'bg-amber-500' },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-slate-600">{m.label}</span>
                <span className="text-xs font-bold text-slate-500">{m.val} · {m.pct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {MEALS.map(meal => (
          <div key={meal.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">{meal.name}</p>
                  <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <Clock className="w-3 h-3" /> {meal.time}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full">
                {meal.calories} kcal
              </span>
            </div>
            <ul className="space-y-1">
              {meal.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <CTACard />
    </div>
  )
}

// ─── TRAINING TAB ─────────────────────────────────────────────────────────────
function TrainingTab() {
  const [openDay, setOpenDay] = useState(null)
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-2xl p-5 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-base">الخطة التدريبية</h2>
            <p className="text-white/40 text-xs font-medium">4 أيام / أسبوع | RPE-Based</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {TRAINING_DAYS.map((day, idx) => {
          const isOpen = openDay === idx
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button onClick={() => setOpenDay(isOpen ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-right hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#0a0a0a] rounded-xl flex items-center justify-center text-gold-400 font-extrabold text-sm">{idx + 1}</div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900 text-sm">{day.day}</p>
                    <p className="text-xs text-slate-400 font-medium">{day.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IntensityBadge level={day.intensity} />
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-2">
                  {day.exercises.map((ex, ei) => (
                    <div key={ei} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm">{ex.name}</p>
                        <p className="text-xs text-slate-400 font-medium">
                          {ex.sets} Sets × {ex.reps}
                          {ex.zone && <span className="ml-1 text-blue-500 font-semibold">| {ex.zone}</span>}
                        </p>
                      </div>
                      <RPEBadge value={ex.rpe} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <CTACard />
    </div>
  )
}

// ─── LAB TAB ──────────────────────────────────────────────────────────────────
function LabTab() {
  const [openSession, setOpenSession] = useState(0)
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111827] rounded-2xl p-6 border border-white/5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🔥</span>
              <h2 className="font-extrabold text-white text-xl">HIIT + Zone 2</h2>
            </div>
            <p className="text-white/40 text-sm font-medium">حرق الدهون الأمثل علمياً</p>
          </div>
          <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">مفعّل</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[{ label: 'Sessions / week', val: '4' }, { label: 'Min / week', val: '140' }, { label: 'Protocol', val: 'Zone 2 + HIIT' }]
            .map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <p className="font-extrabold text-white text-base">{s.val}</p>
                <p className="text-white/30 text-[10px] font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-slate-900 text-sm">HR Zone Chart</h3>
          <span className="text-xs text-slate-400 font-medium">Max HR: 185 bpm (Tanaka)</span>
        </div>
        <div className="space-y-2">
          {HR_ZONES.map((z, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-slate-500 w-6 text-right">{z.zone}</span>
              <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                <div className={`h-full ${z.color} rounded-lg opacity-80`} style={{ width: `${20 + i * 20}%` }} />
                <span className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-slate-700">{z.label}</span>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="text-[10px] font-bold text-slate-600">{z.range}</p>
                <p className="text-[10px] text-slate-400">{z.pct}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {LAB_SESSIONS.map((session, idx) => {
          const isOpen = openSession === idx
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button onClick={() => setOpenSession(isOpen ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-right hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#0a0a0a] rounded-xl flex items-center justify-center text-gold-400 font-extrabold text-sm">{idx + 1}</div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900 text-sm">{session.day} — {session.type}</p>
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Clock className="w-3 h-3" /> {session.duration}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IntensityBadge level={session.intensity} />
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-slate-600">{session.zone}</span>
                  </div>
                  <div className="space-y-2">
                    {session.exercises.map((ex, ei) => (
                      <div key={ei} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700">{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <CTACard />
    </div>
  )
}

// ─── PROGRESS TAB ─────────────────────────────────────────────────────────────
function ProgressTab() {
  const [form, setForm] = useState({ weight: '', waist: '', note: '' })
  const maxW = Math.max(...MOCK_PROGRESS.map(e => e.weight))
  const minW = Math.min(...MOCK_PROGRESS.map(e => e.weight))

  return (
    <div className="space-y-5">
      <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#1e3a5f,#1e40af)', minHeight: 140 }}>
        <div className="relative z-10 px-6 py-7">
          <p className="text-blue-200 text-xs font-extrabold uppercase tracking-widest mb-2">رحلتك</p>
          <h1 className="text-2xl font-extrabold text-white">متابعة التقدم 📈</h1>
          <p className="text-blue-200/70 text-sm mt-2 font-medium">سجّل قياساتك الأسبوعية وتابع تطورك</p>
        </div>
      </div>

      {/* Weight trend */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-500" /> منحنى الوزن
          </h3>
          <DemoBadge />
        </div>
        <div className="flex items-end gap-2 h-24 mb-3">
          {MOCK_PROGRESS.map((entry, i) => {
            const pct = maxW === minW ? 60 : 20 + ((entry.weight - minW) / (maxW - minW)) * 60
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-600">{entry.weight}</span>
                <div className="w-full bg-blue-500 rounded-t-lg transition-all"
                  style={{ height: `${pct}%` }} />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          {MOCK_PROGRESS.map((e, i) => (
            <span key={i}>{new Date(e.date).toLocaleDateString('ar', { month: 'short', day: 'numeric' })}</span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          <span className="text-emerald-600 font-extrabold text-sm">↓ {(MOCK_PROGRESS[0].weight - MOCK_PROGRESS.at(-1).weight).toFixed(1)} كغ</span>
          <span className="text-emerald-700 text-xs font-medium">إجمالي الخسارة منذ البداية</span>
        </div>
      </div>

      {/* Add measurement form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-extrabold text-slate-900 text-sm mb-4">إضافة قياس جديد</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide block mb-1.5">الوزن (كغ)</label>
            <input type="number" step="0.1" placeholder="88.0"
              value={form.weight} onChange={e => setForm(p => ({...p, weight: e.target.value}))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide block mb-1.5">الخصر (سم)</label>
            <input type="number" step="0.1" placeholder="90"
              value={form.waist} onChange={e => setForm(p => ({...p, waist: e.target.value}))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 transition" />
          </div>
        </div>
        <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-extrabold text-sm opacity-70 cursor-not-allowed" disabled>
          💾 حفظ القياس (تجريبي)
        </button>
      </div>
      <CTACard />
    </div>
  )
}

// ─── JOURNAL TAB ──────────────────────────────────────────────────────────────
function JournalTab() {
  const today = new Date().toLocaleDateString('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Qatar' })
  return (
    <div className="space-y-5">
      <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#0e7490,#0369a1)', minHeight: 130 }}>
        <div className="relative z-10 px-6 py-7">
          <p className="text-cyan-200 text-xs font-extrabold uppercase tracking-widest mb-2">سجلك اليومي</p>
          <h1 className="text-2xl font-extrabold text-white">يومياتي 💧</h1>
          <p className="text-cyan-200/70 text-sm mt-1 font-medium">{today}</p>
        </div>
      </div>
      <WaterDemo standalone />
      {/* Mood */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-extrabold text-slate-800 text-sm">حالتك اليوم</p>
          <DemoBadge />
        </div>
        <div className="flex gap-3 justify-center">
          {['😩','😔','😐','😊','😁'].map((e, i) => (
            <button key={i} className={`text-3xl p-2 rounded-xl transition-all ${i === 3 ? 'bg-amber-50 border-2 border-amber-300 scale-110' : 'hover:bg-slate-50'}`}>
              {e}
            </button>
          ))}
        </div>
      </div>
      {/* Log summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="font-extrabold text-slate-800 text-sm mb-3">تاريخ يومياتك (آخر 7 أيام)</p>
        <div className="flex gap-2">
          {['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'].map((day, i) => (
            <div key={day} className="flex-1 text-center">
              <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg mb-1 ${i < 5 ? 'bg-blue-500' : 'bg-slate-100 opacity-40'}`}>
                {i < 5 ? '💧' : ''}
              </div>
              <p className="text-[9px] text-slate-400 font-medium">{day.slice(0,3)}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs font-bold text-blue-600 mt-3">🔥 5 أيام متتالية — ممتاز!</p>
      </div>
      <CTACard />
    </div>
  )
}

// ─── SHOPPING TAB ─────────────────────────────────────────────────────────────
function ShoppingTab() {
  const total = MOCK_SHOPPING.reduce((s, c) => s + c.items.length, 0)
  const [checked, setChecked] = useState(new Set())

  function toggle(key) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const pct = Math.round((checked.size / total) * 100)

  return (
    <div className="space-y-5">
      <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#065f46,#047857)', minHeight: 130 }}>
        <div className="relative z-10 px-6 py-7 flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-xs font-extrabold uppercase tracking-widest mb-2">قائمتك الأسبوعية</p>
            <h1 className="text-2xl font-extrabold text-white">قائمة التسوق 🛒</h1>
            <p className="text-emerald-200/70 text-sm mt-1 font-medium">مولّدة من خطتك الغذائية</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-extrabold text-white">{pct}%</p>
            <p className="text-emerald-200 text-[10px] font-bold">مكتمل</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
          <span>{checked.size} / {total} عنصر</span>
          <DemoBadge />
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {MOCK_SHOPPING.map(cat => (
        <div key={cat.category} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <p className="font-extrabold text-slate-800 text-sm">{cat.category}</p>
          </div>
          <div className="divide-y divide-slate-50">
            {cat.items.map((item, i) => {
              const key = `${cat.category}-${i}`
              const done = checked.has(key)
              return (
                <button key={i} onClick={() => toggle(key)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 text-right transition hover:bg-slate-50 ${done ? 'opacity-50' : ''}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                    {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`flex-1 font-semibold text-sm ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.food}</span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{item.qty} {item.unit}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <CTACard />
    </div>
  )
}

// ─── PHOTOS TAB ───────────────────────────────────────────────────────────────
const DEMO_PHOTOS = [
  { id: '1', type: 'before',   date: '2026-05-01', emoji: '🏁' },
  { id: '2', type: 'progress', date: '2026-05-15', emoji: '📈' },
]

function PhotosTab() {
  return (
    <div className="space-y-5">
      <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#4c1d95,#5b21b6)', minHeight: 130 }}>
        <div className="relative z-10 px-6 py-7">
          <p className="text-purple-200 text-xs font-extrabold uppercase tracking-widest mb-2">توثيق رحلتك</p>
          <h1 className="text-2xl font-extrabold text-white">صوري 📸</h1>
          <p className="text-purple-200/70 text-sm mt-1 font-medium">قبل / تقدم / بعد — لك أنت فقط</p>
        </div>
      </div>

      {/* Upload demo */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
        <div className="text-5xl mb-3">📷</div>
        <p className="font-extrabold text-slate-800 text-sm mb-1">رفع صورة جديدة</p>
        <p className="text-xs text-slate-400 font-medium mb-4">JPEG / PNG / WebP — حد أقصى 200 كيلوبايت</p>
        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          {['before','progress','after'].map(t => (
            <span key={t} className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${t === 'progress' ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-400'}`}>
              {t === 'before' ? 'قبل 🏁' : t === 'progress' ? 'تقدم 📈' : 'بعد 🏆'}
            </span>
          ))}
        </div>
        <button className="px-6 py-2.5 bg-violet-100 text-violet-700 rounded-xl font-bold text-sm cursor-not-allowed opacity-70" disabled>
          اختيار صورة (تجريبي)
        </button>
      </div>

      {/* Demo gallery */}
      <div>
        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">📂 صورك المحفوظة</p>
        <div className="grid grid-cols-3 gap-3">
          {DEMO_PHOTOS.map(p => (
            <div key={p.id} className="relative aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex flex-col items-center justify-center gap-1">
              <span className="text-4xl">{p.emoji}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.type === 'before' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                {p.type === 'before' ? 'قبل' : 'تقدم'}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">{p.date}</span>
            </div>
          ))}
          <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-300">
            <Camera className="w-6 h-6" />
            <span className="text-[10px] font-medium">إضافة</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
        <p className="text-xs text-slate-400 font-medium">🔒 صورك خاصة — لا يراها إلا المدرب وأنت</p>
      </div>
      <CTACard />
    </div>
  )
}

// ─── RESOURCES TAB ────────────────────────────────────────────────────────────
function ResourcesTab() {
  return (
    <div className="space-y-5">
      <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#1e293b,#334155)', minHeight: 130 }}>
        <div className="relative z-10 px-6 py-7">
          <p className="text-slate-400 text-xs font-extrabold uppercase tracking-widest mb-2">من المدرب أمين</p>
          <h1 className="text-2xl font-extrabold text-white">ملفاتي 📎</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">ملفات وأدلة خاصة بك</p>
        </div>
      </div>

      <div className="space-y-3">
        {MOCK_RESOURCES.map((file, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <span className="text-3xl flex-shrink-0">{file.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-slate-900 text-sm truncate">{file.name}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{file.size}</p>
            </div>
            <button className="flex-shrink-0 px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold cursor-not-allowed opacity-60" disabled>
              تنزيل
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
        <p className="text-xs text-amber-700 font-medium">في النسخة الحقيقية يتمكن المدرب من رفع ملفات PDF وروابط لك مباشرة</p>
      </div>
      <CTACard />
    </div>
  )
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setTab, open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}
      <aside className={`
        fixed top-[44px] right-0 h-[calc(100%-44px)] z-30 w-60
        bg-[#0a0a0a] flex flex-col border-l border-white/5
        lg:static lg:h-full transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between px-5 py-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gold-400 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" fill="black" />
            </div>
            <span className="text-white font-extrabold text-sm tracking-wider uppercase">
              Amine<span className="text-gold-400">Fit</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/30 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 mb-4 font-bold">بوابتك الشخصية</p>
          {TABS.map(({ id, icon: Icon, label }) => {
            const active = activeTab === id
            return (
              <button key={id} onClick={() => { setTab(id); onClose() }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${active ? 'bg-gold-400 text-black' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-black' : 'text-white/25'}`} />
                <span className={`font-bold text-sm flex-1 text-right ${active ? 'text-black' : ''}`}>{label}</span>
              </button>
            )
          })}
        </nav>

        <div className="px-4 pb-5 pt-3 border-t border-white/5">
          <Link href="/#pricing"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-400 text-black font-extrabold text-sm hover:bg-gold-300 transition shadow-lg shadow-gold-400/20">
            <Zap className="w-4 h-4" fill="black" />
            اختر خطتك
          </Link>
        </div>
      </aside>
    </>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const TAB_TITLES = {
    dashboard: 'الرئيسية',
    nutrition:  'الخطة الغذائية',
    training:   'الخطة التدريبية',
    lab:        'المختبر 🔬',
    progress:   'متابعة التقدم',
    journal:    'يوميتي 💧',
    shopping:   'قائمة التسوق 🛒',
    photos:     'صوري 📸',
    resources:  'ملفاتي 📎',
  }

  return (
    <div dir="rtl" className="flex h-screen bg-[#f5f5f5] overflow-hidden">
      <div className="fixed top-0 inset-x-0 z-50 h-[44px] bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-4 flex items-center gap-3 shadow-lg">
        <FlaskConical className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-bold flex-1 truncate">
          وضع العرض التجريبي — هذه نسخة تجريبية من منصة Amine-Fit
        </span>
        <Link href="/#pricing"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-extrabold hover:bg-black/80 transition whitespace-nowrap flex-shrink-0">
          اختر خطتك ←
        </Link>
      </div>

      <div className="flex w-full mt-[44px] h-[calc(100%-44px)] overflow-hidden">
        <Sidebar activeTab={activeTab} setTab={setActiveTab} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center gap-4 flex-shrink-0">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full hidden sm:block">
              🔬 جولة تجريبية
            </span>
            <div className="w-9 h-9 rounded-full bg-[#0a0a0a] text-gold-400 flex items-center justify-center font-extrabold text-base">م</div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-3xl mx-auto">
              {activeTab === 'dashboard'  && <DashboardTab />}
              {activeTab === 'nutrition'  && <NutritionTab />}
              {activeTab === 'training'   && <TrainingTab />}
              {activeTab === 'lab'        && <LabTab />}
              {activeTab === 'progress'   && <ProgressTab />}
              {activeTab === 'journal'    && <JournalTab />}
              {activeTab === 'shopping'   && <ShoppingTab />}
              {activeTab === 'photos'     && <PhotosTab />}
              {activeTab === 'resources'  && <ResourcesTab />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
