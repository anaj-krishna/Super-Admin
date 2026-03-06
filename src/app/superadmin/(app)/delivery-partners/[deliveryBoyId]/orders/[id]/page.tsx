"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { superAdminApi } from "@/app/lib/superAdminApi";
import {
  getApiErrorMessage,
  isMembershipDeniedMessage,
  isTransitionDeniedMessage,
} from "@/app/lib/httpError";
import type { Order, OrderItem, Product } from "@/types/superadmin";

export default function DeliveryJobDetailPage() {
  const params = useParams<{ deliveryBoyId: string; id: string }>();
  const deliveryBoyId = String(params.deliveryBoyId ?? "");
  const id = String(params.id ?? "");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!deliveryBoyId || !id) {
      setError("Missing job id.");
      setLoading(false);
      return;
    }

    superAdminApi
      .getDeliveryOrder(deliveryBoyId, id)
      .then((data) => setOrder(data))
      .catch((e) => {
        const msg = getApiErrorMessage(e).message;
        if (isMembershipDeniedMessage(msg) || msg === "Order not found or not assigned to you") {
          setError("You don’t have access to this job.");
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, [deliveryBoyId, id]);

  useEffect(() => {
    load();
  }, [load]);

  const canAccept = order?.status === "READY" && order.deliveryBoyId === null;
  const canPickup = order?.status === "ACCEPTED";
  const canDeliver = order?.status === "PICKED_UP";
  const canFail = order?.status === "PICKED_UP";

  const act = async (action: "accept" | "pickup" | "deliver" | "fail") => {
    if (!order) return;
    setBusy(true);
    setActionError(null);

    try {
      if (action === "accept") await superAdminApi.acceptOrder(deliveryBoyId, order._id);
      if (action === "pickup") await superAdminApi.pickupOrder(deliveryBoyId, order._id);
      if (action === "deliver") await superAdminApi.deliverOrder(deliveryBoyId, order._id);
      if (action === "fail") await superAdminApi.failOrder(deliveryBoyId, order._id);
      load();
    } catch (e) {
      const msg = getApiErrorMessage(e).message;
      if (isTransitionDeniedMessage(msg)) {
        setActionError("Action not allowed in current status.");
      } else if (isMembershipDeniedMessage(msg) || msg === "Order not assigned to you") {
        setActionError("You don’t have access to this job.");
      } else {
        setActionError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-zinc-600 dark:text-zinc-400">Loading job...</p>
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
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Job Detail</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{order._id}</p>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Status: {order.status}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/superadmin/delivery-partners/${deliveryBoyId}`}
            className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
          >
            Back
          </Link>
          <button
            onClick={load}
            disabled={busy}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {actionError && <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">{actionError}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        {canAccept && (
          <button
            onClick={() => act("accept")}
            disabled={busy}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white"
          >
            Accept
          </button>
        )}
        {canPickup && (
          <button
            onClick={() => act("pickup")}
            disabled={busy}
            className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white"
          >
            Pickup
          </button>
        )}
        {canDeliver && (
          <button
            onClick={() => act("deliver")}
            disabled={busy}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white"
          >
            Deliver
          </button>
        )}
        {canFail && (
          <button
            onClick={() => act("fail")}
            disabled={busy}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white"
          >
            Fail
          </button>
        )}
      </div>

      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Items</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((it, idx) => (
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
        {typeof order.itemsTotal === "number" && (
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">Items total: {order.itemsTotal}</div>
        )}
        {typeof order.deliveryCharge === "number" && (
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">Delivery charge: {order.deliveryCharge}</div>
        )}
        {typeof order.deliveryChargePincode === "string" && order.deliveryChargePincode.trim() !== "" && (
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">Charge pincode: {order.deliveryChargePincode}</div>
        )}
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
