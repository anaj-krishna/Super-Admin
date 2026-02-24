/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { superAdminApi } from "@/app/lib/superAdminApi";
import { getApiErrorMessage, isMembershipDeniedMessage } from "@/app/lib/httpError";
import type { Product } from "@/types/superadmin";

export default function StorekeeperProductsPage() {
  const params = useParams<{ userId: string }>();
  const storeId = params.userId;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    superAdminApi
      .listProducts(storeId)
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((e) => {
        const msg = getApiErrorMessage(e).message;
        setError(isMembershipDeniedMessage(msg) ? "You don’t have access to this account." : msg);
      })
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Products</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Storekeeper workspace (storeId: {storeId.slice(0, 8)}...)</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/superadmin/storekeepers/${storeId}`}
            className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium"
          >
            Back
          </Link>
          <Link
            href={`/superadmin/storekeepers/${storeId}/products/create`}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900 rounded-lg p-6 border border-red-200 dark:border-red-700 text-center">
          <p className="text-red-700 dark:text-red-100">{error}</p>
          <button onClick={load} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">No products yet</p>
          <Link
            href={`/superadmin/storekeepers/${storeId}/products/create`}
            className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Create first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Link
              key={p._id}
              href={`/superadmin/storekeepers/${storeId}/products/${p._id}`}
              className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white truncate">{p.name}</h3>
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-100 text-xs font-medium rounded-full">
                  Qty: {p.quantity}
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">Price: {p.price}</p>
              {p.category && <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-2">Category: {p.category}</p>}
              {p.offers?.length ? (
                <p className="text-green-700 dark:text-green-300 text-xs mt-2">Offer: {p.offers[0].type} {p.offers[0].value}</p>
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-2">No offer</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
