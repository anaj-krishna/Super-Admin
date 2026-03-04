"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { superAdminApi } from "@/app/lib/superAdminApi";
import { getApiErrorMessage, isMembershipDeniedMessage } from "@/app/lib/httpError";

export default function CreateProductPage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const storeId = params.userId;

  const [form, setForm] = useState({
    name: "",
    description: "",
    images: "",
    quantity: "",
    price: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const quantityNum = Number(form.quantity);
    if (!Number.isFinite(quantityNum) || form.quantity === "") {
      setError("Quantity must be a valid number");
      setLoading(false);
      return;
    }

    try {
      const images = form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await superAdminApi.createProduct(storeId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        images: images.length ? images : undefined,
        quantity: quantityNum,
        price: form.price.trim(),
        category: form.category.trim() || undefined,
      });

      setSuccess("✓ Product created successfully!");
      setTimeout(() => router.push(`/superadmin/storekeepers/${storeId}/products`), 800);
    } catch (e) {
      const msg = getApiErrorMessage(e).message;
      setError(isMembershipDeniedMessage(msg) ? "You don't have access to this account." : msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Link 
        href={`/superadmin/storekeepers/${storeId}/products`}
        className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Products
      </Link>

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Create Product</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        Store ID: {storeId.slice(0, 8)}...
      </p>

      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <form onSubmit={submit} className="p-6 sm:p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Product Name" required>
              <input 
                required
                className={inputClass} 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                placeholder="e.g. Organic Tomatoes"
              />
            </Field>

            <Field label="Category">
              <input 
                className={inputClass} 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })} 
                placeholder="e.g. Vegetables"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Description">
                <textarea 
                  className={`${inputClass} min-h-[100px] resize-y`} 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  placeholder="Describe the product details, weight, origin, etc."
                />
              </Field>
            </div>

            <Field label="Price" required>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₹</span>
                <input 
                  required
                  className={`${inputClass} pl-8`} 
                  value={form.price} 
                  onChange={(e) => setForm({ ...form, price: e.target.value })} 
                  placeholder="100.00" 
                />
              </div>
            </Field>

            <Field label="Initial Stock Quantity" required>
              <input 
                required
                type="number" 
                min="0"
                className={inputClass} 
                value={form.quantity} 
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
                placeholder="e.g. 50"
              />
            </Field>

            <div className="md:col-span-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Field label="Images (Comma-separated URLs)">
                <input 
                  className={inputClass} 
                  value={form.images} 
                  onChange={(e) => setForm({ ...form, images: e.target.value })} 
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" 
                />
                <p className="text-xs text-zinc-500 mt-2">Provide direct links to hosted images.</p>
              </Field>
            </div>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl animate-in fade-in">
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl animate-in fade-in">
              <p className="text-green-700 dark:text-green-400 text-sm font-medium">{success}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(`/superadmin/storekeepers/${storeId}/products`)}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1" title="Required">*</span>}
      </label>
      {children}
    </div>
  );
}