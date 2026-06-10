"use client";

import ReportsView from "@/screens/dashboard/components/ReportsView";
import DashboardHeader from "@/screens/dashboard/components/DashboardHeader";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";

export default function DashboardReportsPage() {
  const { live, orderManager } = useDashboardContext();

  return (
    <>
      <DashboardHeader
        kind="reports"
        title="Báo cáo"
        subtitle="Thống kê nhanh từ comment và đơn đã tạo"
      />
      <section className="min-h-0 flex-1 overflow-hidden">
        <ReportsView
          commentsCount={live.comments.length}
          buyingCount={orderManager.buyingCount}
          ordersCount={orderManager.orders.length}
          totalRevenue={orderManager.totalRevenue}
        />
      </section>
    </>
  );
}
