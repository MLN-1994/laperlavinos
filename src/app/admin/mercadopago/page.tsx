'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { MercadoPagoAccountStatus } from '@/types/mercadopago';

interface ManualLinkResult {
  initPoint?: string;
  sandboxInitPoint?: string;
}

function isMercadoPagoAccountStatus(value: unknown): value is MercadoPagoAccountStatus {
  if (!value || typeof value !== 'object') return false;
  return typeof (value as { connected?: unknown }).connected === 'boolean';
}

const initialState: MercadoPagoAccountStatus & { loading: boolean; error: string | null } = {
  connected: false,
  loading: true,
  error: null,
};

export default function MercadoPagoAdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [account, setAccount] = useState(initialState);
  const [showManualForm, setShowManualForm] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [flash, setFlash] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);

  // Formulario cambio de cuenta
  const [accessToken, setAccessToken] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Cobro manual
  const [manualTitle, setManualTitle] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualQuantity, setManualQuantity] = useState('1');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState<ManualLinkResult | null>(null);
  const [copied, setCopied] = useState(false);

  const preferredLink = manualLink?.initPoint || manualLink?.sandboxInitPoint;

  const fetchAccount = async () => {
    setAccount((c) => ({ ...c, loading: true, error: null }));
    try {
      const res = await fetch('/api/mercadopago/account', { cache: 'no-store' });
      const data = (await res.json()) as unknown;
      if (!res.ok || !isMercadoPagoAccountStatus(data)) {
        throw new Error('No se pudo cargar la cuenta de Mercado Pago.');
      }
      setAccount({ ...initialState, ...data, loading: false });
      setPublicKey((data as MercadoPagoAccountStatus).publicKey ?? '');
    } catch (err) {
      setAccount({ ...initialState, loading: false, error: err instanceof Error ? err.message : 'Error' });
    }
  };

  useEffect(() => { void fetchAccount(); }, []);

  // Leer resultado OAuth desde la URL y limpiarla
  useEffect(() => {
    const oauth = searchParams.get('oauth');
    const reason = searchParams.get('reason');
    if (!oauth) return;

    if (oauth === 'success') {
      setFlash({ msg: 'Cuenta de Mercado Pago conectada correctamente.', tone: 'ok' });
      void fetchAccount();
    } else if (oauth === 'cancelled') {
      setFlash({ msg: 'Conexion cancelada.', tone: 'err' });
    } else if (oauth === 'error') {
      const msg = reason
        ? decodeURIComponent(reason)
        : 'No se pudo conectar la cuenta de Mercado Pago.';
      setFlash({ msg, tone: 'err' });
    }

    // Limpiar params de la URL sin recargar
    router.replace('/admin/mercadopago', { scroll: false });
  }, [searchParams, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken.trim()) { setSaveError('Pegá el token de Mercado Pago.'); return; }
    setSaveLoading(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/mercadopago/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: publicKey.trim(), accessToken: accessToken.trim() }),
      });
      const data = (await res.json()) as { error?: string; nickname?: string | null };
      if (!res.ok) throw new Error(data.error ?? 'No se pudo guardar.');
      setFlash({ msg: `Cuenta actualizada${data.nickname ? `: ${data.nickname}` : ''}.`, tone: 'ok' });
      setAccessToken('');
      setShowManualForm(false);
      await fetchAccount();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('¿Seguro que querés desconectar la cuenta de Mercado Pago?')) return;
    setDisconnecting(true);
    try {
      const res = await fetch('/api/mercadopago/account', { method: 'DELETE' });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'No se pudo desconectar.');
      setFlash({ msg: 'Cuenta desconectada.', tone: 'ok' });
      await fetchAccount();
    } catch (err) {
      setFlash({ msg: err instanceof Error ? err.message : 'Error', tone: 'err' });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(manualAmount);
    const qty = Number(manualQuantity);
    if (!manualTitle.trim()) { setManualError('Escribí una descripción para el cobro.'); return; }
    if (!Number.isFinite(amount) || amount <= 0) { setManualError('Ingresá un monto válido.'); return; }
    if (!Number.isInteger(qty) || qty <= 0) { setManualError('Ingresá una cantidad válida.'); return; }
    setManualLoading(true);
    setManualError(null);
    setManualLink(null);
    setCopied(false);
    try {
      const res = await fetch('/api/admin/mercadopago/manual-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: manualTitle.trim(), description: manualTitle.trim(), amount, quantity: qty }),
      });
      const data = (await res.json()) as ManualLinkResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'No se pudo generar el link.');
      setManualLink(data);
    } catch (err) {
      setManualError(err instanceof Error ? err.message : 'No se pudo generar el link.');
    } finally {
      setManualLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!preferredLink) return;
    try {
      await navigator.clipboard.writeText(preferredLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { setManualError('No se pudo copiar.'); }
  };

  const inputClass = 'rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]';

  return (
    <section className="mx-auto max-w-2xl space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif tracking-wide text-[#beb9b1]">Mercado Pago</h1>
        <p className="mt-1 text-sm text-[#beb9b1]/50">
          Configurá la cuenta con la que se reciben los pagos de la tienda.
        </p>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`rounded-sm border px-4 py-3 text-sm ${
          flash.tone === 'ok'
            ? 'border-[#a68a5c]/30 bg-[#a68a5c]/10 text-[#c9a96e]'
            : 'border-[#d03416]/30 bg-[#d03416]/10 text-[#f3c3ba]'
        }`}>
          {flash.msg}
        </div>
      )}

      {/* ── CUENTA CONECTADA ─────────────────────────────── */}
      <div className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#beb9b1]/50 mb-4">
          Cuenta conectada
        </p>

        {account.loading ? (
          <p className="text-sm text-[#beb9b1]/40 animate-pulse">Verificando cuenta...</p>
        ) : account.error ? (
          <p className="text-sm text-[#f3c3ba]">{account.error}</p>
        ) : account.connected ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 h-3 w-3 rounded-full bg-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-base font-serif text-[#f5efe3]">
                  {account.nickname ?? 'Cuenta activa'}
                </p>
                <p className="mt-0.5 text-sm text-[#beb9b1]/60 truncate">
                  {account.email ?? ''}
                </p>
                {account.liveMode === false && (
                  <p className="mt-2 text-xs text-amber-400">
                    Cuenta en modo prueba — los cobros reales no estan activos
                  </p>
                )}
              </div>
            </div>

            {account.mode !== 'direct' ? (
              <div className="flex flex-wrap gap-3 pt-2 border-t border-[#beb9b1]/10">
                <a
                  href="/api/mercadopago/oauth/authorize"
                  className="text-xs uppercase tracking-widest text-[#beb9b1]/50 hover:text-[#beb9b1] transition-colors"
                >
                  Cambiar cuenta
                </a>
                <span className="text-[#beb9b1]/20">·</span>
                <button
                  type="button"
                  onClick={() => { setShowManualForm((v) => !v); setSaveError(null); }}
                  className="text-xs uppercase tracking-widest text-[#beb9b1]/30 hover:text-[#beb9b1]/60 transition-colors"
                >
                  {showManualForm ? 'Cancelar' : 'Usar token manual'}
                </button>
                <span className="text-[#beb9b1]/20">·</span>
                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  disabled={disconnecting}
                  className="text-xs uppercase tracking-widest text-[#d03416]/60 hover:text-[#d03416] transition-colors disabled:opacity-40"
                >
                  {disconnecting ? 'Desconectando...' : 'Desconectar'}
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#beb9b1]/10">
                <a
                  href="/api/mercadopago/oauth/authorize"
                  className="text-xs uppercase tracking-widest text-[#beb9b1]/50 hover:text-[#beb9b1] transition-colors"
                >
                  Cambiar cuenta
                </a>
              </div>
            )}
          </div>
        ) : (
          /* ── SIN CUENTA ── */
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 h-3 w-3 rounded-full bg-red-400 flex-shrink-0" />
              <div>
                <p className="text-base font-serif text-[#f3c3ba]">Sin cuenta conectada</p>
                <p className="mt-0.5 text-sm text-[#beb9b1]/50">
                  Conecta tu cuenta de Mercado Pago para empezar a recibir pagos.
                </p>
              </div>
            </div>

            {/* Boton OAuth principal */}
            <a
              href="/api/mercadopago/oauth/authorize"
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden border border-[#009ee3] bg-transparent px-6 py-4 text-sm font-bold tracking-wide text-[#009ee3] transition-all hover:text-white"
            >
              <span className="absolute inset-0 z-0 bg-[#009ee3] transition-transform duration-300 translate-y-full group-hover:translate-y-0" />
              <svg className="relative z-10 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.75 17.25v-1.5a.75.75 0 011.5 0v1.5a.75.75 0 01-1.5 0zm.75-3.75a.75.75 0 01-.75-.75V6.75a.75.75 0 011.5 0v6a.75.75 0 01-.75.75z"/>
              </svg>
              <span className="relative z-10">Conectar con Mercado Pago</span>
            </a>

            <p className="text-xs text-[#beb9b1]/35 text-center">
              Se abre el login de Mercado Pago. Cuando termines, volveras automaticamente aqui.
            </p>

            {/* Alternativa manual */}
            <div className="pt-1 border-t border-[#beb9b1]/8">
              <button
                type="button"
                onClick={() => { setShowManualForm((v) => !v); setSaveError(null); }}
                className="text-xs uppercase tracking-widest text-[#beb9b1]/30 hover:text-[#beb9b1]/60 transition-colors"
              >
                {showManualForm ? 'Cancelar' : 'Prefiero ingresar el token manualmente'}
              </button>
            </div>
          </div>
        )}

        {/* Formulario token manual (secundario) */}
        {showManualForm && (
          <form className="mt-5 pt-5 border-t border-[#beb9b1]/10 grid gap-4" onSubmit={handleSave}>
            <p className="text-sm text-[#beb9b1]/60">
              Conseguis el token en{' '}
              <a
                href="https://www.mercadopago.com.ar/developers/panel"
                target="_blank"
                rel="noreferrer"
                className="text-[#a68a5c] underline underline-offset-2 hover:opacity-80"
              >
                mercadopago.com.ar/developers
              </a>
              {' '}→ tu aplicacion → <strong className="text-[#beb9b1]/70">Credenciales de produccion</strong>.
            </p>

            <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
              Token de acceso <span className="text-[#d03416]/70 normal-case tracking-normal">(requerido)</span>
              <textarea
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="APP_USR-..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
              Clave pública <span className="text-[#beb9b1]/30 normal-case tracking-normal">(opcional)</span>
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="APP_USR-..."
                className={inputClass}
              />
            </label>

            {saveError && (
              <p className="rounded-sm border border-[#d03416]/30 bg-[#d03416]/10 px-3 py-2 text-xs text-[#f3c3ba]">
                {saveError}
              </p>
            )}

            <button
              type="submit"
              disabled={saveLoading}
              className="group relative flex items-center justify-center overflow-hidden border border-[#a68a5c] bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a68a5c] transition-all hover:text-[#3c3c3b] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-400 translate-y-full group-hover:translate-y-0" />
              <span className="relative z-10">{saveLoading ? 'Guardando...' : 'Guardar y activar'}</span>
            </button>
          </form>
        )}
      </div>

      {/* ── COBRO PUNTUAL ────────────────────────────────── */}
      <div className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#beb9b1]/50 mb-1">
          Generar link de cobro
        </p>
        <p className="text-sm text-[#beb9b1]/60 mb-5">
          Creá un link para cobrarle a un cliente por cualquier concepto y monto.
          El cliente entra al link y paga con su tarjeta.
        </p>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleCreateLink}>
          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55 sm:col-span-2">
            ¿Por qué es el cobro?
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => { setManualTitle(e.target.value); setManualLink(null); }}
              placeholder="Ej: Caja degustación, reserva, flete..."
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
            Monto ($)
            <input
              type="number"
              min="1"
              step="0.01"
              value={manualAmount}
              onChange={(e) => { setManualAmount(e.target.value); setManualLink(null); }}
              placeholder="5000"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
            Cantidad
            <input
              type="number"
              min="1"
              step="1"
              value={manualQuantity}
              onChange={(e) => { setManualQuantity(e.target.value); setManualLink(null); }}
              placeholder="1"
              className={inputClass}
            />
          </label>

          {manualError && (
            <p className="sm:col-span-2 rounded-sm border border-[#d03416]/30 bg-[#d03416]/10 px-3 py-2 text-xs text-[#f3c3ba]">
              {manualError}
            </p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={!account.connected || manualLoading}
              className="group relative flex items-center justify-center overflow-hidden border border-[#a68a5c] bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a68a5c] transition-all hover:text-[#3c3c3b] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-400 translate-y-full group-hover:translate-y-0" />
              <span className="relative z-10">
                {manualLoading ? 'Generando...' : 'Crear link de cobro'}
              </span>
            </button>
          </div>
        </form>

        {preferredLink && (
          <div className="mt-5 rounded-sm border border-[#a68a5c]/20 bg-[#1a1a1a]/30 p-5 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/50 mb-1">
                ✓ Link listo para compartir
              </p>
              <a
                href={preferredLink}
                target="_blank"
                rel="noreferrer"
                className="block break-all text-xs text-[#a68a5c] underline underline-offset-2 hover:opacity-80"
              >
                {preferredLink}
              </a>
              {!manualLink?.initPoint && manualLink?.sandboxInitPoint && (
                <p className="mt-1 text-[10px] text-amber-400">Este es un link de prueba.</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="text-xs uppercase tracking-widest text-[#beb9b1]/60 hover:text-[#beb9b1] transition-colors border border-[#beb9b1]/15 px-4 py-2 rounded-sm"
              >
                {copied ? '✓ Copiado' : 'Copiar link'}
              </button>
              <a
                href={preferredLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs uppercase tracking-widest text-[#a68a5c] hover:opacity-80 transition-opacity border border-[#a68a5c]/40 px-4 py-2 rounded-sm"
              >
                Abrir y ver
              </a>
            </div>
          </div>
        )}
      </div>

    </section>
  );
}
