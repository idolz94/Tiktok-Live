"use client";

import SettingsView from "@/features/dashboard/components/SettingsView";
import { useDashboardContext } from "@/features/dashboard";

export default function DashboardSettingsPage() {
  const { user, logout, registeredTikTokUsername, live } = useDashboardContext();

  return (
    <section className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
      <SettingsView
        username={user?.fullName || user?.phone || user?.username || "User"}
        tiktokUsername={live.tiktokUsername || registeredTikTokUsername}
        tiktokChannels={user?.tiktokChannels || []}
        isConnected={live.isConnected}
        status={live.status}
        onLogout={logout}
      />
    </section>
  );
}
