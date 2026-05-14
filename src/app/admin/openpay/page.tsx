'use client';

import { useEffect, useState } from 'react';

interface ManualLinkResult {
  checkoutUrl: string;
  orderUuid: string;
  orderId: string;
}

interface OpenPayStatus {
  connected: boolean;
  maskedClientId?: string;
  environment?: string;
  reason?: string;
}

interface OpenPayConfig {
  configured: boolean;
  maskedClientId?: string;
  environment?: string;
  source?: 'db' | 'env';
}

export default function OpenPayAdminPage() {
  const [status, setStatus] = useState<OpenPayStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [showChangeForm, setShowChangeForm] = useState(false);
  const [configData, setConfigData] = useState<OpenPayConfig | null>(null);
  const [newClientId, setNewClientId] = useState('');
  const [newClientSecret, setNewClientSecret] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [manualTitle, setManualTitle] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState<ManualLinkResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);

  const loadStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/admin/openpay/status');
      const data = (await res.json()) as OpenPayStatus & OpenPayConfig;
      setStatus(data);
      setConfigData({ configured: data.connected, maskedClientId: data.maskedClientId, environment: data.environment });
    } catch {
      setStatus({ connected: false, reason: 'error' });
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => { void loadStatus(); }, []);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId.trim() || !newClientSecret.trim()) {
      setSaveError('Completa ambos campos.');
      return;
    }
    setSaveLoading(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/admin/openpay/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: newClientId.trim(), clientSecret: newClientSecret.trim() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'No se pudo guardar.');
      setFlash({ msg: 'Cuenta de OpenPay actualizada.', tone: 'ok' });
      setNewClientId('');
      setNewClientSecret('');
      setShowChangeForm(false);
      await loadStatus();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateManualLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(manualAmount);
    if (!manualTitle.trim()) { setManualError('Escribi una descripcion para el cobro.'); return; }
    if (!Number.isFinite(amount) || amount <= 0) { setManualError('Ingresa un monto valido.'); return; }
    setManualLoading(true);
    setManualError(null);
    setManualLink(null);
    setCopied(false);
    try {
      const response = await fetch('/api/admin/openpay/manual-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: manualTitle.trim(), amount }),
      });
      const data = (await response.json()) as ManualLinkResult & { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'No se pudo generar el link.');
      setManualLink(data);
    } catch (err) {
      setManualError(err instanceof Error ? err.message : 'No se pudo generar el link de cobro.');
    } finally {
      setManualLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!manualLink?.checkoutUrl) return;
    try {
      await navigator.clipboard.writeText(manualLink.checkoutUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { setManualError('No se pudo copiar el link.'); }
  };

  const inputClass = 'rounded-sm border border-neutral-200 bg-white px-3 py-2.5 text-sm normal-case tracking-normal text-neutral-800 outline-none transition focus:border-[#a68a5c]';

  return (
    <section className="mx-auto max-w-2xl space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif tracking-wide text-neutral-800">OpenPay / BBVA</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Cobros con tarjeta a traves de BBVA OpenPay.
        </p>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`rounded-sm border px-4 py-3 text-sm ${
          flash.tone === 'ok'
            ? 'border-[#a68a5c]/30 bg-[#a68a5c]/10 text-[#c9a96e]'
            : 'border-red-200 bg-red-50 text-red-600'
        }`}>
          {flash.msg}
        </div>
      )}

      {/* -- CUENTA CONECTADA -- */}
      <div className="rounded-sm border border-neutral-200 bg-white p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400 mb-4">
          Cuenta conectada
        </p>

        {statusLoading ? (
          <p className="text-sm text-neutral-400 animate-pulse">Verificando conexion...</p>
        ) : status?.connected ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 h-3 w-3 rounded-full bg-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-base font-serif text-neutral-800">Cuenta activa</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {status.environment ?? 'Produccion'} &middot; OpenPay Argentina (BBVA)
                </p>
                <p className="mt-0.5 text-xs text-neutral-300 font-mono">
                  ID: {status.maskedClientId}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => { setShowChangeForm((v) => !v); setSaveError(null); }}
                className="text-xs uppercase tracking-widest text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                {showChangeForm ? 'Cancelar' : 'Cambiar cuenta'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 h-3 w-3 rounded-full bg-red-400 flex-shrink-0" />
              <div>
                <p className="text-base font-serif text-red-600">Sin conexion</p>
                <p className="mt-1 text-sm text-neutral-400">
                  {status?.reason === 'no_config'
                    ? 'Las credenciales de OpenPay no estan configuradas.'
                    : 'No se pudo conectar con OpenPay. Verifica que las credenciales sean correctas.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowChangeForm(true)}
              className="text-xs uppercase tracking-widest text-[#a68a5c] hover:opacity-80 transition-opacity"
            >
              Ingresar credenciales
            </button>
          </div>
        )}

        {/* Formulario cambio de cuenta */}
        {showChangeForm && (
          <form className="mt-5 pt-5 border-t border-neutral-200 grid gap-4" onSubmit={handleSaveCredentials}>
            <p className="text-sm text-neutral-500">
              Obtene las credenciales en el{' '}
              <a
                href="https://mi.openpayargentina.com.ar"
                target="_blank"
                rel="noreferrer"
                className="text-[#a68a5c] underline underline-offset-2 hover:opacity-80"
              >
                portal de OpenPay Argentina
              </a>
              {' '}&rarr; <strong className="text-neutral-600">Mi cuenta</strong> &rarr; <strong className="text-neutral-600">Credenciales</strong>.
            </p>
            <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Client ID
              <input
                type="text"
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Client Secret
              <input
                type="password"
                value={newClientSecret}
                onChange={(e) => setNewClientSecret(e.target.value)}
                placeholder="Tu clave secreta de OpenPay"
                className={inputClass}
              />
            </label>
            {saveError && (
              <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
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

      {/* -- COBRO PUNTUAL -- */}
      <div className="rounded-sm border border-neutral-200 bg-white p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400 mb-1">
          Generar link de cobro
        </p>
        <p className="text-sm text-neutral-500 mb-5">
          Crea un link para cobrarle a un cliente por cualquier concepto y monto.
          El cliente entra al link y paga con su tarjeta.
        </p>

        <form className="grid gap-4" onSubmit={handleCreateManualLink}>
          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Por que es el cobro?
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => { setManualTitle(e.target.value); setManualLink(null); }}
              placeholder="Ej: Caja degustacion, reserva evento, flete..."
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Monto a cobrar ($)
            <input
              type="number"
              min="1"
              step="1"
              value={manualAmount}
              onChange={(e) => { setManualAmount(e.target.value); setManualLink(null); }}
              placeholder="Ej: 5000"
              className={inputClass}
            />
          </label>

          {manualError && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {manualError}
            </p>
          )}

          <button
            type="submit"
            disabled={manualLoading || !status?.connected}
            className="group relative flex items-center justify-center overflow-hidden border border-[#a68a5c] bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a68a5c] transition-all hover:text-[#3c3c3b] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-400 translate-y-full group-hover:translate-y-0" />
            <span className="relative z-10">
              {manualLoading ? 'Generando...' : 'Crear link de cobro'}
            </span>
          </button>
        </form>

        {manualLink?.checkoutUrl && (
          <div className="mt-5 rounded-sm border border-[#a68a5c]/20 bg-neutral-50 p-5 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
                Link listo para compartir
              </p>
              <a
                href={manualLink.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="block break-all text-xs text-[#a68a5c] underline underline-offset-2 hover:opacity-80"
              >
                {manualLink.checkoutUrl}
              </a>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-700 transition-colors border border-neutral-200 px-4 py-2 rounded-sm"
              >
                {copied ? 'Copiado' : 'Copiar link'}
              </button>
              <a
                href={manualLink.checkoutUrl}
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
