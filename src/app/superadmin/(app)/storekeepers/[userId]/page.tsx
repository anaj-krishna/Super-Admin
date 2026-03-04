/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { superAdminApi } from "@/app/lib/superAdminApi";
import {
  getApiErrorMessage,
  isMembershipDeniedMessage,
} from "@/app/lib/httpError";
import type { ManagedUser } from "@/types/superadmin";

export default function StorekeeperDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const [user, setUser] = useState<ManagedUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    superAdminApi
      .getStorekeeper(userId)
      .then((data) => setUser(data))
      .catch((e) => {
        const msg = getApiErrorMessage(e).message;
        setError(
          isMembershipDeniedMessage(msg)
            ? "You don't have access to this account."
            : msg
        );
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const getStatusBadgeStyles = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30";
      case "inactive":
      case "suspended":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/30";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-pulse">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-8"></div>
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
          <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 h-64 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700"></div>
          <div className="h-32 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        <Link 
          href="/superadmin/storekeepers"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Storekeepers
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800/30">
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <Link 
        href="/superadmin/storekeepers"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Storekeepers
      </Link>

      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1 break-words">{user.name}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2 break-all sm:break-normal">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            {user.email}
          </p>
        </div>
        
        <div className="flex items-center justify-start sm:justify-end shrink-0">
          <span className={`px-3 py-1.5 text-xs uppercase tracking-wider font-bold rounded-full border ${getStatusBadgeStyles(user.status)}`}>
            {user.status || "Unknown"}
          </span>
        </div>
      </div>

      {/* Account Details Grey Card */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          Account Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
          <Info label="User ID" value={user._id} />
          <Info label="Role" value={user.role} />
          <Info label="Verified" value={user.isVerified ? "Yes" : "No"} />
          <Info label="Mobile" value={user.mobileNumber} />
          <Info label="Primary Address" value={user.address} />
          <Info label="Secondary Address" value={user.address2} />
          <div className="md:col-span-2 lg:col-span-3">
            <Info label="Serviceable Pincodes" value={user.serviceablePincodes?.join(", ") || "—"} />
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mt-10 mb-4 px-1">
        Storekeeper Workspaces
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* --- Card 1: Manage Products --- */}
        <Link
          href={`/superadmin/storekeepers/${user._id}/products`}
          className="group relative overflow-hidden bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 rounded-2xl hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all flex items-center justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Manage Products</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">View inventory, add offers, and update stock.</p>
          </div>
          <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-600 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </Link>

        {/* --- Card 2: View Orders --- */}
        <Link
          href={`/superadmin/storekeepers/${user._id}/orders`}
          className="group relative overflow-hidden bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 rounded-2xl hover:border-green-500/50 dark:hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 transition-all flex items-center justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">View Orders</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Track incoming orders and delivery status.</p>
          </div>
          <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-600 group-hover:text-green-500 transition-colors transform group-hover:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words">{value || "—"}</div>
    </div>
  );
}