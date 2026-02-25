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
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    superAdminApi
      .getOrder(storeId, id)
      .then((data) => setOrder(data))
      .catch((e) => {
        const msg = getApiErrorMessage(e).message;
        setError(isMembershipDeniedMessage(msg) ? "You don’t have access to this account." : msg);
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
    setActionError(null);

    try {
      await superAdminApi.markReady(storeId, order._id);
      load();
    } catch (e) {
      const msg = getApiErrorMessage(e).message;
      setActionError(isTransitionDeniedMessage(msg) ? "Action not allowed in current status." : msg);
    } finally {
      setBusy(false);
    }
  };

  const fetchAvailableDelivery = async () => {
    if (!order) return;
    setBusy(true);
    setActionError(null);

    try {
      const data = await superAdminApi.availableDeliveryPlaceholder(storeId, order._id);
      setActionError(data.message);
    } catch (e) {
      setActionError(getApiErrorMessage(e).message);
    } finally {
      setBusy(false);
    }
  };

  const items = useMemo(() => order?.items ?? [], [order]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-zinc-600 dark:text-zinc-400">Loading order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900 rounded-lg p-6 border border-red-200 dark:border-red-700">
          <p className="text-red-700 dark:text-red-100">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Order Detail</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{order._id}</p>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Status: {order.status}</p>
        </div>
        <Link
          href={`/superadmin/storekeepers/${storeId}/orders`}
          className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
        >
          Back
        </Link>
      </div>

      {actionError && <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">{actionError}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={markReady}
          disabled={!canMarkReady || busy}
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white"
        >
          Mark READY
        </button>
        <button
          onClick={fetchAvailableDelivery}
          disabled={busy}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white"
        >
          Available delivery (placeholder)
        </button>
        <button
          onClick={load}
          disabled={busy}
          className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
        >
          Refresh
        </button>
      </div>

      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Items</h2>
        <div className="mt-4 space-y-3">
          {items.map((it, idx) => (
            <OrderItemRow key={idx} item={it} />
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Addresses</h2>
        <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">Pickup: {order.pickupAddress}</div>
        <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Delivery: {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.zipCode} • {order.deliveryAddress.phone}
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Totals</h2>
        <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">Total amount: {order.totalAmount}</div>
      </div>
    </div>
  );
}

function OrderItemRow({ item }: { item: OrderItem }) {
  const product = item.productId as Product | string;
  const name = typeof product === "string" ? product : product.name;
  const id = typeof product === "string" ? product : product._id;

  return (
    <div className="flex items-start justify-between gap-4 border border-zinc-200 dark:border-zinc-700 rounded p-3">
      <div>
        <div className="font-medium text-zinc-900 dark:text-white">{name}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{id}</div>
      </div>
      <div className="text-right">
        <div className="text-sm text-zinc-700 dark:text-zinc-300">Qty: {item.quantity}</div>
        <div className="text-sm text-zinc-700 dark:text-zinc-300">Price: {item.price}</div>
      </div>
    </div>
  );
}
