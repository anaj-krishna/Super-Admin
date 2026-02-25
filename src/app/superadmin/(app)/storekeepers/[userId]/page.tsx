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
            ? "You don’t have access to this account."
            : msg
        );
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-zinc-600 dark:text-zinc-400">Loading storekeeper...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900 rounded-lg p-6 border border-red-200 dark:border-red-700">
          <p className="text-red-700 dark:text-red-100">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{user.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{user.email}</p>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Status: {user.status}</p>
        </div>
        <Link
          href="/superadmin/storekeepers"
          className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
        >
          Back
        </Link>
      </div>

      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Info label="User ID" value={user._id} />
          <Info label="Role" value={user.role} />
          <Info label="Verified" value={user.isVerified ? "Yes" : "No"} />
          <Info label="Mobile" value={user.mobileNumber} />
          <Info label="Address" value={user.address} />
          <Info label="Address2" value={user.address2} />
          <Info label="Serviceable pincodes" value={user.serviceablePincodes?.join(", ") || "—"} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`/superadmin/storekeepers/${user._id}/products`}
          className="px-6 py-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg hover:opacity-90 text-blue-900 dark:text-blue-100 font-medium"
        >
          Products
        </Link>
        <Link
          href={`/superadmin/storekeepers/${user._id}/orders`}
          className="px-6 py-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg hover:opacity-90 text-green-900 dark:text-green-100 font-medium"
        >
          Orders
        </Link>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-1 text-zinc-900 dark:text-white wrap-break-word">{value || "—"}</div>
    </div>
  );
}
