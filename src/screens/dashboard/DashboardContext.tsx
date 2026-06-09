"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTikTokLiveSocket } from "@/hooks/useTikTokLiveSocket";
import type { BottomTab, LiveComment, TopTab } from "@/types";
import { createOrderCommentKey } from "@/utils/comment";
import DashboardSkeleton from "./components/DashboardSkeleton";
import { useOrderManager } from "./hooks/useOrderManager";

type DashboardContextValue = {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  logout: ReturnType<typeof useAuth>["logout"];
  refreshAuth: ReturnType<typeof useAuth>["refreshAuth"];
  topTab: TopTab;
  setTopTab: (tab: TopTab) => void;
  showChannelSwitcher: boolean;
  setShowChannelSwitcher: (value: boolean) => void;
  liveControlsHidden: boolean;
  setLiveControlsHidden: (hidden: boolean) => void;
  isDisconnecting: boolean;
  registeredTikTokUsername: string;
  live: ReturnType<typeof useTikTokLiveSocket>;
  orderManager: ReturnType<typeof useOrderManager>;
  handleCreateOrder: (comment: LiveComment) => Promise<boolean>;
  disconnectLive: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout, refreshAuth } = useAuth();
  const [topTab, setTopTab] = useState<TopTab>("tiktok");
  const [showChannelSwitcher, setShowChannelSwitcher] = useState(false);
  const [liveControlsHidden, setLiveControlsHidden] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const createdCommentKeysRef = useRef<Set<string>>(new Set());

  const registeredTikTokUsername = user?.tiktokUsername || "";
  const live = useTikTokLiveSocket({
    initialUsername: registeredTikTokUsername,
  });

  const orderManager = useOrderManager({
    comments: live.comments,
    liveSessionId: live.currentLiveSessionId,
  });

  const disconnectLive = useCallback(async () => {
    if (isDisconnecting) return;

    try {
      setIsDisconnecting(true);
      await live.disconnect();
    } finally {
      setIsDisconnecting(false);
    }
  }, [isDisconnecting, live]);

  const handleCreateOrder = useCallback(
    async (comment: LiveComment) => {
      const commentKey = createOrderCommentKey(comment);

      if (createdCommentKeysRef.current.has(commentKey)) {
        alert("Comment này đã tạo đơn rồi.");
        return false;
      }

      try {
        createdCommentKeysRef.current.add(commentKey);
        const result = await orderManager.createOrderFromComment(comment);

        if (result?.message) {
          toast.success(result.message);
        }

        return true;
      } catch (error) {
        createdCommentKeysRef.current.delete(commentKey);

        if (process.env.NEXT_PUBLIC_NODE_ENV === "development") console.error("CREATE ORDER ERROR:", error);
        alert(error instanceof Error ? error.message : "Tạo đơn thất bại");

        return false;
      }
    },
    [orderManager],
  );

  const dashboardContextValue = useMemo<DashboardContextValue | null>(() => {
    if (!user) return null;

    return {
      user,
      logout,
      refreshAuth,
      topTab,
      setTopTab,
      showChannelSwitcher,
      setShowChannelSwitcher,
      liveControlsHidden,
      setLiveControlsHidden,
      isDisconnecting,
      registeredTikTokUsername,
      live,
      orderManager,
      handleCreateOrder,
      disconnectLive,
    };
  }, [
    disconnectLive,
    handleCreateOrder,
    isDisconnecting,
    live,
    logout,
    orderManager,
    refreshAuth,
    registeredTikTokUsername,
    showChannelSwitcher,
    liveControlsHidden,
    topTab,
    user,
  ]);

  if (isLoading) return <DashboardSkeleton />;
  if (!dashboardContextValue) return null;

  return <DashboardContext.Provider value={dashboardContextValue}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboardContext must be used inside DashboardProvider");
  }

  return context;
}

export function getDashboardTabFromPathname(pathname: string): BottomTab {
  if (pathname.startsWith("/dashboard/customers")) return "customers";
  if (pathname.startsWith("/dashboard/shipping")) return "shipping";
  if (pathname.startsWith("/dashboard/history")) return "history";
  if (pathname.startsWith("/dashboard/reports")) return "reports";
  if (pathname.startsWith("/dashboard/settings")) return "settings";
  return "home";
}
