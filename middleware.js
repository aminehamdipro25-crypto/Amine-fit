import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Protect coach dashboard
  if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/login') {
    const token = request.cookies.get('admin_token')?.value
    if (token !== (process.env.DASHBOARD_PASSWORD || 'amine2025')) {
      return NextResponse.redirect(new URL('/dashboard/login', request.url))
    }
  }

  // Protect client portal
  if (
    (pathname.startsWith('/client') &&
     pathname !== '/client/login' &&
     pathname !== '/client')
  ) {
    const token = request.cookies.get('client_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/client/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/client/:path*'],
}
