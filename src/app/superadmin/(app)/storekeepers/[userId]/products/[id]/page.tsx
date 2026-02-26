"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { superAdminApi } from "@/app/lib/superAdminApi";
import {
  getApiErrorMessage,
  isMembershipDeniedMessage,
} from "@/app/lib/httpError";
import type { DiscountType, Product } from "@/types/superadmin";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ userId: string; id: string }>();
  const storeId = params.userId;
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  const [edit, setEdit] = useState({
    name: "",
    description: "",
    images: "",
    quantity: "",
    price: "",
    category: "",
  });

  const [stockQty, setStockQty] = useState<string>("");

  const [offer, setOffer] = useState({
    type: "PERCENTAGE" as DiscountType,
    value: "",
    startDate: "",
    endDate: "",
  });

  const offerExists = useMemo(() => !!product?.offers?.length, [product]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setActionMsg(null);

    superAdminApi
      .getProduct(storeId, id)
      .then((p) => {
        setProduct(p);
        setEdit({
          name: p.name ?? "",
          description: p.description ?? "",
          images: (p.images ?? []).join(", "),
          quantity: String(p.quantity ?? ""),
          price: p.price ?? "",
          category: p.category ?? "",
        });
      })
      .catch((e) => {
        const msg = getApiErrorMessage(e).message;
        setError(isMembershipDeniedMessage(msg) ? "You don't have access to this account." : msg);
      })
      .finally(() => setLoading(false));
  }, [storeId, id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e?: FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    setActionMsg(null);

    const quantityNum = edit.quantity.trim() ? Number(edit.quantity) : undefined;
    if (edit.quantity.trim() && !Number.isFinite(quantityNum)) {
      setActionMsg({ text: "Quantity must be a number", type: "error" });
      setSaving(false);
      return;
    }

    try {
      const images = edit.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await superAdminApi.updateProduct(storeId, id, {
        name: edit.name.trim() || undefined,
        description: edit.description.trim() || undefined,
        images: images.length ? images : undefined,
        quantity: quantityNum,
        price: edit.price.trim() || undefined,
        category: edit.category.trim() || undefined,
      });
      setActionMsg({ text: "✓ Product details saved", type: "success" });
      load();
    } catch (e) {
      setActionMsg({ text: getApiErrorMessage(e).message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const patchStock = async (e?: FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    setActionMsg(null);

    const qty = Number(stockQty);
    if (!Number.isFinite(qty) || stockQty === "") {
      setActionMsg({ text: "Please enter a valid quantity", type: "error" });
      setSaving(false);
      return;
    }

    try {
      await superAdminApi.patchStock(storeId, id, qty);
      setActionMsg({ text: "✓ Stock updated", type: "success" });
      setStockQty("");
      load();
    } catch (e) {
      setActionMsg({ text: getApiErrorMessage(e).message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const addOffer = async (e?: FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    setActionMsg(null);

    const valueNum = Number(offer.value);
    if (!Number.isFinite(valueNum) || offer.value === "") {
      setActionMsg({ text: "Offer value must be a valid number", type: "error" });
      setSaving(false);
      return;
    }

    try {
      await superAdminApi.addOffer(storeId, id, {
        type: offer.type,
        value: valueNum,
        startDate: offer.startDate ? new Date(offer.startDate).toISOString() : undefined,
        endDate: offer.endDate ? new Date(offer.endDate).toISOString() : undefined,
      });
      setActionMsg({ text: "✓ Offer added successfully", type: "success" });
      setOffer({ type: "PERCENTAGE", value: "", startDate: "", endDate: "" });
      load();
    } catch (e) {
      setActionMsg({ text: getApiErrorMessage(e).message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const deleteOffer = async () => {
    if (!confirm("Are you sure you want to remove this offer?")) return;
    setSaving(true);
    setActionMsg(null);
    try {
      await superAdminApi.deleteOffer(storeId, id);
      setActionMsg({ text: "✓ Offer deleted", type: "info" });
      load();
    } catch (e) {
      setActionMsg({ text: getApiErrorMessage(e).message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    setSaving(true);
    setActionMsg(null);
    try {
      await superAdminApi.deleteProduct(storeId, id);
      router.push(`/superadmin/storekeepers/${storeId}/products`);
    } catch (e) {
      setActionMsg({ text: getApiErrorMessage(e).message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-pulse">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-8"></div>
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
          <div className="h-10 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 h-96 mb-6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <Link 
          href={`/superadmin/storekeepers/${storeId}/products`}
          className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Products
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800/30">
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Link 
        href={`/superadmin/storekeepers/${storeId}/products`}
        className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Products
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{product.name}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            ID: {product._id}
          </p>
        </div>
        <button
          onClick={deleteProduct}
          disabled={saving}
          className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/30 dark:hover:bg-red-600 dark:hover:text-white disabled:opacity-50 font-semibold transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Delete Product
        </button>
      </div>

      {actionMsg && (
        <div className={`mb-6 p-4 rounded-xl border animate-in fade-in flex items-center gap-3 ${
          actionMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400' : 
          actionMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400' :
          'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400'
        }`}>
          <p className="text-sm font-medium">{actionMsg.text}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
            Edit Details
          </h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Name">
              <input className={inputClass} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </Field>
            <Field label="Category">
              <input className={inputClass} value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
            </Field>
            <Field label="Price">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₹</span>
                <input className={`${inputClass} pl-8`} value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} />
              </div>
            </Field>
            <Field label="Total Quantity">
              <input type="number" className={inputClass} value={edit.quantity} onChange={(e) => setEdit({ ...edit, quantity: e.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea className={`${inputClass} min-h-[100px] resize-y`} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Images (comma-separated URLs)">
                <input className={inputClass} value={edit.images} onChange={(e) => setEdit({ ...edit, images: e.target.value })} />
              </Field>
            </div>
            <div className="md:col-span-2 mt-2 flex justify-end">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-semibold shadow-md active:scale-95 transition-all">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
            Quick Stock Update
          </h2>
          <form onSubmit={patchStock} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Field label="Patch Quantity">
                <input
                  type="number"
                  className={inputClass}
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  placeholder="Set new exact quantity"
                />
              </Field>
            </div>
            <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-semibold shadow-md active:scale-95 transition-all shrink-0">
              Update Stock
            </button>
          </form>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
            Active Offers
            {offerExists && (
              <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30">
                Active
              </span>
            )}
          </h2>

          {offerExists ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-zinc-900 dark:text-white font-semibold">
                  {product.offers[0].type === "PERCENTAGE" ? `${product.offers[0].value}% OFF` : `₹${product.offers[0].value} FLAT OFF`}
                </p>
                <div className="text-sm text-zinc-500 mt-1 flex gap-4">
                  <span>Starts: {product.offers[0].startDate ? new Date(product.offers[0].startDate).toLocaleDateString() : 'N/A'}</span>
                  <span>Ends: {product.offers[0].endDate ? new Date(product.offers[0].endDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              <button
                onClick={deleteOffer}
                disabled={saving}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white disabled:opacity-60 rounded-lg transition-colors font-medium shrink-0"
              >
                Remove Offer
              </button>
            </div>
          ) : (
            <form onSubmit={addOffer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Discount Type">
                <select className={inputClass} value={offer.type} onChange={(e) => setOffer({ ...offer, type: e.target.value as DiscountType })}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </Field>
              <Field label="Discount Value">
                <input type="number" className={inputClass} value={offer.value} onChange={(e) => setOffer({ ...offer, value: e.target.value })} placeholder="e.g. 15" />
              </Field>
              <Field label="Start Date (Optional)">
                <input type="datetime-local" className={inputClass} value={offer.startDate} onChange={(e) => setOffer({ ...offer, startDate: e.target.value })} />
              </Field>
              <Field label="End Date (Optional)">
                <input type="datetime-local" className={inputClass} value={offer.endDate} onChange={(e) => setOffer({ ...offer, endDate: e.target.value })} />
              </Field>
              <div className="md:col-span-2 mt-2 flex justify-end">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl font-semibold shadow-md active:scale-95 transition-all">
                  Publish Offer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{label}</label>
      {children}
    </div>
  );
}