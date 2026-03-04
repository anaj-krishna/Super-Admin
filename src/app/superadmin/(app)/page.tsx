"use client";

import { useEffect, useState } from "react";
import { superAdminApi } from "@/app/lib/superAdminApi";
import { getApiErrorMessage } from "@/app/lib/httpError";
import type { SuperAdmin } from "@/types/superadmin";

export default function SuperAdminProfilePage() {
  const [admin, setAdmin] = useState<SuperAdmin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminApi
      .me()
      .then((data) => setAdmin(data))
      .catch((e) => setError(getApiErrorMessage(e).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-3xl animate-pulse">
        {/* Title and Subtitle Skeletons */}
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 mb-3"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-8"></div>

        {/* Card Layout Skeleton */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generate 10 blank placeholder items to match your Info fields */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-16 mb-2"></div>
                <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-40"></div>
              </div>
            ))}
          </div>
        </div>
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

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">My Profile</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">Super admin account details</p>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Info label="Name" value={admin?.name} />
          <Info label="Email" value={admin?.email} />
          <Info label="Location" value={admin?.location} />
          <Info label="Mobile" value={admin?.mobileNumber} />
          <Info label="State" value={admin?.state} />
          <Info label="District" value={admin?.district} />
          <Info label="Taluk" value={admin?.taluk} />
          <Info label="Local Body Type" value={admin?.localBodyType} />
          <Info label="Local Body Name" value={admin?.localBodyName} />
          <Info label="Ward" value={admin?.ward} />
          <Info label="Pincode" value={admin?.pincode} />
        </div>
      </div>

      <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Linked storekeepers: {admin?.storekeepers?.length ?? 0} • Linked delivery partners: {admin?.deliveryBoys?.length ?? 0}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-1 text-zinc-900 dark:text-white">{value || "—"}</div>
    </div>
  );
}
