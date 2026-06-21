"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GhtkTrackingResult } from "@/api/ordersApi";
import type { OrderWithTikTok } from "@/types";

type Props = {
  orders: OrderWithTikTok[];
  loading?: boolean;
  getShippingTracking: (orderId: string) => Promise<GhtkTrackingResult>;
};

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

function formatTrackingDate(raw?: string): string {
  if (!raw) return "-";
  // "YYYY-MM-DD HH:mm:ss" → replace space with T for reliable parsing
  const normalized = raw.replace(" ", "T");
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return raw;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hh}:${mm}`;
}

function ghtkStatusColor(status?: string): string {
  switch (status) {
    case "3": return "#2ca87b";
    case "2": return "#468adf";
    case "1": return "#e99f20";
    case "-1":
    case "9": return "#ff4242";
    default: return "#888888";
  }
}

function ghtkStatusLabel(tracking: GhtkTrackingResult): string {
  if (tracking.statusText) return tracking.statusText;
  switch (tracking.status) {
    case "-1": return "Hủy đơn";
    case "0": return "Chờ xác nhận";
    case "1": return "Chờ lấy hàng";
    case "2": return "Đang vận chuyển";
    case "3": return "Đã giao hàng";
    case "4": return "Không giao được";
    case "5": return "Đang hoàn";
    case "6": return "Đã hoàn";
    case "7": return "Đang chuyển hoàn";
    case "8": return "Đang xử lý";
    case "9": return "Hàng thất lạc";
    default: return "Đang xử lý";
  }
}

function ChevronRightIcon({ size = 16, color = "#1a1a1a" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3.5 9.5l4 4 7-8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="5" width="14" height="10" rx="2" stroke="white" strokeWidth="1.5" />
      <path d="M6 5V4a3 3 0 016 0v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="10" r="1.5" stroke="white" strokeWidth="1.3" />
    </svg>
  );
}

function ShipFeeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1.5 11.5V6.5A1.5 1.5 0 013 5h8a1.5 1.5 0 011.5 1.5V8h2.5l1 1.5v2h-1a1.5 1.5 0 11-3 0H6a1.5 1.5 0 11-3 0H1.5z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2.25 4.5h13.5M5.25 9h7.5M8.25 13.5h1.5" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Divider() {
  return <div className="h-2 w-full bg-[#f2f2f2]" />;
}

function OrderTrackingCard({
  order,
  getShippingTracking,
}: {
  order: OrderWithTikTok;
  getShippingTracking: (orderId: string) => Promise<GhtkTrackingResult>;
}) {
  const [tracking, setTracking] = useState<GhtkTrackingResult | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(true);
  const [trackingError, setTrackingError] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    getShippingTracking(order.id)
      .then((result) => setTracking(result))
      .catch(() => setTrackingError(true))
      .finally(() => setTrackingLoading(false));
  }, [order.id, getShippingTracking]);

  const avatarLetter = (order.customerName || order.username || "?")[0]?.toUpperCase() ?? "?";
  const labelId = tracking?.labelId ?? order.orderCode ?? "-";
  const partnerId = tracking?.partnerId ?? "-";
  const modifiedDate = formatTrackingDate(tracking?.modified);
  const statusColor = tracking ? ghtkStatusColor(tracking.status) : "#888888";
  const statusLabel = trackingLoading
    ? "Đang tải..."
    : trackingError
    ? "Không tải được"
    : tracking
    ? ghtkStatusLabel(tracking)
    : "Đang xử lý";

  const totalItems = order.products?.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0) ?? 0;
  const shippingFee = tracking?.shipMoney ?? 0;
  // value = COD (tiền thu hộ từ khách), pickMoney = tiền shop nhận sau khi trừ phí
  const codAmount = tracking?.value ?? Number(order.totalAmount) ?? 0;

  return (
    <div className="flex flex-col gap-0 bg-white">
      {/* User info */}
      <div className="flex items-center gap-4 px-4 pt-4 pb-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ff4d6d] text-base font-medium text-white">
          {avatarLetter}
        </div>
        <span className="text-base font-medium text-[#1a1a1a]">
          {order.customerName || order.username || "Khách hàng"}
        </span>
      </div>

      {/* Tracking info box */}
      <div className="mx-4 overflow-hidden rounded-xl border border-[rgba(0,0,0,0.1)]">
        {/* White top — Mã GHTK */}
        <div className="flex items-center justify-between bg-white px-4 pt-3 pb-5">
          <span className="text-xs text-[#484848]">Mã GHTK</span>
          <span className="text-xs text-[#1a1a1a]">{labelId}</span>
        </div>

        {/* Gray bottom — carrier status */}
        <div className="rounded-xl bg-[#f2f2f2] px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            {/* Carrier logo */}
            <div className="flex items-center gap-2">
              <div className="relative size-8 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/images/providers/ghtk.png"
                  alt="GHTK"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
              <span className="text-sm font-medium text-[#1a1a1a]">GHTK</span>
            </div>
            <div className="flex items-center gap-1">
              {trackingLoading ? (
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              ) : (
                <span className="text-sm font-medium" style={{ color: statusColor }}>
                  {statusLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-[#484848]">Theo dõi</span>
              <ChevronRightIcon size={16} color="#484848" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-[#484848]">{modifiedDate}</span>
            <span className="text-xs text-[#1a1a1a]">{partnerId}</span>
          </div>
        </div>
      </div>

      {/* Order info rows */}
      <div className="flex flex-col px-4 pt-3 pb-4">
        <div className="flex w-full items-center justify-between py-2">
          <span className="text-sm text-[#2b2b2b]">Số lượng sản phẩm</span>
          <span className="w-24 text-right text-sm font-medium text-[#1a1a1a]">{totalItems}</span>
        </div>
        <div className="h-px bg-[#f2f2f2]" />

        <div className="flex w-full items-center justify-between py-2">
          <span className="text-sm text-[#2b2b2b]">Phí vận chuyển</span>
          <span className="w-24 text-right text-sm font-medium text-[#1a1a1a]">
            {shippingFee > 0 ? `${formatVnd(shippingFee)}₫` : "-"}
          </span>
        </div>
        <div className="h-px bg-[#f2f2f2]" />

          <div className="flex w-full items-center justify-between py-2">
          <span className="text-sm text-[#2b2b2b]">Phí vận chuyển</span>
          <span className="w-24 text-right text-sm font-medium text-[#1a1a1a]">
            {shippingFee > 0 ? `${formatVnd(shippingFee)}₫` : "-"}
          </span>
        </div>
        <div className="h-px bg-[#f2f2f2]" />

        <div className="flex w-full items-center justify-between py-2">
          <span className="text-sm text-[#2b2b2b]">Tiền thu hộ (COD)</span>
          <span className="w-24 text-right text-sm font-medium text-[#1a1a1a]">
            {codAmount > 0 ? `${formatVnd(codAmount)}₫` : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 min-w-[110px] flex-1 animate-pulse rounded-xl border border-[rgba(0,0,0,0.1)] bg-gray-100 p-3" />
      ))}
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="size-10 animate-pulse rounded-full bg-gray-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

export default function ShippingView({ orders, loading, getShippingTracking }: Props) {
  const totalCod = useMemo(
    () => orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
    [orders],
  );

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <SummarySkeleton />
        <div className="h-2 bg-[#f2f2f2]" />
        <div className="flex items-center justify-between px-4 py-3">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
        </div>
        {[0, 1].map((i) => (
          <div key={i}>
            <OrderCardSkeleton />
            <div className="h-2 bg-[#f2f2f2]" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#f2f2f2]">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M4 8h24M4 8l2 16h20L28 8M4 8l2-4h20l2 4M12 14v6M16 14v6M20 14v6"
              stroke="#888"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-base font-medium text-[#1a1a1a]">Chưa có vận đơn</p>
        <p className="text-sm text-[#484848]">Đơn hàng sau khi gửi đi sẽ hiển thị ở đây</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Summary stat cards */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {/* COD */}
        <div className="flex min-w-[110px] flex-1 flex-col gap-2 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#edfaf4] p-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#2ca87b]">
            <CheckIcon />
          </div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-semibold text-[#1a1a1a]">{formatVnd(totalCod)}</span>
              <span className="text-xs font-medium text-[#1a1a1a]">₫</span>
            </div>
            <p className="text-[11px] text-[#484848]">Tổng tiền thu hộ (COD)</p>
          </div>
        </div>

        {/* Revenue placeholder */}
        <div className="flex min-w-[110px] flex-1 flex-col gap-2 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#e9f2ff] p-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#468adf]">
            <RevenueIcon />
          </div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-semibold text-[#1a1a1a]">{orders.length}</span>
            </div>
            <p className="text-[11px] text-[#484848]">Tổng doanh thu</p>
          </div>
        </div>

        {/* Shipping fee placeholder */}
        <div className="flex min-w-[110px] flex-1 flex-col gap-2 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#ffe8e8] p-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#ff4242]">
            <ShipFeeIcon />
          </div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-semibold text-[#1a1a1a]">-</span>
            </div>
            <p className="text-[11px] text-[#484848]">Tổng phí vận chuyển</p>
          </div>
        </div>
      </div>

      {/* Order count row */}
      <div className="h-2 bg-[#f2f2f2]" />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-[#1a1a1a]">{orders.length} đơn hàng</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FilterIcon />
          <span className="text-sm font-medium text-[#1a1a1a]">Filter</span>
        </div>
      </div>
      <div className="h-2 bg-[#f2f2f2]" />

      {/* Order cards */}
      {orders.map((order, index) => (
        <div key={order.id}>
          <OrderTrackingCard order={order} getShippingTracking={getShippingTracking} />
          {index < orders.length - 1 && <div className="h-2 bg-[#f2f2f2]" />}
        </div>
      ))}
    </div>
  );
}
