"use client";

import { useCallback, useRef, useState } from "react";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../hooks/useAuth";
import { useTikTokLiveSocket } from "../hooks/useTikTokLiveSocket";
import { BottomTab, LiveComment, TopTab } from "../types";
import OrderOverviewScreen from "./OrderOverviewScreen";
import CustomersView from "./dashboard/components/CustomersView";
import HomeView from "./dashboard/components/HomeView";
import ReportsView from "./dashboard/components/ReportsView";
import SessionHeader from "./dashboard/components/SessionHeader";
import SettingsView from "./dashboard/components/SettingsView";
import ShippingView from "./dashboard/components/ShippingView";
import TopSegmentTabs from "./dashboard/components/TopSegmentTabs";
import { useOrderManager } from "./dashboard/hooks/useOrderManager";
import { createOrderCommentKey } from "@/utils/comment";

export default function DashboardScreen() {
  const { user, logout } = useAuth();
 const registeredTikTokUsername = user?.tiktokUsername || "";

const {
  status,
  isConnected,
  comments,
  clearComments,
  tiktokUsername,
  changeTikTokUsername,
  currentLiveSession,
  liveHistory,
} = useTikTokLiveSocket({
  initialUsername: registeredTikTokUsername,
});

  const [topTab, setTopTab] = useState<TopTab>("connect");
  const [bottomTab, setBottomTab] = useState<BottomTab>("home");
  const createdCommentKeysRef = useRef<Set<string>>(new Set());
  const orderManager = useOrderManager({
    comments,
    onAfterCreateOrder: () => setBottomTab("home"),
  });

const handleCreateOrder = async (comment: LiveComment) => {
  const commentKey = createOrderCommentKey(comment);

  if (createdCommentKeysRef.current.has(commentKey)) {
    alert("Comment này đã tạo đơn rồi.");
    return false;
  }

  try {
    createdCommentKeysRef.current.add(commentKey);

    await orderManager.createOrderFromComment(comment);

    return true;
  } catch (error) {
    createdCommentKeysRef.current.delete(commentKey);

    console.log("CREATE ORDER ERROR:", error);
    alert(error instanceof Error ? error.message : "Tạo đơn thất bại");

    return false;
  }
};

  const renderCurrentBottomView = useCallback(() => {
    if (bottomTab === "home") {
      return (
        <HomeView
          topTab={topTab}
          liveTab={orderManager.liveTab}
          comments={comments}
          orders={orderManager.orders}
          filteredOrders={orderManager.filteredOrders}
          orderFilter={orderManager.orderFilter}
          orderSearchText={orderManager.orderSearchText}
          buyingCount={orderManager.buyingCount}
          paidOrders={orderManager.paidOrders}
          draftOrders={orderManager.draftOrders}
          confirmedOrders={orderManager.confirmedOrders}
          orderProductCount={orderManager.orderProductCount}
          onChangeLiveTab={orderManager.setLiveTab}
          onChangeOrderFilter={orderManager.setOrderFilter}
          onChangeOrderSearchText={orderManager.setOrderSearchText}
          onClearComments={clearComments}
          onClearOrders={orderManager.clearOrders}
          // onCreateOrderFromComment={orderManager.createOrderFromComment}
          onCreateOrderFromComment={handleCreateOrder}
          onUpdateOrder={orderManager.updateOrder}
          onDeleteOrder={orderManager.deleteOrder}
          onAddProductToOrder={orderManager.addProductToOrder}
          onToggleDeposit={orderManager.toggleDepositStatus}
          onConfirmOrder={orderManager.confirmOrder}
          onOpenOrderOverview={orderManager.openOrderOverview}
          liveHistory={liveHistory}
        />
      );
    }

    if (bottomTab === "customers") return <CustomersView customers={orderManager.customers} />;
    if (bottomTab === "shipping") return <ShippingView orders={orderManager.orders} />;
    if (bottomTab === "reports") {
      return (
        <ReportsView
          commentsCount={comments.length}
          buyingCount={orderManager.buyingCount}
          ordersCount={orderManager.orders.length}
          totalRevenue={orderManager.totalRevenue}
        />
      );
    }

    return (
      <SettingsView
        username={user?.fullName || user?.phone || user?.username || "User"}
        tiktokUsername={tiktokUsername || registeredTikTokUsername}
        isConnected={isConnected}
        status={status}
        onChangeTikTokUsername={changeTikTokUsername}
        onLogout={logout}
      />
    );
  }, [
    bottomTab,
    changeTikTokUsername,
    clearComments,
    comments,
    isConnected,
    logout,
    orderManager,
    status,
    tiktokUsername,
    topTab,
    user?.username,
  ]);

  if (orderManager.selectedOrder) {
    return (
      <OrderOverviewScreen
        order={orderManager.selectedOrder}
        onBack={orderManager.closeOrderOverview}
        onConfirm={orderManager.confirmOrder}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7f8]">
      <div className="mx-auto flex min-h-screen max-w-[620px] flex-col bg-[#f4f7f8] shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
        <SessionHeader
          isConnected={isConnected}
          status={status}
          tiktokUsername={tiktokUsername}
          currentLiveSession={currentLiveSession}
        />
        {bottomTab === "home" && <TopSegmentTabs activeTab={topTab} onChange={setTopTab} />}
        <section className="mb-16 flex min-h-0 flex-1 flex-col">
          {renderCurrentBottomView()}
        </section>
        <BottomNav active={bottomTab} onChange={setBottomTab} />
      </div>
    </main>
  );
}
