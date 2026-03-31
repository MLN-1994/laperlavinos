import { redirect } from 'next/navigation';
import AdminLoginForm from './AdminLoginForm';
import { getAdminAccessState } from '@/lib/adminAuth';

interface AdminLoginPageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

function resolveNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith('/admin')) {
    return '/admin';
  }

  return nextPath;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const nextPath = resolveNextPath(params.next);
  const access = await getAdminAccessState({ allowSessionValidationFailure: true });

  if (!access.error && access.user && access.isAdmin) {
    redirect(nextPath);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_50%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(241,245,249,0.92))]" />
      <div className="relative w-full max-w-md">
        {access.error ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-sm text-amber-900 shadow-xl shadow-amber-100/60">
            <h1 className="text-2xl font-bold text-amber-950">Configuracion pendiente</h1>
            <p className="mt-4">{access.error}</p>
            <p className="mt-2">Antes de usar el panel, configura Supabase Auth, la tabla `profiles` y el service role key.</p>
          </div>
        ) : (
          <AdminLoginForm
            nextPath={nextPath}
            currentEmail={access.user?.email ?? null}
            showPermissionWarning={Boolean(access.user && !access.isAdmin)}
          />
        )}
      </div>
    </main>
  );
}