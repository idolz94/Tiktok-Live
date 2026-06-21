"use client";

import { MoneyInput } from "@/components/MoneyInput";
import { Divider } from "./shared";
import { formatMoney } from "@/utils/order";

type Props = {
  selectedShippingProvider: "manual" | "ghtk";
  shippingFeeInput: number;
  prepaidAmountInput: number;
  remain: number;
  onOpenDrawer: () => void;
  onShippingFeeChange: (value: number) => void;
  onPrepaidAmountChange: (value: number) => void;
};

export function OrderShippingSection({
  selectedShippingProvider,
  shippingFeeInput,
  prepaidAmountInput,
  remain,
  onOpenDrawer,
  onShippingFeeChange,
  onPrepaidAmountChange,
}: Props) {
  return (
    <>
      <Divider />
      <section className="px-4 py-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] leading-6 font-semibold text-black">Đơn vị vận chuyển</h2>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <button type="button" onClick={onOpenDrawer} className="flex items-center gap-4 rounded-2xl bg-[#f2f2f2] p-4 text-left">
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${selectedShippingProvider === "manual" ? "bg-[#2ca87b]" : "bg-[#EE0033]"} text-[15px] font-bold text-white`}>
              {selectedShippingProvider === "manual" ? "M" : "G"}
            </div>
            <p className="min-w-0 flex-1 text-[14px] leading-5.5 font-medium text-black">{selectedShippingProvider === "manual" ? "Manual" : "GHTK"}</p>
            <svg className="shrink-0 text-[#484848]" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-3">
            <span className="text-[14px] leading-5.5 text-[#2b2b2b]">Phí vận chuyển</span>
            <MoneyInput
              value={shippingFeeInput}
              onChange={onShippingFeeChange}
              className="w-23 bg-transparent text-right text-[14px] leading-5.5 font-medium text-black outline-none"
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-3">
            <span className="text-[14px] leading-5.5 text-[#2b2b2b]">Trả trước</span>
            <MoneyInput
              value={prepaidAmountInput}
              onChange={onPrepaidAmountChange}
              className="w-23 bg-transparent text-right text-[14px] leading-5.5 font-medium text-black outline-none"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[14px] leading-5.5 text-[#484848]">Còn lại</span>
            <span className="text-[14px] leading-5.5 font-semibold text-[#ff6b8a]">{formatMoney(remain)}</span>
          </div>
        </div>
      </section>
    </>
  );
}
