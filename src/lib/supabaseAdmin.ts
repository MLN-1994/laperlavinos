import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

export function hasSupabaseAdminConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Falta configurar NEXT_PUBLIC_SUPABASE_URL.');
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('Falta configurar SUPABASE_SERVICE_ROLE_KEY.');
  }

  if (!cachedClient) {
    cachedClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return cachedClient;
}