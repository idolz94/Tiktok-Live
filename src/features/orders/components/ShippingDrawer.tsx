"use client";

import { DrawlerBase } from "@/components/ui/Drawler";

type Props = {
  open: boolean;
  selectedShippingProvider: "manual" | "ghtk";
  onOpenChange: (open: boolean) => void;
  onSelectProvider: (provider: "manual" | "ghtk") => void;
};

export function ShippingDrawer({ open, selectedShippingProvider, onOpenChange, onSelectProvider }: Props) {
  return (
    <DrawlerBase open={open} onOpenChange={onOpenChange} title="Đối tác vận chuyển" height="lg">
      <div className="space-y-5 px-1 pt-1">
        <div>
          <p className="px-2 text-[14px] leading-[22px] font-medium text-[#484848]">Đã kết nối</p>
          <div className="mt-3 space-y-3">
            <button
              type="button"
              onClick={() => onSelectProvider("manual")}
              className="flex w-full items-center gap-4 rounded-[16px] bg-[#f2f2f2] p-4 text-left"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2ca87b] text-[15px] font-bold text-white">M</div>
              <p className="min-w-0 flex-1 text-[14px] leading-[22px] font-medium text-black">Thủ Công</p>
              {selectedShippingProvider === "manual" && (
                <svg className="shrink-0 text-[#2ca87b]" width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="currentColor" />
                  <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => onSelectProvider("ghtk")}
              className="flex w-full items-center gap-4 rounded-[16px] bg-[#f2f2f2] p-4 text-left"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EE0033] text-[15px] font-bold text-white">G</div>
              <p className="min-w-0 flex-1 text-[14px] leading-[22px] font-medium text-black">GHTK</p>
              {selectedShippingProvider === "ghtk" && (
                <svg className="shrink-0 text-[#EE0033]" width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="currentColor" />
                  <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <p className="px-2 text-[14px] leading-[22px] font-medium text-[#484848]">Chưa kết nối</p>
          <div className="mt-3 space-y-3 opacity-50">
            <div className="flex w-full items-center gap-4 rounded-[16px] bg-[#f2f2f2] p-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#ffb000] text-[15px] font-bold text-white">S</div>
              <p className="min-w-0 flex-1 text-[14px] leading-[22px] font-medium text-black">Shopee Express</p>
            </div>
            <div className="flex w-full items-center gap-4 rounded-[16px] bg-[#f2f2f2] p-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#cc0000] text-[15px] font-bold text-white">V</div>
              <p className="min-w-0 flex-1 text-[14px] leading-[22px] font-medium text-black">Viettel Post</p>
            </div>
          </div>
        </div>
      </div>
    </DrawlerBase>
  );
}
