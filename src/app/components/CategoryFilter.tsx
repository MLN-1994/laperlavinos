'use client';

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY_CONFIG — mapeá el label visible con el valor exacto del campo
// `Grupo` de vista_articulos en Hermes (la comparación es case-insensitive).
// Si un grupo no tiene productos publicados en Supabase, no aparece.
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG: { grupo: string; label: string }[] = [
  // ── Vinos ────────────────────────────────────────────────────────────────
  { grupo: 'VINOS TINTOS',              label: 'Vinos tintos'            },
  { grupo: 'VINOS BLANCOS',             label: 'Vinos blancos'           },
  { grupo: 'VINOS ROSADOS',             label: 'Vinos rosados'           },
  { grupo: 'VINOS NARANJOS',            label: 'Vinos naranjos'          },
  { grupo: 'ESPUMANTES',                label: 'Espumantes'              },
  { grupo: 'CAVA',                      label: 'Cava'                    },
  // ── Espirituosas ─────────────────────────────────────────────────────────
  { grupo: 'APERITIVOS',                label: 'Aperitivos'              },
  { grupo: 'GIN',                       label: 'Gin'                     },
  { grupo: 'VODKA',                     label: 'Vodka'                   },
  { grupo: 'TEQUILA',                   label: 'Tequila'                 },
  { grupo: 'RON',                       label: 'Ron'                     },
  { grupo: 'WHISKY',                    label: 'Whisky'                  },
  { grupo: 'LICORES',                   label: 'Licores'                 },
  { grupo: 'SPIRITS',                   label: 'Spirits'                 },
  { grupo: 'COGNAC Y BRANDYS',          label: 'Coñac y brandys'         },
  // ── Cervezas y sin alcohol ────────────────────────────────────────────────
  { grupo: 'CERVEZAS NACIONALES',       label: 'Cervezas nacionales'     },
  { grupo: 'CERVEZAS IMPORTADAS',       label: 'Cervezas importadas'     },
  { grupo: 'SIDRAS',                    label: 'Sidras'                  },
  { grupo: 'GASEOSAS, JUGOS Y AGUAS',   label: 'Gaseosas, jugos y aguas' },
  { grupo: 'ENERGIZANTES',              label: 'Energizantes'            },
  // ── Otros ────────────────────────────────────────────────────────────────
  { grupo: 'ALMACEN',                   label: 'Almacén'                 },
  { grupo: 'ACEITES',                   label: 'Aceites'                 },
  { grupo: 'CRISTALERIA',               label: 'Cristalería'             },
  { grupo: 'REGALERIA / ACCESORIOS',    label: 'Regalería / Accesorios'  },
];

interface CategoryFilterProps {
  /** Grupos que realmente tienen al menos un producto publicado en Supabase. */
  availableGroups: string[];
  selected: string | null;
  onChange: (grupo: string | null) => void;
}

export default function CategoryFilter({
  availableGroups,
  selected,
  onChange,
}: CategoryFilterProps) {
  const visible = CATEGORY_CONFIG.filter((c) =>
    availableGroups.some((g) => g?.toUpperCase() === c.grupo.toUpperCase()),
  );

  if (visible.length === 0) return null;

  const basePill =
    'whitespace-nowrap rounded-sm border px-4 py-1.5 text-[12px] uppercase tracking-[0.12em] font-medium transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#a68a5c]/50';
  const inactive =
    'border-neutral-700 bg-transparent text-neutral-400 hover:border-[#a68a5c] hover:text-[#a68a5c]';
  const active =
    'border-[#a68a5c] bg-neutral-800 text-[#a68a5c] font-semibold';

  return (
    <div className="relative w-full">
      {/* Fade derecho para indicar scroll */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#3c3c3b] to-transparent" />
      <div className="overflow-x-auto scrollbar-hide pb-1 pt-0.5">
        <div className="flex min-w-max items-center gap-2 px-0.5">
          <button
            onClick={() => onChange(null)}
            className={`${basePill} ${selected === null ? active : inactive}`}
          >
            Todos
          </button>

          {/* Separador vertical */}
          <span className="h-3.5 w-px shrink-0 bg-neutral-600" />

          {visible.map(({ grupo, label }) => (
            <button
              key={grupo}
              onClick={() => onChange(selected === grupo ? null : grupo)}
              className={`${basePill} ${selected === grupo ? active : inactive}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
