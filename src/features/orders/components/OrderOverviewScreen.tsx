"use client";

import { useEffect, useState } from "react";
import { DrawlerBase } from "@/components/ui/Drawler";
import { Order, OrderProduct } from "@/types";
import { formatMoneyFromK, getOrderTotal } from "@/utils/order";
import { addOrderItemApi, deleteOrderItemApi, updateOrderItemApi } from "@/api/ordersApi";
import { listCustomerAddressesApi, type CustomerAddress } from "@/lib/addresses";
import { MoneyInput } from "@/components/MoneyInput";
import { toast } from "sonner";
import { getOrderTikTokUsername, openTikTokProfile } from "@/utils/tiktok";
import { ProductDrawer } from "./ProductDrawer";
import { ShippingCreateScreen } from "./ShippingCreateScreen";
import {
  BackIcon, PhoneIcon, AddressIcon, TikTokIcon, PrinterIcon,
  PlusCircleIcon, ChevronRightIcon, EyeIcon, InfoIcon, ChevronDownIcon,
  ShipIcon, TrashIcon, EditIcon, ConfirmIcon, ShareIcon, DepositSpinner,
} from "./icons";
import { Divider, VndBadge, GradientButton } from "./shared";
import { CARRIERS } from "../constants/carriers";
import { buildOrderHtml, formatOrderDate, statusLabel } from "../utils/orderOverview";

export default function OrderOverviewScreen({
  order,
  onBack,
  onToggleDeposit,
  onAddProduct,
  onDeleteProduct,
  onUpdateProduct,
  onShippingSubmitted,
  isDepositLoading = false,
  userName,
}: {
  order: Order;
  onBack: () => void;
  onToggleDeposit: (orderId: string) => void;
  onAddProduct?: (orderId: string, product: OrderProduct) => void;
  onDeleteProduct?: (orderId: string, itemId: string) => void;
  onUpdateProduct?: (orderId: string, itemId: string, updates: Partial<OrderProduct>) => void;
  onShippingSubmitted?: () => void;
  isDepositLoading?: boolean;
  userName?: string;
}) {
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [carrierOpen, setCarrierOpen] = useState(false);
  const [linkCarrierOpen, setLinkCarrierOpen] = useState(false);

  const [localShippingFee, setLocalShippingFee] = useState(order.shippingFee ?? 0);
  const [localPrepaid, setLocalPrepaid] = useState(0);

  const [deletingProductId, setDeletingProductId] = useState("");

  const [selectedCarrier, setSelectedCarrier] = useState<(typeof CARRIERS)[0] | null>(null);
  const [linkAccount, setLinkAccount] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [linkIsDefault, setLinkIsDefault] = useState(true);

  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showShippingCreateScreen, setShowShippingCreateScreen] = useState(false);

  const [defaultCustomerAddress, setDefaultCustomerAddress] = useState<CustomerAddress | null>(null);

  function reloadDefaultCustomerAddress() {
    if (!order.customerId) return;
    listCustomerAddressesApi(order.customerId).then((list) => {
      const def = list.find((a) => a?.isDefault) ?? list[0] ?? null;
      setDefaultCustomerAddress(def);
    }).catch(() => {});
  }

  useEffect(() => {
    reloadDefaultCustomerAddress();
  }, [order.customerId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showShippingCreateScreen) reloadDefaultCustomerAddress();
  }, [showShippingCreateScreen]); // eslint-disable-line react-hooks/exhaustive-deps

  const products = order.products || [];
  const productTotal = getOrderTotal(products);
  const shippingFee = localShippingFee;
  const prepaid = localPrepaid;
  const remain = productTotal + shippingFee - prepaid;
  const totalQuantity = products.reduce((s, p) => s + Number(p.quantity || 0), 0);
  const displayProducts = showAllProducts ? products : products.slice(0, 3);

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState("");
  const [editInitialPrice, setEditInitialPrice] = useState("");
  const [editInitialQty, setEditInitialQty] = useState(1);

  async function handleAddProduct(data: { code: string; price: number; quantity: number }) {
    try {
      setIsAddingProduct(true);
      const item = await addOrderItemApi(order.id, {
        productCode: data.code,
        productName: data.code,
        price: data.price,
        quantity: data.quantity,
      });

      const itemId = String(item.id || item.itemId || item.item_id || item.orderItemId || item.order_item_id || "");

      onAddProduct?.(order.id, {
        id: itemId,
        code: String(item.productCode || item.product_code || data.code),
        name: String(item.productName || item.product_name || data.code),
        price: Number(item.price || data.price),
        quantity: Number(item.quantity || data.quantity),
      });

      setAddProductOpen(false);
      toast.success("Đã thêm sản phẩm");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thêm sản phẩm thất bại");
    } finally {
      setIsAddingProduct(false);
    }
  }

  async function handleDeleteProduct(product: OrderProduct) {
    const itemId = String(product.id || "").trim();

    if (!itemId) {
      toast.error("Không tìm thấy ID sản phẩm để xoá");
      return;
    }

    if (!window.confirm(`Xóa sản phẩm "${product.name || product.code}"?`)) return;

    try {
      setDeletingProductId(itemId);
      await deleteOrderItemApi(order.id, itemId);
      onDeleteProduct?.(order.id, itemId);
      toast.success("Đã xoá sản phẩm");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Xoá sản phẩm thất bại");
    } finally {
      setDeletingProductId("");
    }
  }

  function startEditProduct(product: OrderProduct) {
    setEditingProductId(String(product.id || ""));
    setEditInitialPrice(String(product.price || 0));
    setEditInitialQty(product.quantity || 1);
    setEditProductOpen(true);
  }

  async function handleUpdateProduct(data: { code: string; price: number; quantity: number }) {
    const itemId = editingProductId.trim();

    if (!itemId) {
      toast.error("Không tìm thấy ID sản phẩm để cập nhật");
      return;
    }

    try {
      setIsUpdatingProduct(true);
      await updateOrderItemApi(order.id, itemId, { price: data.price, quantity: data.quantity });
      onUpdateProduct?.(order.id, itemId, { price: data.price, quantity: data.quantity });
      setEditingProductId("");
      setEditProductOpen(false);
      toast.success("Đã cập nhật sản phẩm");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cập nhật sản phẩm thất bại");
    } finally {
      setIsUpdatingProduct(false);
    }
  }

  function handlePrint() {
    const html = buildOrderHtml(order);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  function openLinkCarrier(carrier: (typeof CARRIERS)[0]) {
    setSelectedCarrier(carrier);
    setLinkAccount("");
    setLinkPassword("");
    setLinkIsDefault(true);
    setLinkCarrierOpen(true);
  }

  if (showShippingCreateScreen) {
    return (
      <ShippingCreateScreen
        order={order}
        onBack={() => setShowShippingCreateScreen(false)}
        onShippingSubmitted={onShippingSubmitted}
        productTotal={productTotal}
        userName={userName}
      />
    );
  }

  return (
    <main className="mx-auto flex h-dvh max-w-120 flex-col bg-white text-black">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between bg-white px-4 pb-4 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]"
        >
          <BackIcon />
        </button>
        <h1 className="min-w-0 flex-1 px-4 text-center text-[24px] font-semibold leading-7 text-black">
          Tổng quan đơn hàng
        </h1>
        <div className="h-11 w-11" />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-40 [-webkit-overflow-scrolling:touch]">
        <div className="flex flex-col gap-6 px-4 pb-5 pt-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[12px] leading-[18px] text-[#484848]">
              <span className="min-w-0 flex-1 truncate">
                Order ID: {order.orderCode || order.id}
              </span>
              <span className="h-3 w-px shrink-0 bg-[#dadada]" />
              <span className="shrink-0 whitespace-nowrap">
                {formatOrderDate(order.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-flex h-6 items-center rounded-2xl bg-[#d9ffee] px-2 text-[12px] font-medium leading-[18px] text-[#2ca87b]">
                {statusLabel(order.status)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {order.avatarUrl ? (
                <img
                  src={order.avatarUrl}
                  alt={order.username}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[15px] font-semibold text-[#ff6b8a]">
                  {(order.customerName || order.username || "?")?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="w-full text-[16px] font-medium leading-6 text-black">
                  {order.customerName || order.username}
                </p>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l2.09 6.26L20 9.27l-4.91 4.79 1.18 6.94L12 17.77l-4.27 3.23 1.18-6.94L4 9.27l5.91-1.01z" fill="#f5c842" />
                  </svg>
                  <span className="text-[12px] leading-[18px] font-medium text-[#484848]">VIP</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[#484848]"><PhoneIcon /></span>
                <p className="text-[12px] leading-[18px] text-[#484848]">
                  {defaultCustomerAddress?.phone || order.customerPhone || "Chưa có số điện thoại"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[#484848]"><AddressIcon /></span>
                <p className="text-[12px] leading-[18px] text-[#484848]">
                  {defaultCustomerAddress
                    ? [defaultCustomerAddress.address, defaultCustomerAddress.ward, defaultCustomerAddress.district, defaultCustomerAddress.province].filter(Boolean).join(", ") || order.customerAddress || "Chưa có địa chỉ"
                    : order.customerAddressData
                      ? [order.customerAddressData?.address, order.customerAddressData?.ward, order.customerAddressData?.district, order.customerAddressData?.province].filter(Boolean).join(", ") || order.customerAddress || "Chưa có địa chỉ"
                      : order.customerAddress || "Chưa có địa chỉ"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => openTikTokProfile(getOrderTikTokUsername(order))}
                disabled={!getOrderTikTokUsername(order)}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black disabled:opacity-40"
              >
                <TikTokIcon />
                Tiktok
              </button>
              <button
                type="button"
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 4H4v12h8l4 4v-4h4V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M8 10h8M8 7h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Zalo
              </button>
              <button
                type="button"
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black"
              >
                <PhoneIcon />
                Điện thoại
              </button>
            </div>
          </div>
        </div>

        <Divider />

        <section className="px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[18px] font-semibold leading-6 text-black">
              Danh sách sản phẩm
            </h2>
            <button
              type="button"
              onClick={() => setAddProductOpen(true)}
              className="flex shrink-0 items-center gap-1 text-[14px] font-medium leading-[22px] text-black"
            >
              <PlusCircleIcon />
              Thêm mới
            </button>
          </div>

          <div className="mt-1 flex flex-col">
            {displayProducts.map((product, index) => (
              <div
                key={product.id || index}
                className="flex flex-col gap-2 border-b border-black/10 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="min-w-0 flex-1 break-words text-[14px] leading-[22px] text-[#2b2b2b]">
                    {product.name || product.code || "Sản phẩm"}
                  </p>
                  <button
                    type="button"
                    onClick={() => startEditProduct(product)}
                    className="shrink-0 text-[#484848]"
                    aria-label="Sửa sản phẩm"
                  >
                    <EditIcon />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[14px] font-medium leading-[22px] text-black">
                    {formatMoneyFromK(Number(product.price || 0) * Number(product.quantity || 0))}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[12px] leading-4.5 text-[#787878]">x{product.quantity}</span>
                    <button
                      type="button"
                      onClick={() => void handleDeleteProduct(product)}
                      disabled={!!deletingProductId && deletingProductId === product.id}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff0f0] text-[#ff6b8a] disabled:opacity-40"
                      aria-label="Xoá sản phẩm"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllProducts((value) => !value)}
              className="flex h-11 w-full items-center justify-center gap-1 text-[14px] font-medium leading-[22px] text-[#484848]"
            >
              {showAllProducts ? "Thu gọn" : `Xem thêm (${products.length - 3})`}
              <ChevronDownIcon />
            </button>
          )}

          <div className="mt-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[14px] leading-5.5 text-[#484848]">Tổng sản phẩm</span>
              <span className="text-[14px] font-semibold leading-5.5 text-black">{totalQuantity}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[14px] leading-5.5 text-[#484848]">Tổng tiền</span>
              <span className="text-[14px] font-semibold leading-5.5 text-[#ff6b8a]">
                {formatMoneyFromK(productTotal)}
              </span>
            </div>
          </div>
        </section>

        <Divider />

        <section className="px-4 pb-4 pt-5">
          <h2 className="text-[18px] font-semibold leading-6 text-black">Đơn vị vận chuyển</h2>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <span className="shrink-0 text-[14px] leading-5.5 text-[#2b2b2b]">Phí vận chuyển</span>
              <div className="flex h-10 w-36 items-center gap-1 rounded-xl border border-black/10 px-3">
                <MoneyInput value={localShippingFee} onChange={setLocalShippingFee} />
                <VndBadge />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="shrink-0 text-[14px] leading-5.5 text-[#2b2b2b]">Trả trước</span>
              <div className="flex h-10 w-36 items-center gap-1 rounded-xl border border-black/10 px-3">
                <MoneyInput value={localPrepaid} onChange={setLocalPrepaid} />
                <VndBadge />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-black/10 pt-3">
              <span className="text-[14px] leading-5.5 text-[#484848]">Còn lại</span>
              <span className="text-[14px] font-semibold leading-5.5 text-[#ff6b8a]">
                {formatMoneyFromK(remain)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCarrierOpen(true)}
            className="mt-4 w-full overflow-hidden rounded-xl border border-black/10 bg-white text-left"
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-[12px] leading-4.5 text-[#484848]">Mã VTP</span>
              <span className="truncate text-[12px] leading-4.5 text-black">
                {order.orderCode || order.id}
              </span>
            </div>
            <div className="flex items-center gap-4 bg-[#f2f2f2] px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d71920] text-[10px] font-bold text-white">
                VTP
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[14px] font-medium leading-5.5 text-black">Viettel Post</p>
                  <span className="text-[12px] font-medium leading-4.5 text-[#2ca87b]">Đang giao hàng</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="truncate text-[12px] leading-4.5 text-[#484848]">
                    {formatOrderDate(order.createdAt)}
                  </p>
                  <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium leading-4.5 text-black">
                    Theo dõi
                    <ChevronRightIcon />
                  </span>
                </div>
              </div>
            </div>
          </button>
        </section>

        <Divider />

        <section className="px-4 pb-6 pt-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onToggleDeposit(order.id)}
              disabled={isDepositLoading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-[40px] py-3 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-70 ${
                order.depositStatus === "paid" || order.depositStatus === "deposited"
                  ? "bg-[#2ca87b] text-white"
                  : "bg-[#f5c842] text-black"
              }`}
            >
              {isDepositLoading ? <DepositSpinner /> : <ConfirmIcon />}
              {isDepositLoading
                ? "Đang cập nhật..."
                : order.depositStatus === "paid" || order.depositStatus === "deposited"
                  ? "Đã cọc"
                  : "Chưa cọc"}
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-[40px] py-3 text-[14px] font-medium text-white"
              style={{ backgroundImage: "linear-gradient(90deg, #5b8dee 0%, #7b5cf0 100%)" }}
            >
              <ShareIcon />
              Chia sẻ hoá đơn
            </button>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[40px] bg-[#ffe8e8] py-3 text-[14px] font-medium text-[#ff6b8a]"
          >
            <PrinterIcon size={18} />
            In đơn hàng
          </button>
        </section>
      </div>

      <div className="shrink-0 border-t border-black/10 bg-white px-4 pb-[env(safe-area-inset-bottom,8px)] pt-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCarrierOpen(true)}
            className="flex flex-1 items-center gap-2 overflow-hidden rounded-[40px] border border-black/10 bg-[#f2f2f2] px-4 py-3"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#d71920] text-[9px] font-bold text-white">
              VTP
            </div>
            <span className="min-w-0 flex-1 truncate text-left text-[14px] font-medium text-black">
              Viettel Post
            </span>
            <ChevronRightIcon />
          </button>
          <button
            type="button"
            onClick={() => setShowShippingCreateScreen(true)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-[40px] bg-[#f5c842] px-6 py-3 text-[14px] font-semibold text-black"
          >
            <ShipIcon />
            Ship
          </button>
        </div>
      </div>

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
          if (!open) setEditingProductId("");
        }}
        mode="edit"
        initialPrice={editInitialPrice}
        initialQty={editInitialQty}
        loading={isUpdatingProduct}
        onSave={(data) => void handleUpdateProduct(data)}
      />

      <DrawlerBase
        open={carrierOpen}
        onOpenChange={setCarrierOpen}
        title="Đối tác vận chuyển"
        height="auto"
      >
        <div className="flex flex-col gap-1 px-4 pb-6">
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#787878]">
            Đã kết nối
          </p>
          {CARRIERS.filter((c) => c.linked).map((carrier) => (
            <div key={carrier.id} className="flex items-center gap-3 rounded-xl bg-[#f2f2f2] p-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${carrier.bgColor} text-[11px] font-bold text-white`}>
                {carrier.shortName}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-black">{carrier.name}</span>
                  {carrier.isDefault && (
                    <span className="rounded-full bg-[#edfaf4] px-2 py-0.5 text-[11px] font-medium text-[#2ca87b]">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#787878]">{carrier.description}</p>
              </div>
            </div>
          ))}

          <p className="mb-2 mt-4 text-[12px] font-medium uppercase tracking-wide text-[#787878]">
            Chưa kết nối
          </p>
          {CARRIERS.filter((c) => !c.linked).map((carrier) => (
            <button
              key={carrier.id}
              type="button"
              onClick={() => openLinkCarrier(carrier)}
              className="flex w-full items-center gap-3 rounded-xl border border-black/8 bg-white p-3 text-left"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${carrier.bgColor} text-[11px] font-bold text-white`}>
                {carrier.shortName}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[14px] font-medium text-black">{carrier.name}</span>
                <p className="text-[12px] text-[#787878]">{carrier.description}</p>
              </div>
              <ChevronRightIcon />
            </button>
          ))}
        </div>
      </DrawlerBase>

      <DrawlerBase
        open={linkCarrierOpen}
        onOpenChange={setLinkCarrierOpen}
        title={selectedCarrier?.name ?? "Liên kết"}
        height="auto"
        footer={
          <div className="px-4 pb-2 pt-1">
            <GradientButton
              label="Kết nối"
              disabled={!linkAccount || !linkPassword}
              onClick={() => setLinkCarrierOpen(false)}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-5 px-4 pb-4">
          <div className="flex items-start gap-2 rounded-xl bg-[#e9f2ff] p-3">
            <span className="mt-0.5 shrink-0 text-[#468adf]">
              <InfoIcon />
            </span>
            <p className="text-[13px] leading-5 text-[#468adf]">
              Nhập thông tin tài khoản {selectedCarrier?.name ?? "đơn vị vận chuyển"} để liên kết và tạo vận đơn tự động.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Tài khoản</label>
            <div className="flex h-12 items-center rounded-xl border border-black/10 px-4">
              <input
                type="tel"
                inputMode="tel"
                value={linkAccount}
                onChange={(e) => setLinkAccount(e.target.value)}
                placeholder="Số điện thoại"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Mật khẩu</label>
            <div className="flex h-12 items-center gap-2 rounded-xl border border-black/10 px-4">
              <input
                type={showPassword ? "text" : "password"}
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                placeholder="••••••••"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[#787878]">
                <EyeIcon />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[#484848]">Đặt làm mặc định</span>
            <button
              type="button"
              role="switch"
              aria-checked={linkIsDefault}
              onClick={() => setLinkIsDefault((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition-colors ${linkIsDefault ? "bg-[#ff6b8a]" : "bg-[#d1d1d1]"}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${linkIsDefault ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </DrawlerBase>
    </main>
  );
}
