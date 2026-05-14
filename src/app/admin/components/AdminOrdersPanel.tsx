'use client';

import { useMemo, useRef, useState } from 'react';
import Pagination from './Pagination';

interface AdminOrderItemView {
  id: string;
  productId: string | null;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface AdminOrderView {
  id: string;
  status: string;
  paymentStatus: string | null;
  externalReference: string;
  mercadopagoPreferenceId: string | null;
  mercadopagoPaymentId: string | null;
  buyerName: string;
  buyerEmail: string | null;
  buyerPhone: string | null;
  buyerDocumentType: string | null;
  buyerDocumentNumber: string | null;
  buyerAddress: string | null;
  shippingPayload: { province?: string; city?: string; postalCode?: string; tipo?: string; direccion?: string } | null;
  totalAmount: number;
  subtotalAmount: number | null;
  shippingAmount: number | null;
  currencyId: string;
  notes: string | null;
  notasInternas: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  items: AdminOrderItemView[];
}

interface AdminOrdersPanelProps {
  orders: AdminOrderView[];
}

const PAGE_SIZE = 8;

function formatCurrency(amount: number, currencyId: string) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currencyId || 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'pago_aprobado':
      return 'border-[#a68a5c]/30 bg-[#a68a5c]/10 text-[#c9a96e]';
    case 'pago_rechazado':
    case 'pago_cancelado':
      return 'border-[#d03416]/30 bg-[#d03416]/10 text-[#f3c3ba]';
    default:
      return 'border-[#beb9b1]/15 bg-[#beb9b1]/5 text-[#beb9b1]/60';
  }
}

export default function AdminOrdersPanel({ orders }: AdminOrdersPanelProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id ?? null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [notasDraft, setNotasDraft] = useState<Record<string, string>>({});
  const [notasSaving, setNotasSaving] = useState<Record<string, boolean>>({});
  const [notasSaved, setNotasSaved] = useState<Record<string, boolean>>({});

  function getNotaValue(order: AdminOrderView) {
    return notasDraft[order.id] ?? order.notasInternas ?? '';
  }

  async function saveNota(orderId: string) {
    setNotasSaving((prev) => ({ ...prev, [orderId]: true }));
    setNotasSaved((prev) => ({ ...prev, [orderId]: false }));
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notas_internas: notasDraft[orderId] ?? '' }),
      });
      if (res.ok) {
        setNotasSaved((prev) => ({ ...prev, [orderId]: true }));
        setTimeout(() => setNotasSaved((prev) => ({ ...prev, [orderId]: false })), 2500);
      }
    } finally {
      setNotasSaving((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  const filteredOrders = useMemo(() => {
    const searchNeedle = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!searchNeedle) {
        return true;
      }

      const searchable = [
        order.externalReference,
        order.buyerName,
        order.buyerEmail,
        order.buyerPhone,
        order.mercadopagoPaymentId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(searchNeedle);
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedOrder = filteredOrders.find((order) => order.id === selectedOrderId) ?? paginatedOrders[0] ?? null;

  const approvedCount = orders.filter((order) => order.status === 'pago_aprobado').length;
  const pendingCount = orders.filter((order) => order.status === 'checkout_generado').length;

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-sm border border-[#beb9b1]/10 bg-[linear-gradient(135deg,_rgba(49,44,40,0.98),_rgba(63,56,51,0.94))] p-6 text-[#f7f0e2] shadow-xl shadow-[#2f2b28]/10 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#cbbca3]">
              Operacion de pedidos
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.1rem]">Pedidos web</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d6cdbf] sm:text-[15px]">
              Segui pagos, referencias y datos del comprador sin entrar a la base manualmente.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#cbbca3]">Aprobados</p>
              <p className="mt-2 text-3xl font-semibold text-white">{approvedCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#cbbca3]">En checkout</p>
              <p className="mt-2 text-3xl font-semibold text-white">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-6 shadow-sm sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
            Buscar por referencia o comprador
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="external_reference, email, telefono"
              className="rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
            Estado
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
            >
              <option value="all">Todos</option>
              <option value="checkout_generado">Checkout generado</option>
              <option value="pago_aprobado">Pago aprobado</option>
              <option value="pago_rechazado">Pago rechazado</option>
              <option value="pago_cancelado">Pago cancelado</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="space-y-4">
          {paginatedOrders.length === 0 ? (
              <div className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-8 text-sm text-[#beb9b1]/50">
              No hay pedidos que coincidan con los filtros actuales.
            </div>
          ) : (
            paginatedOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setTimeout(() => {
                    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }}
                className={`w-full rounded-sm border p-5 text-left transition ${
                  order.id === selectedOrder?.id
                    ? 'border-[#a68a5c]/40 bg-[#a68a5c]/10'
                    : 'border-[#beb9b1]/10 bg-[#2a2725] hover:border-[#beb9b1]/20'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusStyles(order.status)}`}>
                        {order.status.replaceAll('_', ' ')}
                      </span>
                      {order.paymentStatus && (
                        <span className="rounded-sm border border-[#beb9b1]/15 bg-[#beb9b1]/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#beb9b1]/50">
                          MP: {order.paymentStatus}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-[#f5efe3]">{order.buyerName}</h2>
                      <p className="mt-1 text-sm text-[#beb9b1]/40">{order.externalReference}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#beb9b1]/40">Total</p>
                    <p className="mt-1 text-xl font-semibold text-[#c9a96e]">{formatCurrency(order.totalAmount, order.currencyId)}</p>
                    <p className="mt-2 text-xs text-[#beb9b1]/40">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filteredOrders.length}
            pageSize={PAGE_SIZE}
          />
        </div>

        <div ref={detailRef} className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-6 sm:p-8">
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="space-y-3 border-b border-[#beb9b1]/10 pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusStyles(selectedOrder.status)}`}>
                    {selectedOrder.status.replaceAll('_', ' ')}
                  </span>
                  {selectedOrder.paymentStatus && (
                    <span className="rounded-sm border border-[#beb9b1]/15 bg-[#beb9b1]/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#beb9b1]/50">
                      Mercado Pago: {selectedOrder.paymentStatus}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-serif tracking-wide text-[#beb9b1]">{selectedOrder.buyerName}</h2>
                <p className="text-sm text-[#beb9b1]/40">Creado el {formatDate(selectedOrder.createdAt)}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#beb9b1]/40">Referencia</p>
                  <p className="mt-2 break-all text-sm font-medium text-[#beb9b1]">{selectedOrder.externalReference}</p>
                </div>
                <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#beb9b1]/40">Pago Mercado Pago</p>
                  <p className="mt-2 break-all text-sm font-medium text-[#beb9b1]">{selectedOrder.mercadopagoPaymentId || 'Sin pago vinculado'}</p>
                </div>
                <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 p-4 sm:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#beb9b1]/40">Comprador</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm text-[#beb9b1]/70">
                    <p><span className="text-[#beb9b1]/40">Email:</span> {selectedOrder.buyerEmail || 'No informado'}</p>
                    <p><span className="text-[#beb9b1]/40">Teléfono:</span> {selectedOrder.buyerPhone || 'No informado'}</p>
                    <p><span className="text-[#beb9b1]/40">Documento:</span> {selectedOrder.buyerDocumentType || '-'} {selectedOrder.buyerDocumentNumber || ''}</p>
                    <p><span className="text-[#beb9b1]/40">Dirección:</span> {selectedOrder.buyerAddress || 'No informada'}</p>
                    {selectedOrder.shippingPayload && (
                      <p className="sm:col-span-2">
                        <span className="text-[#beb9b1]/40">
                          {selectedOrder.shippingPayload.tipo === 'retiro' ? 'Método de entrega:' : 'Destino de envío:'}
                        </span>{' '}
                        {selectedOrder.shippingPayload.tipo === 'retiro'
                          ? `Retiro en local — ${selectedOrder.shippingPayload.direccion ?? 'Pilmaiquén 292, Bahía Blanca'}`
                          : [selectedOrder.shippingPayload.city, selectedOrder.shippingPayload.province, selectedOrder.shippingPayload.postalCode ? `CP ${selectedOrder.shippingPayload.postalCode}` : null].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#beb9b1]/40">Items</p>
                  <p className="text-xs text-[#beb9b1]/40">{selectedOrder.items.length} item(s)</p>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#f5efe3]">{item.title}</p>
                          <p className="mt-1 text-xs text-[#beb9b1]/40">{item.productId || 'Sin product_id'} · {item.quantity} unidad(es)</p>
                        </div>
                        <p className="text-sm font-semibold text-[#c9a96e]">{formatCurrency(item.lineTotal, selectedOrder.currencyId)}</p>
                      </div>
                      <p className="mt-2 text-xs text-[#beb9b1]/40">Unitario: {formatCurrency(item.unitPrice, selectedOrder.currencyId)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 p-4 text-sm text-[#beb9b1]/70">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#beb9b1]/40">Resumen operativo</p>
                <div className="mt-3 space-y-2">
                  <p><span className="text-[#beb9b1]/40">Subtotal:</span> {formatCurrency(selectedOrder.subtotalAmount ?? selectedOrder.totalAmount, selectedOrder.currencyId)}</p>
                  <p><span className="text-[#beb9b1]/40">Envío:</span> {selectedOrder.shippingAmount !== null ? formatCurrency(selectedOrder.shippingAmount, selectedOrder.currencyId) : 'No calculado'}</p>
                  <p><span className="text-[#beb9b1]/40">Total:</span> <span className="text-[#c9a96e] font-semibold">{formatCurrency(selectedOrder.totalAmount, selectedOrder.currencyId)}</span></p>
                  <p><span className="text-[#beb9b1]/40">Preferencia:</span> {selectedOrder.mercadopagoPreferenceId || 'No informada'}</p>
                  <p><span className="text-[#beb9b1]/40">Notas del comprador:</span> {selectedOrder.notes || 'Sin observaciones'}</p>
                </div>
              </div>

              <div className="rounded-sm border border-[#a68a5c]/20 bg-[#1a1a1a]/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#a68a5c]/70">Notas internas</p>
                <textarea
                  rows={3}
                  value={getNotaValue(selectedOrder)}
                  onChange={(e) =>
                    setNotasDraft((prev) => ({ ...prev, [selectedOrder.id]: e.target.value }))
                  }
                  placeholder="Observaciones internas sobre este pedido..."
                  className="mt-3 w-full resize-none rounded-sm border border-[#beb9b1]/15 bg-[#2a2725] px-3 py-2.5 text-sm text-[#f5efe3] placeholder-[#beb9b1]/30 outline-none transition focus:border-[#a68a5c]/60"
                />
                <div className="mt-2 flex items-center justify-end gap-3">
                  {notasSaved[selectedOrder.id] && (
                    <span className="text-xs text-[#a68a5c]">Guardado</span>
                  )}
                  <button
                    type="button"
                    disabled={notasSaving[selectedOrder.id]}
                    onClick={() => saveNota(selectedOrder.id)}
                    className="rounded-sm border border-[#a68a5c]/40 bg-[#a68a5c]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#c9a96e] transition hover:bg-[#a68a5c]/20 disabled:opacity-50"
                  >
                    {notasSaving[selectedOrder.id] ? 'Guardando...' : 'Guardar nota'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#beb9b1]/50">No hay un pedido seleccionado.</p>
          )}
        </div>
      </div>
    </section>
  );
}