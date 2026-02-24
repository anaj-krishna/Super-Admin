"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateDeliveryBoy() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/superadmin/delivery-partners/create");
  }, [router]);

  return null;
}
