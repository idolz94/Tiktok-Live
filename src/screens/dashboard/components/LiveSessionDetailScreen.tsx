"use client";

import OrderCard from "@/components/OrderCard";
import { LiveHistoryItem } from "@/features/tiktok-live/types";
import type { DepositStatus, Order, OrderProduct, OrderStatus, OrderWithTikTok } from "@/types";
import { formatDuration, removeAt } from "@/utils/comment";
import { formatTime } from "@/utils/date";
import { normalizeApiOrderForUi } from "@/utils/order";
import { useState } from "react";

type LiveSessionDetailScreenProps = {
  session: LiveHistoryItem;
  onBack: () => void;
  onUpdateOrder: (id: string, field: keyof Order, value: string) => void;
  onDeleteOrder: (id: string) => void;
  onAddProductToOrder: (orderId: string, product: OrderProduct) => void;
  onToggleDeposit: (orderId: string) => Promise<void> | void;
  onConfirmOrder: (orderId: string) => Promise<void> | void;
  onOpenOrderOverview: (orderId: string) => void;
};

function ChevronLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="m15 18-6-6 6-6" stroke="#2b2b2b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="1.6" fill="#2b2b2b" />
      <circle cx="5" cy="12" r="1.6" fill="#2b2b2b" />
      <circle cx="19" cy="12" r="1.6" fill="#2b2b2b" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#484848" strokeWidth="1.5" />
      <path d="M12 7v5l3 3" stroke="#484848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#484848" strokeWidth="1.5" />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="#484848" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="#2b2b2b" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function StatIcon({ color }: { color: string }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  bg: string;
  color: string;
};

function StatCard({ label, value, bg, color }: StatCardProps) {
  return (
    <div className={`flex min-h-20 items-center gap-3 rounded-2xl border border-white/70 p-3 ${bg}`}>
      <StatIcon color={color} />
      <div className="min-w-0">
        <p className="text-[12px] leading-4.5 text-[#484848]">{label}</p>
        <p className="mt-0.5 text-[20px] font-semibold leading-7 text-[#2b2b2b]">{value}</p>
      </div>
    </div>
  );
}

function getOrderProductsCount(order: OrderWithTikTok) {
  return order.products?.reduce((sum, p) => sum + Number(p.quantity || 0), 0) || Number(order.quantity || 1);
}

export default function LiveSessionDetailScreen({
  session,
  onBack,
  onUpdateOrder,
  onDeleteOrder,
  onAddProductToOrder,
  onToggleDeposit,
  onConfirmOrder,
  onOpenOrderOverview,
}: LiveSessionDetailScreenProps) {
  const [orders, setOrders] = useState<OrderWithTikTok[]>(() =>
    (session.orders || []).map((o) => normalizeApiOrderForUi(o))
  );

  const duration = session.durationSeconds || 0;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const paidCount = orders.filter((o) => o.depositStatus === "paid" || o.depositStatus === "deposited").length;
  const unpaidCount = orders.filter((o) => o.depositStatus === "unpaid").length;
  const draftCount = orders.filter((o) => o.status === "draft").length;
  const productCount = orders.reduce((sum, o) => sum + getOrderProductsCount(o), 0);

  const handleToggleDeposit = async (orderId: string) => {
    const current = orders.find((o) => o.id === orderId);
    if (!current) return;
    const next: DepositStatus = current.depositStatus === "paid" ? "unpaid" : "paid";
    await onToggleDeposit(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, depositStatus: next } : o)));
  };

  const handleConfirmOrder = async (orderId: string) => {
    const current = orders.find((o) => o.id === orderId);
    if (!current) return;
    const next: OrderStatus = current.status === "confirmed" ? "draft" : "confirmed";
    await onConfirmOrder(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: next } : o)));
  };

  const handleDeleteOrder = async (orderId: string) => {
    await onDeleteOrder(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleUpdateOrder = (id: string, field: keyof Order, value: string) => {
    onUpdateOrder(id, field, value);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (field === "quantity" || field === "price") return { ...o, [field]: Number(value || 0) };
        return { ...o, [field]: value };
      })
    );
  };

  const handleAddProduct = (orderId: string, product: OrderProduct) => {
    onAddProductToOrder(orderId, product);
    setOrders((prev) =>
      prev.map((o) => (o.id !== orderId ? o : { ...o, products: [...o.products, product] }))
    );
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-155 flex-col bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between px-4 py-3">
          <button type="button" onClick={onBack} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]">
            <ChevronLeftIcon />
          </button>
          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]">
            <MoreIcon />
          </button>
        </div>

        <div className="px-4 pt-1">
          <h1 className="text-[24px] font-semibold leading-8 text-[#2b2b2b]">
            Phiên {formatTime(session.startedAt)} - {formatTime(session.endedAt)}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <UserIcon />
              <span className="text-[12px] leading-4.5 text-[#484848]">{removeAt(session.username)}</span>
            </div>
            <div className="h-3 w-px bg-[#dadada]" />
            <div className="flex items-center gap-2">
              <ClockIcon />
              <span className="text-[12px] leading-4.5 text-[#484848]">{formatDuration(duration)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 px-4">
          <StatCard label="Đã chốt" value={confirmedCount} bg="bg-[#edfaf4]" color="#2ca87b" />
          <StatCard label="Đã cọc" value={paidCount} bg="bg-[#e9f2ff]" color="#2f80ed" />
          <StatCard label="Chưa cọc" value={unpaidCount} bg="bg-[#ffe8e8]" color="#ff6b8a" />
          <StatCard label="Đơn nháp" value={draftCount} bg="bg-[#f2f2f2]" color="#bdbdbd" />
        </div>

        <div className="mt-6 flex items-center justify-between px-4">
          <h2 className="text-[20px] font-semibold leading-7 text-[#2b2b2b]">{productCount} sản phẩm</h2>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f2f2]">
            <FilterIcon />
          </button>
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pb-6 [-webkit-overflow-scrolling:touch]">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              item={order}
              onUpdate={handleUpdateOrder}
              onDelete={handleDeleteOrder}
              onAddProduct={handleAddProduct}
              onToggleDeposit={handleToggleDeposit}
              onConfirmOrder={handleConfirmOrder}
              onOpenOverview={onOpenOrderOverview}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
