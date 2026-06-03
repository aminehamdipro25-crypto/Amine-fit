'use client'
import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react'

/* ══════════════════════════════════════════════════════════════
   WEB AUDIO MUSIC ENGINE
   Motivational 128-BPM beat with reverb + compression
══════════════════════════════════════════════════════════════ */
const _BPM  = 128
const _B    = 60 / _BPM
const _BAR  = _B * 4
const _P5   = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25] // C4..C5 pentatonic

function _makeReverb(ctx) {
  const len = Math.floor(ctx.sampleRate * 1.8)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5)
  }
  const conv = ctx.createConvolver(); conv.buffer = buf; return conv
}

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
const _BASS = [[0,65.41,0.9],[1,65.41,0.45],[2,87.31,0.5],[3,110.00,0.6]]

// Melody A (2-bar) — uplifting ascending phrase
const _MEL = [
  [0,3,0.5],[0.75,4,0.4],[1.5,5,0.4],[2,5,0.5],[2.5,4,0.4],[3,3,0.7],
  [4,2,0.45],[4.75,3,0.4],[5.5,4,0.4],[6,5,1.1],[7.5,3,0.45],[7.75,4,0.6]
]

// Pad chords: quiet sustained chords for atmosphere [beat, freqs_array, dur_beats]
const _PADS = [
  [0, [130.81, 164.81, 196.00], 4.0], // C3 E3 G3
  [4, [110.00, 138.59, 164.81], 4.0], // A2 Db3 E3
]

function _pad(ctx, dest, t, freqs, dur) {
  freqs.forEach(freq => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(dest); o.type = 'sine'; o.frequency.value = freq
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.055, t + 0.4)
    g.gain.setValueAtTime(0.055, t + dur - 0.5)
    g.gain.linearRampToValueAtTime(0, t + dur)
    o.start(t); o.stop(t + dur + 0.1)
  })
}

function _scheduleBar(ctx, dest, t, idx) {
  for (let b = 0; b < 4; b++) {
    const bt = t + b * _B
    _kick(ctx, dest, bt)
    _hat(ctx, dest, bt, 0.07)
    _hat(ctx, dest, bt + _B * 0.5, 0.13)
    if (b === 1 || b === 3) _clap(ctx, dest, bt)
  }
  _BASS.forEach(([bo, freq, dur]) => _bass(ctx, dest, t + bo * _B, freq, dur * _B))
  // Melody every 2 bars
  if (idx % 2 === 0) {
    _MEL.forEach(([bo, ni, dur]) => _note(ctx, dest, t + bo * _B, _P5[ni], dur * _B))
  }
  // Pad every 2 bars (offset from melody)
  if (idx % 2 === 0) {
    _PADS.forEach(([bo, freqs, dur]) => _pad(ctx, dest, t + bo * _B, freqs, dur * _B))
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

    // Dynamics compressor — punch + glue
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18; comp.knee.value = 8
    comp.ratio.value = 6; comp.attack.value = 0.004; comp.release.value = 0.12
    comp.connect(ctx.destination)

    // Reverb send — spaciousness
    const reverb = _makeReverb(ctx)
    const rvGain = ctx.createGain(); rvGain.gain.value = 0.14
    reverb.connect(rvGain); rvGain.connect(ctx.destination)

    // Master → compressor (dry) + reverb (wet)
    const master = ctx.createGain(); master.gain.value = 0.52
    master.connect(comp); master.connect(reverb)

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
   SCENE 1 — Landing Page (matches real amine-fit.com)
══════════════════════════════════════ */
function S1_Landing({ p }) {
  // Start scrolling at p=0.15, reach full scroll at p=0.90
  // Max 72% of content height → ensures app + pricing sections are visible
  const scrollY = p > 0.15 ? Math.min((p - 0.15) / 0.75, 1) * 72 : 0

  return (
    <div className="h-full overflow-hidden" style={{ background: '#0a0a0a' }}>
      <div style={{ transform: `translateY(-${scrollY}%)`, transition: 'transform 0.10s linear' }}>

        {/* ── Navbar — matches real site ── */}
        <div className="flex items-center justify-between px-2.5 py-2 border-b border-white/5" dir="rtl">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#fbbf24] rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-black text-[9px] font-black">⚡</span>
            </div>
            <span className="text-white font-black text-[9px] tracking-widest">AMINE<span className="text-[#fbbf24]">FIT</span></span>
          </div>
          <div className="flex gap-2">
            {['الخدمات','كيف يعمل','الأسعار','الحاسبة'].map(l => (
              <span key={l} className="text-white/20 text-[6.5px]">{l}</span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <div className="border border-white/12 rounded-lg px-1.5 py-0.5">
              <span className="text-white/40 text-[6px]">دخول العميل</span>
            </div>
            <div className="bg-[#fbbf24] rounded-lg px-1.5 py-0.5">
              <span className="text-black text-[6px] font-black">لوحة التحكم</span>
            </div>
          </div>
        </div>

        {/* ── Promo banner — matches real site ── */}
        <div className="flex items-center justify-center gap-2 py-1.5"
          style={{ background: 'linear-gradient(90deg,#7f1d1d,#b91c1c,#7f1d1d)' }}>
          <span className="text-white text-[7px] font-bold">🔥 عرض الإطلاق — خصم 50% على جميع الباقات لفترة محدودة</span>
          <div className="bg-white text-red-700 rounded-full px-1.5 font-black" style={{ fontSize: '5.5px' }}>احجز الآن</div>
        </div>

        {/* ── Hero — matches real site (trainer photo + text overlay) ── */}
        <div className="relative overflow-hidden" dir="rtl"
          style={{ minHeight: '122px', background: 'linear-gradient(135deg,#0d0d0d 0%,#1c1c1c 50%,#111 100%)' }}>

          {/* Simulate trainer photo: dark gym gradient with vignette */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.75) 48%, rgba(10,10,10,0.2) 100%)' }} />
          {/* Gym equipment bg hint */}
          <div className="absolute bottom-0 right-1 opacity-[0.07]" style={{ fontSize: '100px', lineHeight: 0.85 }}>🏋️</div>
          <div className="absolute top-2 right-1 opacity-[0.04]" style={{ fontSize: '60px' }}>💪</div>

          {/* Floating stats — matches real site */}
          <div className="absolute left-1.5 top-2 flex flex-col gap-1"
            style={{ opacity: p > 0.22 ? 1 : 0, transition: 'opacity 0.7s' }}>
            {['+100 عميل','10+ سنوات','95% نجاح'].map((s, i) => (
              <div key={i} className="flex items-center gap-1 bg-black/70 border border-white/8 rounded-lg px-1.5 py-0.5">
                <div className="w-1 h-1 rounded-full bg-[#fbbf24]" />
                <span className="text-[#fbbf24] font-black" style={{ fontSize: '6px' }}>{s}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 px-3 pt-2.5 pb-2.5">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-1 bg-[#fbbf24]/8 border border-[#fbbf24]/20 rounded-full px-2 py-0.5 mb-1.5"
              style={{ opacity: p > 0.04 ? 1 : 0, transition: 'opacity 0.5s' }}>
              <span className="text-[#fbbf24] text-[7px]">★★★★★</span>
              <span className="text-white/35 text-[5.5px]">مدرب معتمد • 100+ عميل راضٍ</span>
            </div>

            {/* Main headline — EXACT match to real site */}
            <div style={{ opacity: p > 0.06 ? 1 : 0, transition: 'opacity 0.5s' }}>
              <h1 className="text-white font-black leading-tight" style={{ fontSize: 'clamp(11px,2.1vw,15px)' }}>
                من القوات الخاصة البحرية
              </h1>
              <h1 className="font-black leading-tight mb-1" style={{ fontSize: 'clamp(11px,2.1vw,15px)', color: '#fbbf24' }}>
                إلى قوّتك الشخصية
              </h1>
            </div>

            <p className="text-white/30 mb-1.5" style={{ fontSize: '6px', lineHeight: 1.5, opacity: p > 0.10 ? 1 : 0, transition: 'opacity 0.5s' }}>
              خبير رياضي وغذائي معتمد بخلفية عسكرية تخصصية — أكثر من 10 سنوات
            </p>

            {/* Credential pills — matches real site */}
            <div className="flex flex-wrap gap-1 mb-2"
              style={{ opacity: p > 0.13 ? 1 : 0, transition: 'opacity 0.5s' }}>
              {['Lic. STAPS','مدرب تغذية معتمد','علم النفس الرياضي','مدرب شخصي'].map(b => (
                <span key={b} className="bg-white/[0.05] border border-white/8 rounded-full px-1.5 py-0.5 text-white/30"
                  style={{ fontSize: '5px' }}>{b}</span>
              ))}
            </div>

            {/* CTA buttons — matches real site */}
            <div className="flex gap-1.5" style={{ opacity: p > 0.16 ? 1 : 0, transition: 'opacity 0.5s' }}>
              <div className="bg-[#fbbf24] rounded-xl px-2.5 py-1.5 shadow-lg shadow-[#fbbf24]/20">
                <span className="text-black text-[7.5px] font-black">ابدأ رحلتك الآن ⚡</span>
              </div>
              <div className="border border-white/12 rounded-xl px-2.5 py-1.5">
                <span className="text-white/40 text-[6.5px]">جرب المنصة مجاناً ←</span>
              </div>
              <div className="flex items-center px-1.5">
                <span className="text-white/25 text-[6.5px]">من هو أمين ←</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="px-3 mt-2.5" dir="rtl"
          style={{ opacity: p > 0.25 ? 1 : 0, transition: 'opacity 0.7s' }}>
          <p className="text-white/15 text-[6px] font-black uppercase tracking-widest text-center mb-1.5">كيف يعمل</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              ['1️⃣','سجّل الاستبيان','5 دقائق فقط'],
              ['2️⃣','يراجع أمين بياناتك','خلال 24 ساعة'],
              ['3️⃣','برنامجك جاهز','ابدأ فوراً'],
            ].map(([i,n,d]) => (
              <div key={n} className="bg-white/[0.03] border border-white/7 rounded-xl p-2 text-center">
                <div className="text-base mb-0.5">{i}</div>
                <p className="text-white/55 text-[6.5px] font-bold leading-tight">{n}</p>
                <p className="text-white/20 text-[5.5px] mt-0.5">{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── App showcase — PROMINENT ── */}
        <div className="px-3 mt-2.5" dir="rtl"
          style={{ opacity: p > 0.38 ? 1 : 0, transition: 'opacity 0.7s' }}>
          <p className="text-white/15 text-[6px] font-black uppercase tracking-widest text-center mb-1.5">تطبيقك الشخصي</p>
          <div className="bg-[#fbbf24]/6 border border-[#fbbf24]/25 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 bg-[#fbbf24] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#fbbf24]/25">
                <span className="text-black font-black" style={{ fontSize: '16px' }}>⚡</span>
              </div>
              <div>
                <p className="text-white font-black" style={{ fontSize: '10px' }}>تطبيق Amine-Fit</p>
                <p className="text-white/30 text-[6.5px]">بوابتك الشخصية بعد الاشتراك</p>
              </div>
              <div className="mr-auto bg-emerald-500/15 border border-emerald-500/25 rounded-full px-1.5 py-0.5">
                <span className="text-emerald-400 font-bold" style={{ fontSize: '6px' }}>مجاناً مع الباقة</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[['🥗','خطة غذائية'],['🏋️','برنامج تدريب'],['📊','متابعة التقدم'],['💬','دعم مباشر']].map(([ic,l]) => (
                <div key={l} className="bg-black/25 rounded-xl p-1.5 text-center border border-white/5">
                  <div style={{ fontSize: '13px', marginBottom: '2px' }}>{ic}</div>
                  <p className="text-white/35 font-bold leading-tight" style={{ fontSize: '5.5px' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Pricing ── */}
        <div className="px-3 mt-2.5" dir="rtl"
          style={{ opacity: p > 0.53 ? 1 : 0, transition: 'opacity 0.7s' }}>
          <p className="text-white/15 text-[6px] font-black uppercase tracking-widest text-center mb-1.5">الأسعار</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { n:'التدريب فقط', pr:'50',  h:false },
              { n:'الشهرية ⭐',  pr:'125', h:true  },
              { n:'3 أشهر 🏆',   pr:'300', h:false },
            ].map(c => (
              <div key={c.n} className={`rounded-xl p-2 text-center border ${c.h ? 'bg-[#fbbf24]/10 border-[#fbbf24]/35' : 'bg-white/[0.03] border-white/7'}`}>
                <p className={`font-black text-[7.5px] ${c.h ? 'text-[#fbbf24]' : 'text-white/45'}`}>{c.n}</p>
                <p className={`font-black text-[11px] ${c.h ? 'text-[#fbbf24]' : 'text-white/35'}`}>{c.pr}<span className="text-[6px] font-normal"> د.ت</span></p>
                {c.h && <p className="text-emerald-400 text-[5.5px] font-bold mt-0.5">الأكثر طلباً</p>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Testimonials ── */}
        <div className="px-3 mt-2.5 pb-3" dir="rtl"
          style={{ opacity: p > 0.67 ? 1 : 0, transition: 'opacity 0.7s' }}>
          <div className="flex gap-1.5">
            {[
              { name:'محمد خ.', txt:'خسرت 8 كغ في شهرين فقط!', stars:5 },
              { name:'سارة م.', txt:'أفضل استثمار لصحتي',       stars:5 },
            ].map(t => (
              <div key={t.name} className="flex-1 bg-white/[0.03] border border-white/7 rounded-xl p-2">
                <div className="flex gap-0.5 mb-1">{[...Array(t.stars)].map((_,i) => <span key={i} className="text-[#fbbf24] text-[8px]">★</span>)}</div>
                <p className="text-white/35 text-[6.5px] leading-snug">"{t.txt}"</p>
                <p className="text-white/20 text-[5.5px] mt-1">{t.name}</p>
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
   SCENE 4 — Payment Instructions (after registration)
   Phase A (0–0.52): success page + choose D17 + show number
   Phase B (0.52–1.0): WhatsApp confirmation → pending
══════════════════════════════════════ */
function S4_Pending({ p }) {
  const phaseB = p >= 0.52
  const pb     = phaseB ? (p - 0.52) / 0.48 : 0

  if (phaseB) {
    // Phase B: sent confirmation → waiting
    return (
      <div className="h-full flex flex-col items-center justify-center px-3" style={{ background: '#0a0a0a' }}>
        <div className="w-full max-w-[210px]">
          {/* WA sent badge */}
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 text-center mb-4"
            style={{ opacity: pb > 0.08 ? 1 : 0, transform: `scale(${pb > 0.08 ? 1 : 0.9})`, transition: 'all 0.5s cubic-bezier(.34,1.56,.64,1)' }}>
            <p className="text-emerald-400 font-black text-[10px]">✅ تم إرسال إثبات الدفع!</p>
            <p className="text-white/30 text-[7px] mt-0.5">في انتظار تأكيد المدرب أمين</p>
          </div>

          {/* Timeline */}
          <div className="space-y-1.5">
            {[
              { icon:'✅', text:'تم التسجيل',             done:true,  active:false, delay:0.20 },
              { icon:'💳', text:'تم إرسال إثبات الدفع',   done:true,  active:false, delay:0.30 },
              { icon:'👨‍💼', text:'المدرب يؤكد ويفعّل',    done:false, active:true,  delay:0.42 },
              { icon:'📧', text:'كود تفعيل على إيميلك',   done:false, active:false, delay:0.58 },
              { icon:'🚀', text:'ادخل بوابتك الشخصية',   done:false, active:false, delay:0.72 },
            ].map((s, i) => (
              <div key={i}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-2 border ${
                  s.active ? 'bg-[#fbbf24]/10 border-[#fbbf24]/30' :
                  s.done   ? 'bg-emerald-500/8 border-emerald-500/20' :
                             'bg-white/[0.02] border-white/5'}`}
                style={{ opacity: pb > s.delay ? 1 : 0, transform: `translateX(${pb > s.delay ? 0 : 8}px)`, transition: 'all 0.4s' }}>
                <span style={{ fontSize: '9px' }}>{s.icon}</span>
                <span className={`text-[7.5px] font-bold flex-1 ${s.active ? 'text-[#fbbf24]' : s.done ? 'text-emerald-400' : 'text-white/25'}`}>{s.text}</span>
                {s.active && <div className="flex gap-0.5">{[0,1,2].map(d=><div key={d} className="w-1 h-1 rounded-full bg-[#fbbf24] animate-bounce" style={{animationDelay:`${d*0.15}s`}}/>)}</div>}
              </div>
            ))}
          </div>
          <p className="text-white/15 text-[6.5px] text-center mt-3"
            style={{ opacity: pb > 0.85 ? 1 : 0, transition: 'opacity 0.4s' }}>
            ستصلك رسالة على ahmed.sport@gmail.com ✉️
          </p>
        </div>
      </div>
    )
  }

  // Phase A: payment success page
  const showPlan     = p > 0.04
  const showSteps    = p > 0.14
  const showD17box   = p > 0.28
  const showNumber   = p > 0.38
  const showWA       = p > 0.44

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#0a0a0a' }}>
      <div className="px-3 pt-3 pb-4 flex flex-col items-center">

        {/* Journey indicator */}
        <div className="flex items-center gap-1 mb-3 w-full justify-center"
          style={{ opacity: p > 0.02 ? 1 : 0, transition: 'opacity 0.4s' }}>
          {[{n:1,label:'تسجيل',done:true},{n:2,label:'دفع',active:true},{n:3,label:'تفعيل',done:false}].map((s,i)=>(
            <div key={s.n} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-0.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-extrabold ${s.done?'bg-emerald-500 text-white':s.active?'bg-[#fbbf24] text-black ring-2 ring-[#fbbf24]/30':'bg-white/10 text-white/30'}`}>{s.done?'✓':s.n}</div>
                <span className={`text-[6px] font-bold ${s.active?'text-[#fbbf24]':s.done?'text-emerald-400':'text-white/20'}`}>{s.label}</span>
              </div>
              {i<2&&<div className="w-5 h-px bg-white/10 mb-2"/>}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-3"
          style={{ opacity: showPlan ? 1 : 0, transform: `translateY(${showPlan?0:8}px)`, transition: 'all 0.5s' }}>
          <div className="w-9 h-9 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-emerald-400 text-sm">✓</span>
          </div>
          <p className="text-white font-black text-[10px]">تم التسجيل ✅</p>
          <p className="text-white/35 text-[7px]">الخطوة الأخيرة — أرسل الدفع</p>
        </div>

        {/* Plan badge */}
        <div className="w-full bg-[#fbbf24]/8 border border-[#fbbf24]/20 rounded-xl px-3 py-2 flex items-center gap-2 mb-3"
          style={{ opacity: showPlan ? 1 : 0, transform: `translateY(${showPlan?0:6}px)`, transition: 'all 0.5s 0.1s' }}>
          <span className="text-base">⚡</span>
          <div className="flex-1">
            <p className="text-white/40 text-[6.5px] font-bold">الباقة المختارة</p>
            <p className="text-white font-extrabold text-[9px]">الباقة الشهرية</p>
          </div>
          <div className="text-right">
            <p className="text-[#fbbf24] font-extrabold text-[14px]">125</p>
            <p className="text-white/25 text-[6.5px]">د.ت</p>
          </div>
        </div>

        {/* Method: D17 selected */}
        <div className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-2.5 mb-2.5"
          style={{ opacity: showD17box ? 1 : 0, transform: `translateY(${showD17box?0:6}px)`, transition: 'all 0.5s' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px]">📱</span>
            <p className="text-white font-extrabold text-[8px]">الدفع عبر D17</p>
          </div>
          <div className="space-y-1.5">
            {[
              { n:'1', text:'افتح تطبيق D17 أو *194#', sub:'' },
              { n:'2', text:'أرسل 125 د.ت إلى:', isNumber:true },
              { n:'3', text:'أرسل إثبات الدفع على واتساب', sub:'' },
            ].map((s,i)=>(
              <div key={i} className="flex gap-1.5 items-start">
                <div className="w-4 h-4 rounded-full bg-[#fbbf24] text-black text-[6px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</div>
                <div className="flex-1">
                  <p className="text-white font-bold text-[7.5px]">{s.text}</p>
                  {s.isNumber && showNumber && (
                    <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1 mt-1">
                      <span className="text-white font-bold text-[8px] tracking-widest flex-1 text-center" dir="ltr">XX XXX XXX</span>
                      <span className="text-white/30 text-[8px]">⎘</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WA CTA */}
        <div className="w-full py-2 rounded-xl flex items-center justify-center gap-1.5 font-extrabold text-[8px] text-white"
          style={{ background: '#25d366', opacity: showWA ? 1 : 0, transform: `scale(${showWA?1:0.95})`, transition: 'all 0.4s cubic-bezier(.34,1.56,.64,1)' }}>
          <span>💬</span> أرسلت الدفع — فعّل حسابي
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   SCENE 5 — Client Login (matches real page)
   Phase A (0-0.48): تفعيل الحساب tab — type email + activation code
   Phase B (0.50-1.0): دخول tab — type email+password, login
══════════════════════════════════════ */
function S5_Login({ p }) {
  const tab        = p < 0.50 ? 'activate' : 'login'
  const actEmail   = typed('ahmed.sport@gmail.com', p, 0.12, 0.36)
  const actCode    = typed('AF-8X2K', p, 0.38, 0.48)
  const loginEmail = typed('ahmed.sport@gmail.com', p, 0.54, 0.72)
  const dotCount   = Math.floor(typed('••••••••', p, 0.74, 0.88).length)

  // Left food emojis (scaled down for the mini browser)
  const LEFT_BG  = ['🥗','🍎','🥦','🥑','🍗']
  const RIGHT_BG = ['🏋️','💪','🔥','⚡','🎯']

  return (
    <div className="h-full relative flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#111827 50%,#0a0a0a 100%)' }}>

      {/* Background emojis — matches real page */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {LEFT_BG.map((e, i) => (
          <span key={`l${i}`} className="absolute" style={{
            top:`${8+i*18}%`, left:`${2+i%2*8}%`,
            fontSize: 28 - i*2, opacity: 0.08, transform:`rotate(${i%2===0?-10:10}deg)`
          }}>{e}</span>
        ))}
        {RIGHT_BG.map((e, i) => (
          <span key={`r${i}`} className="absolute" style={{
            top:`${8+i*18}%`, right:`${2+i%2*8}%`,
            fontSize: 28 - i*2, opacity: 0.08, transform:`rotate(${i%2===0?10:-10}deg)`
          }}>{e}</span>
        ))}
        {/* Gold diagonal lines */}
        {[20,50,80].map(pct => (
          <div key={pct} className="absolute opacity-[0.04]"
            style={{ width:'200%', height:'1px',
              background:'linear-gradient(90deg,transparent,#fbbf24,transparent)',
              top:`${pct}%`, left:'-50%', transform:'rotate(-8deg)' }} />
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 w-[72%] max-w-[210px]"
        style={{ opacity: p > 0.04 ? 1 : 0, transform:`translateY(${p>0.04?0:10}px)`, transition:'all 0.5s' }}>

        {/* Logo */}
        <div className="text-center mb-3">
          <div className="w-10 h-10 bg-[#fbbf24] rounded-2xl flex items-center justify-center mx-auto mb-1.5 shadow-lg shadow-[#fbbf24]/25">
            <span className="text-black text-lg">⚡</span>
          </div>
          <p className="text-white font-black text-[11px] tracking-widest uppercase">Amine<span className="text-[#fbbf24]">Fit</span></p>
          <p className="text-white/30 text-[7px] mt-0.5">بوابة العميل الشخصية</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 mb-2.5"
          style={{ background:'rgba(255,255,255,0.04)' }}>
          <div className={`flex-1 flex items-center justify-center gap-1 py-2 text-[7px] font-black transition-all duration-300 ${tab==='login' ? 'bg-[#fbbf24] text-black' : 'text-white/40'}`}>
            🔒 دخول
          </div>
          <div className={`flex-1 flex items-center justify-center gap-1 py-2 text-[7px] font-black transition-all duration-300 ${tab==='activate' ? 'bg-[#fbbf24] text-black' : 'text-white/40'}`}>
            🛡️ تفعيل الحساب
          </div>
        </div>

        {/* Glass card */}
        <div className="rounded-xl border border-white/8 p-3"
          style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(12px)' }}>

          {/* ── Activation tab ── */}
          {tab === 'activate' && (
            <div>
              <p className="text-white font-black text-[10px] mb-0.5">أول مرة؟ فعّل حسابك</p>
              <p className="text-white/30 text-[7px] mb-2.5">أدخل البريد ورمز التفعيل الذي أرسله المدرب</p>
              {/* Email */}
              <div className="mb-2">
                <label className="text-white/35 text-[6px] font-bold uppercase tracking-wide mb-0.5 block">البريد الإلكتروني</label>
                <div className={`border rounded-lg px-2 py-1.5 text-[8px] min-h-[24px] flex items-center transition-colors ${p>0.09&&p<0.38?'border-[#fbbf24]/60 bg-[#fbbf24]/5':'border-white/10 bg-white/[0.03]'}`} dir="ltr">
                  {actEmail
                    ? <span className="text-white">{actEmail}{p>0.09&&p<0.38?<span className="animate-pulse text-[#fbbf24]">|</span>:null}</span>
                    : <span className="text-white/15">your@email.com</span>}
                </div>
              </div>
              {/* Activation code */}
              <div className="mb-2.5">
                <label className="text-white/35 text-[6px] font-bold uppercase tracking-wide mb-0.5 block">رمز التفعيل</label>
                <div className={`border rounded-lg px-2 py-1.5 text-[8px] min-h-[24px] flex items-center transition-colors ${p>0.36&&p<0.50?'border-[#fbbf24]/60 bg-[#fbbf24]/5':'border-white/10 bg-white/[0.03]'}`} dir="ltr">
                  {actCode
                    ? <span className="text-white font-mono">{actCode}{p>0.36&&p<0.50?<span className="animate-pulse text-[#fbbf24]">|</span>:null}</span>
                    : <span className="text-white/15">AF-XXXX</span>}
                </div>
              </div>
              <div className={`w-full rounded-lg py-1.5 text-center text-[7px] font-black bg-[#fbbf24] text-black transition-all ${p>0.44?'scale-[1.02] shadow-md shadow-[#fbbf24]/25':''}`}>
                تفعيل الحساب ←
              </div>
            </div>
          )}

          {/* ── Login tab ── */}
          {tab === 'login' && (
            <div>
              <p className="text-white font-black text-[10px] mb-0.5">تسجيل الدخول</p>
              <p className="text-white/30 text-[7px] mb-2.5">أدخل بريدك وكلمة مرورك للوصول لبرنامجك</p>
              {/* Email */}
              <div className="mb-2">
                <label className="text-white/35 text-[6px] font-bold uppercase tracking-wide mb-0.5 block">البريد الإلكتروني</label>
                <div className={`border rounded-lg px-2 py-1.5 text-[8px] min-h-[24px] flex items-center transition-colors ${p>0.51&&p<0.74?'border-[#fbbf24]/60 bg-[#fbbf24]/5':'border-white/10 bg-white/[0.03]'}`} dir="ltr">
                  {loginEmail
                    ? <span className="text-white">{loginEmail}{p>0.51&&p<0.74?<span className="animate-pulse text-[#fbbf24]">|</span>:null}</span>
                    : <span className="text-white/15">your@email.com</span>}
                </div>
              </div>
              {/* Password */}
              <div className="mb-2.5">
                <label className="text-white/35 text-[6px] font-bold uppercase tracking-wide mb-0.5 block">كلمة المرور</label>
                <div className={`border rounded-lg px-2 py-1.5 text-[10px] min-h-[24px] flex items-center transition-colors ${p>0.72&&p<0.90?'border-[#fbbf24]/60 bg-[#fbbf24]/5':'border-white/10 bg-white/[0.03]'}`}>
                  {dotCount > 0
                    ? <span className="text-white/70 tracking-widest">{'●'.repeat(dotCount)}{p>0.72&&p<0.90?<span className="animate-pulse text-[#fbbf24] text-[7px]">|</span>:null}</span>
                    : <span className="text-white/15 text-[7px]">••••••••</span>}
                </div>
              </div>
              <div className={`w-full rounded-lg py-1.5 text-center text-[7px] font-black bg-[#fbbf24] text-black transition-all flex items-center justify-center gap-1 ${p>0.90?'scale-[1.03] shadow-md shadow-[#fbbf24]/25':''}`}>
                {p>0.95 ? '✓ جارٍ الدخول...' : <><span>⚡</span> دخول</>}
              </div>
              <p className="text-center text-white/20 text-[6px] mt-2">أول مرة؟ <span className="text-[#fbbf24]">فعّل حسابك هنا</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   SCENE 6 — Client Dashboard (matches real client/home page)
══════════════════════════════════════ */
function S6_Dashboard({ p }) {
  const showHero  = p > 0.05
  const showStats = p > 0.28
  const showCards = p > 0.52

  const navItems = [
    { label: 'الرئيسية',         active: true  },
    { label: 'الخطة الغذائية',   active: false },
    { label: 'الخطة التدريبية',  active: false },
    { label: 'المختبر',           active: false },
    { label: 'متابعة التقدم',    active: false },
    { label: 'يوميتي',           active: false },
    { label: 'قائمة التسوق',     active: false },
  ]

  return (
    <div className="h-full flex" style={{ background: '#0a0a0a' }}>
      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Demo banner */}
        <div className="bg-[#fbbf24] px-2 py-1.5 flex items-center justify-between gap-1 flex-shrink-0">
          <span className="text-black font-bold truncate" style={{ fontSize: '5.5px' }}>
            وضع العرض التجريبي — هذه نسخة تجريبية من منصة Amine-Fit
          </span>
          <div className="bg-black text-[#fbbf24] rounded px-1.5 py-0.5 font-black whitespace-nowrap flex-shrink-0"
            style={{ fontSize: '5.5px' }}>اختر خطتك ←</div>
        </div>

        <div className="flex-1 overflow-hidden p-2">
          {/* Trial badge */}
          <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 mb-2"
            style={{ opacity: p > 0.03 ? 1 : 0, transition: 'opacity 0.4s' }}>
            <span style={{ fontSize: '8px' }}>🎭</span>
            <span className="text-white/40 font-bold" style={{ fontSize: '6px' }}>جولة تجريبية</span>
          </div>

          {/* Hero card */}
          <div className="rounded-2xl mb-2 p-3 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg,#1c1c1c 0%,#0f0f0f 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              opacity: showHero ? 1 : 0,
              transition: 'opacity 0.5s',
            }}>
            <div className="absolute left-1 bottom-0 opacity-[0.08]" style={{ fontSize: '44px' }}>🏋️</div>
            <p className="text-white/25 font-bold mb-0.5 text-right" style={{ fontSize: '5.5px' }}>منصة AMINE-FIT الشخصية</p>
            <p className="text-white font-black text-right mb-1" style={{ fontSize: '12px' }}>أهلاً بك، عميلنا الكريم</p>
            <p className="text-white/30 text-right mb-1.5" style={{ fontSize: '6px', lineHeight: 1.5 }}>
              خطتك الغذائية والتدريبية المخصصة جاهزة — نحن معك في كل خطوة نحو هدفك
            </p>
            <div className="flex items-center gap-1 justify-end">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold" style={{ fontSize: '6px' }}>حسابك نشط</span>
            </div>
          </div>

          {/* 4 stats row — matches real page */}
          <div className="grid grid-cols-4 gap-1 mb-2"
            style={{ opacity: showStats ? 1 : 0, transform: `translateY(${showStats ? 0 : 4}px)`, transition: 'all 0.5s' }}>
            {[
              { emoji: '🎂', val: '26',  unit: 'سنة', label: 'العمر'           },
              { emoji: '📏', val: '178', unit: 'سم',  label: 'الطول'           },
              { emoji: '🎯', val: '75',  unit: 'كغ',  label: 'الوزن المستهدف' },
              { emoji: '⚖️', val: '88',  unit: 'كغ',  label: 'الوزن الحالي'   },
            ].map((s, i) => (
              <div key={i} className="bg-white/[0.04] border border-white/8 rounded-xl p-1.5 text-center">
                <div style={{ fontSize: '13px', lineHeight: 1.2 }}>{s.emoji}</div>
                <p className="text-white font-black" style={{ fontSize: '10px' }}>{s.val}</p>
                <p className="text-[#fbbf24] font-bold" style={{ fontSize: '6px' }}>{s.unit}</p>
                <p className="text-white/20" style={{ fontSize: '5px', lineHeight: 1.1 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Plan access cards — matches real page */}
          <div className="grid grid-cols-2 gap-1.5"
            style={{ opacity: showCards ? 1 : 0, transform: `translateY(${showCards ? 0 : 4}px)`, transition: 'all 0.5s' }}>
            <div className="rounded-xl p-2.5"
              style={{ background: 'linear-gradient(135deg,#1a1a1a,#0f0f0f)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-center" style={{ fontSize: '20px' }}>🏋️</div>
              <p className="text-white font-black text-center" style={{ fontSize: '8px' }}>الخطة التدريبية</p>
              <p className="text-[#fbbf24] text-center font-bold" style={{ fontSize: '6.5px' }}>4 أيام / أسبوع</p>
            </div>
            <div className="rounded-xl p-2.5"
              style={{ background: 'linear-gradient(135deg,#0d2b1e,#091a12)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div className="text-center" style={{ fontSize: '20px' }}>🥗</div>
              <p className="text-white font-black text-center" style={{ fontSize: '8px' }}>الخطة الغذائية</p>
              <p className="text-emerald-400 text-center font-bold" style={{ fontSize: '6.5px' }}>1850 سعرة • 5 وجبات</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar (RIGHT — matches real page) ── */}
      <div className="w-[68px] bg-[#111] border-l border-white/5 flex flex-col py-2.5 px-1.5 flex-shrink-0">
        {/* AMINEFIT logo — top right of sidebar */}
        <div className="flex items-center justify-end gap-1 mb-3">
          <span className="text-white font-black" style={{ fontSize: '7px', letterSpacing: '0.5px' }}>AMINEFIT</span>
          <div className="w-6 h-6 bg-[#fbbf24] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black" style={{ fontSize: '11px' }}>⚡</span>
          </div>
        </div>

        {/* Nav items */}
        <div className="space-y-0.5" style={{ opacity: p > 0.06 ? 1 : 0, transition: 'opacity 0.5s' }}>
          {navItems.map((item, i) => (
            <div key={i}
              className={`flex items-center px-1.5 py-1 rounded-xl justify-end gap-1.5 ${item.active ? 'bg-[#fbbf24]' : ''}`}>
              <span
                className={`text-right font-bold truncate ${item.active ? 'text-black' : 'text-white/20'}`}
                style={{ fontSize: '5.5px' }}>
                {item.label}
              </span>
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 ${item.active ? 'bg-black/10' : 'bg-white/5'}`}>
                <span style={{ fontSize: '8px', opacity: item.active ? 1 : 0.5 }}>
                  {['🏠','🥗','🏋️','🔬','📊','📅','🛒'][i]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   SCENE 7 — Client Plan (matches real client/plan page)
   3 top tabs: التغذية | التدريب | التقدم
   Right icon column
══════════════════════════════════════ */
function S7_Portal({ p }) {
  // Start with training (1), then nutrition (0), then progress (2)
  const tab = p < 0.35 ? 1 : p < 0.68 ? 0 : 2

  const rightIcons = ['📊','🏋️','🥗','🔬','📅','🛒','📷']

  return (
    <div className="h-full flex flex-col" style={{ background: '#0a0a0a' }}>

      {/* ── 3 top tabs — matches real page ── */}
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { label: 'التغذية', idx: 0 },
          { label: 'التدريب', idx: 1 },
          { label: 'التقدم',  idx: 2 },
        ].map((t) => (
          <div key={t.idx}
            className={`flex-1 py-2 text-center font-black transition-all ${
              t.idx === tab ? 'bg-[#fbbf24] text-black' : 'text-white/25'
            }`}
            style={{ fontSize: '8px' }}>
            {t.label}
          </div>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Content */}
        <div className="flex-1 overflow-hidden p-2" dir="rtl">

          {/* ── Training tab ── */}
          {tab === 1 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 py-0.5">
                  <span className="text-blue-400 font-black" style={{ fontSize: '7px' }} dir="ltr">WARM UP ✓</span>
                </div>
                <span className="text-white/25 font-medium" style={{ fontSize: '6.5px' }} dir="ltr">
                  Push / Pull Day A — Week 1
                </span>
              </div>
              <div className="space-y-1.5">
                {[
                  { pct: '90%', sets: '4×8',   name: 'Bench Press',      done: true  },
                  { pct: '75%', sets: '3×10',  name: 'Incline DB Press',  done: true  },
                  { pct: '70%', sets: '4×Max', name: 'Pull-Up',           done: false },
                  { pct: '65%', sets: '3×10',  name: 'Barbell Row',       done: false },
                  { pct: '60%', sets: '3×10',  name: 'Overhead Press',    done: false },
                ].map((e, i) => (
                  <div key={i}
                    className={`flex items-center gap-1.5 rounded-xl px-2 py-1.5 border ${
                      e.done ? 'bg-white/[0.05] border-white/12' : 'bg-white/[0.02] border-white/7'
                    }`}
                    style={{
                      opacity: p > 0.06 + i * 0.06 ? 1 : 0,
                      transform: `translateX(${p > 0.06 + i * 0.06 ? 0 : -4}px)`,
                      transition: 'all 0.35s',
                    }}>
                    <span className="text-white/20 font-mono flex-shrink-0" style={{ fontSize: '6.5px' }} dir="ltr">{e.pct}</span>
                    <span className="text-[#fbbf24] font-black flex-shrink-0" style={{ fontSize: '7.5px' }} dir="ltr">{e.sets}</span>
                    <span className="text-white font-bold flex-1 text-right" style={{ fontSize: '8px' }} dir="ltr">{e.name}</span>
                    <span className={`font-black flex-shrink-0 ${e.done ? 'text-white/80' : 'text-white/15'}`} style={{ fontSize: '10px' }}>
                      {e.done ? '✓' : '○'}
                    </span>
                  </div>
                ))}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-1.5 text-center"
                  style={{ opacity: p > 0.34 ? 1 : 0, transition: 'opacity 0.4s' }}>
                  <span className="text-white/20" style={{ fontSize: '6.5px' }} dir="ltr">COOL DOWN — 10 min stretching</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Nutrition tab ── */}
          {tab === 0 && (
            <div className="space-y-1.5">
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-2 mb-1">
                <div className="flex justify-between mb-1">
                  <span className="text-blue-400 font-black" style={{ fontSize: '6.5px' }}>بروتين 35%</span>
                  <span className="text-yellow-400 font-black" style={{ fontSize: '6.5px' }}>كارب 47%</span>
                  <span className="text-rose-400 font-black" style={{ fontSize: '6.5px' }}>دهون 18%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                  <div className="bg-blue-400" style={{ width: '35%' }} />
                  <div className="bg-yellow-400" style={{ width: '47%' }} />
                  <div className="bg-rose-400 flex-1" />
                </div>
                <p className="text-white/20 text-right mt-1" style={{ fontSize: '6px' }}>1,840 kcal / يوم • 161g بروتين</p>
              </div>
              {[
                { ic: '🌅', n: 'الفطور',       t: '07:00', kcal: '420', d: 'شوفان + بيض + موز' },
                { ic: '🍎', n: 'وجبة خفيفة',  t: '10:30', kcal: '180', d: 'تفاحة + مكسرات' },
                { ic: '☀️', n: 'الغداء',       t: '13:00', kcal: '650', d: 'أرز + دجاج + خضار' },
                { ic: '🌙', n: 'العشاء',       t: '19:30', kcal: '480', d: 'تونة + سلطة' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/8 rounded-xl px-2 py-1.5"
                  style={{ opacity: p > 0.38 + i * 0.07 ? 1 : 0, transition: 'opacity 0.4s' }}>
                  <span style={{ fontSize: '11px' }}>{m.ic}</span>
                  <div className="flex-1 text-right">
                    <p className="text-white font-black" style={{ fontSize: '7.5px' }}>
                      {m.n} <span className="text-white/20 font-normal" style={{ fontSize: '6.5px' }}>{m.t}</span>
                    </p>
                    <p className="text-white/25" style={{ fontSize: '6px' }}>{m.d}</p>
                  </div>
                  <span className="text-emerald-400 font-black" style={{ fontSize: '7.5px' }}>{m.kcal}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Progress tab ── */}
          {tab === 2 && (
            <div className="space-y-2">
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-2">
                <p className="text-white/30 font-bold mb-2 text-right" style={{ fontSize: '7px' }} dir="ltr">
                  Weight (kg) — 4 Weeks
                </p>
                <div className="flex items-end gap-1.5" style={{ height: '48px' }}>
                  {[{ w: 86.2, wk: 'W1' }, { w: 84.8, wk: 'W2' }, { w: 83.5, wk: 'W3' }, { w: 82.5, wk: 'W4' }].map(({ w, wk }, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-white font-black" style={{ fontSize: '6.5px' }}>{w}</span>
                      <div className="w-full rounded-t"
                        style={{ height: `${((w - 80) / 8) * 30}px`, background: 'linear-gradient(to top,#fbbf24,#fbbf24aa)' }} />
                      <span className="text-white/20" style={{ fontSize: '5.5px' }}>{wk}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[['−3.7 كغ', 'الوزن'], ['−4.2 سم', 'الخصر'], ['18.5%', 'الدهون']].map(([v, l]) => (
                  <div key={l} className="bg-white/[0.03] border border-white/8 rounded-xl p-1.5 text-center">
                    <p className="text-emerald-400 font-black" style={{ fontSize: '9px' }}>{v}</p>
                    <p className="text-white/25" style={{ fontSize: '6px' }}>{l}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#fbbf24]/8 border border-[#fbbf24]/20 rounded-xl p-2 text-center"
                style={{ opacity: p > 0.88 ? 1 : 0, transition: 'opacity 0.5s' }}>
                <p className="text-[#fbbf24] font-black" style={{ fontSize: '7.5px' }}>📸 أضف صورة تقدم أسبوعية</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right icon column — matches real page ── */}
        <div className="w-9 bg-[#0d0d0d] border-r border-white/5 flex flex-col items-center pt-2 gap-1.5 flex-shrink-0">
          {rightIcons.map((icon, i) => (
            <div key={i}
              className={`w-7 h-7 rounded-xl flex items-center justify-center cursor-pointer ${
                (i === 1 && tab === 1) || (i === 2 && tab === 0) || (i === 0 && tab === 2)
                  ? 'bg-[#fbbf24]/15 border border-[#fbbf24]/30'
                  : ''
              }`}>
              <span style={{ fontSize: '12px', opacity: 0.35 }}>{icon}</span>
            </div>
          ))}
        </div>
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
    ms:     11000,
    cursor: [[0,.50,.40],[.20,.50,.50],[.40,.50,.62],[.58,.50,.72],[.76,.50,.80],[.90,.50,.87],[1,.50,.90]],
    render: (p) => <S1_Landing p={p} />,
  },
  {
    url:    'amine-fit.com/#pricing',
    label:  '💰 اختيار الباقة الشهرية',
    icon:   '💰',
    ms:     8000,
    cursor: [[0,.50,.35],[.25,.50,.55],[.50,.50,.68],[.65,.50,.73],[.80,.50,.73],[1,.50,.73]],
    render: (p) => <S2_Pricing p={p} />,
  },
  {
    url:    'amine-fit.com/register?plan=monthly',
    label:  '📋 نموذج التسجيل (5 خطوات)',
    icon:   '📋',
    ms:     9000,
    cursor: [[0,.50,.28],[.10,.38,.42],[.44,.38,.53],[.70,.38,.64],[.85,.50,.80],[.92,.50,.80],[1,.50,.80]],
    render: (p) => <S3_Register p={p} />,
  },
  {
    url:    'amine-fit.com/register/success?plan=monthly',
    label:  '💳 إتمام الدفع عبر D17',
    icon:   '💳',
    ms:     9000,
    cursor: [[0,.50,.30],[.15,.50,.45],[.30,.50,.55],[.45,.50,.65],[.58,.50,.72],[.70,.50,.78],[.85,.50,.82],[1,.50,.85]],
    render: (p) => <S4_Pending p={p} />,
  },
  {
    url:    'amine-fit.com/client/login',
    label:  '🔑 تفعيل الحساب ثم الدخول',
    icon:   '🔑',
    ms:     9000,
    // Cursor: page → تفعيل tab → email field → code field → دخول tab → email → pw → button
    cursor: [[0,.50,.40],[.08,.35,.40],[.12,.50,.56],[.37,.50,.63],[.44,.35,.40],[.51,.65,.40],[.56,.50,.56],[.74,.50,.63],[.90,.50,.74],[1,.50,.74]],
    render: (p) => <S5_Login p={p} />,
  },
  {
    url:    'amine-fit.com/client/home',
    label:  '📱 تطبيق Amine-Fit — الصفحة الرئيسية',
    icon:   '📱',
    ms:     9000,
    cursor: [[0,.35,.28],[.20,.35,.45],[.45,.35,.60],[.65,.35,.72],[.85,.65,.72],[1,.65,.72]],
    render: (p) => <S6_Dashboard p={p} />,
  },
  {
    url:    'amine-fit.com/client/plan',
    label:  '⚡ التطبيق — التغذية / التدريب / التقدم',
    icon:   '⚡',
    ms:     9000,
    cursor: [[0,.75,.18],[.12,.25,.18],[.34,.25,.18],[.38,.50,.18],[.55,.50,.18],[.70,.75,.18],[.86,.75,.18],[1,.75,.18]],
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
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef(null)

  const { muted, toggle: toggleMute, start: startMusic, stop: stopMusic } = useMusicEngine()

  // Sync music with play state
  useEffect(() => {
    if (playing) startMusic()
    else stopMusic()
  }, [playing]) // eslint-disable-line

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

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
    <div ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden border border-white/10"
      style={{ aspectRatio: fullscreen ? undefined : '16/9', background: '#111',
        ...(fullscreen ? { height: '100vh', borderRadius: 0, border: 'none' } : {}) }}>

      {/* Browser + scene */}
      <div className="absolute inset-0 p-0">
        <Browser url={SCENES[si].url}>
          {SCENES[si].render(pct)}
        </Browser>
      </div>

      {/* Cursor */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
        <Cursor x={cur.x * 100} y={cur.y * 91 + 9} click={isClick} />
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
            <button onClick={() => jump((si - 1 + SCENES.length) % SCENES.length)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center flex-shrink-0"
              title="المشهد السابق">
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
            <button onClick={() => jump((si + 1) % SCENES.length)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center flex-shrink-0"
              title="المشهد التالي">
              <ChevronLeft className="w-3.5 h-3.5 text-white" />
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
            {/* Fullscreen */}
            <button onClick={toggleFullscreen}
              title={fullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center flex-shrink-0">
              {fullscreen
                ? <Minimize2 className="w-3 h-3 text-white" />
                : <Maximize2 className="w-3 h-3 text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
