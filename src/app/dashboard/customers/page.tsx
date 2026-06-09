"use client";

import { useRouter } from "next/navigation";
import CustomersView from "@/screens/dashboard/components/CustomersView";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";

export default function DashboardCustomersPage() {
  const router = useRouter();
  const { orderManager } = useDashboardContext();

  return (
    <CustomersView
      customers={orderManager.customers}
      onOpenCustomer={(key) => router.push(`/dashboard/customers/${encodeURIComponent(key)}`)}
    />
  );
}
