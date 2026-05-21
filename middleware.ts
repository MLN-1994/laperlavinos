import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './src/lib/supabaseMiddleware';

const PREVIEW_COOKIE = 'lp_preview';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/img') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt';

  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  if (maintenanceMode && !isStatic) {
    const previewSecret = process.env.PREVIEW_SECRET;

    const previewParam = request.nextUrl.searchParams.get('preview');
    if (previewSecret && previewParam === previewSecret) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.set(PREVIEW_COOKIE, previewSecret, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    }

    const previewCookie = request.cookies.get(PREVIEW_COOKIE)?.value;
    const hasAccess = previewSecret && previewCookie === previewSecret;

    if (!hasAccess) {
      if (pathname !== '/maintenance') {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
      return NextResponse.next();
    }
  }

  if (pathname.startsWith('/admin')) {
    try {
      const { response, user } = await updateSession(request);
      if (!user) {
        const loginUrl = new URL('/admin-login', request.url);
        loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    } catch {
      return NextResponse.next({ request });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!maintenance|_next|favicon\\.ico|robots\\.txt).*)'],
};
