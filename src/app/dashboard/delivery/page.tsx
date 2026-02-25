"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeliveryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/superadmin/delivery-partners");
  }, [router]);

  return null;
}
