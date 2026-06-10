"use client";

import ShippingView from "@/screens/dashboard/components/ShippingView";
import DashboardHeader from "@/screens/dashboard/components/DashboardHeader";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";

export default function DashboardShippingPage() {
  const { orderManager } = useDashboardContext();

  return (
    <>
      <DashboardHeader kind="sub" title="Vận đơn" />
      <section className="min-h-0 flex-1 overflow-hidden">
        <ShippingView orders={orderManager.orders} />
      </section>
    </>
  );
}
