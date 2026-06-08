"use client";

import SettingsView from "@/screens/dashboard/components/SettingsView";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";

export default function DashboardSettingsPage() {
  const { user, logout, refreshAuth, registeredTikTokUsername, live } = useDashboardContext();

  return (
    <SettingsView
      username={user?.fullName || user?.phone || user?.username || "User"}
      tiktokUsername={live.tiktokUsername || registeredTikTokUsername}
      tiktokChannels={user?.tiktokChannels || []}
      isConnected={live.isConnected}
      status={live.status}
      onChangeTikTokUsername={live.changeTikTokUsername}
      onRefreshAuth={refreshAuth}
      onLogout={logout}
    />
  );
}
