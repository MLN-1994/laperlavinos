'use client';

import { useRouter } from 'next/navigation';
import { getSupabaseClient, hasSupabaseBrowserConfig } from '@/lib/supabaseClient';

interface AdminSignOutButtonProps {
  className?: string;
  redirectTo?: string;
}

export default function AdminSignOutButton({
  className,
  redirectTo = '/admin-login',
}: AdminSignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    if (hasSupabaseBrowserConfig()) {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    }

    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={className ?? 'rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100'}
    >
      Cerrar sesion
    </button>
  );
}