"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";

type SuperAdmin = {
  id: string;
  name: string;
  email: string;
  location?: string;
};

export default function DashboardPage() {
  const [admin, setAdmin] = useState<SuperAdmin | null>(null);
  const [stats, setStats] = useState({ storekeepers: 0, deliveryBoys: 0 });

  useEffect(() => {
    api.get<SuperAdmin>("/super-admin/auth/me")
      .then((res) => setAdmin(res.data))
      .catch(() => {});

    // Fetch stats
    Promise.all([
      api.get("/super-admin/auth/storekeepers").then((res) => Array.isArray(res.data) ? res.data.length : 0).catch(() => 0),
      api.get("/super-admin/auth/delivery-boys").then((res) => Array.isArray(res.data) ? res.data.length : 0).catch(() => 0),
    ]).then(([sk, db]) => {
      setStats({ storekeepers: sk, deliveryBoys: db });
    });
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Welcome back, {admin?.name || "Admin"}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {admin?.email} • {admin?.location || "All locations"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Total Storekeepers
              </p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {stats.storekeepers}
              </p>
            </div>
            <div className="text-4xl opacity-10">🏪</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Total Delivery Boys
              </p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {stats.deliveryBoys}
              </p>
            </div>
            <div className="text-4xl opacity-10">🚚</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/storekeepers"
            className="px-4 py-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors text-blue-900 dark:text-blue-100 font-medium"
          >
            View Storekeepers
          </Link>
          <Link
            href="/dashboard/storekeepers/create"
            className="px-4 py-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors text-green-900 dark:text-green-100 font-medium"
          >
            Add Storekeeper
          </Link>
          <Link
            href="/dashboard/delivery"
            className="px-4 py-3 bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors text-purple-900 dark:text-purple-100 font-medium"
          >
            View Delivery Boys
          </Link>
          <Link
            href="/dashboard/delivery/create"
            className="px-4 py-3 bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors text-orange-900 dark:text-orange-100 font-medium"
          >
            Add Delivery Boy
          </Link>
        </div>
      </div>
    </div>
  );
}
