export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/client/', '/api/'],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.vercel.app'}/sitemap.xml`,
  }
}
