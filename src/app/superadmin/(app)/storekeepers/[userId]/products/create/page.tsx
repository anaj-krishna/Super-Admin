"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
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

  const submit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const quantityNum = Number(form.quantity);
    if (!Number.isFinite(quantityNum)) {
      setError("Quantity must be a number");
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

      setSuccess("✓ Product created");
      setTimeout(() => router.push(`/superadmin/storekeepers/${storeId}/products`), 800);
    } catch (e) {
      const msg = getApiErrorMessage(e).message;
      setError(isMembershipDeniedMessage(msg) ? "You don’t have access to this account." : msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Create Product</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">Storekeeper (storeId: {storeId.slice(0, 8)}...)</p>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 border border-zinc-200 dark:border-zinc-700">
        <div className="space-y-6">
          <Field label="Name" required>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>

          <Field label="Description">
            <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>

          <Field label="Images (comma-separated URLs)">
            <input className={inputClass} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://..., https://..." />
          </Field>

          <Field label="Quantity" required>
            <input type="number" className={inputClass} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </Field>

          <Field label="Price" required>
            <input className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="₹100" />
          </Field>

          <Field label="Category">
            <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </Field>
        </div>

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
        {success && <p className="text-green-700 dark:text-green-300 text-sm mt-4">{success}</p>}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push(`/superadmin/storekeepers/${storeId}/products`)}
            className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
