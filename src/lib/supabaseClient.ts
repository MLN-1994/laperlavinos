import { createBrowserClient } from '@supabase/ssr';

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

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
		cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
	}

	return cachedClient;
}