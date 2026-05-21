import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PREVIEW_COOKIE = 'lp_preview';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Safety net: si por cualquier razón el middleware se ejecuta sobre admin,
  // no hacer nada. El matcher (positivo, abajo) ya debería excluirlo.
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin-login')) {
    return NextResponse.next();
  }

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

// MATCHER POSITIVO: el middleware SOLO se carga en estas rutas públicas.
// Cualquier ruta no listada (/, /admin, /admin-login, /api/*, /maintenance,
// assets, etc.) NUNCA pasa por el middleware — no hay forma de interceptar
// admin por error, ni siquiera por cache de edge en Vercel.
export const config = {
  matcher: [
    '/',
    '/legal/:path*',
    '/pago/:path*',
    '/producto/:path*',
    '/productos/:path*',
    '/transferencia/:path*',
  ],
};
