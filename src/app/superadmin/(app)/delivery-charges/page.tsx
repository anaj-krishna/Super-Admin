"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { superAdminApi } from "@/app/lib/superAdminApi";
import { getApiErrorMessage } from "@/app/lib/httpError";
import type { DeliveryChargeRule } from "@/types/superadmin";

export default function DeliveryChargesPage() {
  const [rules, setRules] = useState<DeliveryChargeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ pincode: "", charge: "" });
  const [touched, setTouched] = useState({ pincode: false, charge: false });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    superAdminApi
      .listDeliveryCharges()
      .then((data) => setRules(Array.isArray(data) ? data : []))
      .catch((e) => setError(getApiErrorMessage(e).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pincode = form.pincode.trim();
  const chargeRaw = form.charge;

  const pincodeValid = useMemo(() => /^\d{6}$/.test(pincode), [pincode]);
  const chargeNumber = useMemo(() => Number(chargeRaw), [chargeRaw]);
  const chargeValid = useMemo(
    () => chargeRaw.trim() !== "" && Number.isFinite(chargeNumber) && chargeNumber >= 0,
    [chargeRaw, chargeNumber]
  );

  const canSave = pincodeValid && chargeValid && !saving && deleting === null;

  const save = async () => {
    setTouched({ pincode: true, charge: true });
    setSaveError(null);
    setSaveMsg(null);

    if (!pincodeValid || !chargeValid) return;

    setSaving(true);
    try {
      await superAdminApi.upsertDeliveryCharge(pincode, chargeNumber);
      setSaveMsg("✓ Saved delivery charge.");
      setForm({ pincode: "", charge: "" });
      setTouched({ pincode: false, charge: false });
      load();
    } catch (e) {
      setSaveError(getApiErrorMessage(e).message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (rulePincode: string) => {
    setError(null);
    setSaveError(null);
    setSaveMsg(null);
    setDeleting(rulePincode);

    try {
      await superAdminApi.deleteDeliveryCharge(rulePincode);
      load();
    } catch (e) {
      setError(getApiErrorMessage(e).message);
    } finally {
      setDeleting(null);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Delivery Charges</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Create, update, or delete a fixed delivery charge per 6-digit pincode.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading || saving || deleting !== null}
          className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Add / Update</h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              inputMode="numeric"
              autoComplete="off"
              placeholder="560001"
              className={inputClass}
              value={form.pincode}
              onBlur={() => setTouched((t) => ({ ...t, pincode: true }))}
              onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
            />
            {touched.pincode && !pincodeValid && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">Pincode must be exactly 6 digits.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Charge <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="30"
              className={inputClass}
              value={form.charge}
              onBlur={() => setTouched((t) => ({ ...t, charge: true }))}
              onChange={(e) => setForm((f) => ({ ...f, charge: e.target.value }))}
            />
            {touched.charge && !chargeValid && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">Charge must be a number ≥ 0.</p>
            )}
          </div>
        </div>

        {saveError && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-100 text-sm font-medium">{saveError}</p>
          </div>
        )}

        {saveMsg && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
            <p className="text-green-700 dark:text-green-100 text-sm font-medium">{saveMsg}</p>
          </div>
        )}

        <button
          onClick={save}
          disabled={!canSave}
          className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="mt-8 bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Existing Rules</h2>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="mt-4 bg-red-50 dark:bg-red-900 rounded-lg p-6 border border-red-200 dark:border-red-700 text-center">
            <p className="text-red-700 dark:text-red-100">{error}</p>
            <button
              onClick={load}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Retry
            </button>
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-zinc-600 dark:text-zinc-400">No delivery charge rules yet.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="text-left text-sm font-semibold text-zinc-700 dark:text-zinc-200 px-4 py-3">Pincode</th>
                  <th className="text-left text-sm font-semibold text-zinc-700 dark:text-zinc-200 px-4 py-3">Charge</th>
                  <th className="text-right text-sm font-semibold text-zinc-700 dark:text-zinc-200 px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {rules.map((r) => {
                  const busy = deleting === r.pincode;
                  return (
                    <tr key={r._id ?? r.pincode} className="bg-white dark:bg-zinc-800">
                      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-white">{r.pincode}</td>
                      <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">{r.charge}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => del(r.pincode)}
                          disabled={busy || saving}
                          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
                        >
                          {busy ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
