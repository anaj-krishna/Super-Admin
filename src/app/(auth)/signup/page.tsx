"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "../../lib/api";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
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

  const [error, setError] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const submit = async () => {
    try {
      await api.post("/super-admin/auth/signup", form);
      router.push("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Signup failed");
      } else {
        setError("Signup failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl bg-gray-100 p-6 rounded-lg shadow text-zinc-900">
        <h1 className="text-2xl font-semibold mb-4">Super Admin Signup</h1>

        <input className="input" placeholder="Name"
          onChange={e => handleChange("name", e.target.value)} />

        <input className="input" placeholder="Email"
          onChange={e => handleChange("email", e.target.value)} />

        <input type="password" className="input" placeholder="Password"
          onChange={e => handleChange("password", e.target.value)} />

        <input className="input" placeholder="Mobile Number"
          onChange={e => handleChange("mobileNumber", e.target.value)} />

        <input className="input" placeholder="State" value="Kerala" disabled />

        <input className="input" placeholder="District"
          onChange={e => handleChange("district", e.target.value)} />

        <input className="input" placeholder="Taluk"
          onChange={e => handleChange("taluk", e.target.value)} />

        {/* Local Body Type Dropdown */}
        <select
          className="input"
          onChange={e => handleChange("localBodyType", e.target.value)}
        >
          <option value="">Select Local Body</option>
          <option value="GRAM_PANCHAYAT">Panchayat</option>
          <option value="MUNICIPALITY">Municipality</option>
          <option value="CORPORATION">Corporation</option>
        </select>

        <input className="input" placeholder="Local Body Name"
          onChange={e => handleChange("localBodyName", e.target.value)} />

        <input className="input" placeholder="Ward Number"
          onChange={e => handleChange("ward", e.target.value)} />

        <input className="input" placeholder="Address"
          onChange={e => handleChange("addressLine1", e.target.value)} />

        <input className="input" placeholder="Pincode"
          onChange={e => handleChange("pincode", e.target.value)} />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          onClick={submit}
          className="w-full bg-black text-white py-2 rounded hover:opacity-90"
        >
          Signup
        </button>

        <p className="text-sm text-center mt-4 text-zinc-700">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          margin-bottom: 12px;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
