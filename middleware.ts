import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './src/lib/supabaseMiddleware';

export async function middleware(request: NextRequest) {
  try {
    const { response, user } = await updateSession(request);

    if (request.nextUrl.pathname.startsWith('/admin') && !user) {
      const loginUrl = new URL('/admin-login', request.url);
      loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch {
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};