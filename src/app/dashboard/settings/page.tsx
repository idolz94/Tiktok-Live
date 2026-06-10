"use client";

import SettingsView from "@/screens/dashboard/components/SettingsView";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";

export default function DashboardSettingsPage() {
  const { user, logout, registeredTikTokUsername, live } = useDashboardContext();

  return (
    <section className="min-h-0 flex-1 overflow-hidden">
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
