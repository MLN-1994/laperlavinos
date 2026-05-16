'use client';

import { useEffect, useState } from 'react';

export interface HomeSection {
  tipo: string;
  producto_id: string | null;
  producto_nombre: string | null;
  imagen_url: string | null;
  titulo: string | null;
  subtitulo: string | null;
  cita: string | null;
  cta_label: string | null;
  cta_href: string | null;
  activo: boolean;
  updated_at?: string;
}

// Cache en memoria para evitar re-fetches innecesarios
let cachedSections: HomeSection[] | null = null;
let cachedAt = 0;
const TTL_MS = 60_000;

async function fetchAllSections(): Promise<HomeSection[]> {
  const now = Date.now();
  if (cachedSections && now - cachedAt < TTL_MS) return cachedSections;

  const res = await fetch('/api/home-sections', { cache: 'no-store' });
  if (!res.ok) return [];

  const data = (await res.json()) as HomeSection[];
  cachedSections = data;
  cachedAt = now;
  return data;
}

export function useHomeSection(tipo: string) {
  const [section, setSection] = useState<HomeSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSections()
      .then((data) => setSection(data.find((s) => s.tipo === tipo) ?? null))
      .finally(() => setLoading(false));
  }, [tipo]);

  return { section, loading };
}
