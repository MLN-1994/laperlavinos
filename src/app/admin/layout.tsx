import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';
import AdminSignOutButton from './AdminSignOutButton';
import { getAdminAccessState } from '@/lib/adminAuth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccessState();

  if (access.error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16">
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 shadow-sm">
          <h1 className="text-lg font-semibold text-amber-950">Configuracion pendiente</h1>
          <p className="mt-3">{access.error}</p>
          <p className="mt-2">Revisa las variables de entorno y la tabla `profiles` antes de usar el panel.</p>
        </div>
      </div>
    );
  }

  if (!access.user) {
    redirect('/admin-login');
  }

  if (!access.isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16">
        <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 shadow-sm">
          <h1 className="text-lg font-semibold text-rose-950">Acceso denegado</h1>
          <p className="mt-3">Tu usuario inicio sesion, pero no tiene permisos de administrador.</p>
          <p className="mt-2">Marca el perfil como admin en Supabase o entra con otro usuario.</p>
          <div className="mt-5">
            <AdminSignOutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminShell userEmail={access.user.email}>
      {children}
    </AdminShell>
  );
}