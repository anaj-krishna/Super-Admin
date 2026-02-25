"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StorekeepersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/superadmin/storekeepers");
  }, [router]);

  return null;
}
