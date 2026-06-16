"use client";

import { useRouter } from "next/navigation";
import HomeView from "@/features/dashboard/components/HomeView";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import { useDashboardContext } from "@/features/dashboard";

export default function DashboardLivePage() {
  const router = useRouter();

  const {
    user,
    topTab,
    setTopTab,
    showChannelSwitcher,
    setShowChannelSwitcher,
    registeredTikTokUsername,
    live,
    orderManager,
    handleCreateOrder,
    isCommentOrderCreated,
    setLiveControlsHidden,
    refreshAuth,
  } = useDashboardContext();

  return (
    <>
      <DashboardHeader kind="home" activeTab={topTab} onChangeTab={setTopTab} />
      <section className="min-h-0 flex-1 overflow-hidden">
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
          onCreateOrderFromComment={handleCreateOrder}
          isCommentOrderCreated={isCommentOrderCreated}
          onUpdateOrder={orderManager.updateOrder}
          onDeleteOrder={orderManager.deleteOrder}
          onAddProductToOrder={orderManager.addProductToOrder}
          onToggleDeposit={orderManager.toggleDepositStatus}
          onConfirmOrder={orderManager.confirmOrder}
          onOpenOrderOverview={(orderId) => router.push(`/dashboard/orders/${orderId}`)}
          depositLoadingIds={orderManager.depositLoadingIds}
          orderLoading={orderManager.orderLoading}
          tiktokUsername={live.tiktokUsername || registeredTikTokUsername}
          tiktokChannels={user?.tiktokChannels || []}
          isConnected={live.isConnected}
          isConnecting={live.isConnecting}
          showChannelSwitcher={showChannelSwitcher}
          onShowChannelSwitcherChange={setShowChannelSwitcher}
          onConnectTikTokLive={live.changeTikTokUsername}
          onLiveControlsHiddenChange={setLiveControlsHidden}
          onChannelAdded={refreshAuth}
        />
      </section>
    </>
  );
}
