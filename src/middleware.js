import { NextResponse } from 'next/server';

// Secret key for JWT signing (use environment variable or default)
const JWT_SECRET = process.env.JWT_SECRET || 'reviews-era-secret-key-12345';

export function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect Admin dashboard (/admin)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      // Decode JWT token directly (Middlewares run in Edge, so we can parse payload manually)
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));

      if (payload.role !== 'admin') {
        // Non-admin trying to access admin dashboard -> redirect to writer dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect Writer/User dashboard (/dashboard)
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
