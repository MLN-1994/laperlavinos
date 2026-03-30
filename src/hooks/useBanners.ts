"use client";
import { useEffect, useState } from 'react';
import { getSupabaseClient, hasSupabaseBrowserConfig } from '../lib/supabaseClient';
import { Banner } from '../types/banner';
export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBanners() {
      setLoading(true);
      if (!hasSupabaseBrowserConfig()) {
        setError('Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        setBanners([]);
        setLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setBanners(data as Banner[]);
      }
      setLoading(false);
    }

    fetchBanners();
  }, []);

  return { banners, loading, error };
}