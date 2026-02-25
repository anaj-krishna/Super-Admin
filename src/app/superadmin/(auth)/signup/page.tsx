"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { superAdminApi } from "@/app/lib/superAdminApi";
import { getApiErrorMessage } from "@/app/lib/httpError";

export default function SuperAdminSignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    mobileNumber: "",
    state: "Kerala",
    district: "",
    taluk: "",
    localBodyType: "",
    localBodyName: "",
    ward: "",
    addressLine1: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasAnyAddressFields = useMemo(() => {
    return (
      !!form.mobileNumber.trim() ||
      !!form.state.trim() ||
      !!form.district.trim() ||
      !!form.taluk.trim() ||
      !!form.localBodyType.trim() ||
      !!form.localBodyName.trim() ||
      !!form.ward.trim() ||
      !!form.addressLine1.trim() ||
      !!form.pincode.trim()
    );
  }, [form]);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email, and password are required");
      setLoading(false);
      return;
    }

    if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim())) {
      setError("Pincode must be exactly 6 digits");
      setLoading(false);
      return;
    }

    if (!form.location.trim() && !hasAnyAddressFields) {
      setError("Provide either a location or address details");
      setLoading(false);
      return;
    }

    try {
      await superAdminApi.signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        location: form.location.trim() || undefined,
        mobileNumber: form.mobileNumber.trim() || undefined,
        state: form.state.trim() || undefined,
        district: form.district.trim() || undefined,
        taluk: form.taluk.trim() || undefined,
        localBodyType: form.localBodyType.trim() || undefined,
        localBodyName: form.localBodyName.trim() || undefined,
        ward: form.ward.trim() || undefined,
        addressLine1: form.addressLine1.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
      });
      setSuccess("Registered successfully. Redirecting to login...");
      setTimeout(() => router.push("/superadmin/login"), 800);
    } catch (e) {
      const info = getApiErrorMessage(e);
      setError(info.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full mb-3 p-2 border rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700";

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-zinc-200 dark:border-zinc-800">
      <h1 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">Super Admin Signup</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Name *</label>
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Email *</label>
          <input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Password *</label>
          <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Location (optional)</label>
          <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Kochi, Kerala" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          If you don&apos;t provide a location, fill in address fields below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Mobile Number</label>
            <input className={inputClass} value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">State</label>
            <input className={inputClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">District</label>
            <input className={inputClass} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Taluk</label>
            <input className={inputClass} value={form.taluk} onChange={(e) => setForm({ ...form, taluk: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Local Body Type</label>
            <select className={inputClass} value={form.localBodyType} onChange={(e) => setForm({ ...form, localBodyType: e.target.value })}>
              <option value="">Select Local Body</option>
              <option value="GRAM_PANCHAYAT">Panchayat</option>
              <option value="MUNICIPALITY">Municipality</option>
              <option value="CORPORATION">Corporation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Local Body Name</label>
            <input className={inputClass} value={form.localBodyName} onChange={(e) => setForm({ ...form, localBodyName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Ward</label>
            <input className={inputClass} value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Pincode (6 digits)</label>
            <input className={inputClass} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Address Line 1</label>
            <input className={inputClass} value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      {success && <p className="text-green-700 dark:text-green-300 text-sm mt-3">{success}</p>}

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full mt-6 bg-black text-white py-2 rounded hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Signup"}
      </button>

      <p className="text-sm text-center mt-4 text-zinc-700 dark:text-zinc-300">
        Already have an account?{" "}
        <Link href="/superadmin/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
