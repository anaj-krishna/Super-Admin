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
        setError(isMembershipDeniedMessage(msg) ? "You don't have access to this account." : msg);
      })
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <Link 
        href={`/superadmin/storekeepers/${storeId}`}
        className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Storekeeper Profile
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Products Inventory</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Store ID: {storeId.slice(0, 8)}...
          </p>
        </div>
        <Link
          href={`/superadmin/storekeepers/${storeId}/products/create`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-center shrink-0"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 animate-pulse h-40">
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
              </div>
              <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-700 rounded mb-2"></div>
              <div className="h-3 w-1/4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800/30 text-center">
          <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
          <button onClick={load} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
            Retry Loading
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 border border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <p className="text-zinc-900 dark:text-white font-semibold text-lg">No products found</p>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">This storekeeper's inventory is empty. Get started by adding a product.</p>
          <Link
            href={`/superadmin/storekeepers/${storeId}/products/create`}
            className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
              className="group flex flex-col justify-between bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {p.name}
                  </h3>
                  <span className={`shrink-0 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${
                    p.quantity > 0 
                      ? 'bg-zinc-200 text-zinc-700 border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600'
                      : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30'
                  }`}>
                    Qty: {p.quantity}
                  </span>
                </div>
                
                <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  ₹{p.price}
                </p>
                
                <div className="flex flex-col gap-1.5">
                  {p.category && (
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      {p.category}
                    </p>
                  )}
                  
                  {p.offers?.length ? (
                    <p className="text-green-600 dark:text-green-400 text-xs font-medium flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                      {p.offers[0].type}: {p.offers[0].value}
                    </p>
                  ) : (
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs font-medium flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 inline-block" />
                      No active offers
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}