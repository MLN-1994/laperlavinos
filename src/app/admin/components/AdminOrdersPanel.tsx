'use client';

import { useMemo, useState } from 'react';
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
  totalAmount: number;
  subtotalAmount: number | null;
  shippingAmount: number | null;
  currencyId: string;
  notes: string | null;
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
      return 'border-[#cfe0ca] bg-[#eef5ea] text-[#4d6643]';
    case 'pago_rechazado':
    case 'pago_cancelado':
      return 'border-[#e7c8c3] bg-[#fbefed] text-[#8e4e45]';
    default:
      return 'border-[#ddd1bf] bg-[#faf6ef] text-[#6c5e4b]';
  }
}

export default function AdminOrdersPanel({ orders }: AdminOrdersPanelProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id ?? null);

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
      <div className="overflow-hidden rounded-[28px] border border-[#dbd0c2] bg-[linear-gradient(135deg,_rgba(49,44,40,0.98),_rgba(63,56,51,0.94))] p-6 text-[#f7f0e2] shadow-xl shadow-[#2f2b28]/10 sm:p-8">
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

      <div className="rounded-[28px] border border-[#ddd2c0] bg-[rgba(252,249,244,0.92)] p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Buscar por referencia o comprador
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="external_reference, email, telefono"
              className="rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Estado
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20"
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
            <div className="rounded-[28px] border border-[#ddd2c0] bg-[rgba(252,249,244,0.92)] p-8 text-sm text-slate-600 shadow-sm backdrop-blur-sm">
              No hay pedidos que coincidan con los filtros actuales.
            </div>
          ) : (
            paginatedOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrderId(order.id)}
                className={`w-full rounded-[28px] border p-5 text-left shadow-sm transition ${
                  order.id === selectedOrder?.id
                    ? 'border-[#b49971] bg-[#f7f0e5] shadow-[#d6c8b4]/40'
                    : 'border-[#ddd2c0] bg-[rgba(252,249,244,0.92)] hover:border-[#ccb089]'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusStyles(order.status)}`}>
                        {order.status.replaceAll('_', ' ')}
                      </span>
                      {order.paymentStatus && (
                        <span className="rounded-full border border-[#d6c9b7] bg-white px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                          MP: {order.paymentStatus}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{order.buyerName}</h2>
                      <p className="mt-1 text-sm text-slate-500">{order.externalReference}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(order.totalAmount, order.currencyId)}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatDate(order.createdAt)}</p>
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

        <div className="rounded-[28px] border border-[#ddd2c0] bg-[rgba(252,249,244,0.92)] p-6 shadow-sm backdrop-blur-sm sm:p-8">
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="space-y-3 border-b border-[#e5dccf] pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusStyles(selectedOrder.status)}`}>
                    {selectedOrder.status.replaceAll('_', ' ')}
                  </span>
                  {selectedOrder.paymentStatus && (
                    <span className="rounded-full border border-[#d6c9b7] bg-white px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                      Mercado Pago: {selectedOrder.paymentStatus}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{selectedOrder.buyerName}</h2>
                <p className="text-sm text-slate-500">Creado el {formatDate(selectedOrder.createdAt)}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Referencia</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-800">{selectedOrder.externalReference}</p>
                </div>
                <div className="rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Pago Mercado Pago</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-800">{selectedOrder.mercadopagoPaymentId || 'Todavia sin pago vinculado'}</p>
                </div>
                <div className="rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] p-4 sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Comprador</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
                    <p><span className="font-semibold">Email:</span> {selectedOrder.buyerEmail || 'No informado'}</p>
                    <p><span className="font-semibold">Telefono:</span> {selectedOrder.buyerPhone || 'No informado'}</p>
                    <p><span className="font-semibold">Documento:</span> {selectedOrder.buyerDocumentType || '-'} {selectedOrder.buyerDocumentNumber || ''}</p>
                    <p><span className="font-semibold">Direccion:</span> {selectedOrder.buyerAddress || 'No informada'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Items</p>
                  <p className="text-xs text-slate-500">{selectedOrder.items.length} item(s)</p>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-[#e7dece] bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.productId || 'Sin product_id'} · {item.quantity} unidad(es)</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{formatCurrency(item.lineTotal, selectedOrder.currencyId)}</p>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Unitario: {formatCurrency(item.unitPrice, selectedOrder.currencyId)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] p-4 text-sm text-slate-700">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Resumen operativo</p>
                <div className="mt-3 space-y-2">
                  <p><span className="font-semibold">Subtotal:</span> {formatCurrency(selectedOrder.subtotalAmount ?? selectedOrder.totalAmount, selectedOrder.currencyId)}</p>
                  <p><span className="font-semibold">Envio:</span> {selectedOrder.shippingAmount !== null ? formatCurrency(selectedOrder.shippingAmount, selectedOrder.currencyId) : 'No calculado'}</p>
                  <p><span className="font-semibold">Total:</span> {formatCurrency(selectedOrder.totalAmount, selectedOrder.currencyId)}</p>
                  <p><span className="font-semibold">Preferencia:</span> {selectedOrder.mercadopagoPreferenceId || 'No informada'}</p>
                  <p><span className="font-semibold">Notas:</span> {selectedOrder.notes || 'Sin observaciones del comprador'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">No hay un pedido seleccionado.</p>
          )}
        </div>
      </div>
    </section>
  );
}