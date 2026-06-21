"use client";

import { useEffect } from "react";
import ShippingView from "@/features/dashboard/components/ShippingView";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import { useDashboardContext } from "@/features/dashboard";

export default function DashboardShippingPage() {
  const { orderManager } = useDashboardContext();
  const { reloadShipmentOrders, shipmentOrders, shipmentLoading, getShippingTracking } = orderManager;

  useEffect(() => {
    void reloadShipmentOrders();
  }, [reloadShipmentOrders]);

  return (
    <>
      <DashboardHeader kind="sub" title="Vận đơn" />
      <section className="mb-16 min-h-0 flex-1 overflow-hidden">
        <ShippingView orders={shipmentOrders} loading={shipmentLoading} getShippingTracking={getShippingTracking} />
      </section>
    </>
  );
}
