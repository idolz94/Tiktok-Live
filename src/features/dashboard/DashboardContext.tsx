"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTikTokLiveSocket } from "@/hooks/useTikTokLiveSocket";
import type { BottomTab, LiveComment, TopTab } from "@/types";
import { createOrderCommentKey } from "@/utils/comment";
import DashboardSkeleton from "./components/DashboardSkeleton";
import { useOrderManager } from "@/features/orders/hooks/useOrderManager";

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
  handleCreateOrder: (comment: LiveComment) => Promise<{ success: boolean; orderId: string }>;
  isCommentOrderCreated: (comment: LiveComment) => boolean;
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
  const [createdCommentKeys, setCreatedCommentKeys] = useState<Set<string>>(new Set());

  const registeredTikTokUsername = user?.tiktokUsername || "";
  const reloadShipmentOrdersRef = useRef<() => void>(() => {});

  const live = useTikTokLiveSocket({
    initialUsername: registeredTikTokUsername,
    onOrderShippingUpdated: useCallback(() => {
      reloadShipmentOrdersRef.current();
    }, []),
  });

  const orderManager = useOrderManager({
    comments: live.comments,
    liveSessionId: live.currentLiveSessionId,
    hasOrders: user?.hasOrders ?? false,
  });

  useEffect(() => {
    reloadShipmentOrdersRef.current = () => { void orderManager.reloadShipmentOrders(); };
  }, [orderManager.reloadShipmentOrders]);

  useEffect(() => {
    if (!live.liveError) return;

    toast.error(live.liveError);
    orderManager.setLiveTab("live");
    setLiveControlsHidden(false);
    live.clearLiveError();
  }, [live, orderManager]);

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
        toast.warning("Comment này đã tạo đơn rồi.");
        return { success: false, orderId: "" };
      }

      try {
        createdCommentKeysRef.current.add(commentKey);
        const result = await orderManager.createOrderFromComment(comment);
        setCreatedCommentKeys((prev) => new Set(prev).add(commentKey));

        if (result?.message) {
          toast.success(result.message);
        }

        return { success: true, orderId: result?.orderId ?? "" };
      } catch (error) {
        createdCommentKeysRef.current.delete(commentKey);
        setCreatedCommentKeys((prev) => {
          const next = new Set(prev);
          next.delete(commentKey);
          return next;
        });

        if (process.env.NEXT_PUBLIC_NODE_ENV === "development") console.error("CREATE ORDER ERROR:", error);
        toast.error(error instanceof Error ? error.message : "Tạo đơn thất bại");

        return { success: false, orderId: "" };
      }
    },
    [orderManager],
  );

  const isCommentOrderCreated = useCallback(
    (comment: LiveComment) => {
      return Boolean(comment.isOrderCreated || comment.orderId || createdCommentKeys.has(createOrderCommentKey(comment)));
    },
    [createdCommentKeys],
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
      isCommentOrderCreated,
      disconnectLive,
    };
  }, [
    disconnectLive,
    handleCreateOrder,
    isCommentOrderCreated,
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
