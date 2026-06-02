export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/client/', '/api/'],
      },
    ],
    sitemap: 'https://amine-fit.vercel.app/sitemap.xml',
  }
}
