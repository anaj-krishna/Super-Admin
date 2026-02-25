"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { superAdminApi } from "@/app/lib/superAdminApi";
import { setToken } from "@/app/lib/auth";
import { getApiErrorMessage } from "@/app/lib/httpError";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await superAdminApi.login({ email, password });
      setToken(data.token);
      router.push("/superadmin");
    } catch (e) {
      const info = getApiErrorMessage(e);
      setError(info.statusCode === 401 ? "Invalid email or password" : info.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-zinc-200 dark:border-zinc-800">
      <h1 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">Super Admin Login</h1>

      <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Email</label>
      <input
        className="w-full mb-4 p-2 border rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
        placeholder="admin@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Password</label>
      <input
        type="password"
        className="w-full mb-4 p-2 border rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-sm text-center mt-4 text-zinc-700 dark:text-zinc-300">
        Don&apos;t have an account?{" "}
        <Link href="/superadmin/signup" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
