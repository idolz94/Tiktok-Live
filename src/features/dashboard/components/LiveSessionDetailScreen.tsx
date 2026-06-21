"use client";

import OrderCard from "@/components/OrderCard";
import { LiveHistoryItem } from "@/features/tiktok-live/types";
import type { DepositStatus, Order, OrderProduct, OrderStatus, OrderWithTikTok } from "@/types";
import { formatDuration, removeAt } from "@/utils/comment";
import { formatTime } from "@/utils/date";
import { normalizeApiOrderForUi } from "@/utils/order";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CustomerTypeFilter = "vip" | "retail" | "wholesale";
type StatusFilter = "confirmed" | "paid" | "unpaid" | "draft";

type LiveSessionDetailScreenProps = {
  session: LiveHistoryItem;
  onBack: () => void;
  onUpdateOrder: (id: string, field: keyof Order, value: string) => void;
  onDeleteOrder: (id: string) => void;
  onAddProductToOrder: (orderId: string, product: OrderProduct) => void;
  onToggleDeposit: (orderId: string) => Promise<void> | void;
  onConfirmOrder: (orderId: string) => Promise<void> | void;
  onOpenOrderOverview: (orderId: string) => void;
  depositLoadingIds: Set<string>;
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

function CrownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 17h20M4 17L2 8l6 4 4-7 4 7 6-4-2 9H4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SingleUserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 20c0-3.5 3.13-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 14c2.21 0 4 1.79 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="#2b2b2b" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

type FilterDrawerProps = {
  isOpen: boolean;
  customerFilters: Set<CustomerTypeFilter>;
  statusFilters: Set<StatusFilter>;
  onToggleCustomer: (v: CustomerTypeFilter) => void;
  onToggleStatus: (v: StatusFilter) => void;
  onApply: () => void;
  onClose: () => void;
};

function FilterDrawer({
  isOpen,
  customerFilters,
  statusFilters,
  onToggleCustomer,
  onToggleStatus,
  onApply,
  onClose,
}: FilterDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const hasAny = customerFilters.size > 0 || statusFilters.size > 0;

  useEffect(() => {
    if (!isOpen) return;
    const el = overlayRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tagClass = (active: boolean) =>
    `flex h-[40px] items-center gap-[6px] rounded-[28px] px-[16px] text-[14px] transition-colors ${
      active
        ? "bg-[#ff6b8a] text-white"
        : "bg-[#f2f2f2] text-[#484848]"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative flex flex-col rounded-t-4xl bg-white shadow-[0px_15px_75px_0px_rgba(0,0,0,0.18)]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-11 rounded-[99px] bg-[#dadada]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="flex-1 text-center text-[18px] font-medium text-[#2b2b2b]">Bộ lọc</h2>
          <button type="button" onClick={onClose} className="absolute right-4 flex size-9 items-center justify-center rounded-full bg-[#f2f2f2]">
            <CloseIcon />
          </button>
        </div>

        {/* Section: Khách hàng */}
        <div className="px-4 pt-2">
          <p className="mb-3 text-[13px] font-medium text-[#484848]">Khách hàng</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={tagClass(customerFilters.has("vip"))} onClick={() => onToggleCustomer("vip")}>
              <CrownIcon />
              VIP
            </button>
            <button type="button" className={tagClass(customerFilters.has("retail"))} onClick={() => onToggleCustomer("retail")}>
              <SingleUserIcon />
              Lẻ
            </button>
            <button type="button" className={tagClass(customerFilters.has("wholesale"))} onClick={() => onToggleCustomer("wholesale")}>
              <GroupIcon />
              Sỉ
            </button>
          </div>
        </div>

        {/* Section: Trạng thái */}
        <div className="px-4 pt-5">
          <p className="mb-3 text-[13px] font-medium text-[#484848]">Trạng thái</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={tagClass(statusFilters.has("confirmed"))} onClick={() => onToggleStatus("confirmed")}>
              <RingIcon />
              Đã chốt
            </button>
            <button type="button" className={tagClass(statusFilters.has("paid"))} onClick={() => onToggleStatus("paid")}>
              <RingIcon />
              Đã cọc
            </button>
            <button type="button" className={tagClass(statusFilters.has("unpaid"))} onClick={() => onToggleStatus("unpaid")}>
              <RingIcon />
              Chưa cọc
            </button>
            <button type="button" className={tagClass(statusFilters.has("draft"))} onClick={() => onToggleStatus("draft")}>
              <RingIcon />
              Đơn nháp
            </button>
          </div>
        </div>

        {/* Apply button */}
        <div className="mt-5 border-t border-black/10 px-4 pt-5 pb-8">
          <button
            type="button"
            onClick={onApply}
            disabled={!hasAny}
            className="w-full rounded-[40px] py-3.5 text-[16px] font-semibold text-white transition-opacity disabled:opacity-40"
            style={{
              background: "linear-gradient(138deg, #ff6b8a 13.5%, #ffa66d 52.1%, #ffc86a 117.8%)",
            }}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}


function StatIcon({ color }: { color: string }) {
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-white">
      <span className="size-4 rounded-full" style={{ backgroundColor: color }} />
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
        <p className="mt-0.5 text-[20px] leading-7 font-semibold text-[#2b2b2b]">{value}</p>
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
  depositLoadingIds,
}: LiveSessionDetailScreenProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithTikTok[]>(() =>
    (session.orders || []).map((o) => normalizeApiOrderForUi(o))
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pendingCustomerFilters, setPendingCustomerFilters] = useState<Set<CustomerTypeFilter>>(new Set());
  const [pendingStatusFilters, setPendingStatusFilters] = useState<Set<StatusFilter>>(new Set());
  const [activeCustomerFilters, setActiveCustomerFilters] = useState<Set<CustomerTypeFilter>>(new Set());
  const [activeStatusFilters, setActiveStatusFilters] = useState<Set<StatusFilter>>(new Set());

  const duration = session.durationSeconds || 0;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const paidCount = orders.filter((o) => o.depositStatus === "paid" || o.depositStatus === "deposited").length;
  const unpaidCount = orders.filter((o) => o.depositStatus === "unpaid").length;
  const draftCount = orders.filter((o) => o.status === "draft").length;
  const productCount = orders.reduce((sum, o) => sum + getOrderProductsCount(o), 0);

  const filteredOrders = orders.filter((o) => {
    if (activeStatusFilters.size > 0) {
      const matchStatus =
        (activeStatusFilters.has("confirmed") && o.status === "confirmed") ||
        (activeStatusFilters.has("paid") && (o.depositStatus === "paid" || o.depositStatus === "deposited")) ||
        (activeStatusFilters.has("unpaid") && o.depositStatus === "unpaid") ||
        (activeStatusFilters.has("draft") && o.status === "draft");
      if (!matchStatus) return false;
    }
    return true;
  });

  const activeFilterCount = activeCustomerFilters.size + activeStatusFilters.size;

  const openFilter = () => {
    setPendingCustomerFilters(new Set(activeCustomerFilters));
    setPendingStatusFilters(new Set(activeStatusFilters));
    setIsFilterOpen(true);
  };

  const closeFilter = () => setIsFilterOpen(false);

  const toggleCustomer = (v: CustomerTypeFilter) => {
    setPendingCustomerFilters((prev) => {
      const next = new Set(prev);
      next.has(v) ? next.delete(v) : next.add(v);
      return next;
    });
  };

  const toggleStatus = (v: StatusFilter) => {
    setPendingStatusFilters((prev) => {
      const next = new Set(prev);
      next.has(v) ? next.delete(v) : next.add(v);
      return next;
    });
  };

  const applyFilter = () => {
    setActiveCustomerFilters(new Set(pendingCustomerFilters));
    setActiveStatusFilters(new Set(pendingStatusFilters));
    setIsFilterOpen(false);
  };

  const handleToggleDeposit = async (orderId: string) => {
    const current = orders.find((o) => o.id === orderId);
    if (!current) return;
    const next: DepositStatus = current.depositStatus === "paid" || current.depositStatus === "deposited" ? "unpaid" : "paid";
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
    <main className="h-dvh bg-white">
      <div className="mx-auto flex h-full flex-col bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
        {/* Sticky header */}
        <div className="flex shrink-0 items-center justify-between px-4 py-3">
          <button type="button" onClick={onBack} className="flex size-11 items-center justify-center rounded-full bg-[#f2f2f2]">
            <ChevronLeftIcon />
          </button>
          <button type="button" className="flex size-11 items-center justify-center rounded-full bg-[#f2f2f2]">
            <MoreIcon />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
          <div className="px-4 pt-1">
            <h1 className="text-[24px] leading-8 font-semibold text-[#2b2b2b]">
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
            <h2 className="text-[20px] leading-7 font-semibold text-[#2b2b2b]">{productCount} sản phẩm</h2>
            <button
              type="button"
              onClick={openFilter}
              className="relative flex size-10 items-center justify-center rounded-full bg-[#f2f2f2]"
            >
              <FilterIcon />
              {activeFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6b8a] px-1 text-[10px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="mt-3 pb-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                item={order}
                onUpdate={handleUpdateOrder}
                onDelete={handleDeleteOrder}
                onAddProduct={handleAddProduct}
                onToggleDeposit={handleToggleDeposit}
                onConfirmOrder={handleConfirmOrder}
                onOpenOverview={onOpenOrderOverview}
                onOpenCustomer={(key) => router.push(`/dashboard/customers/${encodeURIComponent(key)}`)}
                isDepositLoading={depositLoadingIds.has(order.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        customerFilters={pendingCustomerFilters}
        statusFilters={pendingStatusFilters}
        onToggleCustomer={toggleCustomer}
        onToggleStatus={toggleStatus}
        onApply={applyFilter}
        onClose={closeFilter}
      />
    </main>
  );
}
