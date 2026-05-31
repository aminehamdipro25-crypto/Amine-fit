import Link from 'next/link'
import { posts } from '@/lib/blogPosts'

export const metadata = {
  title: 'المدونة — تغذية ولياقة بدنية',
  description: 'مقالات علمية في التغذية والتدريب الرياضي من المدرب أمين حمدي — مدرب شخصي معتمد في قطر.',
}

const colorMap = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue:    'bg-blue-100 text-blue-700',
  sky:     'bg-sky-100 text-sky-700',
  gold:    'bg-amber-100 text-amber-700',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="bg-[#0a0a0a] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold-400 text-sm font-extrabold uppercase tracking-widest mb-4">المدونة</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            تغذية · لياقة · علم
          </h1>
          <p className="text-white/40 text-lg font-medium max-w-xl mx-auto">
            مقالات علمية مبسّطة لمساعدتك على تحقيق أهدافك الصحية
          </p>
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden">
              <div className="bg-slate-50 p-8 text-center text-5xl group-hover:bg-slate-100 transition-colors">
                {post.emoji}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${colorMap[post.categoryColor] || 'bg-slate-100 text-slate-600'}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-300">{post.readTime}</span>
                </div>
                <h2 className="font-extrabold text-slate-900 text-base leading-snug mb-2 group-hover:text-gold-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
                <p className="text-xs text-slate-300 mt-3 font-medium">
                  {new Date(post.date).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
