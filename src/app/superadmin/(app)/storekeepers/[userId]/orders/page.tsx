/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { superAdminApi } from "@/app/lib/superAdminApi";
import {
  getApiErrorMessage,
  isMembershipDeniedMessage,
} from "@/app/lib/httpError";
import type { Order, OrderStatus } from "@/types/superadmin";

const STATUS_OPTIONS: Array<{ label: string; value: "" | OrderStatus }> = [
  { label: "All", value: "" },
  { label: "PLACED", value: "PLACED" },
  { label: "READY", value: "READY" },
  { label: "ACCEPTED", value: "ACCEPTED" },
  { label: "PICKED_UP", value: "PICKED_UP" },
  { label: "DELIVERED", value: "DELIVERED" },
  { label: "FAILED", value: "FAILED" },
  { label: "CANCELLED", value: "CANCELLED" },
  { label: "REJECTED", value: "REJECTED" },
];

export default function StorekeeperOrdersPage() {
  const params = useParams<{ userId: string }>();
  const storeId = params.userId;

  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    superAdminApi
      .listOrders(storeId, status || undefined)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((e) => {
        const msg = getApiErrorMessage(e).message;
        setError(isMembershipDeniedMessage(msg) ? "You don’t have access to this account." : msg);
      })
      .finally(() => setLoading(false));
  }, [storeId, status]);

  useEffect(() => {
    load();
  }, [load]);

  const countLabel = useMemo(() => `${orders.length} order${orders.length === 1 ? "" : "s"}`, [orders.length]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Orders</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">{countLabel} • storeId: {storeId.slice(0, 8)}...</p>
        </div>
        <Link
          href={`/superadmin/storekeepers/${storeId}`}
          className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium"
        >
          Back
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm text-zinc-700 dark:text-zinc-300">Status</label>
        <select
          className="px-3 py-2 border rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
          value={status}
          onChange={(e) => setStatus(e.target.value as "" | OrderStatus)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button onClick={load} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900 rounded-lg p-6 border border-red-200 dark:border-red-700 text-center">
          <p className="text-red-700 dark:text-red-100">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">No orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o._id}
              href={`/superadmin/storekeepers/${storeId}/orders/${o._id}`}
              className="block bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 hover:shadow transition-shadow"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">Order</div>
                  <div className="font-semibold text-zinc-900 dark:text-white">{o._id}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Status</div>
                  <div className="font-medium text-zinc-900 dark:text-white">{o.status}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Total: {o.totalAmount}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
