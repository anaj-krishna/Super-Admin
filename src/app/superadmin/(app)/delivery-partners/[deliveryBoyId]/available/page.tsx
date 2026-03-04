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
        setError(isMembershipDeniedMessage(msg) ? "You don't have access to this account." : msg);
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
      setTimeout(() => load(), 400); 
    } catch (e) {
      const msg = getApiErrorMessage(e).message;
      setError(isTransitionDeniedMessage(msg) ? "Action not allowed in current status." : msg);
      setBusyId(null);
    }
  };

  const countLabel = useMemo(() => `${orders.length} job${orders.length === 1 ? "" : "s"}`, [orders.length]);

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Link 
        href={`/superadmin/delivery-partners/${deliveryBoyId}`}
        className="inline-flex items-center text-sm text-zinc-500 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Partner Profile
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
            Available Jobs 
            <span className="px-2.5 py-1 text-xs uppercase tracking-wider font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30 shadow-sm">
              READY
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            ID: {deliveryBoyId.slice(0, 8)}... • <span className="font-medium text-zinc-700 dark:text-zinc-300">{countLabel}</span>
          </p>
        </div>
        
        <button 
          onClick={load} 
          className="p-2.5 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-colors shrink-0"
          title="Refresh List"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin text-purple-600 dark:text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
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
              <div className="h-10 w-28 bg-zinc-200 dark:bg-zinc-700 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800/30 text-center">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 border border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="text-zinc-900 dark:text-white font-semibold text-lg">No available jobs</p>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">There are currently no orders waiting to be picked up.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const isUnassigned = o.deliveryBoyId === null;
            const canAccept = o.status === "READY" && isUnassigned;
            const isBusy = busyId === o._id;

            return (
              <div
                key={o._id}
                className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex-1">
                    <Link
                      href={`/superadmin/delivery-partners/${deliveryBoyId}/orders/${o._id}`}
                      className="group inline-block"
                    >
                      <div className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Job #{o._id.slice(-6).toUpperCase()}
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </div>
                    </Link>
                    <div className="text-xs text-zinc-400 font-mono mt-1">ID: {o._id}</div>
                    
                    {!isUnassigned && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Assigned to another partner
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-64 shrink-0 pt-3 sm:pt-0 border-t border-zinc-200 dark:border-zinc-700 sm:border-t-0">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Total Value</div>
                      <div className="font-bold text-zinc-900 dark:text-white">₹{o.totalAmount}</div>
                    </div>

                    {canAccept && (
                      <button
                        onClick={() => accept(o._id)}
                        disabled={isBusy}
                        className={`px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center min-w-[120px] ${
                          isBusy 
                            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white active:scale-95 shadow-green-500/20'
                        }`}
                      >
                        {isBusy ? (
                          <>
                            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Accepting
                          </>
                        ) : (
                          "Accept Job"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}