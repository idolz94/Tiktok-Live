"use client";

import ShippingView from "@/screens/dashboard/components/ShippingView";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";

export default function DashboardShippingPage() {
  const { orderManager } = useDashboardContext();

  return <ShippingView orders={orderManager.orders} />;
}
