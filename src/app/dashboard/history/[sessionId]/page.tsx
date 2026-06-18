"use client";

import { useParams, useRouter } from "next/navigation";
import LiveSessionDetailScreen from "@/features/dashboard/components/LiveSessionDetailScreen";
import { useDashboardContext } from "@/features/dashboard";

export default function DashboardLiveSessionDetailPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { live, orderManager } = useDashboardContext();
  const session = live.liveHistory.find((item) => item.sessionId === params.sessionId);

  if (live.isHistoryLoading) {
    return (
      <main className="h-dvh bg-white">
        <div className="mx-auto flex h-full flex-col bg-white px-4 pt-3">
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 animate-pulse rounded-full bg-[#f2f2f2]" />
            <div className="h-11 w-11 animate-pulse rounded-full bg-[#f2f2f2]" />
          </div>
          <div className="mt-4 h-7 w-48 animate-pulse rounded-lg bg-[#f2f2f2]" />
          <div className="mt-3 h-4 w-32 animate-pulse rounded-md bg-[#f2f2f2]" />
          <div className="mt-6 grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#f2f2f2]" />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="h-6 w-28 animate-pulse rounded-md bg-[#f2f2f2]" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-[#f2f2f2]" />
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#f2f2f2]" />
            ))}
          </div>
        </div>
      </main>
    );
  }

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
