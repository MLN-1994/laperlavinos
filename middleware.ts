import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PREVIEW_COOKIE = 'lp_preview';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  if (!maintenanceMode) return NextResponse.next();

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
  if (previewSecret && previewCookie === previewSecret) return NextResponse.next();

  if (pathname !== '/maintenance') {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!admin|maintenance|_next|api|favicon\\.ico|robots\\.txt|assets|img).*)'],
};
