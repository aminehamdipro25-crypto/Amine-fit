export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.vercel.app'
  const now  = new Date().toISOString()
  return [
    { url: base,                    lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/register`,      lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/client/login`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${base}/blog`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/legal/privacy`, lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/legal/terms`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
