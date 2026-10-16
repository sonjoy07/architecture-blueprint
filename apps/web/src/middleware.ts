import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets, api routes, and Next internals should bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('sentrydocs_session');
  const isAuthenticated = Boolean(sessionCookie && sessionCookie.value);

  // If user visits /login while authenticated, redirect to /dashboard/copilot
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard/copilot', request.url));
    }
    return NextResponse.next();
  }

  // Root landing page: redirect to /dashboard/copilot if authenticated, else /login
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard/copilot', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protected paths: /dashboard/*, /copilot, /documents, /audit, /ingestion
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/copilot') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/audit') ||
    pathname.startsWith('/ingestion');

  if (isProtectedPath) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Forward legacy paths to standard /dashboard paths
    if (pathname === '/copilot') {
      return NextResponse.redirect(new URL('/dashboard/copilot', request.url));
    }
    if (pathname === '/documents' || pathname === '/ingestion') {
      return NextResponse.redirect(new URL('/dashboard/ingestion', request.url));
    }
    if (pathname === '/audit') {
      return NextResponse.redirect(new URL('/dashboard/audit', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
