"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [actionMsg, setActionMsg] = useState<string | null>(null);

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
        setError(isMembershipDeniedMessage(msg) ? "You don’t have access to this account." : msg);
      })
      .finally(() => setLoading(false));
  }, [storeId, id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setActionMsg(null);

    const quantityNum = edit.quantity.trim() ? Number(edit.quantity) : undefined;
    if (edit.quantity.trim() && !Number.isFinite(quantityNum)) {
      setActionMsg("Quantity must be a number");
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
      setActionMsg("✓ Saved");
      load();
    } catch (e) {
      setActionMsg(getApiErrorMessage(e).message);
    } finally {
      setSaving(false);
    }
  };

  const patchStock = async () => {
    setSaving(true);
    setActionMsg(null);

    const qty = Number(stockQty);
    if (!Number.isFinite(qty)) {
      setActionMsg("Quantity must be a number");
      setSaving(false);
      return;
    }

    try {
      await superAdminApi.patchStock(storeId, id, qty);
      setActionMsg("✓ Stock updated");
      setStockQty("");
      load();
    } catch (e) {
      setActionMsg(getApiErrorMessage(e).message);
    } finally {
      setSaving(false);
    }
  };

  const addOffer = async () => {
    setSaving(true);
    setActionMsg(null);

    const valueNum = Number(offer.value);
    if (!Number.isFinite(valueNum)) {
      setActionMsg("Offer value must be a number");
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
      setActionMsg("✓ Offer added");
      setOffer({ type: offer.type, value: "", startDate: "", endDate: "" });
      load();
    } catch (e) {
      setActionMsg(getApiErrorMessage(e).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteOffer = async () => {
    setSaving(true);
    setActionMsg(null);
    try {
      await superAdminApi.deleteOffer(storeId, id);
      setActionMsg("✓ Offer deleted");
      load();
    } catch (e) {
      setActionMsg(getApiErrorMessage(e).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    setSaving(true);
    setActionMsg(null);
    try {
      await superAdminApi.deleteProduct(storeId, id);
      router.push(`/superadmin/storekeepers/${storeId}/products`);
    } catch (e) {
      setActionMsg(getApiErrorMessage(e).message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-zinc-600 dark:text-zinc-400">Loading product...</p>
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

  if (!product) return null;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{product.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Product ID: {product._id}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/superadmin/storekeepers/${storeId}/products`}
            className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
          >
            Back
          </Link>
          <button
            onClick={deleteProduct}
            disabled={saving}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white"
          >
            Delete
          </button>
        </div>
      </div>

      {actionMsg && <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">{actionMsg}</p>}

      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Edit Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name">
            <input className={inputClass} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          </Field>
          <Field label="Category">
            <input className={inputClass} value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
          </Field>
          <Field label="Price">
            <input className={inputClass} value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} />
          </Field>
          <Field label="Quantity">
            <input type="number" className={inputClass} value={edit.quantity} onChange={(e) => setEdit({ ...edit, quantity: e.target.value })} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <input className={inputClass} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Images (comma-separated URLs)">
              <input className={inputClass} value={edit.images} onChange={(e) => setEdit({ ...edit, images: e.target.value })} />
            </Field>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Stock Update</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="number"
            className={inputClass}
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            placeholder="New quantity (number)"
          />
          <button
            onClick={patchStock}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium"
          >
            Update Stock
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Offer</h2>

        {offerExists ? (
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              Current offer: {product.offers[0].type} {product.offers[0].value}
            </div>
            <button
              onClick={deleteOffer}
              disabled={saving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded"
            >
              Delete Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Type">
              <select
                className={inputClass}
                value={offer.type}
                onChange={(e) => setOffer({ ...offer, type: e.target.value as DiscountType })}
              >
                <option value="PERCENTAGE">PERCENTAGE</option>
                <option value="FLAT">FLAT</option>
              </select>
            </Field>
            <Field label="Value">
              <input
                type="number"
                className={inputClass}
                value={offer.value}
                onChange={(e) => setOffer({ ...offer, value: e.target.value })}
              />
            </Field>
            <Field label="Start Date">
              <input
                type="datetime-local"
                className={inputClass}
                value={offer.startDate}
                onChange={(e) => setOffer({ ...offer, startDate: e.target.value })}
              />
            </Field>
            <Field label="End Date">
              <input
                type="datetime-local"
                className={inputClass}
                value={offer.endDate}
                onChange={(e) => setOffer({ ...offer, endDate: e.target.value })}
              />
            </Field>

            <div className="md:col-span-2">
              <button
                onClick={addOffer}
                disabled={saving}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg font-medium"
              >
                Add Offer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{label}</label>
      {children}
    </div>
  );
}
