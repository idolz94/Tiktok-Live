"use client";

import { useParams, useRouter } from "next/navigation";
import LiveSessionDetailScreen from "@/features/dashboard/components/LiveSessionDetailScreen";
import { useDashboardContext } from "@/features/dashboard";

export default function DashboardLiveSessionDetailPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { live, orderManager } = useDashboardContext();
  const session = live.liveHistory.find((item) => item.sessionId === params.sessionId);

  if (!session) {
    return (
      <main className="min-h-dvh bg-white">
        <div className="mx-auto flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
          <p className="text-[16px] font-semibold text-[#2b2b2b]">Không tìm thấy phiên LIVE</p>
          <button
            type="button"
            onClick={() => router.replace("/dashboard/history")}
            className="mt-4 rounded-full bg-[#ff6b8a] px-5 py-3 text-[14px] font-semibold text-white"
          >
            Quay lại lịch sử
          </button>
        </div>
      </main>
    );
  }

  return (
    <LiveSessionDetailScreen
      session={session}
      onBack={() => router.back()}
      onUpdateOrder={orderManager.updateOrder}
      onDeleteOrder={orderManager.deleteOrder}
      onAddProductToOrder={orderManager.addProductToOrder}
      onToggleDeposit={orderManager.toggleDepositStatus}
      onConfirmOrder={orderManager.confirmOrder}
      onOpenOrderOverview={(orderId) => router.push(`/dashboard/orders/${orderId}`)}
      depositLoadingIds={orderManager.depositLoadingIds}
    />
  );
}
