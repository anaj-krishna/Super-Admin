"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";

type Storekeeper = {
  id?: string;
  name: string;
  email: string;
};

export default function StorekeepersPage() {
  const [list, setList] = useState<Storekeeper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/super-admin/auth/storekeepers")
      .then((res) => setList(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Failed to load storekeepers"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Storekeepers</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage all storekeepers in your system
          </p>
        </div>
        <Link
          href="/dashboard/storekeepers/create"
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
        <div className="bg-red-50 dark:bg-red-900 rounded-lg p-12 border border-red-200 dark:border-red-700 text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">No storekeepers yet</p>
          <Link
            href="/dashboard/storekeepers/create"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Create your first storekeeper
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((storekeeper, index) => (
            <div
              key={storekeeper.id || storekeeper.email || index}
              className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {storekeeper.name}
                </h3>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">{storekeeper.email}</p>
              {storekeeper.id && (
                <p className="text-zinc-500 text-xs mt-3">ID: {storekeeper.id.slice(0, 8)}...</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
