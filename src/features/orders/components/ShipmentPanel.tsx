"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Order, ShippingStatus } from "@/types";
import { formatMoney } from "@/utils/order";
import { cancelShipmentApi } from "@/api/ordersApi";

const SHIPPING_STATUS_LABEL: Record<ShippingStatus, string> = {
  not_shipped: "Chưa vận chuyển",
  submitted: "Đã đăng đơn",
  waiting_pickup: "Chờ lấy hàng",
  shipping: "Đang giao hàng",
  delivered: "Đã giao",
  failed: "Giao thất bại",
  returned: "Đã hoàn",
};

const ACTIVE_STATUSES: ShippingStatus[] = [
  "submitted",
  "waiting_pickup",
  "shipping",
];

function ShippingStatusBadge({ status }: { status: ShippingStatus }) {
  const label = SHIPPING_STATUS_LABEL[status] ?? status;
  const isActive = ACTIVE_STATUSES.includes(status);
  const isDelivered = status === "delivered";
  const isFailed = status === "failed" || status === "returned";

  const colorClass = isDelivered
    ? "text-[#2ca87b]"
    : isFailed
      ? "text-[#ff6b8a]"
      : isActive
        ? "text-[#5b8dee]"
        : "text-[#484848]";

  return <span className={`text-[12px] font-medium leading-4.5 ${colorClass}`}>{label}</span>;
}

export function ShipmentPanel({
  order,
  onCreateShipment,
  onCancelled,
}: {
  order: Order;
  onCreateShipment: () => void;
  onCancelled?: () => void;
}) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const shippingStatus = order.shippingStatus ?? "not_shipped";
  const hasShipment = shippingStatus !== "not_shipped";
  const canCancel = ACTIVE_STATUSES.includes(shippingStatus) || shippingStatus === "submitted";

  async function handleCancel() {
    setIsCancelling(true);
    try {
      await cancelShipmentApi(order.id, { reason: cancelReason || undefined });
      toast.success("Đã hủy vận đơn.");
      setShowCancelConfirm(false);
      setCancelReason("");
      onCancelled?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Hủy vận đơn thất bại.");
    } finally {
      setIsCancelling(false);
    }
  }

  if (!hasShipment) {
    return (
      <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-black/15 px-4 py-6">
        <p className="text-[14px] text-[#484848]">Chưa có vận đơn</p>
        <button
          type="button"
          onClick={onCreateShipment}
          className="rounded-[40px] bg-[#f5c842] px-6 py-2.5 text-[14px] font-semibold text-black"
        >
          Tạo vận đơn
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <span className="text-[12px] leading-4.5 text-[#484848]">Mã vận đơn</span>
          <span className="truncate text-[12px] font-medium leading-4.5 text-black">
            {order.trackingCode || order.orderCode || order.id}
          </span>
        </div>
        {order.providerName && (
          <div className="flex items-center justify-between gap-4 border-t border-black/10 px-4 py-3">
            <span className="text-[12px] leading-4.5 text-[#484848]">Đơn vị</span>
            <span className="text-[12px] font-medium leading-4.5 text-black">{order.providerName}</span>
          </div>
        )}
        <div className="flex items-center gap-4 bg-[#f2f2f2] px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-medium leading-5.5 text-black">Đơn vận chuyển</p>
              <ShippingStatusBadge status={shippingStatus} />
            </div>
            {order.shippingFee != null && order.shippingFee > 0 && (
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="text-[12px] leading-4.5 text-[#484848]">Phí ship</span>
                <span className="text-[12px] font-medium leading-4.5 text-black">
                  {formatMoney(order.shippingFee)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {canCancel && !showCancelConfirm && (
        <button
          type="button"
          onClick={() => setShowCancelConfirm(true)}
          className="w-full rounded-xl border border-[#ff6b8a] py-2.5 text-[14px] font-medium text-[#ff6b8a]"
        >
          Hủy vận đơn
        </button>
      )}

      {showCancelConfirm && (
        <div className="flex flex-col gap-2 rounded-xl border border-[#ff6b8a]/30 bg-[#fff5f7] p-4">
          <p className="text-[13px] font-medium text-[#484848]">Xác nhận hủy vận đơn?</p>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Lý do hủy (tuỳ chọn)"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#5b8dee]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowCancelConfirm(false); setCancelReason(""); }}
              disabled={isCancelling}
              className="flex-1 rounded-lg border border-black/10 py-2 text-[13px] font-medium text-[#484848] disabled:opacity-50"
            >
              Không
            </button>
            <button
              type="button"
              onClick={() => void handleCancel()}
              disabled={isCancelling}
              className="flex-1 rounded-lg bg-[#ff6b8a] py-2 text-[13px] font-medium text-white disabled:opacity-50"
            >
              {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
