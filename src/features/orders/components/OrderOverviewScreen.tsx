"use client";

import type { Order, OrderProduct } from "@/types";
import { ProductDrawer } from "./ProductDrawer";
import { ShippingCreateScreen } from "./ShippingCreateScreen";
import { useOrderOverview } from "../hooks/useOrderOverview";
import { BackIcon, PrinterIcon, ShareIcon } from "./icons";
import { formatOrderDate, statusLabel } from "../utils/orderOverview";
import { buildDeliverySlipHtml } from "../utils/printHtml";
import { listShopAddressesApi } from "@/lib/addresses";
import { OrderCustomerSection } from "./OrderCustomerSection";
import { OrderProductsSection } from "./OrderProductsSection";
import { OrderShippingSection } from "./OrderShippingSection";
import { ShippingDrawer } from "./ShippingDrawer";
import { OrderFooterActions } from "./OrderFooterActions";

type Props = {
  order: Order;
  onBack: () => void;
  onToggleDeposit: (orderId: string) => void;
  onAddProduct?: (orderId: string, product: OrderProduct) => void;
  onDeleteProduct?: (orderId: string, itemId: string) => void;
  onUpdateProduct?: (orderId: string, itemId: string, updates: Partial<OrderProduct>) => void;
  onShippingSubmitted?: () => void;
  isDepositLoading?: boolean;
  userName?: string;
  onCustomerClick?: (customerKey: string) => void;
};

export default function OrderOverviewScreen({
  order,
  onBack,
  onToggleDeposit,
  onAddProduct,
  onDeleteProduct: _onDeleteProduct,
  onUpdateProduct,
  onShippingSubmitted,
  isDepositLoading = false,
  userName,
  onCustomerClick,
}: Props) {

  const {
    addProductOpen,
    setAddProductOpen,
    editProductOpen,
    setEditProductOpen,
    showAllProducts,
    setShowAllProducts,
    showShippingCreateScreen,
    setShowShippingCreateScreen,
    showShippingDrawer,
    setShowShippingDrawer,
    selectedShippingProvider,
    setSelectedShippingProvider,
    shippingFeeInput,
    setShippingFeeInput,
    prepaidAmountInput,
    setPrepaidAmountInput,
    defaultCustomerAddress,
    fetchedCustomerPhone,
    products,
    productTotal,
    shippingFee,
    remain,
    totalQuantity,
    displayProducts,
    isAddingProduct,
    isUpdatingProduct,
    editInitialPrice,
    editInitialQty,
    handleAddProduct,
    handleUpdateProduct,
    startEditProduct,
    clearEditProduct,
  } = useOrderOverview(order, {
    onAddProduct,
    onUpdateProduct,
  });

  async function executePrint() {
    let sender = null;
    try {
      const addresses = await listShopAddressesApi();
      sender = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
    } catch {
      // print without sender info if fetch fails
    }

    const html = buildDeliverySlipHtml(order, sender);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");

    if (!win) {
      URL.revokeObjectURL(url);
      return;
    }

    const revoke = () => URL.revokeObjectURL(url);
    win.addEventListener("load", () => {
      win.print();
      revoke();
    }, { once: true });
    win.addEventListener("beforeunload", revoke, { once: true });
  }

  function handlePrint() {
    void executePrint();
  }

  if (showShippingCreateScreen) {
    return (
      <ShippingCreateScreen
        order={order}
        onBack={() => setShowShippingCreateScreen(false)}
        onShippingSubmitted={onShippingSubmitted}
        productTotal={productTotal}
        userName={userName}
        initialShippingFee={shippingFee}
      />
    );
  }

  return (
    <main className="mx-auto flex h-dvh w-full flex-col bg-white text-black">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between bg-white px-4 pt-3 pb-4">
        <button type="button" onClick={onBack} className="flex size-11 items-center justify-center rounded-full bg-[#f2f2f2]"><BackIcon /></button>
        <h1 className="min-w-0 flex-1 px-4 text-center text-[20px] leading-7 font-semibold text-black">Tổng quan đơn hàng</h1>
        <div className="flex size-11 items-center justify-end gap-2 text-[#484848]"><PrinterIcon size={18} /><ShareIcon /></div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        <div className="px-4 py-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[12px] leading-4.5 text-[#484848]"><span className="min-w-0 flex-1 truncate">Order ID: {order.orderCode || order.id}</span><span className="h-3 w-px shrink-0 bg-[#dadada]" /><span className="shrink-0 whitespace-nowrap">{formatOrderDate(order.createdAt)}</span></div>
            <div className="flex items-center gap-1"><span className="inline-flex h-6 items-center rounded-2xl bg-[#f2f2f2] px-2 text-[12px] leading-[18px] font-medium text-[#2b2b2b]">{statusLabel(order.status)}</span></div>
          </div>

          <OrderCustomerSection
            order={order}
            phone={defaultCustomerAddress?.phone || fetchedCustomerPhone || order.customerPhone || "Chưa có số điện thoại"}
            address={defaultCustomerAddress ? [defaultCustomerAddress.address, defaultCustomerAddress.ward, defaultCustomerAddress.district, defaultCustomerAddress.province].filter(Boolean).join(", ") || order.customerAddress || "Chưa có địa chỉ" : order.customerAddressData ? [order.customerAddressData?.address, order.customerAddressData?.ward, order.customerAddressData?.district, order.customerAddressData?.province].filter(Boolean).join(", ") || order.customerAddress || "Chưa có địa chỉ" : order.customerAddress || "Chưa có địa chỉ"}
            onCustomerClick={onCustomerClick}
          />

        </div>

        <OrderProductsSection
          products={products}
          displayProducts={displayProducts}
          showAllProducts={showAllProducts}
          totalQuantity={totalQuantity}
          productTotal={productTotal}
          onToggleShowAll={() => setShowAllProducts((value) => !value)}
          onAdd={() => setAddProductOpen(true)}
          onEdit={startEditProduct}
        />

        <OrderShippingSection
          selectedShippingProvider={selectedShippingProvider}
          shippingFeeInput={shippingFeeInput}
          prepaidAmountInput={prepaidAmountInput}
          remain={remain}
          onOpenDrawer={() => setShowShippingDrawer(true)}
          onShippingFeeChange={setShippingFeeInput}
          onPrepaidAmountChange={setPrepaidAmountInput}
        />


        <OrderFooterActions
          orderId={order.id}
          depositStatus={order.depositStatus}
          isDepositLoading={isDepositLoading}
          onPrint={handlePrint}
          onToggleDeposit={onToggleDeposit}
          onShip={() => setShowShippingCreateScreen(true)}
        />
      </div>

      <ShippingDrawer
        open={showShippingDrawer}
        selectedShippingProvider={selectedShippingProvider}
        onOpenChange={setShowShippingDrawer}
        onSelectProvider={(provider) => {
          setSelectedShippingProvider(provider);
          setShowShippingDrawer(false);
        }}
      />

      <ProductDrawer
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        mode="add"
        loading={isAddingProduct}
        onSave={(data) => void handleAddProduct(data)}
      />

      <ProductDrawer
        open={editProductOpen}
        onOpenChange={(open) => {
          setEditProductOpen(open);
          if (!open) clearEditProduct();
        }}
        mode="edit"
        initialPrice={editInitialPrice}
        initialQty={editInitialQty}
        loading={isUpdatingProduct}
        onSave={(data) => void handleUpdateProduct(data)}
      />
    </main>
  );
}
