"use client";

import { useRouter } from "next/navigation";
import CustomersView from "@/features/dashboard/components/CustomersView";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import { useDashboardContext } from "@/features/dashboard";

export default function DashboardCustomersPage() {
  const router = useRouter();
  const { orderManager } = useDashboardContext();

  return (
    <>
      <DashboardHeader kind="customers" title="Khách hàng" />
      <section className="min-h-0 flex-1 overflow-hidden">
        <CustomersView
          customers={orderManager.customers}
          onOpenCustomer={(key) => router.push(`/dashboard/customers/${encodeURIComponent(key)}`)}
        />
      </section>
    </>
  );
}
