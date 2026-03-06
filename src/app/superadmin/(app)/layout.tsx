"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "@/app/lib/auth";

export default function SuperAdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/superadmin/login");
      return;
    }
    const timer = setTimeout(() => setChecked(true), 0);
    return () => clearTimeout(timer);
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "My Profile", href: "/superadmin" },
    { label: "Storekeepers", href: "/superadmin/storekeepers" },
    { label: "Delivery Partners", href: "/superadmin/delivery-partners" },
    { label: "Delivery Charges", href: "/superadmin/delivery-charges" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-zinc-900 text-white flex flex-col">
        <div className="p-6 border-b border-zinc-700">
          <h1 className="text-xl font-bold">Super Admin</h1>
          <p className="text-sm text-zinc-400 mt-1">Control Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-blue-600 text-white font-medium"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-700">
          <button
            onClick={() => {
              clearToken();
              router.push("/superadmin/login");
            }}
            className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900 overflow-auto">
        {children}
      </main>
    </div>
  );
}
