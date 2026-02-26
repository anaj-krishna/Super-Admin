"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { superAdminApi } from "@/app/lib/superAdminApi";
import { getApiErrorMessage } from "@/app/lib/httpError";
import type { ManagedUser } from "@/types/superadmin";

export default function StorekeepersPage() {
  const [list, setList] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    superAdminApi
      .listStorekeepers()
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((e) => setError(getApiErrorMessage(e).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Helper function for dynamic status badge colors
  const getStatusBadgeStyles = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30";
      case "inactive":
      case "suspended":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/30";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* 1. Mobile-safe Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Storekeepers</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage all storekeepers linked to this super admin</p>
        </div>
        <Link
          href="/superadmin/storekeepers/create"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-center"
        >
          + Add Storekeeper
        </Link>
      </div>

      {loading ? (
        /* 2. Skeleton Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-16"></div>
              </div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mt-6"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800/30 text-center">
          <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={load}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 border border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-zinc-900 dark:text-white font-semibold text-lg">No storekeepers found</p>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">Get started by adding your first storekeeper to manage inventory and orders.</p>
          <Link
            href="/superadmin/storekeepers/create"
            className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Add Storekeeper
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((u) => (
            <Link
              key={u._id}
              href={`/superadmin/storekeepers/${u._id}`}
              className="group bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {u.name}
                </h3>
                {/* 3. Dynamic Status Badge */}
                <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${getStatusBadgeStyles(u.status)}`}>
                  {u.status || "Unknown"}
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm flex items-center gap-2">
                {/* Small email icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                {u.email}
              </p>
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-400 dark:text-zinc-500">
                <span>ID: {u._id.slice(0, 8)}...</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400 font-medium">View details &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}