"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/superadmin/login");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      {/* A simple, modern loading spinner */}
      <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
      <h2 className="text-lg font-medium">Redirecting to login...</h2>
      <p className="text-sm text-slate-500">Please wait a moment.</p>
    </div>
  );
}