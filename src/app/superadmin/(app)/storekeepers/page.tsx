/* eslint-disable react-hooks/set-state-in-effect */
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Storekeepers</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage all storekeepers linked to this super admin</p>
        </div>
        <Link
          href="/superadmin/storekeepers/create"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          + Add Storekeeper
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900 rounded-lg p-6 border border-red-200 dark:border-red-700 text-center">
          <p className="text-red-700 dark:text-red-100">{error}</p>
          <button
            onClick={load}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Retry
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">No storekeepers yet</p>
          <Link
            href="/superadmin/storekeepers/create"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Create your first storekeeper
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((u) => (
            <Link
              key={u._id}
              href={`/superadmin/storekeepers/${u._id}`}
              className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{u.name}</h3>
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-100 text-xs font-medium rounded-full">
                  {u.status}
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">{u.email}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-3">ID: {u._id.slice(0, 8)}...</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
