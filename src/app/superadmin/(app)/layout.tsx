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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Track mobile menu state

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
  ];

  const isActive = (href: string) => pathname === href;

  // Helper to close menu and handle logout
  const handleLogout = () => {
    clearToken();
    router.push("/superadmin/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-900">
      
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between bg-zinc-900 text-white p-4 border-b border-zinc-800 shrink-0">
        <h1 className="text-lg font-bold">Super Admin</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-zinc-300 hover:text-white focus:outline-none"
          aria-label="Open menu"
        >
          {/* Hamburger SVG Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* MOBILE SLIDE-OUT MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Dark overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Menu Drawer */}
          <aside className="relative flex flex-col w-64 max-w-sm bg-zinc-900 text-white h-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div>
                <h1 className="text-xl font-bold">Super Admin</h1>
                <p className="text-sm text-zinc-400 mt-1">Control Panel</p>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-zinc-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
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

            <div className="p-4 border-t border-zinc-800">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-sm font-medium transition-colors border border-red-600/20"
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-zinc-900 text-white flex-col shrink-0 border-r border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold">Super Admin</h1>
          <p className="text-sm text-zinc-400 mt-1">Control Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      {/* overflow-hidden on the wrapper and overflow-auto here ensures only this part scrolls! */}
      <main className="flex-1 overflow-auto w-full">
        {children}
      </main>

    </div>
  );
}