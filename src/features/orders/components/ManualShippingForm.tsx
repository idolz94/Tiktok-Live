"use client";

import { useState } from "react";
import { toast } from "sonner";
import { InputField, GradientButton, Divider, VndBadge } from "./shared";

type Props = {
  onSubmit: (data: {
    trackingCode: string;
    providerName?: string;
    shippingFee?: number;
    note?: string;
  }) => Promise<void>;
  submitting?: boolean;
  productTotal: number;
};

export function ManualShippingForm({ onSubmit, submitting, productTotal }: Props) {
  const [trackingCode, setTrackingCode] = useState("");
  const [providerName, setProviderName] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [note, setNote] = useState("");

  async function handleSubmit() {
    if (!trackingCode.trim()) {
      toast.warning("Vui lòng nhập mã vận đơn");
      return;
    }

    try {
      const fee = shippingFee.trim() ? Number(shippingFee) : undefined;
      if (fee !== undefined && (isNaN(fee) || fee < 0)) {
        toast.warning("Phí vận chuyển không hợp lệ");
        return;
      }

      await onSubmit({
        trackingCode: trackingCode.trim(),
        providerName: providerName.trim() || undefined,
        shippingFee: fee,
        note: note.trim() || undefined,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi tạo vận đơn");
    }
  }

  const totalAmount = productTotal + (shippingFee.trim() ? Number(shippingFee) : 0);

  return (
    <div className="flex flex-col gap-5 pb-28">
      <div className="flex flex-col gap-3">
        <p className="px-1 text-sm font-medium text-[#273044]">Mã vận đơn</p>
        <InputField label="Nhập mã vận đơn" placeholder="VD: TK123456789">
          <input
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="VD: TK123456789"
            className="min-w-0 flex-1 bg-transparent text-[14px] leading-5.5 text-black outline-none placeholder:text-[#787878]"
          />
        </InputField>
      </div>

      <div className="flex flex-col gap-3">
        <p className="px-1 text-sm font-medium text-[#273044]">Tên nhà vận chuyển (tùy chọn)</p>
        <InputField label="VD: Thủ công, Ninja Van, AHA" placeholder="Để trống = Thủ công">
          <input
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            placeholder="Để trống = Thủ công"
            className="min-w-0 flex-1 bg-transparent text-[14px] leading-5.5 text-black outline-none placeholder:text-[#787878]"
          />
        </InputField>
      </div>

      <div className="flex flex-col gap-3">
        <p className="px-1 text-sm font-medium text-[#273044]">Phí vận chuyển (tùy chọn)</p>
        <div className="flex gap-2">
          <InputField label="VD: 25000" placeholder="Để trống = không có phí" suffix={<VndBadge />}>
            <input
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              placeholder="Để trống = không có phí"
              type="number"
              className="min-w-0 flex-1 bg-transparent text-[14px] leading-5.5 text-black outline-none placeholder:text-[#787878]"
            />
          </InputField>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="px-1 text-sm font-medium text-[#273044]">Ghi chú (tùy chọn)</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="VD: Giao hàng trước 17h, liên hệ trước khi tới"
          className="form-item rounded-lg border border-black/8 px-4 py-3 text-sm"
          rows={3}
        />
      </div>

      <Divider />

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-[#7a8a99]">Tổng tiền hàng</span>
          <span className="font-medium text-[#273044]">
            {productTotal.toLocaleString("vi-VN")} ₫
          </span>
        </div>
        {shippingFee.trim() && (
          <div className="flex justify-between text-sm">
            <span className="text-[#7a8a99]">Phí vận chuyển</span>
            <span className="font-medium text-[#273044]">
              {Number(shippingFee).toLocaleString("vi-VN")} ₫
            </span>
          </div>
        )}
        <div className="flex justify-between border-t border-black/8 pt-1">
          <span className="font-medium text-[#273044]">Tổng cộng</span>
          <span className="font-semibold text-[#ff6b8a]">
            {totalAmount.toLocaleString("vi-VN")} ₫
          </span>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full -translate-x-1/2 border-t border-black/8 bg-white px-4 pb-8 pt-3">
        <GradientButton
          label={submitting ? "Đang tạo đơn..." : "Tạo đơn hàng"}
          onClick={handleSubmit}
          disabled={submitting || !trackingCode.trim()}
        />
      </div>
    </div>
  );
}
