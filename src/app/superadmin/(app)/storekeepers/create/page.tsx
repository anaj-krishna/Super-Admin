"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { superAdminApi } from "@/app/lib/superAdminApi";
import { getApiErrorMessage } from "@/app/lib/httpError";

export default function CreateStorekeeperPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    address2: "",
    mobileNumber: "",
    serviceablePincodes: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      const pincodes = form.serviceablePincodes
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      await superAdminApi.createStorekeeper({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        address2: form.address2.trim() || undefined,
        mobileNumber: form.mobileNumber.trim() || undefined,
        serviceablePincodes: pincodes,
        password: form.password,
      });

      setMsg("✓ Storekeeper created successfully!");
      setTimeout(() => router.push("/superadmin/storekeepers"), 900);
    } catch (e) {
      setError(getApiErrorMessage(e).message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Create Storekeeper</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">Add a new storekeeper to the system</p>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 border border-zinc-200 dark:border-zinc-700">
        <div className="space-y-6">
          <Field label="Full Name" required>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
            />
          </Field>

          <Field label="Email" required>
            <input
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </Field>

          <Field label="Address" required>
            <input
              className={inputClass}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              autoComplete="street-address"
            />
          </Field>

          <Field label="Address Line 2 (Optional)">
            <input
              className={inputClass}
              value={form.address2}
              onChange={(e) => setForm({ ...form, address2: e.target.value })}
              autoComplete="address-line2"
            />
          </Field>

          <Field label="Mobile Number (Optional)">
            <input
              className={inputClass}
              value={form.mobileNumber}
              onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
              autoComplete="tel"
            />
          </Field>

          <Field label="Serviceable Pincodes (comma-separated)" required>
            <input
              className={inputClass}
              value={form.serviceablePincodes}
              onChange={(e) => setForm({ ...form, serviceablePincodes: e.target.value })}
              placeholder="560001, 560002"
              autoComplete="off"
            />
          </Field>

          <Field label="Password" required>
            <input
              type="password"
              className={inputClass}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
          </Field>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-100 text-sm font-medium">{error}</p>
          </div>
        )}

        {msg && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
            <p className="text-green-700 dark:text-green-100 text-sm font-medium">{msg}</p>
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? "Creating..." : "Create Storekeeper"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
