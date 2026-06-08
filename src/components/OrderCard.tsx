"use client";

import { Order, OrderProduct } from "../types";
import { formatMoneyFromK, getOrderTotal } from "../utils/order";
import Avatar from "./Avatar";
import { getOrderTikTokUsername, openTikTokProfile } from "@/utils/tiktok";

function createDisplayCode(orderCode: string) {
  const numbers = orderCode.replace(/\D/g, "");
  return (numbers || orderCode).slice(-6).padStart(6, "0");
}

function IconButton({ children, label, onClick, disabled = false }: { children: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="flex h-6 w-6 items-center justify-center text-[#484848] disabled:text-[#c9c9c9]">
      {children}
    </button>
  );
}

function PrintIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 14h10v6H7v-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}

function TrashIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MoreIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h.01M12 12h.01M19 12h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
}

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function formatProductMeta(product: OrderProduct, fallbackCreatedAt: string) {
  const parts = [product.code, product.color, product.size, product.variantName].filter(Boolean);
  const time = new Date(fallbackCreatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return parts.length ? `${parts.join(" · ")} · ${time}` : time;
}

function statusLabel(status: Order["status"]) {
  if (status === "confirmed") return "Đã chốt";
  if (status === "packed") return "Đã đóng gói";
  if (status === "shipping") return "Đang giao";
  if (status === "completed") return "Hoàn tất";
  if (status === "canceled") return "Đã hủy";
  if (status === "returned") return "Hoàn trả";
  return "Đơn nháp";
}

function statusClassName(status: Order["status"]) {
  if (status === "confirmed" || status === "completed") return "bg-[#e9f2ff] text-[#468adf]";
  if (status === "canceled" || status === "returned") return "bg-[#ffe8e8] text-[#ff4242]";
  return "bg-[#f2f2f2] text-[#484848]";
}

export default function OrderCard({
  item,
  onUpdate,
  onDelete,
  onAddProduct,
  onToggleDeposit,
  onConfirmOrder,
  onOpenOverview,
}: {
  item: Order;
  onUpdate: (id: string, field: keyof Order, value: string) => void;
  onDelete: (id: string) => void;
  onAddProduct?: (orderId: string, product: OrderProduct) => void;
  onToggleDeposit?: (orderId: string) => void;
  onConfirmOrder?: (orderId: string) => void;
  onOpenOverview?: (orderId: string) => void;
}) {
  const products = item.products?.length ? item.products : [];
  const total = item.totalAmount || item.subtotalAmount || getOrderTotal(products);
  const isPaid = item.depositStatus === "paid" || item.depositStatus === "deposited";
  const tiktokUsername = getOrderTikTokUsername(item);
  const displayName = item.customerName || item.username || "Khách live";

  void onUpdate;
  void onAddProduct;
  void onConfirmOrder;

  return (
    <article className="bg-white">
      <div className="px-4 py-4">
        <div className="flex items-start gap-4">
          <Avatar uri={item.avatar || item.avatarUrl} username={displayName} size={40} />

          <div className="min-w-0 flex-1">
            <button type="button" onClick={() => tiktokUsername && openTikTokProfile(tiktokUsername)} disabled={!tiktokUsername} className="block max-w-full truncate text-left text-[16px] leading-6 font-medium text-black disabled:cursor-default">
              {displayName}
            </button>
            <p className="mt-0.5 text-[12px] leading-[18px] text-[#484848]">Order ID: {createDisplayCode(item.orderCode || item.id)}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <IconButton label="In đơn"><PrintIcon /></IconButton>
            <IconButton label="Xóa đơn" onClick={() => onDelete(item.id)}><TrashIcon /></IconButton>
            <IconButton label="Mở tổng quan" onClick={() => onOpenOverview?.(item.id)}><MoreIcon /></IconButton>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1 pl-14">
          <span className="inline-flex h-6 items-center rounded-2xl bg-[#ffefe4] px-2 text-[12px] font-medium text-[#b85b22]">VIP</span>
          <span className={`inline-flex h-6 items-center rounded-2xl px-2 text-[12px] font-medium ${statusClassName(item.status)}`}>{statusLabel(item.status)}</span>
          {isPaid ? <span className="inline-flex h-6 items-center rounded-2xl bg-[#edfaf4] px-2 text-[12px] font-medium text-[#2ca87b]">Đã cọc</span> : null}
        </div>

        <div className="mt-3">
          {products.length ? (
            products.map((product) => {
              const productTotal = Number(product.totalAmount || product.price * product.quantity || 0);
              return (
                <div key={product.id} className="flex gap-3 border-b border-[#f2f2f2] py-3 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] leading-5 text-[#2b2b2b]">{product.name || item.productName || item.comment}</p>
                    <p className="mt-1 truncate text-[12px] leading-[18px] text-[#787878]">{formatProductMeta(product, item.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[14px] leading-5 font-medium text-black">{formatMoneyFromK(productTotal)}</p>
                    <p className="mt-1 text-[12px] leading-[18px] text-[#787878]">x{product.quantity || 1}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex gap-3 border-b border-[#f2f2f2] py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] leading-5 text-[#2b2b2b]">{item.productName || item.comment || "Sản phẩm"}</p>
                <p className="mt-1 truncate text-[12px] leading-[18px] text-[#787878]">{new Date(item.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[14px] leading-5 font-medium text-black">{formatMoneyFromK(Number(item.price || 0) * Number(item.quantity || 1))}</p>
                <p className="mt-1 text-[12px] leading-[18px] text-[#787878]">x{item.quantity || 1}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3">
          <span className="text-[14px] leading-5 text-[#2b2b2b]">Tạm tính</span>
          <strong className="text-[14px] leading-5 font-medium text-[#ff6b8a]">{formatMoneyFromK(total)}</strong>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={() => onToggleDeposit?.(item.id)} className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[40px] text-[14px] font-medium ${isPaid ? "bg-[#edfaf4] text-[#2ca87b]" : "bg-[#ffe8e8] text-[#ff6b8a]"}`}>
            {isPaid ? <CheckIcon /> : null}
            {isPaid ? "Đã cọc" : "Chưa cọc"}
          </button>
          <button type="button" onClick={() => onOpenOverview?.(item.id)} className="h-10 flex-1 rounded-[40px] bg-[linear-gradient(128deg,#ff6b8a_13%,#ffa66d_52%,#ffc86a_118%)] px-4 text-[14px] font-medium text-black">
            Tổng quan đơn hàng
          </button>
        </div>
      </div>
      <div className="h-2 bg-[#f2f2f2]" />
    </article>
  );
}
