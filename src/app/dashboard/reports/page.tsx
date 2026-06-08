"use client";

import ReportsView from "@/screens/dashboard/components/ReportsView";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";

export default function DashboardReportsPage() {
  const { live, orderManager } = useDashboardContext();

  return (
    <ReportsView
      commentsCount={live.comments.length}
      buyingCount={orderManager.buyingCount}
      ordersCount={orderManager.orders.length}
      totalRevenue={orderManager.totalRevenue}
    />
  );
}
