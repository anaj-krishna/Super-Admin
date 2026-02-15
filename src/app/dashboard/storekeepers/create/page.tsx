"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "../../../lib/api";

interface RegisterPayload {
  name: string;
  email: string;
  address: string;
  serviceablePincodes: string[];
  password: string;
  role: "ADMIN" | "DELIVERY";
  address2?: string;
  mobileNumber?: string;
}

export default function CreateStorekeeper() {
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
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const payload: RegisterPayload = {
        name: form.name,
        email: form.email,
        address: form.address,
        serviceablePincodes: form.serviceablePincodes.split(",").map((p) => p.trim()).filter(p => p),
        password: form.password,
        role: "ADMIN", // ADMIN role for storekeeper
      };
      
      // Add optional fields only if provided
      if (form.address2.trim()) payload.address2 = form.address2.trim();
      if (form.mobileNumber.trim()) payload.mobileNumber = form.mobileNumber.trim();
      
      await api.post("/super-admin/auth/create-storekeeper", payload);
      setMsg("✓ Storekeeper created successfully!");
      setTimeout(() => router.push("/dashboard/storekeepers"), 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Error creating storekeeper");
      } else {
        setError("Error creating storekeeper");
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name", label: "Full Name", type: "text", required: true, autoComplete: "name" },
    { key: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
    { key: "address", label: "Address", type: "text", required: true, autoComplete: "street-address" },
    { key: "address2", label: "Address Line 2 (Optional)", type: "text", required: false, autoComplete: "address-line2" },
    { key: "mobileNumber", label: "Mobile Number", type: "tel", required: false, autoComplete: "tel" },
    { key: "serviceablePincodes", label: "Serviceable Pincodes (comma-separated)", type: "text", required: true, autoComplete: "off" },
    { key: "password", label: "Password", type: "password", required: true, autoComplete: "new-password" },
  ];

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Create Storekeeper</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">Add a new storekeeper to the system</p>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 border border-zinc-200 dark:border-zinc-700">
        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={field.type}
                placeholder={field.label}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                required={field.required}
                autoComplete={field.autoComplete}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          ))}
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
