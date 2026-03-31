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
  const preferredManualLink = manualLink?.sandboxInitPoint || manualLink?.initPoint;
  const isSandboxManualLink = Boolean(manualLink?.sandboxInitPoint);

  const fetchAccount = async () => {
    setAccount((current) => ({ ...current, loading: true, error: null }));

    try {
      const response = await fetch('/api/mercadopago/account', { cache: 'no-store' });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? (await response.json()) as MercadoPagoAccountStatus & { error?: string }
        : { error: 'La API de Mercado Pago devolvió una respuesta inválida.' };

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudo cargar la configuración de Mercado Pago.');
      }

      setAccount({
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
      const response = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              id: `manual-${Date.now()}`,
              title: manualTitle.trim(),
              description: manualDescription.trim() || undefined,
              quantity,
              unit_price: amount,
              currency_id: 'ARS',
              category_id: 'manual',
            },
          ],
        }),
      });
      const data = (await response.json()) as ManualLinkResult & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudo generar el link manual de pago.');
      }

      setManualLink(data);
      setManualSuccess(data.sandboxInitPoint
        ? 'Link de pago de prueba generado correctamente.'
        : 'Link generado correctamente. Mercado Pago no devolvió sandbox_init_point para esta cuenta.');
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

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-[#dbd0c2] bg-[linear-gradient(135deg,_rgba(49,44,40,0.98),_rgba(63,56,51,0.94))] p-6 sm:p-8 text-[#f7f0e2] shadow-xl shadow-[#2f2b28]/10">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#cbbca3]">
            Cobros y configuración
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.1rem]">Mercado Pago</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#d6cdbf] sm:text-[15px]">
            Vinculá la cuenta del dueño, gestioná credenciales y generá links manuales para pruebas o cobros puntuales desde el panel.
          </p>
        </div>
      </div>

      {flashMessage && (
        <div
          className={flashTone === 'success'
            ? 'rounded-2xl border border-[#d4d0c6] bg-[#f4f2ec] px-4 py-3 text-sm text-[#485046]'
            : 'rounded-2xl border border-[#e2c5c1] bg-[#fbf0ef] px-4 py-3 text-sm text-[#8b4b43]'}
        >
          {flashMessage}
        </div>
      )}

      <div className="rounded-[28px] border border-[#ddd2c0] bg-[rgba(252,249,244,0.92)] p-6 sm:p-8 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Estado de la cuenta</p>
              {account.loading ? (
                <p className="mt-2 text-sm text-slate-500">Cargando configuración...</p>
              ) : account.error ? (
                <p className="mt-2 text-sm text-rose-600">{account.error}</p>
              ) : account.connected ? (
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p><span className="font-semibold">Configuración:</span> {isDirectMode ? 'Access token fijo en el servidor' : 'Credenciales cargadas manualmente'}</p>
                  <p><span className="font-semibold">Cuenta:</span> {account.nickname || 'Sin alias'}</p>
                  <p><span className="font-semibold">Email:</span> {account.email || 'No informado por Mercado Pago'}</p>
                  <p><span className="font-semibold">Seller ID:</span> {account.sellerId}</p>
                  <p><span className="font-semibold">País:</span> {account.countryId || 'No informado'}</p>
                  <p><span className="font-semibold">Ambiente:</span> {account.liveMode ? 'Producción' : account.liveMode === false ? 'Sandbox / prueba' : 'No informado por Mercado Pago'}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  No hay ninguna cuenta vinculada. El checkout no podrá generarse hasta conectar Mercado Pago.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] p-4 text-sm text-slate-600">
              {isDirectMode
                ? 'La cuenta actual está cargada directamente por access token en el entorno. El checkout ya puede generarse con esta cuenta.'
                : 'La cuenta se administra manualmente desde este panel pegando las credenciales del cliente. El backend usa ese access token para crear links de pago a nombre de esa cuenta.'}
            </div>
          </div>

          <div className="flex min-w-[220px] flex-col gap-3">
            <button
              type="button"
              onClick={() => void handleDisconnect()}
              disabled={!account.connected || disconnecting || isDirectMode}
              className="inline-flex items-center justify-center rounded-2xl border border-[#d6c9b7] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f5eee4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {disconnecting ? 'Desvinculando...' : isDirectMode ? 'Desvincular desde entorno' : 'Desvincular cuenta'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ddd2c0] bg-[rgba(252,249,244,0.92)] p-6 sm:p-8 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Configuración Manual</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Pegá las API keys del cliente para dejar configurada su cuenta manualmente. El access token se guarda sólo en el backend.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {isDirectMode ? 'Modo entorno activo' : 'Modo manual persistido'}
          </p>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSaveConfig}>
          <div className="rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] px-4 py-3 text-xs text-slate-600">
            La `Public Key` y el `Access Token` se obtienen desde Mercado Pago Developers, dentro de la aplicación del cliente, en la sección de credenciales.
            <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
              <a
                href="https://www.mercadopago.com.ar/developers/panel"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-sky-700 underline underline-offset-2"
              >
                Abrir Mercado Pago Developers
              </a>
              <a
                href="https://www.mercadopago.com.ar/developers/es/docs/your-integrations/credentials"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-slate-700 underline underline-offset-2"
              >
                Ver documentación de credenciales
              </a>
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Public Key
            <input
              type="text"
              value={configPublicKey}
              onChange={(event) => setConfigPublicKey(event.target.value)}
              className="rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20"
              placeholder="APP_USR-..."
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Access Token
            <textarea
              value={configAccessToken}
              onChange={(event) => setConfigAccessToken(event.target.value)}
              className="min-h-28 rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20"
              placeholder="APP_USR-..."
            />
          </label>

          {configError && (
            <div className="rounded-2xl border border-[#e2c5c1] bg-[#fbf0ef] px-4 py-3 text-sm text-[#8b4b43]">
              {configError}
            </div>
          )}

          {configSuccess && (
            <div className="rounded-2xl border border-[#d4d0c6] bg-[#f4f2ec] px-4 py-3 text-sm text-[#485046]">
              {configSuccess}
            </div>
          )}

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <button
              type="submit"
              disabled={configLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-[#312c28] px-5 py-3 text-sm font-semibold text-[#f7f0e2] transition hover:bg-[#403932] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {configLoading ? 'Guardando...' : 'Guardar credenciales manualmente'}
            </button>

            <p className="text-xs text-slate-500">
              Si preferís, también podés seguir usando MERCADOPAGO_ACCESS_TOKEN en el entorno como fallback.
            </p>
          </div>
        </form>
      </div>

      <div className="rounded-[28px] border border-[#ddd2c0] bg-[rgba(252,249,244,0.92)] p-6 sm:p-8 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Link de Pago Manual</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Usá esta sección para generar links manuales y probar la integración de Mercado Pago sin depender del carrito.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {account.connected ? 'Cuenta lista para pruebas' : 'Conectá una cuenta para generar links'}
          </p>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateManualLink}>
          <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2">
            Título del cobro
            <input
              type="text"
              value={manualTitle}
              onChange={(event) => setManualTitle(event.target.value)}
              className="rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20"
              placeholder="Ej: Reserva degustación"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2">
            Descripción
            <textarea
              value={manualDescription}
              onChange={(event) => setManualDescription(event.target.value)}
              className="min-h-28 rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20"
              placeholder="Detalle opcional del cobro"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Monto
            <input
              type="number"
              min="1"
              step="0.01"
              value={manualAmount}
              onChange={(event) => setManualAmount(event.target.value)}
              className="rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20"
              placeholder="1500"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Cantidad
            <input
              type="number"
              min="1"
              step="1"
              value={manualQuantity}
              onChange={(event) => setManualQuantity(event.target.value)}
              className="rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20"
              placeholder="1"
            />
          </label>

          {manualError && (
            <div className="rounded-2xl border border-[#e2c5c1] bg-[#fbf0ef] px-4 py-3 text-sm text-[#8b4b43] md:col-span-2">
              {manualError}
            </div>
          )}

          {manualSuccess && (
            <div className="rounded-2xl border border-[#d4d0c6] bg-[#f4f2ec] px-4 py-3 text-sm text-[#485046] md:col-span-2">
              {manualSuccess}
            </div>
          )}

          <div className="md:col-span-2 flex flex-col gap-3 md:flex-row md:items-center">
            <button
              type="submit"
              disabled={!account.connected || manualLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-[#312c28] px-5 py-3 text-sm font-semibold text-[#f7f0e2] transition hover:bg-[#403932] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {manualLoading ? 'Generando link...' : 'Generar link manual'}
            </button>

            <p className="text-xs text-slate-500">
              El panel va a priorizar el `sandbox_init_point` para que pruebes con checkout de test cuando Mercado Pago lo devuelva.
            </p>
          </div>
        </form>

        {manualLink && (
          <div className="mt-6 rounded-[24px] border border-[#ddd1bf] bg-[#faf6ef] p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Resultado</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p><span className="font-semibold">Preference ID:</span> {manualLink.id || 'No informado'}</p>
              <p><span className="font-semibold">Referencia:</span> {manualLink.externalReference || 'No informada'}</p>
              <p><span className="font-semibold">Modo del link:</span> {isSandboxManualLink ? 'Prueba (sandbox)' : 'Producción / fallback'}</p>
              <div>
                <p className="font-semibold">URL de pago {isSandboxManualLink ? 'de prueba' : ''}</p>
                <a
                  href={preferredManualLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block break-all text-sky-700 underline underline-offset-2"
                >
                  {preferredManualLink}
                </a>
              </div>
              {!isSandboxManualLink && (
                <p className="rounded-2xl border border-[#ddd1bf] bg-[#f7f1e7] px-4 py-3 text-xs text-[#7b6646]">
                  Mercado Pago no devolvió `sandbox_init_point`. Eso suele pasar cuando la credencial cargada corresponde a una cuenta o entorno de producción y no a prueba.
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="inline-flex items-center justify-center rounded-2xl border border-[#d6c9b7] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f5eee4]"
              >
                Copiar link
              </button>
              <a
                href={preferredManualLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-[#312c28] px-4 py-3 text-sm font-semibold text-[#f7f0e2] transition hover:bg-[#403932]"
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