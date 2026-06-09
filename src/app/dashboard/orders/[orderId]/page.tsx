"use client";

import { useParams, useRouter } from "next/navigation";
import OrderOverviewScreen from "@/screens/OrderOverviewScreen";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";

export default function DashboardOrderOverviewPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const { orderManager } = useDashboardContext();
  const order = orderManager.orders.find((item) => item.id === params.orderId);

  if (!order) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-155 flex-col items-center justify-center bg-white px-6 text-center">
          <p className="text-[16px] font-semibold text-[#2b2b2b]">Không tìm thấy đơn hàng</p>
          <button
            type="button"
            onClick={() => router.replace("/dashboard/live")}
            className="mt-4 rounded-full bg-[#ff6b8a] px-5 py-3 text-[14px] font-semibold text-white"
          >
            Quay lại LIVE
          </button>
        </div>
      </main>
    );
  }

  return (
    <OrderOverviewScreen
      order={order}
      onBack={() => router.back()}
      onToggleDeposit={orderManager.toggleDepositStatus}
      onAddProduct={orderManager.addProductToOrder}
      onDeleteProduct={orderManager.removeProductFromOrder}
      isDepositLoading={orderManager.depositLoadingIds.has(order.id)}
    />
  );
}
