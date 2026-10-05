import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api/|_next/|_static/|images/|favicon.ico|[\\w-]+\\.\\w+).*)'],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'polaris.id';

  // 1. Abaikan berkas statis
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/images') ||
    url.pathname.startsWith('/favicon') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Bersihkan port (misal :3001)
  let currentHost = hostname.split(':')[0].toLowerCase();

  // 3. Bersihkan domain root produksi dan domain localhost
  if (currentHost.endsWith(`.${rootDomain}`)) {
    currentHost = currentHost.slice(0, -(rootDomain.length + 1));
  } else if (currentHost.endsWith('.localhost')) {
    currentHost = currentHost.slice(0, -'.localhost'.length);
  }

  // 4. Fallback jika diakses langsung di root domain atau localhost tanpa subdomain
  if (
    currentHost === 'localhost' || 
    currentHost === '127.0.0.1' || 
    currentHost === rootDomain || 
    currentHost === 'www' ||
    !currentHost
  ) {
    // Layani Landing Page Utama POLARIS (app/page.tsx)
    return NextResponse.next();
  }

  // 5. Rewrite URL ke dynamic route [subdomain]
  url.pathname = `/${currentHost}${url.pathname}`;
  return NextResponse.rewrite(url);
}
