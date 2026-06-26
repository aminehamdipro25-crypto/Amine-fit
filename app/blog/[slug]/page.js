import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPostBySlug, posts } from '@/lib/blogPosts'
import { ArrowRight, List, BadgeCheck } from 'lucide-react'
import ShareBar from '@/components/blog/ShareBar'

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

function slugify(text, index) {
  const cleaned = text
    .replace(/\*\*/g, '')
    .trim()
    .replace(/[^؀-ۿa-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
  return `${cleaned}-${index}`
}

// Splits a line on **bold** markers and returns plain text / <strong> segments
function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${idx}`} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>
    }
    return <span key={`${keyPrefix}-${idx}`}>{part}</span>
  })
}

function renderContent(content) {
  const lines = content.trim().split('\n')
  const elements = []
  const headings = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) { i++; continue }

    if (line.startsWith('## ')) {
      const text = line.slice(3)
      const id = slugify(text, i)
      headings.push({ id, text })
      elements.push(
        <h2 key={i} id={id} className="text-xl font-extrabold text-slate-900 mt-10 mb-3 scroll-mt-24">
          {text}
        </h2>
      )
    } else if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
      elements.push(<p key={i} className="font-extrabold text-slate-900 mt-5 mb-2">{line.slice(2, -2)}</p>)
    } else if (line.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(<li key={i} className="mb-1.5 pr-1">{renderInline(lines[i].trim().slice(2), `li-${i}`)}</li>)
        i++
      }
      elements.push(<ul key={`ul-${i}`} className="list-disc pr-6 mb-4 space-y-1 text-slate-600 marker:text-amber-400">{items}</ul>)
      continue
    } else if (line.startsWith('|')) {
      // Table
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      const rows = tableLines
        .filter(l => l.replace(/\|/g, '').replace(/-/g, '').trim() !== '')
        .filter(l => !l.replace(/\|/g, '').replace(/-/g, '').replace(/\s/g, '').match(/^-+$/))
      elements.push(
        <div key={`tbl-${i}`} className="overflow-x-auto my-5 rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split('|').filter(c => c.trim())
                const Tag = ri === 0 ? 'th' : 'td'
                return (
                  <tr key={ri} className={ri === 0 ? 'bg-slate-900 text-white' : ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    {cells.map((cell, ci) => (
                      <Tag key={ci} className={`px-4 py-2.5 text-right border-b border-slate-100 font-medium ${ri === 0 ? 'font-extrabold text-white' : 'text-slate-700'}`}>
                        {renderInline(cell.trim(), `c-${ri}-${ci}`)}
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
      elements.push(<p key={i} className="text-slate-600 leading-[1.9] mb-3 font-medium">{renderInline(line, `p-${i}`)}</p>)
    }
    i++
  }
  return { elements, headings }
}

export default function BlogPost({ params }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
  const postUrl = `${base}/blog/${post.slug}`
  const { elements, headings } = renderContent(post.content)
  const relatedPosts = posts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(-3)
    .reverse()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: 'أمين حمدي',
      url: base,
      jobTitle: 'مدرب شخصي ومدرب تغذية معتمد',
      sameAs: [base],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Amine-Fit',
      url: base,
      logo: { '@type': 'ImageObject', url: `${base}/icon-512.png` },
    },
    url: postUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    inLanguage: 'ar',
    image: { '@type': 'ImageObject', url: `${base}/og-image.png`, width: 1200, height: 630 },
    keywords: post.category || 'لياقة بدنية، تغذية، تدريب',
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Hero */}
      <div className="bg-[#0a0a0a] text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 text-[10rem] opacity-5 select-none pointer-events-none">{post.emoji}</div>
        <div className="max-w-2xl mx-auto relative z-10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة للمدونة
          </Link>
          <div className="text-6xl mb-6">{post.emoji}</div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
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

        {/* Table of contents */}
        {headings.length > 1 && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-10">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm mb-3">
              <List className="w-4 h-4 text-amber-500" />
              محتوى المقال
            </div>
            <ul className="space-y-2">
              {headings.map(h => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="text-sm text-slate-500 hover:text-amber-600 font-medium transition-colors">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="prose-like">
          {elements}
        </div>

        {/* Share */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm font-bold text-slate-400">شارك المقال مع من يحتاجه</span>
          <ShareBar title={post.title} url={postUrl} />
        </div>

        {/* Author bio */}
        <div className="mt-10 bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-amber-400">
            <Image src="/coach-hero.jpg" alt="أمين حمدي" fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-extrabold text-slate-900">أمين حمدي</p>
              <BadgeCheck className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-sm text-slate-500 font-medium">مدرب شخصي ومدرب تغذية معتمد — الدوحة، قطر</p>
          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-10">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">مقالات ذات صلة</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden flex flex-col">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 text-center text-3xl">
                    {p.emoji}
                  </div>
                  <div className="p-3.5">
                    <h3 className="font-extrabold text-slate-900 text-xs leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

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
