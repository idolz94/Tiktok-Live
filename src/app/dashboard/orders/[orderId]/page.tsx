"use client";

import { useParams, useRouter } from "next/navigation";
import OrderOverviewScreen from "@/features/orders/components/OrderOverviewScreen";
import { useDashboardContext } from "@/features/dashboard";

export default function DashboardOrderOverviewPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const { orderManager, user } = useDashboardContext();
  const order = orderManager.orders.find((item) => item.id === params.orderId);

  if (!order) {
    return (
      <main className="min-h-dvh bg-white">
        <div className="mx-auto flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
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
      onUpdateProduct={orderManager.updateProductInOrder}
      onShippingSubmitted={() => {
        void orderManager.reloadOrders();
        router.back();
      }}
      isDepositLoading={orderManager.depositLoadingIds.has(order.id)}
      userName={user?.username ?? undefined}
      onCustomerClick={(key) => router.push(`/dashboard/customers/${encodeURIComponent(key)}`)}
    />
  );
}
