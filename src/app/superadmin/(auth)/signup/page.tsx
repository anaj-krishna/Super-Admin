"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, FormEvent } from "react";
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
    const fields = [
      form.mobileNumber, form.state, form.district, form.taluk, 
      form.localBodyType, form.localBodyName, form.ward, 
      form.addressLine1, form.pincode
    ];
    return fields.some(field => field.trim() !== "");
  }, [form]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      setError("Please provide either a general location or full address details");
      setLoading(false);
      return;
    }

    try {
      await superAdminApi.signup({
        ...form,
        location: form.location.trim() || undefined,
      });
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => router.push("/superadmin/login"), 1500);
    } catch (e) {
      setError(getApiErrorMessage(e).message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm";
  const labelStyle = "block text-xs font-semibold uppercase tracking-wider mb-1.5 text-zinc-500 dark:text-zinc-400 ml-1";

  return (
    <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 p-6 md:p-10 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">
      
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Create Admin Account</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Join the platform to start managing your local resources.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Credentials */}
        <section>
          <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px]">01</span>
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Full Name *</label>
              <input className={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelStyle}>Email Address *</label>
              <input type="email" className={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@example.com" />
            </div>
            <div>
              <label className={labelStyle}>Password *</label>
              <input type="password" className={inputStyle} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div>
              <label className={labelStyle}>General Location</label>
              <input className={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Kochi, Kerala" />
            </div>
          </div>
        </section>

        {/* Section 2: Detailed Address */}
        <section className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px]">02</span>
            Detailed Address (Optional if location provided)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelStyle}>Mobile</label>
              <input className={inputStyle} value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} placeholder="+91..." />
            </div>
            <div>
              <label className={labelStyle}>State</label>
              <input className={inputStyle} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div>
              <label className={labelStyle}>District</label>
              <input className={inputStyle} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="Ernakulam" />
            </div>
            <div>
              <label className={labelStyle}>Local Body Type</label>
              <select className={inputStyle} value={form.localBodyType} onChange={(e) => setForm({ ...form, localBodyType: e.target.value })}>
                <option value="">Select Type</option>
                <option value="GRAM_PANCHAYAT">Panchayat</option>
                <option value="MUNICIPALITY">Municipality</option>
                <option value="CORPORATION">Corporation</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}>Local Body Name</label>
              <input className={inputStyle} value={form.localBodyName} onChange={(e) => setForm({ ...form, localBodyName: e.target.value })} placeholder="Name of Panchayat/Municipality" />
            </div>
            <div>
              <label className={labelStyle}>Taluk</label>
              <input className={inputStyle} value={form.taluk} onChange={(e) => setForm({ ...form, taluk: e.target.value })} />
            </div>
            <div>
              <label className={labelStyle}>Ward</label>
              <input className={inputStyle} value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
            </div>
            <div>
              <label className={labelStyle}>Pincode</label>
              <input className={inputStyle} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="682XXX" />
            </div>
            <div className="md:col-span-3">
              <label className={labelStyle}>Address Line 1</label>
              <input className={inputStyle} value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} placeholder="House name, Street, etc." />
            </div>
          </div>
        </section>

        {/* Status Messages */}
        {(error || success) && (
          <div className={`p-4 rounded-xl border ${error ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400' : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-800 dark:text-green-300'} text-sm font-medium text-center animate-in fade-in`}>
            {error || success}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </>
            ) : "Create Admin Account"}
          </button>
          
          <p className="text-center mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/superadmin/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}