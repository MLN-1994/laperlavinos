import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabaseMiddleware';

const PREVIEW_COOKIE = 'lp_preview';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Excluir archivos estáticos y rutas de API
  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/img') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt';

  // --- Maintenance mode ---
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  if (maintenanceMode && !isStatic) {
    const previewSecret = process.env.PREVIEW_SECRET;

    // Si llega con ?preview=SECRET → setear cookie y redirigir a home
    const previewParam = request.nextUrl.searchParams.get('preview');
    if (previewSecret && previewParam === previewSecret) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.set(PREVIEW_COOKIE, previewSecret, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/',
      });
      return response;
    }

    // Verificar cookie de preview
    const previewCookie = request.cookies.get(PREVIEW_COOKIE)?.value;
    const hasAccess = previewSecret && previewCookie === previewSecret;

    if (!hasAccess) {
      if (pathname !== '/maintenance') {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
      return NextResponse.next();
    }
  }

  // --- Admin auth ---
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
