import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { hasSupabaseBrowserConfig } from '@/lib/supabaseClient';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

interface ProfileAdminRow {
  is_admin: boolean | null;
}

export interface AdminAccessState {
  user: User | null;
  isAdmin: boolean;
  error: string | null;
}

interface GetAdminAccessStateOptions {
  allowSessionValidationFailure?: boolean;
}

export async function getAdminAccessState(
  options: GetAdminAccessStateOptions = {},
): Promise<AdminAccessState> {
  const { allowSessionValidationFailure = false } = options;

  if (!hasSupabaseBrowserConfig()) {
    return {
      user: null,
      isAdmin: false,
      error: 'Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    };
  }

  if (!hasSupabaseAdminConfig()) {
    return {
      user: null,
      isAdmin: false,
      error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY para validar permisos de admin.',
    };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    if (allowSessionValidationFailure) {
      return {
        user: null,
        isAdmin: false,
        error: null,
      };
    }

    return {
      user: null,
      isAdmin: false,
      error: 'No se pudo validar la sesion actual.',
    };
  }

  if (!user) {
    return {
      user: null,
      isAdmin: false,
      error: null,
    };
  }

  const { data: profile, error: profileError } = await getSupabaseAdmin()
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle<ProfileAdminRow>();

  if (profileError && profileError.code !== 'PGRST116') {
    return {
      user,
      isAdmin: false,
      error: 'No se pudo validar si el usuario es administrador.',
    };
  }

  return {
    user,
    isAdmin: Boolean(profile?.is_admin),
    error: null,
  };
}

export async function requireAdminApiUser() {
  const access = await getAdminAccessState();

  if (access.error) {
    return NextResponse.json({ error: access.error }, { status: 500 });
  }

  if (!access.user) {
    return NextResponse.json({ error: 'Debes iniciar sesion para usar esta ruta.' }, { status: 401 });
  }

  if (!access.isAdmin) {
    return NextResponse.json({ error: 'Tu usuario no tiene permisos de administrador.' }, { status: 403 });
  }

  return null;
}