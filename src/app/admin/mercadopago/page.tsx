'use client';

import { useEffect, useState } from 'react';
import type { MercadoPagoAccountStatus } from '@/types/mercadopago';

interface ManualLinkResult {
  id?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  externalReference?: string;
}

type ViewState = MercadoPagoAccountStatus & {
  loading: boolean;
  error: string | null;
};

function isMercadoPagoAccountStatus(value: unknown): value is MercadoPagoAccountStatus {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return typeof (value as { connected?: unknown }).connected === 'boolean';
}

const initialState: ViewState = {
  connected: false,
  loading: true,
  error: null,
};

export default function MercadoPagoAdminPage() {
  const [account, setAccount] = useState<ViewState>(initialState);
  const [disconnecting, setDisconnecting] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [flashTone, setFlashTone] = useState<'success' | 'error'>('success');
  const [configPublicKey, setConfigPublicKey] = useState('');
  const [configAccessToken, setConfigAccessToken] = useState('');
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);
  const [manualTitle, setManualTitle] = useState('Pedido de prueba');
  const [manualDescription, setManualDescription] = useState('Link generado manualmente desde el panel de administración.');
  const [manualAmount, setManualAmount] = useState('1500');
  const [manualQuantity, setManualQuantity] = useState('1');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState<ManualLinkResult | null>(null);
  const isDirectMode = account.mode === 'direct';
  const preferredManualLink = manualLink?.initPoint || manualLink?.sandboxInitPoint;
  const isSandboxManualLink = !manualLink?.initPoint && Boolean(manualLink?.sandboxInitPoint);

  const fetchAccount = async () => {
    setAccount((current) => ({ ...current, loading: true, error: null }));

    try {
      const response = await fetch('/api/mercadopago/account', { cache: 'no-store' });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? (await response.json()) as MercadoPagoAccountStatus | { error?: string }
        : { error: 'La API de Mercado Pago devolvió una respuesta inválida.' };

      if (!response.ok) {
        throw new Error(('error' in data ? data.error : null) ?? 'No se pudo cargar la configuración de Mercado Pago.');
      }

      if (!isMercadoPagoAccountStatus(data)) {
        throw new Error('La API de Mercado Pago devolvió un formato inesperado.');
      }

      setAccount({
        ...initialState,
        ...data,
        loading: false,
        error: null,
      });
      setConfigPublicKey(data.publicKey ?? '');
    } catch (fetchError) {
      setAccount({
        connected: false,
        loading: false,
        error: fetchError instanceof Error ? fetchError.message : 'No se pudo cargar la configuración de Mercado Pago.',
      });
    }
  };

  useEffect(() => {
    void fetchAccount();
  }, []);

  const handleSaveConfig = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!configAccessToken.trim()) {
      setConfigError('Pegá el access token del cliente.');
      setConfigSuccess(null);
      return;
    }

    setConfigLoading(true);
    setConfigError(null);
    setConfigSuccess(null);

    try {
      const response = await fetch('/api/mercadopago/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: configPublicKey.trim(),
          accessToken: configAccessToken.trim(),
        }),
      });
      const data = (await response.json()) as { error?: string; nickname?: string | null };

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudo guardar la configuración manual.');
      }

      setFlashTone('success');
      setFlashMessage(data.nickname
        ? `Cuenta configurada manualmente: ${data.nickname}.`
        : 'Cuenta configurada manualmente.');
      setConfigSuccess('Credenciales guardadas correctamente.');
      setConfigAccessToken('');
      await fetchAccount();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'No se pudo guardar la configuración manual.';
      setFlashTone('error');
      setFlashMessage(message);
      setConfigError(message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('¿Querés desvincular la cuenta de Mercado Pago?')) {
      return;
    }

    setDisconnecting(true);
    setFlashMessage(null);

    try {
      const response = await fetch('/api/mercadopago/account', {
        method: 'DELETE',
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudo desvincular la cuenta.');
      }

      setFlashTone('success');
      setFlashMessage('La cuenta de Mercado Pago fue desvinculada.');
      await fetchAccount();
    } catch (disconnectError) {
      setFlashTone('error');
      setFlashMessage(disconnectError instanceof Error ? disconnectError.message : 'No se pudo desvincular la cuenta.');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleCreateManualLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amount = Number(manualAmount);
    const quantity = Number(manualQuantity);

    if (!manualTitle.trim()) {
      setManualError('Ingresá un título para el link de pago.');
      setManualSuccess(null);
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setManualError('Ingresá un monto válido mayor a 0.');
      setManualSuccess(null);
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setManualError('Ingresá una cantidad válida mayor a 0.');
      setManualSuccess(null);
      return;
    }

    setManualLoading(true);
    setManualError(null);
    setManualSuccess(null);

    try {
      const response = await fetch('/api/admin/mercadopago/manual-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: manualTitle.trim(),
          description: manualDescription.trim() || undefined,
          amount,
          quantity,
        }),
      });
      const data = (await response.json()) as ManualLinkResult & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudo generar el link manual de pago.');
      }

      setManualLink(data);
      setManualSuccess(data.initPoint
        ? 'Link generado correctamente.'
        : data.sandboxInitPoint
          ? 'Link de pago de prueba generado correctamente.'
          : 'Mercado Pago no devolvió una URL de checkout utilizable.');
    } catch (createError) {
      setManualError(createError instanceof Error ? createError.message : 'No se pudo generar el link manual de pago.');
      setManualLink(null);
    } finally {
      setManualLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const link = preferredManualLink;

    if (!link) {
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      setManualSuccess('Link copiado al portapapeles.');
    } catch {
      setManualError('No se pudo copiar el link al portapapeles.');
    }
  };

  // Detecta si la cuenta conectada es una cuenta de prueba
  const isTestAccount = Boolean(
    account.email?.includes('testuser') ||
    account.nickname?.toLowerCase().startsWith('testuser') ||
    account.email?.includes('test_user'),
  );

  return (
    <section className="mx-auto max-w-3xl space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif tracking-wide text-[#beb9b1]">Mercado Pago</h1>
        <p className="mt-1 text-sm text-[#beb9b1]/50">
          Configurá la cuenta con la que se procesan los cobros de la tienda.
        </p>
      </div>

      {/* Flash */}
      {flashMessage && (
        <div className={`rounded-sm border px-4 py-3 text-sm ${
          flashTone === 'success'
            ? 'border-[#a68a5c]/30 bg-[#a68a5c]/10 text-[#c9a96e]'
            : 'border-[#d03416]/30 bg-[#d03416]/10 text-[#f3c3ba]'
        }`}>
          {flashMessage}
        </div>
      )}

      {/* ── ESTADO DE LA CUENTA ─────────────────────────── */}
      <div className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#beb9b1]/50 mb-4">
          Cuenta conectada
        </p>

        {account.loading ? (
          <p className="text-sm text-[#beb9b1]/50 animate-pulse">Verificando cuenta...</p>
        ) : account.error ? (
          <p className="text-sm text-[#f3c3ba]">{account.error}</p>
        ) : account.connected ? (
          <>
            {/* Alerta cuenta de prueba */}
            {isTestAccount && (
              <div className="mb-4 rounded-sm border border-[#d03416]/40 bg-[#d03416]/10 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#f3c3ba]">
                  ⚠ Cuenta de prueba detectada
                </p>
                <p className="mt-1 text-xs text-[#f3c3ba]/80">
                  La cuenta activa ({account.email}) es una cuenta de test de Mercado Pago.
                  Los cobros reales no se procesarán. Cargá las credenciales de producción en el formulario de abajo.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#beb9b1]/40">Nombre</p>
                <p className="mt-0.5 text-[#beb9b1]">{account.nickname || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#beb9b1]/40">Email</p>
                <p className="mt-0.5 text-[#beb9b1]">{account.email || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#beb9b1]/40">Seller ID</p>
                <p className="mt-0.5 text-[#beb9b1] font-mono text-xs">{account.sellerId || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#beb9b1]/40">País</p>
                <p className="mt-0.5 text-[#beb9b1]">{account.countryId || '—'}</p>
              </div>
            </div>

            {!isDirectMode && (
              <div className="mt-5 pt-4 border-t border-[#beb9b1]/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  disabled={disconnecting}
                  className="text-xs text-[#d03416]/70 hover:text-[#d03416] transition-colors disabled:opacity-50"
                >
                  {disconnecting ? 'Desvinculando...' : 'Desvincular cuenta'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/30 px-4 py-5 text-center">
            <p className="text-sm text-[#beb9b1]/50">No hay ninguna cuenta vinculada.</p>
            <p className="mt-1 text-xs text-[#beb9b1]/30">
              Completá el formulario de abajo para empezar a recibir pagos.
            </p>
          </div>
        )}
      </div>

      {/* ── CARGAR / ACTUALIZAR CUENTA ──────────────────── */}
      <div className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#beb9b1]/50 mb-1">
          {account.connected && !isTestAccount ? 'Actualizar credenciales' : 'Conectar cuenta'}
        </p>
        <p className="text-sm text-[#beb9b1]/60 mb-5">
          Pegá tus credenciales de producción de Mercado Pago. Se guardan de forma segura en el servidor.
          {isDirectMode && (
            <span className="block mt-1 text-xs text-[#a68a5c]">
              Al guardar acá, estas credenciales toman prioridad sobre la configuración actual.
            </span>
          )}
        </p>

        {/* Instrucciones */}
        <div className="mb-5 rounded-sm border border-[#beb9b1]/8 bg-[#1a1a1a]/20 px-4 py-3 text-xs text-[#beb9b1]/50">
          Obtenés las credenciales en{' '}
          <a
            href="https://www.mercadopago.com.ar/developers/panel"
            target="_blank"
            rel="noreferrer"
            className="text-[#a68a5c] underline underline-offset-2 hover:opacity-80"
          >
            mercadopago.com.ar/developers
          </a>
          {' '}→ tu aplicación → <strong className="text-[#beb9b1]/70">Credenciales de producción</strong>.
        </div>

        <form className="grid gap-4" onSubmit={handleSaveConfig}>
          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
            Public Key
            <input
              type="text"
              value={configPublicKey}
              onChange={(e) => setConfigPublicKey(e.target.value)}
              placeholder="APP_USR-..."
              className="rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
            Access Token <span className="text-[#d03416]/70 normal-case tracking-normal">(requerido)</span>
            <textarea
              value={configAccessToken}
              onChange={(e) => setConfigAccessToken(e.target.value)}
              placeholder="APP_USR-..."
              rows={3}
              className="rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c] resize-none"
            />
          </label>

          {configError && (
            <p className="rounded-sm border border-[#d03416]/30 bg-[#d03416]/10 px-3 py-2 text-xs text-[#f3c3ba]">
              {configError}
            </p>
          )}
          {configSuccess && (
            <p className="rounded-sm border border-[#a68a5c]/30 bg-[#a68a5c]/10 px-3 py-2 text-xs text-[#c9a96e]">
              {configSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={configLoading}
            className="group relative flex items-center justify-center overflow-hidden border border-[#a68a5c] bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a68a5c] transition-all hover:text-[#3c3c3b] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-400 translate-y-full group-hover:translate-y-0" />
            <span className="relative z-10">
              {configLoading ? 'Guardando...' : 'Guardar y activar cuenta'}
            </span>
          </button>
        </form>
      </div>

      {/* ── LINK DE COBRO MANUAL ────────────────────────── */}
      <div className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#beb9b1]/50 mb-1">
          Cobro puntual
        </p>
        <p className="text-sm text-[#beb9b1]/60 mb-5">
          Generá un link de pago para cobrar cualquier monto sin pasar por el carrito de la tienda.
        </p>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleCreateManualLink}>
          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55 sm:col-span-2">
            Concepto del cobro
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Ej: Reserva caja degustación"
              className="rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55 sm:col-span-2">
            Descripción <span className="normal-case tracking-normal text-[#beb9b1]/30">(opcional)</span>
            <input
              type="text"
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="Detalle adicional"
              className="rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
            Monto ($)
            <input
              type="number"
              min="1"
              step="0.01"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              placeholder="1500"
              className="rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
            Cantidad
            <input
              type="number"
              min="1"
              step="1"
              value={manualQuantity}
              onChange={(e) => setManualQuantity(e.target.value)}
              placeholder="1"
              className="rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
            />
          </label>

          {manualError && (
            <p className="sm:col-span-2 rounded-sm border border-[#d03416]/30 bg-[#d03416]/10 px-3 py-2 text-xs text-[#f3c3ba]">
              {manualError}
            </p>
          )}
          {manualSuccess && !manualLink && (
            <p className="sm:col-span-2 rounded-sm border border-[#a68a5c]/30 bg-[#a68a5c]/10 px-3 py-2 text-xs text-[#c9a96e]">
              {manualSuccess}
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
                {manualLoading ? 'Generando...' : 'Generar link de cobro'}
              </span>
            </button>
          </div>
        </form>

        {manualLink && preferredManualLink && (
          <div className="mt-5 rounded-sm border border-[#a68a5c]/20 bg-[#1a1a1a]/30 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/50">Link generado</p>
            <a
              href={preferredManualLink}
              target="_blank"
              rel="noreferrer"
              className="block break-all text-xs text-[#a68a5c] underline underline-offset-2 hover:opacity-80"
            >
              {preferredManualLink}
            </a>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="text-xs uppercase tracking-widest text-[#beb9b1]/50 hover:text-[#beb9b1] transition-colors border border-[#beb9b1]/15 px-3 py-1.5 rounded-sm"
              >
                Copiar link
              </button>
              <a
                href={preferredManualLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs uppercase tracking-widest text-[#a68a5c] hover:opacity-80 transition-opacity border border-[#a68a5c]/40 px-3 py-1.5 rounded-sm"
              >
                Abrir checkout
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
