import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';
import AdminSignOutButton from './AdminSignOutButton';
import { getAdminAccessState } from '@/lib/adminAuth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccessState();

  if (access.error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16 bg-[#3c3c3b]">
        <div className="w-full rounded-sm border border-[#a68a5c]/30 bg-[#a68a5c]/10 p-6 text-sm text-[#c9a96e]">
          <h1 className="text-lg font-semibold text-[#beb9b1]">Configuración pendiente</h1>
          <p className="mt-3">{access.error}</p>
          <p className="mt-2 text-[#beb9b1]/50">Revisá las variables de entorno y la tabla de perfiles antes de usar el panel.</p>
        </div>
      </div>
    );
  }

  if (!access.user) {
    redirect('/admin-login');
  }

  if (!access.isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16 bg-[#3c3c3b]">
        <div className="w-full rounded-sm border border-[#d03416]/30 bg-[#d03416]/10 p-6 text-sm text-[#f3c3ba]">
          <h1 className="text-lg font-semibold text-[#beb9b1]">Acceso denegado</h1>
          <p className="mt-3">Tu usuario inició sesión, pero no tiene permisos de administrador.</p>
          <p className="mt-2 text-[#beb9b1]/50">Marcá el perfil como admin en Supabase o entrá con otro usuario.</p>
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