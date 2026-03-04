"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { superAdminApi } from "@/app/lib/superAdminApi";
import { getApiErrorMessage } from "@/app/lib/httpError";

export default function CreateDeliveryPartnerPage() {
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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      const pincodes = form.serviceablePincodes
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      await superAdminApi.createDeliveryBoy({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        address2: form.address2.trim() || undefined,
        mobileNumber: form.mobileNumber.trim() || undefined,
        serviceablePincodes: pincodes,
        password: form.password,
      });

      setMsg("✓ Delivery partner created successfully!");
      setTimeout(() => router.push("/superadmin/delivery-partners"), 900);
    } catch (e) {
      setError(getApiErrorMessage(e).message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all";

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Link 
        href="/superadmin/delivery-partners"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Delivery Partners
      </Link>

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Create Delivery Partner</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">Add a new delivery partner to the system to handle order fulfillment.</p>

      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <form onSubmit={submit} className="p-6 sm:p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Field label="Full Name" required>
              <input
                required
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Doe"
                autoComplete="name"
              />
            </Field>

            <Field label="Email Address" required>
              <input
                required
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="delivery@example.com"
                autoComplete="email"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Primary Address" required>
                <input
                  required
                  className={inputClass}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. MG Road, Ernakulam"
                  autoComplete="street-address"
                />
              </Field>
            </div>

            <Field label="Address Line 2 (Optional)">
              <input
                className={inputClass}
                value={form.address2}
                onChange={(e) => setForm({ ...form, address2: e.target.value })}
                placeholder="Apartment, landmark, etc."
                autoComplete="address-line2"
              />
            </Field>

            <Field label="Mobile Number (Optional)">
              <input
                type="tel"
                className={inputClass}
                value={form.mobileNumber}
                onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                placeholder="+91..."
                autoComplete="tel"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Serviceable Pincodes (comma-separated)" required>
                <input
                  required
                  className={inputClass}
                  value={form.serviceablePincodes}
                  onChange={(e) => setForm({ ...form, serviceablePincodes: e.target.value })}
                  placeholder="e.g. 682001, 682011"
                  autoComplete="off"
                />
              </Field>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <Field label="Account Password" required>
                <input
                  required
                  type="password"
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Set a secure password"
                  autoComplete="new-password"
                />
              </Field>
            </div>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl animate-in fade-in">
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {msg && (
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl animate-in fade-in">
              <p className="text-green-700 dark:text-green-400 text-sm font-medium">{msg}</p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : "Create Delivery Partner"}
            </button>
          </div>
        </form>
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
      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1" title="Required">*</span>}
      </label>
      {children}
    </div>
  );
}