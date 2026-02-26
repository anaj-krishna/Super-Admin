"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { superAdminApi } from "@/app/lib/superAdminApi";
import {
  getApiErrorMessage,
  isMembershipDeniedMessage,
  isTransitionDeniedMessage,
} from "@/app/lib/httpError";
import type { Order, OrderItem, Product } from "@/types/superadmin";

export default function StorekeeperOrderDetailPage() {
  const params = useParams<{ userId: string; id: string }>();
  const storeId = params.userId;
  const id = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    superAdminApi
      .getOrder(storeId, id)
      .then((data) => setOrder(data))
      .catch((e) => {
        const msg = getApiErrorMessage(e).message;
        setError(isMembershipDeniedMessage(msg) ? "You don't have access to this account." : msg);
      })
      .finally(() => setLoading(false));
  }, [storeId, id]);

  useEffect(() => {
    load();
  }, [load]);

  const canMarkReady = order?.status === "PLACED";

  const markReady = async () => {
    if (!order) return;
    setBusy(true);
    setActionMsg(null);

    try {
      await superAdminApi.markReady(storeId, order._id);
      setActionMsg({ text: "✓ Order marked as READY for pickup", type: "success" });
      load();
    } catch (e) {
      const msg = getApiErrorMessage(e).message;
      setActionMsg({ text: isTransitionDeniedMessage(msg) ? "Action not allowed in current status." : msg, type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const fetchAvailableDelivery = async () => {
    if (!order) return;
    setBusy(true);
    setActionMsg(null);

    try {
      const data = await superAdminApi.availableDeliveryPlaceholder(storeId, order._id);
      setActionMsg({ text: data.message, type: "info" });
    } catch (e) {
      setActionMsg({ text: getApiErrorMessage(e).message, type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const items = useMemo(() => order?.items ?? [], [order]);

  const getOrderStatusBadge = (statusValue?: string) => {
    switch (statusValue) {
      case "DELIVERED": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30";
      case "FAILED":
      case "CANCELLED":
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30";
      case "PLACED":
      case "ACCEPTED": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30";
      case "READY":
      case "PICKED_UP": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30";
      default: return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-pulse">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-8"></div>
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
          <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 h-64 mb-6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        <Link 
          href={`/superadmin/storekeepers/${storeId}/orders`}
          className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Orders
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800/30">
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <Link 
        href={`/superadmin/storekeepers/${storeId}/orders`}
        className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm">ID: {order._id}</p>
        </div>
        <div className="flex items-center justify-start sm:justify-end shrink-0 mt-2 sm:mt-0">
          <span className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold rounded-full border shadow-sm ${getOrderStatusBadge(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      {actionMsg && (
        <div className={`mb-6 p-4 rounded-xl border animate-in fade-in flex items-center gap-3 ${
          actionMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400' : 
          actionMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400' :
          'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400'
        }`}>
          <p className="text-sm font-medium">{actionMsg.text}</p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={markReady}
          disabled={!canMarkReady || busy}
          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          Mark as READY
        </button>
        <button
          onClick={fetchAvailableDelivery}
          disabled={busy}
          className="px-5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400 dark:hover:bg-blue-900/40 disabled:opacity-50 font-semibold text-sm transition-colors"
        >
          Check Delivery Partners
        </button>
        <div className="flex-1"></div>
        <button
          onClick={load}
          disabled={busy}
          className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          title="Refresh Data"
        >
          <svg className={`w-5 h-5 ${busy ? 'animate-spin text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Order Items
            </h2>
            <div className="space-y-4">
              {items.map((it, idx) => (
                <OrderItemRow key={idx} item={it} />
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700 flex justify-end">
              <div className="w-full sm:w-64">
                <div className="flex justify-between items-center py-2 text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-900 dark:text-white">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center py-3 mt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="text-lg font-bold text-zinc-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Store Pickup Location
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
              {order.pickupAddress}
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Customer Delivery
            </h2>
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <p className="font-medium text-zinc-900 dark:text-zinc-200">{order.deliveryAddress.street}</p>
              <p>{order.deliveryAddress.city}, {order.deliveryAddress.zipCode}</p>
              <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {order.deliveryAddress.phone}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function OrderItemRow({ item }: { item: OrderItem }) {
  const product = item.productId as Product | string;
  const name = typeof product === "string" ? product : product.name;
  const id = typeof product === "string" ? product : product._id;
  const totalPrice = item.price * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600">
      <div className="flex-1">
        <div className="font-bold text-zinc-900 dark:text-white line-clamp-1">{name}</div>
        <div className="text-xs text-zinc-400 font-mono mt-1">ID: {id}</div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-64 shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Qty</div>
          <div className="font-medium text-zinc-900 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-center min-w-[2rem]">{item.quantity}</div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Price</div>
          <div className="font-medium text-zinc-600 dark:text-zinc-400">₹{item.price}</div>
        </div>
        <div className="text-right w-20">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Total</div>
          <div className="font-bold text-zinc-900 dark:text-white">₹{totalPrice}</div>
        </div>
      </div>
    </div>
  );
}