"use client";

import { useState } from "react";
import { DrawlerBase } from "../../../components/ui/Drawler";
import { GradientButton, InputField, ToggleSwitch, UnitBadge } from "./shared";

export function ShippingSettingsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [autoScale, setAutoScale] = useState(true);
  const [dimLength, setDimLength] = useState("40");
  const [dimWidth, setDimWidth] = useState("40");
  const [dimHeight, setDimHeight] = useState("10");
  const [dimWeight, setDimWeight] = useState("200");

  return (
    <DrawlerBase
      open={open}
      onOpenChange={onOpenChange}
      title="Kích thước sản phẩm (SHIP)"
      height="auto"
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-xl bg-[#eaf4ff] px-4 py-3 text-[14px] leading-[22px] text-[#0f5d9f]">
          Kích thước sẽ tự động nhân với số lượng sản phẩm (ví dụ: 5 sản phẩm = x5 lần)
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-[15px] leading-6 font-medium text-black">
            Tự động nhân kích thước với số lượng
          </span>
          <ToggleSwitch on={autoScale} onToggle={() => setAutoScale((v) => !v)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Dài" suffix={<UnitBadge unit="cm" />}>
            <input
              value={dimLength}
              onChange={(e) => setDimLength(e.target.value)}
              inputMode="decimal"
              className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none"
            />
          </InputField>
          <InputField label="Rộng" suffix={<UnitBadge unit="cm" />}>
            <input
              value={dimWidth}
              onChange={(e) => setDimWidth(e.target.value)}
              inputMode="decimal"
              className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none"
            />
          </InputField>
          <InputField label="Cao" suffix={<UnitBadge unit="cm" />}>
            <input
              value={dimHeight}
              onChange={(e) => setDimHeight(e.target.value)}
              inputMode="decimal"
              className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none"
            />
          </InputField>
          <InputField label="Khối lượng" suffix={<UnitBadge unit="Gram" />}>
            <input
              value={dimWeight}
              onChange={(e) => setDimWeight(e.target.value)}
              inputMode="decimal"
              className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none"
            />
          </InputField>
        </div>

        <GradientButton label="Lưu lại" disabled />
      </div>
    </DrawlerBase>
  );
}
