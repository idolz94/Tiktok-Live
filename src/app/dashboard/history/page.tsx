"use client";

import { useRouter } from "next/navigation";
import PlaceholderView from "@/screens/dashboard/components/PlaceholderView";
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

  return <PlaceholderView liveHistory={live.liveHistory} onSelectSession={handleSelectSession} />;
}
