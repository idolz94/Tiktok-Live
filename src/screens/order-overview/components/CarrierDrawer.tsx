"use client";

import { DrawlerBase } from "../../../components/ui/Drawler";
import { CARRIERS, Carrier } from "../constants";
import { ChevronRightIcon } from "./icons";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenLinkCarrier: (carrier: Carrier) => void;
};

export function CarrierDrawer({ open, onOpenChange, onOpenLinkCarrier }: Props) {
  return (
    <DrawlerBase
      open={open}
      onOpenChange={onOpenChange}
      title="Đối tác vận chuyển"
      height="auto"
    >
      <div className="flex flex-col gap-1 px-4 pb-6">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#787878]">
          Đã kết nối
        </p>
        {CARRIERS.filter((c) => c.linked).map((carrier) => (
          <div key={carrier.id} className="flex items-center gap-3 rounded-xl bg-[#f2f2f2] p-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${carrier.bgColor} text-[11px] font-bold text-white`}
            >
              {carrier.shortName}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-black">{carrier.name}</span>
                {carrier.isDefault && (
                  <span className="rounded-full bg-[#edfaf4] px-2 py-0.5 text-[11px] font-medium text-[#2ca87b]">
                    Mặc định
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#787878]">{carrier.description}</p>
            </div>
          </div>
        ))}

        <p className="mb-2 mt-4 text-[12px] font-medium uppercase tracking-wide text-[#787878]">
          Chưa kết nối
        </p>
        {CARRIERS.filter((c) => !c.linked).map((carrier) => (
          <button
            key={carrier.id}
            type="button"
            onClick={() => onOpenLinkCarrier(carrier)}
            className="flex w-full items-center gap-3 rounded-xl border border-black/8 bg-white p-3 text-left"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${carrier.bgColor} text-[11px] font-bold text-white`}
            >
              {carrier.shortName}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[14px] font-medium text-black">{carrier.name}</span>
              <p className="text-[12px] text-[#787878]">{carrier.description}</p>
            </div>
            <ChevronRightIcon />
          </button>
        ))}
      </div>
    </DrawlerBase>
  );
}
