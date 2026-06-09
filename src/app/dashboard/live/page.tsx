"use client";

import { useRouter } from "next/navigation";
import HomeView from "@/screens/dashboard/components/HomeView";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";

export default function DashboardLivePage() {
  const router = useRouter();

  const {
    user,
    topTab,
    showChannelSwitcher,
    setShowChannelSwitcher,
    registeredTikTokUsername,
    live,
    orderManager,
    handleCreateOrder,
    setLiveControlsHidden,
  } = useDashboardContext();

  return (
    <HomeView
      topTab={topTab}
      liveTab={orderManager.liveTab}
      comments={live.comments}
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
      onClearComments={live.clearComments}
      onClearOrders={orderManager.clearOrders}
      onCreateOrderFromComment={handleCreateOrder}
      onUpdateOrder={orderManager.updateOrder}
      onDeleteOrder={orderManager.deleteOrder}
      onAddProductToOrder={orderManager.addProductToOrder}
      onToggleDeposit={orderManager.toggleDepositStatus}
      onConfirmOrder={orderManager.confirmOrder}
      onOpenOrderOverview={(orderId) => router.push(`/dashboard/orders/${orderId}`)}
      depositLoadingIds={orderManager.depositLoadingIds}
      tiktokUsername={live.tiktokUsername || registeredTikTokUsername}
      tiktokChannels={user?.tiktokChannels || []}
      isConnected={live.isConnected}
      showChannelSwitcher={showChannelSwitcher}
      onShowChannelSwitcherChange={setShowChannelSwitcher}
      onConnectTikTokLive={live.changeTikTokUsername}
      onLiveControlsHiddenChange={setLiveControlsHidden}
    />
  );
}
