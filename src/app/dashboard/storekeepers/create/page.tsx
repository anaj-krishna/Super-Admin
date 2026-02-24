"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateStorekeeper() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/superadmin/storekeepers/create");
  }, [router]);

  return null;
}
