import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostBySlug, posts } from '@/lib/blogPosts'
import { ArrowRight } from 'lucide-react'

export function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${base}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: ['أمين حمدي'],
      url: `${base}/blog/${post.slug}`,
    },
  }
}

const colorMap = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue:    'bg-blue-100 text-blue-700',
  sky:     'bg-sky-100 text-sky-700',
  gold:    'bg-amber-100 text-amber-700',
}

function renderContent(content) {
  const lines = content.trim().split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) { i++; continue }

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-xl font-extrabold text-slate-900 mt-8 mb-3">{line.slice(3)}</h2>)
    } else if (line.startsWith('**') && line.endsWith('**') && !line.slice(2,-2).includes('**')) {
      elements.push(<p key={i} className="font-bold text-slate-900 mb-2">{line.slice(2,-2)}</p>)
    } else if (line.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(<li key={i} className="mb-1">{lines[i].trim().slice(2)}</li>)
        i++
      }
      elements.push(<ul key={`ul-${i}`} className="list-disc pr-6 mb-4 space-y-1 text-slate-600">{items}</ul>)
      continue
    } else if (line.startsWith('|')) {
      // Table
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      const rows = tableLines.filter(l => !l.replace(/\|/g,'').replace(/-/g,'').trim() === false || l.replace(/\|/g,'').replace(/-/g,'').trim() !== '')
        .filter(l => !l.replace(/\|/g,'').replace(/-/g,'').replace(/\s/g,'').match(/^-+$/))
      elements.push(
        <div key={`tbl-${i}`} className="overflow-x-auto my-4 rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split('|').filter(c => c.trim())
                const Tag = ri === 0 ? 'th' : 'td'
                return (
                  <tr key={ri} className={ri === 0 ? 'bg-slate-50' : ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    {cells.map((cell, ci) => (
                      <Tag key={ci} className="px-4 py-2.5 text-right border-b border-slate-100 font-medium text-slate-700">
                        {cell.trim()}
                      </Tag>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
      continue
    } else {
      elements.push(<p key={i} className="text-slate-600 leading-relaxed mb-3 font-medium">{line}</p>)
    }
    i++
  }
  return elements
}

export default function BlogPost({ params }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: 'أمين حمدي', url: base },
    publisher: { '@type': 'Organization', name: 'Amine-Fit', url: base },
    url: `${base}/blog/${post.slug}`,
    inLanguage: 'ar',
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Hero */}
      <div className="bg-[#0a0a0a] text-white py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة للمدونة
          </Link>
          <div className="text-6xl mb-6">{post.emoji}</div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${colorMap[post.categoryColor] || 'bg-slate-700 text-slate-300'}`}>
              {post.category}
            </span>
            <span className="text-white/30 text-sm">{post.readTime}</span>
            <span className="text-white/30 text-sm">
              {new Date(post.date).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{post.title}</h1>
          <p className="text-white/50 mt-3 leading-relaxed">{post.excerpt}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="prose-like">
          {renderContent(post.content)}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-[#0a0a0a] rounded-2xl p-6 text-center">
          <p className="text-white font-extrabold text-lg mb-2">هل تريد خطة مخصصة؟</p>
          <p className="text-white/40 text-sm mb-4">احصل على برنامج تغذية وتدريب مصمم خصيصاً لك</p>
          <Link href="/register"
            className="inline-block px-6 py-3 bg-[#fbbf24] text-black font-extrabold rounded-xl hover:bg-[#f59e0b] transition text-sm">
            ابدأ الآن
          </Link>
        </div>
      </div>
    </div>
  )
}
