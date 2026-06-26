'use client'
import { useState } from 'react'
import Link from 'next/link'
import { posts } from '@/lib/blogPosts'

const colorMap = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue:    'bg-blue-100 text-blue-700',
  sky:     'bg-sky-100 text-sky-700',
  gold:    'bg-amber-100 text-amber-700',
}

const CATS = ['الكل', 'تغذية', 'تدريب', 'صحة']

export default function BlogPage() {
  const [active, setActive] = useState('الكل')

  const filtered = active === 'الكل' ? posts : posts.filter(p => p.category === active)
  const featured = posts[posts.length - 1]

  return (
    <div className="min-h-screen bg-[#f8f9fb]" dir="rtl">
      {/* Hero */}
      <div className="bg-[#0a0a0a] text-white pt-20 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
          {['🥗','🏋️','🔬','💪','🌙','📊'].map((e, i) => (
            <span key={i} className="absolute text-7xl" style={{
              top: `${[10,60,20,50,30,70][i]}%`,
              left: `${[5,10,30,55,75,90][i]}%`,
              transform: `rotate(${[-15,10,-8,20,-12,5][i]}deg)`,
            }}>{e}</span>
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-4">مدونة Amine-Fit</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            تغذية · لياقة · علم
          </h1>
          <p className="text-white/40 text-base font-medium max-w-xl mx-auto mb-8">
            مقالات علمية مبسّطة من المدرب أمين حمدي — مدرب شخصي معتمد في الدوحة، قطر
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-white/70 text-xs font-bold">{posts.length} مقالة منشورة</span>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATS.map(cat => {
            const count = cat === 'الكل' ? posts.length : posts.filter(p => p.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all
                  ${active === cat
                    ? 'bg-[#0a0a0a] text-amber-400 shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
              >
                {cat}
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full
                  ${active === cat ? 'bg-amber-400/20 text-amber-300' : 'bg-white text-slate-400'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Featured post — show only in "الكل" */}
        {active === 'الكل' && featured && (
          <div className="mb-10">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">أحدث مقالة</p>
            <Link href={`/blog/${featured.slug}`}
              className="group flex flex-col sm:flex-row gap-0 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden">
              <div className="sm:w-56 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center py-10 sm:py-0 text-7xl group-hover:scale-105 transition-transform">
                {featured.emoji}
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${colorMap[featured.categoryColor] || 'bg-slate-100 text-slate-600'}`}>
                    {featured.category}
                  </span>
                  <span className="text-xs text-slate-300">{featured.readTime}</span>
                  <span className="mr-auto text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">🆕 جديد</span>
                </div>
                <h2 className="font-extrabold text-slate-900 text-xl leading-snug mb-3 group-hover:text-amber-600 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-2 text-amber-600 text-sm font-bold">
                  اقرأ المقالة
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-500 font-bold">لا توجد مقالات في هذه الفئة حالياً</p>
          </div>
        ) : (
          <>
            {active !== 'الكل' && (
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                {filtered.length} مقالة — {active}
              </p>
            )}
            {active === 'الكل' && (
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">كل المقالات</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(active === 'الكل' ? [...posts].slice(0, -1).reverse() : filtered).map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden flex flex-col">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-7 text-center text-5xl group-hover:from-slate-100 group-hover:to-slate-200 transition-all">
                    {post.emoji}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${colorMap[post.categoryColor] || 'bg-slate-100 text-slate-600'}`}>
                        {post.category}
                      </span>
                      <span className="text-[11px] text-slate-300 font-medium">{post.readTime}</span>
                    </div>
                    <h2 className="font-extrabold text-slate-900 text-sm leading-snug mb-2 group-hover:text-amber-600 transition-colors flex-1">
                      {post.title}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    <p className="text-[10px] text-slate-300 font-medium">
                      {new Date(post.date).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="mt-14 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border border-white/5 p-8 text-center shadow-xl shadow-black/30">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-white font-extrabold text-xl mb-2">هل تريد خطة مخصصة لك؟</p>
            <p className="text-white/40 text-sm mb-6">برنامج تغذية وتدريب مصمم خصيصاً بناءً على جسمك وأهدافك</p>
            <Link href="/register"
              className="inline-block px-7 py-3.5 bg-amber-400 text-black font-extrabold rounded-2xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20 text-sm">
              ⚡ ابدأ رحلتك الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
