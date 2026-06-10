import BlogContent from './BlogContent'
import { posts } from '@/lib/blogPosts'

export const metadata = {
  title: 'المدونة — تغذية ولياقة بدنية | Amine-Fit',
  description: 'مقالات علمية في التغذية والتدريب الرياضي من المدرب أمين حمدي — مدرب شخصي معتمد في الدوحة، قطر.',
}

export default function BlogPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: base },
      { '@type': 'ListItem', position: 2, name: 'المدونة',  item: `${base}/blog` },
    ],
  }

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'مقالات Amine-Fit',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${base}/blog/${p.slug}`,
      name: p.title,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <BlogContent />
    </>
  )
}
