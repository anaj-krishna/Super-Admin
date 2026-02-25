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

export default function DeliveryPartnerDetailPage() {
  const params = useParams<{ deliveryBoyId: string }>();
  const deliveryBoyId = params.deliveryBoyId;

  const [user, setUser] = useState<ManagedUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    superAdminApi
      .getDeliveryBoy(deliveryBoyId)
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
  }, [deliveryBoyId]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-zinc-600 dark:text-zinc-400">Loading delivery partner...</p>
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
          href="/superadmin/delivery-partners"
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
          href={`/superadmin/delivery-partners/${user._id}/available`}
          className="px-6 py-4 bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg hover:opacity-90 text-purple-900 dark:text-purple-100 font-medium"
        >
          Available jobs (READY)
        </Link>
        <Link
          href={`/superadmin/delivery-partners/${user._id}/mine`}
          className="px-6 py-4 bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg hover:opacity-90 text-orange-900 dark:text-orange-100 font-medium"
        >
          My jobs
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
