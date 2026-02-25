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
import type { Order } from "@/types/superadmin";

export default function AvailableJobsPage() {
  const params = useParams<{ deliveryBoyId: string }>();
  const deliveryBoyId = params.deliveryBoyId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    superAdminApi
      .listDeliveryOrders(deliveryBoyId, { status: "READY" })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((e) => {
        const msg = getApiErrorMessage(e).message;
        setError(isMembershipDeniedMessage(msg) ? "You don’t have access to this account." : msg);
      })
      .finally(() => setLoading(false));
  }, [deliveryBoyId]);

  useEffect(() => {
    load();
  }, [load]);

  const accept = async (orderId: string) => {
    setBusyId(orderId);
    setError(null);
    try {
      await superAdminApi.acceptOrder(deliveryBoyId, orderId);
      load();
    } catch (e) {
      const msg = getApiErrorMessage(e).message;
      setError(isTransitionDeniedMessage(msg) ? "Action not allowed in current status." : msg);
    } finally {
      setBusyId(null);
    }
  };

  const countLabel = useMemo(() => `${orders.length} job${orders.length === 1 ? "" : "s"}`, [orders.length]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Available jobs (READY)</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">{countLabel} • deliveryBoyId: {deliveryBoyId.slice(0, 8)}...</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/superadmin/delivery-partners/${deliveryBoyId}`}
            className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium"
          >
            Back
          </Link>
          <button onClick={load} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            Refresh
          </button>
        </div>
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
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">No available jobs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const isUnassigned = o.deliveryBoyId === null;
            const canAccept = o.status === "READY" && isUnassigned;

            return (
              <div
                key={o._id}
                className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Order</div>
                    <Link
                      href={`/superadmin/delivery-partners/${deliveryBoyId}/orders/${o._id}`}
                      className="font-semibold text-zinc-900 dark:text-white hover:underline"
                    >
                      {o._id}
                    </Link>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Status: {o.status}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Total</div>
                      <div className="font-medium text-zinc-900 dark:text-white">{o.totalAmount}</div>
                    </div>

                    {canAccept && (
                      <button
                        onClick={() => accept(o._id)}
                        disabled={busyId === o._id}
                        className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white"
                      >
                        {busyId === o._id ? "Accepting..." : "Accept"}
                      </button>
                    )}
                  </div>
                </div>

                {!isUnassigned && (
                  <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Assigned already</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
