'use client'
import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'

/* ══════════════════════════════════════════════════════════════
   WEB AUDIO MUSIC ENGINE
   Motivational 120-BPM beat: kick/clap/hat + bass + melody
══════════════════════════════════════════════════════════════ */
const _BPM  = 120
const _B    = 60 / _BPM       // 0.5s per beat
const _BAR  = _B * 4          // 2.0s per bar
const _P5   = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25] // C4..C5 pentatonic

function _kick(ctx, dest, t) {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.connect(g); g.connect(dest); o.type = 'sine'
  o.frequency.setValueAtTime(160, t)
  o.frequency.exponentialRampToValueAtTime(28, t + 0.38)
  g.gain.setValueAtTime(1.0, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
  o.start(t); o.stop(t + 0.4)
}

function _clap(ctx, dest, t) {
  const buf = ctx.createBuffer(1, ~~(ctx.sampleRate * 0.18), ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.035))
  const src = ctx.createBufferSource(); src.buffer = buf
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 1.2
  const g = ctx.createGain()
  src.connect(f); f.connect(g); g.connect(dest)
  g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
  src.start(t); src.stop(t + 0.18)
}

function _hat(ctx, dest, t, vol = 0.1) {
  const buf = ctx.createBuffer(1, ~~(ctx.sampleRate * 0.055), ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource(); src.buffer = buf
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 8500
  const g = ctx.createGain()
  src.connect(f); f.connect(g); g.connect(dest)
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.055)
  src.start(t); src.stop(t + 0.055)
}

function _bass(ctx, dest, t, freq, dur) {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.connect(g); g.connect(dest); o.type = 'sawtooth'; o.frequency.value = freq
  g.gain.setValueAtTime(0.38, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.start(t); o.stop(t + dur + 0.05)
}

function _note(ctx, dest, t, freq, dur, vol = 0.11) {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.connect(g); g.connect(dest); o.type = 'triangle'; o.frequency.value = freq
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.start(t); o.stop(t + dur + 0.05)
}

// Bass pattern: [beat_offset, freq_hz, dur_beats]
const _BASS = [[0,65.41,0.85],[1,65.41,0.4],[2,87.31,0.45],[3,98.00,0.55]]

// Melody (2-bar, beat-indexed): G4 E4 G4 A4 C5 A4 G4 | E4 G4 A4 C5(long) G4 E4
const _MEL = [
  [0,3,0.45],[0.5,2,0.35],[1,3,0.35],[1.5,4,0.35],[2,5,0.55],[2.5,4,0.35],[3,3,0.6],
  [4,2,0.4],[4.5,3,0.4],[5,4,0.4],[5.5,5,1.0],[7,3,0.45],[7.5,2,0.6]
]

function _scheduleBar(ctx, dest, t, idx) {
  for (let b = 0; b < 4; b++) {
    const bt = t + b * _B
    _kick(ctx, dest, bt)
    _hat(ctx, dest, bt, 0.07)
    _hat(ctx, dest, bt + _B * 0.5, 0.12)
    if (b === 1 || b === 3) _clap(ctx, dest, bt)
  }
  _BASS.forEach(([bo, freq, dur]) => _bass(ctx, dest, t + bo * _B, freq, dur * _B))
  if (idx % 2 === 0) {
    _MEL.forEach(([bo, ni, dur]) => _note(ctx, dest, t + bo * _B, _P5[ni], dur * _B))
  }
}

function useMusicEngine() {
  const ctxRef   = useRef(null)
  const timerRef = useRef(null)
  const nextRef  = useRef(0)
  const barRef   = useRef(0)
  const mutedRef = useRef(true)
  const [muted, setMuted] = useState(true)

  // Stable refs so useEffect deps don't thrash
  const stopRef = useRef(null)
  const startRef = useRef(null)

  stopRef.current = () => {
    clearInterval(timerRef.current)
    timerRef.current = null
    if (ctxRef.current) { ctxRef.current.close().catch(() => {}); ctxRef.current = null }
  }

  startRef.current = () => {
    if (mutedRef.current) return
    stopRef.current()
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    const master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination)
    ctxRef.current = ctx
    nextRef.current = ctx.currentTime + 0.1
    barRef.current = 0
    const tick = () => {
      while (nextRef.current < ctx.currentTime + 0.3) {
        _scheduleBar(ctx, master, nextRef.current, barRef.current)
        nextRef.current += _BAR
        barRef.current++
      }
    }
    tick()
    timerRef.current = setInterval(tick, 100)
  }

  function toggle() {
    const nm = !mutedRef.current
    mutedRef.current = nm
    setMuted(nm)
    if (nm) stopRef.current()
    else startRef.current()
  }

  useEffect(() => () => stopRef.current(), [])

  return { muted, toggle, start: () => startRef.current(), stop: () => stopRef.current() }
}

/* ── animation helpers ── */
function lerp(a, b, t) { return a + (b - a) * t }

function getCursor(frames, p) {
  for (let i = 1; i < frames.length; i++) {
    if (p <= frames[i][0]) {
      const [p0, x0, y0] = frames[i - 1], [p1, x1, y1] = frames[i]
      const t = p1 === p0 ? 1 : (p - p0) / (p1 - p0)
      return { x: lerp(x0, x1, t), y: lerp(y0, y1, t) }
    }
  }
  const l = frames[frames.length - 1]; return { x: l[1], y: l[2] }
}

function typed(text, p, s, e) {
  if (p < s) return ''
  return text.slice(0, Math.floor(Math.min((p - s) / (e - s), 1) * text.length))
}

/* ── Browser Chrome ── */
function Browser({ url, children }) {
  return (
    <div className="flex flex-col h-full bg-[#1c1c1e] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#2c2c2e] border-b border-white/5 flex-shrink-0">
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-1.5 flex-1 min-w-0 mx-1">
          <button className="text-white/20 hover:text-white/40 text-[10px] px-0.5">‹</button>
          <button className="text-white/20 hover:text-white/40 text-[10px] px-0.5">›</button>
        </div>
        <div className="flex items-center gap-2 flex-1 bg-[#3a3a3c] rounded-md px-2.5 py-1 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 flex-shrink-0" />
          <span className="text-white/35 text-[9px] font-mono truncate" dir="ltr">{url}</span>
        </div>
        <div className="flex gap-1.5 ml-1">
          <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center">
            <span className="text-white/20 text-[8px]">⊕</span>
          </div>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">{children}</div>
    </div>
  )
}

/* ── Cursor ── */
function Cursor({ x, y, click }) {
  return (
    <div className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: 20, transform: 'translate(-3px,-2px)',
        transition: 'left 0.5s cubic-bezier(.4,0,.2,1), top 0.5s cubic-bezier(.4,0,.2,1)' }}>
      <svg width="16" height="20" viewBox="0 0 16 20" style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,.7))' }}>
        <path d="M0 0L0 17L4.5 12.5L7.5 19.5L9.5 18.5L6.5 11.5L12 11.5Z" fill="white" stroke="rgba(0,0,0,.3)" strokeWidth="0.8" />
      </svg>
      {click && <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full border-2 border-gold-400 animate-ping opacity-80" />}
    </div>
  )
}

/* ══════════════════════════════════════
   SCENE 1 — Landing Page (full scroll)
══════════════════════════════════════ */
function S1_Landing({ p }) {
  const scrollY = p > 0.22 ? Math.min((p - 0.22) / 0.60, 1) * 48 : 0
  return (
    <div className="h-full overflow-hidden" style={{ background: '#0a0a0a' }}>
      <div style={{ transform: `translateY(-${scrollY}%)`, transition: 'transform 0.08s linear' }}>
        {/* Navbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#fbbf24] rounded-md flex items-center justify-center">
              <span className="text-black text-[8px] font-black">⚡</span>
            </div>
            <span className="text-white font-black text-[10px] tracking-widest">AMINE<span className="text-[#fbbf24]">FIT</span></span>
          </div>
          <div className="flex gap-2.5">
            {['الخدمات','الأسعار','كيف يعمل'].map(l => (
              <span key={l} className="text-white/25 text-[8px]">{l}</span>
            ))}
          </div>
          <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg px-2 py-0.5">
            <span className="text-[#fbbf24] text-[8px] font-black">دخول العميل</span>
          </div>
        </div>
        {/* Promo */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white text-center py-1.5">
          <span className="text-[8px] font-bold">🔥 عرض الإطلاق — خصم 50% على جميع الباقات • محدود</span>
        </div>
        {/* Hero */}
        <div className="px-4 pt-4 pb-3 text-center" style={{ opacity: p > 0.02 ? 1 : 0, transition: 'opacity 0.5s' }}>
          <div className="inline-flex items-center gap-1 bg-[#fbbf24]/10 border border-[#fbbf24]/25 rounded-full px-2.5 py-1 mb-3">
            <span className="text-[#fbbf24] text-[7px] font-black">⭐ خبرة 10 سنوات — القوات الخاصة والغواصين البحريين</span>
          </div>
          <h1 className="text-white font-black leading-tight mb-2 tracking-tight" style={{ fontSize: 'clamp(13px,2.5vw,20px)' }}>
            برنامجك المخصص بالكامل<br />
            <span className="text-[#fbbf24]">من المدرب أمين حمدي</span>
          </h1>
          <p className="text-white/35 mb-3 max-w-xs mx-auto" style={{ fontSize: '8px', lineHeight: 1.6 }}>
            تدريب + تغذية + متابعة أسبوعية — مصمّم خصيصاً لك وجاهز خلال 24 ساعة
          </p>
          <div className="flex gap-2 justify-center">
            <div className="bg-[#fbbf24] rounded-xl px-3 py-1.5 shadow-lg shadow-[#fbbf24]/25">
              <span className="text-black text-[9px] font-black">اشترك الآن ⚡</span>
            </div>
            <div className="border border-white/15 rounded-xl px-3 py-1.5">
              <span className="text-white/50 text-[8px]">اكتشف أكثر</span>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-1.5 px-3 mt-1" style={{ opacity: p > 0.15 ? 1 : 0, transition: 'opacity 0.6s' }}>
          {[['100+','عميل راضٍ'],['95%','نسبة النجاح'],['10+','سنوات خبرة'],['24h','استجابة']].map(([v,l]) => (
            <div key={l} className="bg-white/[0.04] border border-white/8 rounded-xl p-2 text-center">
              <p className="text-[#fbbf24] font-black text-xs">{v}</p>
              <p className="text-white/25 text-[7px] leading-tight">{l}</p>
            </div>
          ))}
        </div>
        {/* How it works */}
        <div className="px-3 mt-3" style={{ opacity: p > 0.35 ? 1 : 0, transition: 'opacity 0.6s' }}>
          <p className="text-white/20 text-[7px] font-black uppercase tracking-widest text-center mb-2">كيف يعمل</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              ['1️⃣','سجّل واملأ الاستبيان','خلال 5 دقائق'],
              ['2️⃣','يراجع المدرب بياناتك','خلال 24 ساعة'],
              ['3️⃣','احصل على برنامجك','جاهز للبدء فوراً'],
            ].map(([i,n,d]) => (
              <div key={n} className="bg-white/[0.03] border border-white/8 rounded-xl p-2 text-center">
                <div className="text-lg mb-0.5">{i}</div>
                <p className="text-white/60 text-[7px] font-bold leading-tight">{n}</p>
                <p className="text-white/25 text-[6px] mt-0.5">{d}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Services */}
        <div className="px-3 mt-3" style={{ opacity: p > 0.50 ? 1 : 0, transition: 'opacity 0.6s' }}>
          <p className="text-white/20 text-[7px] font-black uppercase tracking-widest text-center mb-2">ما تحصل عليه</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[['🏋️','برنامج تدريب','مصمّم لهدفك'],['🥗','خطة تغذية','ADA علمية دقيقة'],['📊','متابعة أسبوعية','تقارير وتعديلات']].map(([i,n,d]) => (
              <div key={n} className="bg-white/[0.03] border border-white/8 rounded-xl p-2 text-center">
                <div className="text-lg mb-0.5">{i}</div>
                <p className="text-white/60 text-[7px] font-bold">{n}</p>
                <p className="text-white/25 text-[6px] mt-0.5">{d}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Pricing preview */}
        <div className="px-3 mt-3" style={{ opacity: p > 0.65 ? 1 : 0, transition: 'opacity 0.6s' }}>
          <p className="text-white/20 text-[7px] font-black uppercase tracking-widest text-center mb-2">الأسعار</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { n:'التدريب فقط', p:'50',  h:false },
              { n:'الشهرية ⭐',  p:'125', h:true  },
              { n:'3 أشهر',      p:'300', h:false },
            ].map(c => (
              <div key={c.n} className={`rounded-xl p-2 text-center border ${c.h ? 'bg-[#fbbf24]/12 border-[#fbbf24]/40 scale-[1.04]' : 'bg-white/[0.03] border-white/8'}`}>
                <p className={`font-black text-[8px] ${c.h ? 'text-[#fbbf24]' : 'text-white/50'}`}>{c.n}</p>
                <p className={`font-black text-xs ${c.h ? 'text-[#fbbf24]' : 'text-white/40'}`}>{c.p}<span className="text-[7px] font-medium"> د.ت</span></p>
              </div>
            ))}
          </div>
        </div>
        {/* Testimonials */}
        <div className="px-3 mt-3 pb-2" style={{ opacity: p > 0.80 ? 1 : 0, transition: 'opacity 0.6s' }}>
          <p className="text-white/20 text-[7px] font-black uppercase tracking-widest text-center mb-2">آراء العملاء</p>
          <div className="flex gap-1.5">
            {[
              { name:'محمد خ.', txt:'خسرت 8 كغ في شهرين!', stars:5 },
              { name:'سارة م.',  txt:'أفضل استثمار لصحتي', stars:5 },
            ].map(t => (
              <div key={t.name} className="flex-1 bg-white/[0.03] border border-white/8 rounded-xl p-2">
                <div className="flex gap-0.5 mb-1">{[...Array(t.stars)].map((_,i) => <span key={i} className="text-[#fbbf24] text-[8px]">★</span>)}</div>
                <p className="text-white/40 text-[7px] leading-snug">"{t.txt}"</p>
                <p className="text-white/20 text-[6px] mt-1">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   SCENE 2 — Pricing + Click a plan
══════════════════════════════════════ */
function S2_Pricing({ p }) {
  const showModal = p > 0.65
  return (
    <div className="h-full overflow-hidden relative" style={{ background: '#0a0a0a' }}>
      <div className="px-3 pt-3">
        <p className="text-[#fbbf24] text-[7px] font-black uppercase tracking-widest text-center mb-1">الأسعار</p>
        <p className="text-white font-black text-center mb-3" style={{ fontSize: 'clamp(10px,2vw,14px)' }}>اختر الباقة الأنسب لك</p>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { n:'التدريب فقط', p:'50',  feats:['برنامج تدريبي','دعم واتساب','بوابة العميل'],         h:false },
            { n:'الشهرية',     p:'125', feats:['تدريب + تغذية','متابعة أسبوعية','7 أيام ضمان كامل'], h:true  },
            { n:'3 أشهر',      p:'300', feats:['كل الباقة الشهرية','مكالمة شهرية','ضمان النتيجة'],   h:false },
          ].map((c, i) => (
            <div key={c.n}
              className={`rounded-2xl border p-2.5 flex flex-col transition-all duration-300 ${c.h
                ? 'bg-[#fbbf24]/10 border-[#fbbf24]/40 scale-105 shadow-lg shadow-[#fbbf24]/10'
                : 'bg-white/[0.03] border-white/10'}`}
              style={{ opacity: p > i * 0.08 ? 1 : 0, transition: 'opacity 0.4s' }}>
              {c.h && <span className="text-[6px] font-black text-[#fbbf24] bg-[#fbbf24]/15 rounded-full px-1.5 py-0.5 self-start mb-1">⭐ الأكثر طلباً</span>}
              <p className={`font-black text-[9px] ${c.h ? 'text-[#fbbf24]' : 'text-white/60'}`}>{c.n}</p>
              <p className={`font-black text-sm mb-1.5 ${c.h ? 'text-[#fbbf24]' : 'text-white'}`}>{c.p}<span className="text-[7px] opacity-60"> د.ت</span></p>
              {c.feats.map(f => (
                <div key={f} className="flex items-center gap-1 mb-0.5">
                  <span className={`text-[7px] ${c.h ? 'text-emerald-400' : 'text-white/20'}`}>✓</span>
                  <span className={`text-[7px] ${c.h ? 'text-white/55' : 'text-white/20'}`}>{f}</span>
                </div>
              ))}
              <div className={`mt-auto pt-2 rounded-lg py-1 text-center text-[7px] font-black ${c.h ? 'bg-[#fbbf24] text-black' : 'bg-white/5 text-white/30'}`}>
                اختر هذه
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center"
          style={{ opacity: Math.min((p - 0.65) / 0.08, 1) }}>
          <div className="bg-[#161616] border border-[#fbbf24]/35 rounded-2xl p-4 w-[58%] max-w-[190px]">
            <div className="text-center mb-3">
              <span className="text-2xl">⚡</span>
              <p className="text-[#fbbf24] font-black text-[10px] mt-1">الباقة الشهرية</p>
              <p className="text-white font-black text-lg">125 <span className="text-white/30 text-[8px] font-medium">د.ت / شهر</span></p>
            </div>
            {['تدريب مخصص 100%','خطة غذائية ADA','متابعة أسبوعية','تقارير تقدم أسبوعية','7 أيام استرداد كامل'].map(f => (
              <div key={f} className="flex items-center gap-1.5 mb-1.5">
                <span className="text-emerald-400 text-[9px]">✓</span>
                <span className="text-white/55 text-[8px]">{f}</span>
              </div>
            ))}
            <div className={`bg-[#fbbf24] rounded-xl py-2 text-center mt-3 transition-transform ${p > 0.88 ? 'scale-105 shadow-lg shadow-[#fbbf24]/30' : ''}`}>
              <span className="text-black font-black text-[9px]">ابدأ الآن ⚡</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   SCENE 3 — Registration Form (5 steps)
══════════════════════════════════════ */
function S3_Register({ p }) {
  const name  = typed('أحمد محمد الرياضي', p, 0.14, 0.40)
  const email = typed('ahmed.sport@gmail.com', p, 0.46, 0.72)
  const phone = typed('50123456', p, 0.72, 0.88)
  return (
    <div className="h-full overflow-auto bg-white">
      <div className="px-3 pt-3">
        {/* Steps */}
        <div className="flex gap-1 mb-3">
          {['المعلومات','الأهداف','التغذية','الصحة','الالتزام'].map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full mb-0.5 ${i === 0 ? 'bg-blue-500' : 'bg-slate-200'}`} />
              <p className="text-[6px] text-slate-300 text-center truncate">{s}</p>
            </div>
          ))}
        </div>
        {/* Plan badge */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-2.5 py-2 flex items-center gap-2 mb-3"
          style={{ opacity: p > 0.04 ? 1 : 0, transition: 'opacity 0.5s' }}>
          <span className="text-base">⚡</span>
          <div>
            <p className="text-blue-700 font-black text-[8px]">الباقة الشهرية — 125 د.ت</p>
            <p className="text-blue-400 text-[7px]">تدريب + تغذية + متابعة 30 يوم</p>
          </div>
          <span className="mr-auto text-emerald-500 text-[9px] font-black">✓</span>
        </div>
        <p className="text-slate-700 font-black text-[10px] mb-3">الخطوة 1 — المعلومات الأساسية</p>
        {/* Name */}
        <div className="mb-2.5">
          <label className="text-[8px] font-bold text-slate-500 mb-1 block">الاسم الكامل *</label>
          <div className={`border-2 rounded-xl px-2.5 py-2 text-[9px] font-medium transition-all min-h-[28px] flex items-center ${p > 0.11 && p < 0.43 ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
            {name ? <span className="text-slate-800">{name}{p > 0.11 && p < 0.43 ? <span className="animate-pulse text-blue-500 ml-px">|</span> : null}</span>
                  : <span className="text-slate-300">الاسم الكامل</span>}
          </div>
        </div>
        {/* Email */}
        <div className="mb-2.5">
          <label className="text-[8px] font-bold text-slate-500 mb-1 block">البريد الإلكتروني *</label>
          <div className={`border-2 rounded-xl px-2.5 py-2 text-[9px] font-medium transition-all min-h-[28px] flex items-center ${p > 0.43 && p < 0.75 ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 bg-white'}`} dir="ltr">
            {email ? <span className="text-slate-800">{email}{p > 0.43 && p < 0.75 ? <span className="animate-pulse text-blue-500 ml-px">|</span> : null}</span>
                   : <span className="text-slate-300">email@example.com</span>}
          </div>
        </div>
        {/* Phone */}
        <div className="mb-2.5" style={{ opacity: p > 0.55 ? 1 : 0, transition: 'opacity 0.5s' }}>
          <label className="text-[8px] font-bold text-slate-500 mb-1 block">رقم الهاتف *</label>
          <div className={`border-2 rounded-xl px-2.5 py-2 text-[9px] font-medium transition-all min-h-[28px] flex items-center ${p > 0.70 && p < 0.90 ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 bg-white'}`} dir="ltr">
            {phone ? <span className="text-slate-800">+974 {phone}{p > 0.70 && p < 0.90 ? <span className="animate-pulse text-blue-500 ml-px">|</span> : null}</span>
                   : <span className="text-slate-300">+974 XXXXXXXX</span>}
          </div>
        </div>
        {/* Gender */}
        <div className="mb-3" style={{ opacity: p > 0.62 ? 1 : 0, transition: 'opacity 0.5s' }}>
          <label className="text-[8px] font-bold text-slate-500 mb-1 block">الجنس *</label>
          <div className="flex gap-2">
            {['ذكر','أنثى'].map((g, i) => (
              <div key={g} className={`flex-1 border-2 rounded-xl px-2 py-1.5 text-center text-[8px] font-bold transition-all ${i === 0 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-400'}`}>{g}</div>
            ))}
          </div>
        </div>
        {/* Next */}
        <div className={`w-full rounded-xl py-2 text-center text-[9px] font-black text-white transition-all ${p > 0.85 ? 'bg-blue-600 scale-[1.02] shadow-lg shadow-blue-500/25' : 'bg-blue-400'}`}>
          {p > 0.93 ? '⏳ جارٍ الإرسال...' : 'التالي — الأهداف ←'}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   SCENE 4 — Waiting for Trainer Approval
══════════════════════════════════════ */
function S4_Pending({ p }) {
  const dots = ['','.','..',  '...'][Math.floor(p * 16) % 4]
  return (
    <div className="h-full flex flex-col items-center justify-center px-4" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-[220px]"
        style={{ opacity: p > 0.04 ? 1 : 0, transform: `translateY(${p > 0.04 ? 0 : 12}px)`, transition: 'all 0.5s' }}>

        {/* Success check */}
        <div className="w-14 h-14 bg-emerald-500/15 border-2 border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ opacity: p > 0.12 ? 1 : 0, transform: `scale(${p > 0.12 ? 1 : 0.5})`, transition: 'all 0.5s cubic-bezier(.34,1.56,.64,1)' }}>
          <span className="text-emerald-400 text-xl">✓</span>
        </div>

        <p className="text-white font-black text-[12px] text-center mb-1"
          style={{ opacity: p > 0.18 ? 1 : 0, transition: 'opacity 0.4s' }}>تم إرسال طلبك! 🎉</p>
        <p className="text-white/30 text-[8px] text-center mb-4 leading-relaxed"
          style={{ opacity: p > 0.24 ? 1 : 0, transition: 'opacity 0.4s' }}>
          المدرب أمين يراجع بياناتك الآن{dots}
        </p>

        {/* Status timeline */}
        <div className="space-y-2">
          {[
            { icon:'✅', text:'تم استلام الاستبيان بنجاح',    done:true,  active:false, delay:0.28 },
            { icon:'👨‍💼', text:'المدرب يراجع بياناتك (1-24 ساعة)', done:false, active:true,  delay:0.40 },
            { icon:'📋', text:'إعداد البرنامج المخصص لك',      done:false, active:false, delay:0.54 },
            { icon:'📧', text:'إرسال البرنامج + تفعيل حسابك',  done:false, active:false, delay:0.66 },
            { icon:'🚀', text:'ابدأ رحلتك في بوابة العميل',    done:false, active:false, delay:0.78 },
          ].map((s, i) => (
            <div key={i}
              className={`flex items-center gap-2 rounded-xl px-2.5 py-2 border transition-all ${
                s.active  ? 'bg-[#fbbf24]/10 border-[#fbbf24]/30' :
                s.done    ? 'bg-emerald-500/8 border-emerald-500/20' :
                            'bg-white/[0.02] border-white/5'}`}
              style={{ opacity: p > s.delay ? 1 : 0, transform: `translateX(${p > s.delay ? 0 : 8}px)`, transition: 'all 0.4s' }}>
              <span style={{ fontSize: '10px' }}>{s.icon}</span>
              <span className={`text-[8px] font-bold flex-1 ${s.active ? 'text-[#fbbf24]' : s.done ? 'text-emerald-400' : 'text-white/25'}`}>
                {s.text}
              </span>
              {s.active && (
                <div className="flex gap-0.5">
                  {[0,1,2].map(d => (
                    <div key={d} className="w-1 h-1 rounded-full bg-[#fbbf24] animate-bounce" style={{ animationDelay: `${d*0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-white/15 text-[7px] text-center mt-3"
          style={{ opacity: p > 0.85 ? 1 : 0, transition: 'opacity 0.4s' }}>
          ستصلك رسالة على ahmed.sport@gmail.com ✉️
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   SCENE 5 — Client Login
══════════════════════════════════════ */
function S5_Login({ p }) {
  const emailTyped = typed('ahmed.sport@gmail.com', p, 0.14, 0.44)
  const dotCount   = Math.floor(typed('12345678', p, 0.50, 0.74).length)
  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="w-[62%] max-w-[200px]"
        style={{ opacity: p > 0.04 ? 1 : 0, transform: `translateY(${p > 0.04 ? 0 : 10}px)`, transition: 'all 0.5s' }}>
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-[#fbbf24] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-[#fbbf24]/20">
            <span className="text-black font-black text-sm">⚡</span>
          </div>
          <p className="text-white font-black text-[11px]">بوابة العميل</p>
          <p className="text-white/25 text-[8px] mt-0.5">تم تفعيل حسابك ✓</p>
        </div>
        {/* Email */}
        <div className="mb-2">
          <label className="text-white/40 text-[7px] font-bold mb-0.5 block">البريد الإلكتروني</label>
          <div className={`border rounded-xl px-2.5 py-1.5 text-[8px] font-medium min-h-[26px] flex items-center transition-colors ${p > 0.11 && p < 0.48 ? 'border-[#fbbf24]/60 bg-[#fbbf24]/5' : 'border-white/10 bg-white/[0.03]'}`} dir="ltr">
            {emailTyped ? <span className="text-white">{emailTyped}{p > 0.11 && p < 0.48 ? <span className="animate-pulse text-[#fbbf24] ml-px">|</span> : null}</span>
                        : <span className="text-white/15">email@example.com</span>}
          </div>
        </div>
        {/* Password */}
        <div className="mb-3">
          <label className="text-white/40 text-[7px] font-bold mb-0.5 block">كلمة المرور</label>
          <div className={`border rounded-xl px-2.5 py-1.5 text-[10px] font-medium min-h-[26px] flex items-center transition-colors ${p > 0.47 && p < 0.78 ? 'border-[#fbbf24]/60 bg-[#fbbf24]/5' : 'border-white/10 bg-white/[0.03]'}`}>
            {dotCount > 0 ? <span className="text-white tracking-widest">{'●'.repeat(dotCount)}{p > 0.47 && p < 0.78 ? <span className="animate-pulse text-[#fbbf24] ml-px text-[8px]">|</span> : null}</span>
                          : <span className="text-white/15 text-[8px]">••••••••</span>}
          </div>
        </div>
        <div className={`w-full bg-[#fbbf24] rounded-xl py-2 text-center font-black transition-all ${p > 0.82 ? 'scale-[1.03] shadow-lg shadow-[#fbbf24]/25' : ''}`}
          style={{ fontSize: '9px' }}>
          {p > 0.9 ? '✓ جارٍ الدخول...' : 'دخول إلى المنصة →'}
        </div>
        <p className="text-white/15 text-[7px] text-center mt-2">نسيت كلمة المرور؟</p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   SCENE 6 — Client Dashboard
══════════════════════════════════════ */
function S6_Dashboard({ p }) {
  const ringFill = Math.min(p * 1.1, 1) * 60
  const cards = [
    { v:'18/30', l:'يوم التقدم',  c:'#fbbf24' },
    { v:'82.5',  l:'كغ الوزن الحالي', c:'#ffffff' },
    { v:'1,840', l:'kcal هدف اليوم', c:'#34d399' },
    { v:'−3.7',  l:'كغ خسرتها',  c:'#34d399' },
  ]
  return (
    <div className="h-full flex" style={{ background: '#0a0a0a' }}>
      {/* Sidebar */}
      <div className="w-11 bg-[#111] border-r border-white/5 flex flex-col items-center py-3 gap-2.5 flex-shrink-0">
        <div className="w-7 h-7 bg-[#fbbf24] rounded-xl flex items-center justify-center mb-1">
          <span className="text-black text-[9px] font-black">⚡</span>
        </div>
        {[
          { i:'🏠', active:true  },
          { i:'🥗', active:false },
          { i:'🏋️', active:false },
          { i:'📊', active:false },
          { i:'📝', active:false },
          { i:'📷', active:false },
        ].map((item, idx) => (
          <div key={idx} className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs cursor-pointer transition-all
            ${item.active ? 'bg-[#fbbf24]/15 border border-[#fbbf24]/30' : 'hover:bg-white/5'}`}>
            {item.i}
          </div>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 p-3 overflow-hidden">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <p className="text-white font-black" style={{ fontSize: '9px' }}>أهلاً، أحمد 👋</p>
            <p className="text-white/25" style={{ fontSize: '7px' }}>الاثنين 03 يونيو 2026</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="w-6 h-6 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/30 flex items-center justify-center">
              <span className="text-[#fbbf24] font-black" style={{ fontSize: '8px' }}>أ</span>
            </div>
          </div>
        </div>
        {/* Progress ring */}
        <div className="bg-white/[0.04] border border-white/8 rounded-xl p-2.5 flex items-center gap-2.5 mb-2"
          style={{ opacity: p > 0.08 ? 1 : 0, transition: 'opacity 0.5s' }}>
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-12 h-12" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="4" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#fbbf24" strokeWidth="4"
                strokeDasharray={`${(ringFill * 0.879).toFixed(1)} 87.96`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.3s' }} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-black text-[#fbbf24]" style={{ fontSize: '8px' }}>
              {Math.round(ringFill)}%
            </span>
          </div>
          <div>
            <p className="text-white font-black" style={{ fontSize: '9px' }}>تقدم البرنامج</p>
            <p className="text-white/30" style={{ fontSize: '7px' }}>18 يوم من 30 مكتملة</p>
            <div className="flex gap-0.5 mt-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={`rounded-full ${i < 5 ? 'bg-[#fbbf24]' : 'bg-white/10'}`} style={{ width: '12px', height: '5px' }} />
              ))}
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {cards.map((c, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/8 rounded-xl p-2"
              style={{ opacity: p > 0.18 + i * 0.10 ? 1 : 0, transform: `translateY(${p > 0.18 + i * 0.10 ? 0 : 5}px)`, transition: 'all 0.4s' }}>
              <p className="font-black text-xs" style={{ color: c.c }}>{c.v}</p>
              <p className="text-white/25 mt-0.5" style={{ fontSize: '7px' }}>{c.l}</p>
            </div>
          ))}
        </div>
        {/* Next session */}
        <div className="bg-[#fbbf24]/8 border border-[#fbbf24]/20 rounded-xl p-2"
          style={{ opacity: p > 0.65 ? 1 : 0, transition: 'opacity 0.5s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#fbbf24] font-black" style={{ fontSize: '8px' }}>💪 تمرين اليوم</p>
              <p className="text-white/35" style={{ fontSize: '7px' }} dir="ltr">Push Day A — Week 3</p>
            </div>
            <div className="bg-[#fbbf24] rounded-lg px-2 py-1">
              <span className="text-black font-black" style={{ fontSize: '7px' }}>ابدأ ←</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   SCENE 7 — Portal (Nutrition / Training / Progress)
══════════════════════════════════════ */
function S7_Portal({ p }) {
  const tab = p < 0.33 ? 0 : p < 0.66 ? 1 : 2
  const tabs = [
    { icon:'🥗', label:'التغذية' },
    { icon:'🏋️', label:'التدريب' },
    { icon:'📊', label:'التقدم'  },
  ]
  return (
    <div className="h-full flex" style={{ background: '#0a0a0a' }}>
      {/* Sidebar */}
      <div className="w-11 bg-[#111] border-r border-white/5 flex flex-col items-center py-3 gap-2.5 flex-shrink-0">
        <div className="w-7 h-7 bg-[#fbbf24] rounded-xl flex items-center justify-center mb-1">
          <span className="text-black text-[9px] font-black">⚡</span>
        </div>
        {['🏠','🥗','🏋️','📊','📝','📷'].map((ic, i) => (
          <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-all
            ${i === tab + 1 ? 'bg-[#fbbf24]/15 border border-[#fbbf24]/35' : ''}`}>
            {ic}
          </div>
        ))}
      </div>
      {/* Main */}
      <div className="flex-1 p-3 overflow-hidden">
        {/* Tab switcher */}
        <div className="flex bg-white/[0.04] border border-white/8 rounded-xl p-1 mb-3">
          {tabs.map((t, i) => (
            <div key={t.label} className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 transition-all cursor-pointer ${i === tab ? 'bg-[#fbbf24] shadow-md' : ''}`}>
              <span style={{ fontSize: '9px' }}>{t.icon}</span>
              <span className={`font-black ${i === tab ? 'text-black' : 'text-white/25'}`} style={{ fontSize: '7px' }}>{t.label}</span>
            </div>
          ))}
        </div>

        {/* ── Nutrition tab ── */}
        {tab === 0 && (
          <div className="space-y-1.5">
            <div className="bg-white/[0.04] border border-white/8 rounded-xl p-2 mb-1">
              <div className="flex justify-between text-[7px] font-black mb-1">
                <span className="text-blue-400">بروتين 35%</span>
                <span className="text-yellow-400">كارب 47%</span>
                <span className="text-rose-400">دهون 18%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                <div className="bg-blue-400 rounded-l-full" style={{ width:`${p > 0.04 ? 35 : 0}%`, transition:'width 0.8s' }} />
                <div className="bg-yellow-400"               style={{ width:`${p > 0.06 ? 47 : 0}%`, transition:'width 1s' }} />
                <div className="bg-rose-400 flex-1 rounded-r-full" style={{ opacity: p > 0.08 ? 1 : 0, transition:'opacity 0.5s' }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[6px] text-white/20">
                <span>1,840 kcal / يوم</span>
                <span>161g بروتين</span>
              </div>
            </div>
            {[
              { ic:'🌅', n:'الفطور',   t:'07:00', kcal:'420', d:'شوفان + بيض مسلوق + موز' },
              { ic:'🍎', n:'وجبة خفيفة', t:'10:30', kcal:'180', d:'تفاحة + مكسرات' },
              { ic:'☀️', n:'الغداء',   t:'13:00', kcal:'650', d:'أرز + دجاج + خضار مشوية' },
              { ic:'🌙', n:'العشاء',   t:'19:30', kcal:'480', d:'تونة + سلطة + بطاطا حلوة' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/[0.03] border border-white/8 rounded-xl px-2 py-1.5"
                style={{ opacity: p > i * 0.06 ? 1 : 0, transition: 'opacity 0.4s' }}>
                <span style={{ fontSize: '12px' }}>{m.ic}</span>
                <div className="flex-1">
                  <p className="text-white font-black" style={{ fontSize: '8px' }}>{m.n} <span className="text-white/20 font-normal">{m.t}</span></p>
                  <p className="text-white/25" style={{ fontSize: '6px' }}>{m.d}</p>
                </div>
                <span className="text-emerald-400 font-black" style={{ fontSize: '8px' }}>{m.kcal}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Training tab ── */}
        {tab === 1 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="bg-blue-500/15 border border-blue-500/25 rounded-lg px-2 py-0.5">
                <span className="text-blue-400 font-black" style={{ fontSize: '7px' }} dir="ltr">WARM UP ✓</span>
              </div>
              <p className="text-white/25" style={{ fontSize: '7px' }} dir="ltr">Push / Pull Day A — Week 3</p>
            </div>
            {[
              { n:'Bench Press',      sets:'4', reps:'8',   rest:'90s', m:'Chest',     done:true  },
              { n:'Incline DB Press', sets:'3', reps:'10',  rest:'75s', m:'Chest',     done:true  },
              { n:'Pull-Up',          sets:'4', reps:'Max', rest:'90s', m:'Back',      done:false },
              { n:'Barbell Row',      sets:'3', reps:'10',  rest:'75s', m:'Back',      done:false },
              { n:'Overhead Press',   sets:'3', reps:'10',  rest:'60s', m:'Shoulders', done:false },
            ].map((e, i) => (
              <div key={i}
                className={`flex items-center gap-2 border rounded-xl px-2 py-1.5 transition-all ${e.done ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-white/[0.03] border-white/8'}`}
                style={{ opacity: p > 0.35 + i * 0.06 ? 1 : 0, transform:`translateY(${p > 0.35 + i * 0.06 ? 0 : 4}px)`, transition:'all 0.35s' }}>
                <span className={`text-[9px] ${e.done ? 'text-emerald-400' : 'text-white/15'}`}>{e.done ? '✓' : '○'}</span>
                <div className="flex-1">
                  <p className="text-white font-black" style={{ fontSize: '8px' }} dir="ltr">{e.n}</p>
                  <p className="text-white/25" style={{ fontSize: '6px' }} dir="ltr">{e.m}</p>
                </div>
                <p className="text-[#fbbf24] font-black" style={{ fontSize: '8px' }} dir="ltr">{e.sets}×{e.reps}</p>
                <p className="text-white/30 font-mono" style={{ fontSize: '7px' }} dir="ltr">{e.rest}</p>
              </div>
            ))}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 text-center"
              style={{ opacity: p > 0.62 ? 1 : 0, transition: 'opacity 0.4s' }}>
              <p className="text-white/20 text-[7px]" dir="ltr">COOL DOWN — 10 min stretching</p>
            </div>
          </div>
        )}

        {/* ── Progress tab ── */}
        {tab === 2 && (
          <div className="space-y-2">
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-2.5">
              <p className="text-white/30 font-bold mb-2" style={{ fontSize: '7px' }} dir="ltr">Weight (kg) — 4 Weeks</p>
              <div className="flex items-end gap-1.5" style={{ height: '55px' }}>
                {[{w:86.2,wk:'W1'},{w:84.8,wk:'W2'},{w:83.5,wk:'W3'},{w:82.5,wk:'W4'}].map(({w,wk}, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <span className="text-white font-black" style={{ fontSize: '7px' }}>{w}</span>
                    <div className="w-full rounded-t"
                      style={{ height:`${((w-80)/8)*36}px`, background:'linear-gradient(to top,#fbbf24,#fbbf24aa)', transition:`height 0.6s ease ${i*0.1}s` }} />
                    <span className="text-white/20" style={{ fontSize: '6px' }}>{wk}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5"
              style={{ opacity: p > 0.80 ? 1 : 0, transition: 'opacity 0.5s' }}>
              {[['−3.7 كغ','الوزن'],['−4.2 سم','الخصر'],['18.5%','الدهون']].map(([v,l]) => (
                <div key={l} className="bg-white/[0.03] border border-white/8 rounded-xl p-1.5 text-center">
                  <p className="text-emerald-400 font-black" style={{ fontSize: '9px' }}>{v}</p>
                  <p className="text-white/25" style={{ fontSize: '6px' }}>{l}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#fbbf24]/8 border border-[#fbbf24]/20 rounded-xl p-2"
              style={{ opacity: p > 0.88 ? 1 : 0, transition: 'opacity 0.5s' }}>
              <p className="text-[#fbbf24] font-black text-center" style={{ fontSize: '8px' }}>📸 أضف صورة تقدم أسبوعية</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   Scene Registry  (7 scenes)
══════════════════════════════════════ */
const SCENES = [
  {
    url:    'amine-fit.com',
    label:  '🌐 صفحة الهبوط — الميزات والأسعار',
    icon:   '🌐',
    ms:     7000,
    cursor: [[0,.50,.40],[.20,.50,.50],[.40,.50,.62],[.58,.50,.72],[.76,.50,.80],[.90,.50,.87],[1,.50,.90]],
    render: (p) => <S1_Landing p={p} />,
  },
  {
    url:    'amine-fit.com/#pricing',
    label:  '💰 اختيار الباقة الشهرية',
    icon:   '💰',
    ms:     5500,
    cursor: [[0,.50,.35],[.25,.50,.55],[.50,.50,.68],[.65,.50,.73],[.80,.50,.73],[1,.50,.73]],
    render: (p) => <S2_Pricing p={p} />,
  },
  {
    url:    'amine-fit.com/register?plan=monthly',
    label:  '📋 نموذج التسجيل (5 خطوات)',
    icon:   '📋',
    ms:     6500,
    cursor: [[0,.50,.28],[.10,.38,.42],[.44,.38,.53],[.70,.38,.64],[.85,.50,.80],[.92,.50,.80],[1,.50,.80]],
    render: (p) => <S3_Register p={p} />,
  },
  {
    url:    'amine-fit.com/register/pending',
    label:  '⏳ قيد مراجعة المدرب',
    icon:   '⏳',
    ms:     5500,
    cursor: [[0,.50,.50],[.30,.50,.50],[.60,.50,.50],[1,.50,.50]],
    render: (p) => <S4_Pending p={p} />,
  },
  {
    url:    'amine-fit.com/client/login',
    label:  '🔑 دخول بوابة العميل',
    icon:   '🔑',
    ms:     5000,
    cursor: [[0,.50,.38],[.10,.50,.50],[.43,.50,.60],[.77,.50,.73],[.86,.50,.73],[1,.50,.73]],
    render: (p) => <S5_Login p={p} />,
  },
  {
    url:    'amine-fit.com/client/dashboard',
    label:  '🏠 لوحة التحكم الرئيسية',
    icon:   '🏠',
    ms:     6000,
    cursor: [[0,.72,.28],[.2,.75,.50],[.45,.75,.62],[.65,.30,.50],[.85,.30,.62],[1,.30,.65]],
    render: (p) => <S6_Dashboard p={p} />,
  },
  {
    url:    'amine-fit.com/client/plan',
    label:  '⚡ التغذية / التدريب / التقدم',
    icon:   '⚡',
    ms:     6500,
    cursor: [[0,.35,.18],[.10,.35,.18],[.32,.35,.18],[.36,.55,.18],[.54,.55,.18],[.70,.75,.18],[.86,.75,.18],[1,.75,.18]],
    render: (p) => <S7_Portal p={p} />,
  },
]

/* ══════════════════════════════════════
   Main Component
══════════════════════════════════════ */
const TICK = 60

export default function AnimatedPlatformDemo({ autoPlay = true }) {
  const [si,      setSi]      = useState(0)
  const [pct,     setPct]     = useState(0)
  const [playing, setPlaying] = useState(autoPlay)

  const { muted, toggle: toggleMute, start: startMusic, stop: stopMusic } = useMusicEngine()

  // Sync music with play state
  useEffect(() => {
    if (playing) startMusic()
    else stopMusic()
  }, [playing]) // eslint-disable-line

  useEffect(() => {
    if (!playing) return
    const step = TICK / SCENES[si].ms
    const id = setInterval(() => {
      setPct(prev => {
        const next = prev + step
        if (next >= 1) {
          setSi(s => (s + 1) % SCENES.length)
          return 0
        }
        return next
      })
    }, TICK)
    return () => clearInterval(id)
  }, [playing, si])

  function jump(i) { setSi(i); setPct(0); setPlaying(true) }

  const cur      = getCursor(SCENES[si].cursor, pct)
  const totalPct = (si + pct) / SCENES.length
  const isClick  = pct > 0.80 && pct < 0.92

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/10"
      style={{ aspectRatio: '16/9', background: '#111' }}>

      {/* Browser + scene */}
      <div className="absolute inset-0 p-0">
        <Browser url={SCENES[si].url}>
          {SCENES[si].render(pct)}
        </Browser>
      </div>

      {/* Cursor */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
        <Cursor x={cur.x} y={cur.y + 9} click={isClick} />
      </div>

      {/* Page-change flash */}
      <div className="absolute inset-0 bg-white pointer-events-none"
        style={{ opacity: pct < 0.04 ? (1 - pct / 0.04) * 0.25 : 0, zIndex: 18, transition: 'opacity 0.05s' }} />

      {/* Controls */}
      <div className="absolute bottom-0 inset-x-0" style={{ zIndex: 20 }}>
        <div className="bg-gradient-to-t from-black/95 via-black/55 to-transparent pt-10 pb-3 px-4">
          {/* Progress bar */}
          <div className="h-[2px] bg-white/10 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-[#fbbf24] rounded-full"
              style={{ width: `${totalPct * 100}%`, transition: `width ${TICK}ms linear` }} />
          </div>
          {/* Buttons + label + dots */}
          <div className="flex items-center gap-2.5">
            <button onClick={() => setPlaying(v => !v)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center flex-shrink-0">
              {playing
                ? <Pause className="w-3 h-3 text-white fill-white" />
                : <Play  className="w-3 h-3 text-white fill-white ml-px" />}
            </button>
            <button onClick={() => jump(0)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-3 h-3 text-white" />
            </button>
            {/* Music toggle */}
            <button onClick={toggleMute}
              title={muted ? 'تشغيل الموسيقى' : 'كتم الموسيقى'}
              className={`w-7 h-7 rounded-full transition flex items-center justify-center flex-shrink-0 ${muted ? 'bg-white/10 hover:bg-white/20' : 'bg-[#fbbf24]/20 border border-[#fbbf24]/40 hover:bg-[#fbbf24]/30'}`}>
              {muted
                ? <VolumeX className="w-3 h-3 text-white/50" />
                : <Volume2 className="w-3 h-3 text-[#fbbf24]" />}
            </button>
            <span className="text-white/55 font-bold flex-1 truncate" style={{ fontSize: '9px' }}>
              {SCENES[si].label}
            </span>
            <div className="flex items-center gap-1.5">
              {SCENES.map((_, i) => (
                <button key={i} onClick={() => jump(i)}
                  className={`rounded-full transition-all duration-300 ${i === si ? 'bg-[#fbbf24]' : 'bg-white/20 hover:bg-white/40'}`}
                  style={{ width: i === si ? '14px' : '6px', height: '6px' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
