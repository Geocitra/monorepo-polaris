import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images/ (public images)
     * - static extensions (.jpg, .jpeg, .png, .webp, .svg, .ico)
     * - api/ (API routes)
     */
    '/((?!api|_next/static|_next/image|_next/data|images|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Lewati static assets dan image optimization secara absolut
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i)
  ) {
    return NextResponse.next();
  }

  // Penanganan rute Superadmin Console
  if (pathname.startsWith('/superadmin')) {
    const isSuperadminLogin = pathname === '/superadmin/login';
    const adminToken = req.cookies.get('polaris_admin_session')?.value;

    if (!adminToken && !isSuperadminLogin) {
      return NextResponse.redirect(new URL('/superadmin/login', req.url));
    }
    if (adminToken && isSuperadminLogin) {
      return NextResponse.redirect(new URL('/superadmin', req.url));
    }
    return NextResponse.next();
  }

  const token = req.cookies.get('polaris_session')?.value;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // 1. Jika pengguna belum login dan mencoba membuka halaman privat dashboard
  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Jika pengguna sudah login tapi mencoba membuka halaman login/register lagi
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}
