"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { superAdminApi } from "@/app/lib/superAdminApi";
import { getApiErrorMessage, isMembershipDeniedMessage } from "@/app/lib/httpError";
import type { Order } from "@/types/superadmin";

export default function MyJobsPage() {
  const params = useParams<{ deliveryBoyId: string }>();
  const deliveryBoyId = params.deliveryBoyId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    superAdminApi
      .myDeliveryOrders(deliveryBoyId)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((e) => {
        const msg = getApiErrorMessage(e).message;
        setError(isMembershipDeniedMessage(msg) ? "You don't have access to this account." : msg);
      })
      .finally(() => setLoading(false));
  }, [deliveryBoyId]);

  useEffect(() => {
    load();
  }, [load]);

  const countLabel = useMemo(() => `${orders.length} active job${orders.length === 1 ? "" : "s"}`, [orders.length]);

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
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Link 
        href={`/superadmin/delivery-partners/${deliveryBoyId}`}
        className="inline-flex items-center text-sm text-zinc-500 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Partner Profile
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">My Active Jobs</h1>
          <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
            ID: {deliveryBoyId.slice(0, 8)}... • <span className="font-medium text-zinc-700 dark:text-zinc-300">{countLabel}</span>
          </p>
        </div>
        
        <button 
          onClick={load} 
          className="p-2.5 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-colors shrink-0"
          title="Refresh List"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin text-orange-600 dark:text-orange-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 animate-pulse flex justify-between items-center">
              <div>
                <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-700 rounded mb-3"></div>
                <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
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
          <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <p className="text-zinc-900 dark:text-white font-semibold text-lg">No assigned jobs</p>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">You have not accepted any delivery jobs yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o._id}
              href={`/superadmin/delivery-partners/${deliveryBoyId}/orders/${o._id}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 hover:border-orange-500/50 dark:hover:border-orange-500/50 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Job #{o._id.slice(-6).toUpperCase()}
                  </span>
                  <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border shadow-sm ${getOrderStatusBadge(o.status)}`}>
                    {o.status}
                  </span>
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400 font-mono text-xs mt-1">
                  ID: {o._id}
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-zinc-200 dark:border-zinc-700 sm:border-t-0">
                <div className="text-left sm:text-right">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Value</div>
                  <div className="font-bold text-zinc-900 dark:text-white">₹{o.totalAmount}</div>
                </div>
                <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-hover:text-orange-500 transition-colors transform group-hover:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}