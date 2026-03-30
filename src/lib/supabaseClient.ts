import { createClient } from '@supabase/supabase-js';

let cachedClient: ReturnType<typeof createClient> | null = null;

export function hasSupabaseBrowserConfig() {
	return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl) {
		throw new Error('Falta configurar NEXT_PUBLIC_SUPABASE_URL.');
	}

	if (!supabaseAnonKey) {
		throw new Error('Falta configurar NEXT_PUBLIC_SUPABASE_ANON_KEY.');
	}

	if (!cachedClient) {
		cachedClient = createClient(supabaseUrl, supabaseAnonKey);
	}

	return cachedClient;
}