import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PREVIEW_COOKIE = 'lp_preview';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Safety net: nunca tocar admin desde el proxy.
  // La auth de admin se maneja en src/app/admin/layout.tsx vía getAdminAccessState().
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin-login')) {
    return NextResponse.next();
  }

  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  if (!maintenanceMode) return NextResponse.next();

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
  if (previewSecret && previewCookie === previewSecret) {
    return NextResponse.next();
  }

  if (pathname !== '/maintenance') {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
  return NextResponse.next();
}

// MATCHER POSITIVO: el proxy SOLO corre en estas rutas públicas.
// /admin, /admin-login, /api/*, /maintenance, assets, etc. NUNCA pasan por aquí.
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
