"use client";

import { useEffect } from "react";
import ShippingView from "@/features/dashboard/components/ShippingView";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import { useDashboardContext } from "@/features/dashboard";

export default function DashboardShippingPage() {
  const { orderManager } = useDashboardContext();

  useEffect(() => {
    void orderManager.reloadShipmentOrders();
  }, [orderManager.reloadShipmentOrders]);

  return (
    <>
      <DashboardHeader kind="sub" title="Vận đơn" />
      <section className="min-h-0 flex-1 overflow-hidden mb-16">
        <ShippingView
          orders={orderManager.shipmentOrders}
          loading={orderManager.shipmentLoading}
          getShippingTracking={orderManager.getShippingTracking}
        />
      </section>
    </>
  );
}
