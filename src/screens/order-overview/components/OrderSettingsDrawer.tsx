"use client";

import { DrawlerBase } from "../../../components/ui/Drawler";
import { GradientButton, VndBadge } from "./shared";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  localShippingFee: number;
  localPrepaid: number;
  onChangeShippingFee: (value: number) => void;
  onChangePrepaid: (value: number) => void;
};

export function OrderSettingsDrawer({
  open,
  onOpenChange,
  localShippingFee,
  localPrepaid,
  onChangeShippingFee,
  onChangePrepaid,
}: Props) {
  return (
    <DrawlerBase
      open={open}
      onOpenChange={onOpenChange}
      title="Cài đặt đơn hàng"
      height="auto"
      footer={
        <div className="px-4 pb-2 pt-1">
          <GradientButton label="Lưu" onClick={() => onOpenChange(false)} />
        </div>
      }
    >
      <div className="flex flex-col gap-5 px-4 pb-4">
        <div className="flex flex-col gap-2">
          <label className="text-[14px] leading-5.5 text-[#484848]">Phí vận chuyển</label>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-black/10 px-4">
            <input
              type="number"
              inputMode="numeric"
              value={localShippingFee === 0 ? "" : localShippingFee}
              onChange={(e) => onChangeShippingFee(Number(e.target.value) || 0)}
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
            />
            <VndBadge />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[14px] leading-5.5 text-[#484848]">Trả trước</label>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-black/10 px-4">
            <input
              type="number"
              inputMode="numeric"
              value={localPrepaid === 0 ? "" : localPrepaid}
              onChange={(e) => onChangePrepaid(Number(e.target.value) || 0)}
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
            />
            <VndBadge />
          </div>
        </div>
      </div>
    </DrawlerBase>
  );
}
