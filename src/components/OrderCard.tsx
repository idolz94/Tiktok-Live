"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Order, OrderProduct } from "../types";
import { formatMoney, getOrderTotal, printOrder } from "@/utils/order";
import Avatar from "./Avatar";
import { getOrderTikTokUsername, openTikTokProfile } from "@/utils/tiktok";
import { MoneyInput } from "./MoneyInput";
import { patchOrderApi } from "@/api/ordersApi";

function createDisplayCode(orderCode: string) {
  const numbers = orderCode.replace(/\D/g, "");
  return (numbers || orderCode).slice(-6).padStart(6, "0");
}

function IconButton({ children, label, onClick, disabled = false }: { children: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="flex size-6 items-center justify-center text-[#484848] disabled:text-[#c9c9c9]">
      {children}
    </button>
  );
}

function PrintIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 14h10v6H7v-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}

function TrashIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function NoteIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MoreIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h.01M12 12h.01M19 12h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
}

function TikTokIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07Z"/></svg>;
}

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function LoadingSpinner() {
  return <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

function formatProductMeta(_product: OrderProduct, fallbackCreatedAt: string) {
  return new Date(fallbackCreatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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
  onOpenCustomer,
  isDepositLoading = false,
}: {
  item: Order;
  onUpdate: (id: string, field: keyof Order, value: string) => void;
  onDelete: (id: string) => void;
  onAddProduct?: (orderId: string, product: OrderProduct) => void;
  onToggleDeposit?: (orderId: string) => void;
  onConfirmOrder?: (orderId: string) => void;
  onOpenOverview?: (orderId: string) => void;
  onOpenCustomer?: (customerKey: string) => void;
  isDepositLoading?: boolean;
}) {
  const products = item.products?.length ? item.products : [];
  const total = item.subtotalAmount || getOrderTotal(products);
  const isPaid = item.depositStatus === "paid" || item.depositStatus === "deposited";
  const tiktokUsername = getOrderTikTokUsername(item);
  const displayName = item.customerName || item.username || "Khách live";

  const [codAmount, setCodAmount] = useState<number>(item.codAmount ?? 0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteText, setNoteText] = useState(item.note ?? "");
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleCodChange = useCallback(
    (val: number) => {
      setCodAmount(val);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        void patchOrderApi(item.id, { codAmount: val }).catch(() => {});
      }, 600);
    },
    [item.id],
  );

  const handleNoteSave = useCallback(async () => {
    setNoteSaving(true);
    try {
      await patchOrderApi(item.id, { note: noteText });
      toast.success("Đã lưu ghi chú.");
    } catch {
      toast.error("Lưu ghi chú thất bại. Vui lòng thử lại.");
    } finally {
      setNoteSaving(false);
    }
  }, [item.id, noteText]);

  void onUpdate;
  void onAddProduct;
  void onConfirmOrder;

  return (
    <article className="bg-white">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {onOpenCustomer ? (
            <button
              type="button"
              className="shrink-0"
              onClick={() => onOpenCustomer(tiktokUsername || item.username || item.id)}
            >
              <Avatar uri={item.avatar || item.avatarUrl} username={displayName} size={40} />
            </button>
          ) : (
            <Avatar uri={item.avatar || item.avatarUrl} username={displayName} size={40} />
          )}
          <div className="min-w-0 flex-1">
            <button type="button" onClick={() => tiktokUsername && openTikTokProfile(tiktokUsername)} disabled={!tiktokUsername} className="block max-w-full truncate text-left text-[16px] leading-6 font-medium text-black disabled:cursor-default">
              {displayName}
            </button>
            <p className="mt-0.5 text-[12px] leading-[18px] text-[#484848]">Order ID: {createDisplayCode(item.orderCode || item.id)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <IconButton label="In đơn" onClick={() => printOrder(item)}><PrintIcon /></IconButton>
            <IconButton label="TikTok" disabled={!tiktokUsername} onClick={() => openTikTokProfile(tiktokUsername)}><TikTokIcon /></IconButton>
            <div className="relative" ref={menuRef}>
              <IconButton label="Thêm tùy chọn" onClick={() => setMenuOpen((v) => !v)}><MoreIcon /></IconButton>
              {menuOpen && (
                <div className="absolute top-8 right-0 z-50 min-w-[160px] overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[14px] text-[#2b2b2b] hover:bg-[#f5f5f5]"
                    onClick={() => { setShowNoteEditor((v) => !v); setMenuOpen(false); }}
                  >
                    <NoteIcon />
                    Ghi Chú
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[14px] text-[#ff4242] hover:bg-[#fff0f0]"
                    onClick={() => { setMenuOpen(false); if (window.confirm("Xóa đơn hàng này?")) onDelete(item.id); }}
                  >
                    <TrashIcon />
                    Xoá đơn hàng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 pl-14">
          <span className="inline-flex h-6 items-center rounded-2xl bg-[#ffefe4] px-2 text-[12px] font-medium text-[#b85b22]">VIP</span>
          <span className={`inline-flex h-6 items-center rounded-2xl px-2 text-[12px] font-medium ${statusClassName(item.status)}`}>{statusLabel(item.status)}</span>
        </div>
        <div className="mt-3">
          {products.length ? (
            products.map((product) => {
              const productTotal = Number(product.totalAmount || product.price * product.quantity || 0);
              return (
                <div key={product.id} className="flex gap-3 border-b border-[#f2f2f2] py-3 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] leading-5 break-words text-[#2b2b2b]">{product.name || item.productName || item.comment}</p>
                    <p className="mt-1 truncate text-[12px] leading-[18px] text-[#787878]">{formatProductMeta(product, item.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[14px] leading-5 font-medium text-black">{formatMoney(productTotal)} x{product.quantity || 1}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex gap-3 border-b border-[#f2f2f2] py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-5 break-words text-[#2b2b2b]">{item.productName || item.comment || "Sản phẩm"}</p>
                <p className="mt-1 truncate text-[12px] leading-[18px] text-[#787878]">{new Date(item.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[14px] leading-5 font-medium text-black">{formatMoney(Number(item.price || 0) * Number(item.quantity || 1))}</p>
                <p className="mt-1 text-[12px] leading-[18px] text-[#787878]">x{item.quantity || 1}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-3">
          <span className="text-[14px] leading-5 text-[#2b2b2b]">Tạm tính</span>
          <strong className="text-[14px] leading-5 font-medium text-[#ff6b8a]">{formatMoney(total)}</strong>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[14px] leading-5 text-[#2b2b2b]">Tiền thu hộ (COD)</span>
          <div className="flex items-center gap-1">
            <MoneyInput
              value={codAmount}
              onChange={handleCodChange}
              placeholder="0"
              className="w-28 bg-transparent text-right text-[14px] font-medium text-black outline-none"
            />
            <span className="shrink-0 text-[12px] text-[#787878]">₫</span>
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={() => onToggleDeposit?.(item.id)} disabled={isDepositLoading} className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[40px] text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-70 ${isPaid ? "bg-[#edfaf4] text-[#2ca87b]" : "bg-[#ffe8e8] text-[#ff6b8a]"}`}>
            {isDepositLoading ? <LoadingSpinner /> : isPaid ? <CheckIcon /> : null}
            {isDepositLoading ? "Đang cập nhật..." : isPaid ? "Đã cọc" : "Chưa cọc"}
          </button>
          <button type="button" onClick={() => onOpenOverview?.(item.id)} className="h-10 flex-1 rounded-[40px] bg-[linear-gradient(128deg,#ff6b8a_13%,#ffa66d_52%,#ffc86a_118%)] px-4 text-[14px] font-medium text-black">
            Tổng quan đơn hàng
          </button>
        </div>
        {showNoteEditor && (
          <div className="relative mt-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Nhập ghi chú đơn hàng..."
              rows={3}
              className="w-full resize-none rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-3 pt-2.5 pb-10 text-[14px] leading-5 text-[#2b2b2b] outline-none placeholder:text-[#b0b0b0] focus:border-[#ff6b8a]"
            />
            <button
              type="button"
              onClick={() => void handleNoteSave()}
              disabled={noteSaving}
              className="absolute right-2.5 bottom-2.5 rounded-lg bg-[#ff6b8a] px-3 py-1 text-[12px] font-medium text-white disabled:opacity-60"
            >
              {noteSaving ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        )}
      </div>
      <div className="h-2 bg-[#f2f2f2]" />
    </article>
  );
}
