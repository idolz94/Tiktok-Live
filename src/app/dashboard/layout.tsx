"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import IphoneRouteTransition from "@/features/dashboard/components/IphoneRouteTransition";
import {
  DashboardProvider,
  getDashboardTabFromPathname,
  useDashboardContext,
} from "@/features/dashboard";

function isDetailPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard/customers/") ||
    pathname.startsWith("/dashboard/history/") ||
    pathname.startsWith("/dashboard/orders/")
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    user,
    topTab,
    live,
    orderManager,
    isDisconnecting,
    registeredTikTokUsername,
    setShowChannelSwitcher,
    liveControlsHidden,
    disconnectLive,
  } = useDashboardContext();
  const activeTab = getDashboardTabFromPathname(pathname);

  if (isDetailPath(pathname)) {
    return (
      <main className="h-dvh overflow-hidden bg-white">
        <div className="mx-auto h-full max-w-155 bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
          <IphoneRouteTransition>{children}</IphoneRouteTransition>
        </div>
      </main>
    );
  }

  return (
    <main className="h-dvh overflow-hidden bg-white">
      <div className="mx-auto flex h-full max-w-155 flex-col bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
        <IphoneRouteTransition>{children}</IphoneRouteTransition>
        <BottomNav
          username={user?.fullName || user?.phone || user?.username || "User"}
          footerHidden={liveControlsHidden && live.isConnected && activeTab === "home"}
          liveBar={
            live.isConnected && activeTab === "home" && topTab === "tiktok" && orderManager.liveTab === "live"
              ? {
                  username: live.tiktokUsername || registeredTikTokUsername,
                  commentsCount: live.comments.length,
                  ordersCount: orderManager.orders.length,
                  isDisconnecting,
                  onSwitchChannel: () => setShowChannelSwitcher(true),
                  onDisconnect: disconnectLive,
                }
              : undefined
          }
        />
      </div>
    </main>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
