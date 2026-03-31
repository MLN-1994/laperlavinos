'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, hasSupabaseBrowserConfig } from '@/lib/supabaseClient';
import AdminSignOutButton from '@/app/admin/AdminSignOutButton';

interface AdminLoginFormProps {
  nextPath: string;
  currentEmail?: string | null;
  showPermissionWarning?: boolean;
}

export default function AdminLoginForm({
  nextPath,
  currentEmail,
  showPermissionWarning = false,
}: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(currentEmail ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(showPermissionWarning ? 'La cuenta actual no tiene permisos de administrador.' : null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasSupabaseBrowserConfig()) {
      setError('Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'No se pudo iniciar sesion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">La Perla Vinos</p>
        <h1 className="text-3xl font-bold text-slate-900">Ingreso administrador</h1>
        <p className="text-sm text-slate-600">
          Accede al panel para gestionar catalogo, banners y configuracion de Mercado Pago.
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            placeholder="admin@laperlavinos.com"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
            Contrasena
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            placeholder="Tu contrasena"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? 'Ingresando...' : 'Ingresar al panel'}
        </button>
      </form>

      {currentEmail && showPermissionWarning && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>La sesion actual corresponde a {currentEmail}, pero ese perfil no tiene el flag `is_admin`.</p>
          <div className="mt-4">
            <AdminSignOutButton className="rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100" redirectTo="/admin-login" />
          </div>
        </div>
      )}
    </div>
  );
}