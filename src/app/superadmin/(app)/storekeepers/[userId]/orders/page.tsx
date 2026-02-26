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
  { label: "All Orders", value: "" },
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
        setError(isMembershipDeniedMessage(msg) ? "You don't have access to this account." : msg);
      })
      .finally(() => setLoading(false));
  }, [storeId, status]);

  useEffect(() => {
    load();
  }, [load]);

  const countLabel = useMemo(() => `${orders.length} order${orders.length === 1 ? "" : "s"}`, [orders.length]);

  const getOrderStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30";
      case "FAILED":
      case "CANCELLED":
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30";
      case "PLACED":
      case "ACCEPTED":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30";
      case "READY":
      case "PICKED_UP":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <Link 
        href={`/superadmin/storekeepers/${storeId}`}
        className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Storekeeper Profile
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Store Orders</h1>
          <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            ID: {storeId.slice(0, 8)}... • <span className="font-medium text-zinc-700 dark:text-zinc-300">{countLabel}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
          <select
            className="pl-3 pr-8 py-2 bg-transparent text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer appearance-none"
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | OrderStatus)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.label} value={o.value} className="bg-white dark:bg-zinc-800">
                {o.label}
              </option>
            ))}
          </select>
          <svg className="w-4 h-4 text-zinc-400 -ml-6 mr-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
          
          <button 
            onClick={load} 
            className="p-2 text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Refresh Orders"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 animate-pulse flex justify-between items-center">
              <div>
                <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-700 rounded mb-3"></div>
                <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
              </div>
              <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800/30 text-center">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 border border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <p className="text-zinc-900 dark:text-white font-semibold text-lg">No orders found</p>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">There are no orders matching this status.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o._id}
              href={`/superadmin/storekeepers/${storeId}/orders/${o._id}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Order #{o._id.slice(-6).toUpperCase()}
                  </span>
                  <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${getOrderStatusBadge(o.status)}`}>
                    {o.status}
                  </span>
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400 font-mono text-xs mt-1">
                  ID: {o._id}
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-zinc-200 dark:border-zinc-700 sm:border-t-0">
                <div className="text-left sm:text-right">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total</div>
                  <div className="font-bold text-zinc-900 dark:text-white">₹{o.totalAmount}</div>
                </div>
                <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}