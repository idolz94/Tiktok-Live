"use client";

import { useRouter } from "next/navigation";
import PlaceholderView from "@/screens/dashboard/components/PlaceholderView";
import DashboardHeader from "@/screens/dashboard/components/DashboardHeader";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";
import type { LiveHistoryItem } from "@/features/tiktok-live/types";

export default function DashboardHistoryPage() {
  const { live } = useDashboardContext();
  const router = useRouter();

  const handleSelectSession = (item: LiveHistoryItem) => {
    if (item.sessionId) {
      router.push(`/dashboard/history/${item.sessionId}`);
    }
  };

  return (
    <>
      <DashboardHeader kind="sub" title="Lịch sử" />
      <section className="min-h-0 flex-1 overflow-hidden">
        <PlaceholderView liveHistory={live.liveHistory} onSelectSession={handleSelectSession} />
      </section>
    </>
  );
}
