import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';
import AdminSignOutButton from './AdminSignOutButton';
import { getAdminAccessState } from '@/lib/adminAuth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccessState();

  if (access.error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16 bg-neutral-50">
        <div className="w-full rounded-sm border border-[#a68a5c]/30 bg-[#a68a5c]/10 p-6 text-sm text-[#c9a96e]">
          <h1 className="text-lg font-semibold text-neutral-800">Configuración pendiente</h1>
          <p className="mt-3">{access.error}</p>
          <p className="mt-2 text-neutral-500">Revisá las variables de entorno y la tabla de perfiles antes de usar el panel.</p>
        </div>
      </div>
    );
  }

  if (!access.user) {
    redirect('/admin-login');
  }

  if (!access.isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16 bg-neutral-50">
        <div className="w-full rounded-sm border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          <h1 className="text-lg font-semibold text-neutral-800">Acceso denegado</h1>
          <p className="mt-3">Tu usuario inició sesión, pero no tiene permisos de administrador.</p>
          <p className="mt-2 text-neutral-500">Marcá el perfil como admin en Supabase o entrá con otro usuario.</p>
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