"use client";

import { DrawlerBase } from "../../../components/ui/Drawler";
import { GradientButton, VndBadge } from "./shared";
import { MinusIcon, PlusIcon } from "./icons";
import { MoneyInput } from "@/components/MoneyInput";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newCode: string;
  newPrice: string;
  newQty: number;
  onChangeCode: (value: string) => void;
  onChangePrice: (value: string) => void;
  onChangeQty: (value: number) => void;
};

export function AddProductDrawer({
  open,
  onOpenChange,
  newCode,
  newPrice,
  newQty,
  onChangeCode,
  onChangePrice,
  onChangeQty,
}: Props) {
  return (
    <DrawlerBase
      open={open}
      onOpenChange={onOpenChange}
      title="Thêm mới"
      height="auto"
      footer={
        <div className="px-4 pb-2 pt-1">
          <GradientButton label="Lưu lại" onClick={() => onOpenChange(false)} />
        </div>
      }
    >
      <div className="flex flex-col gap-5 px-4 pb-4">
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#484848]">Mã</label>
          <div className="flex h-12 items-center rounded-xl border border-black/10 px-4">
            <input
              type="text"
              value={newCode}
              onChange={(e) => onChangeCode(e.target.value)}
              placeholder="Nhập mã sản phẩm"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#484848]">Giá</label>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-black/10 px-4">
            <MoneyInput
              valueK={Number(newPrice) || 0}
              onChange={(k) => onChangePrice(String(k))}
            />
            <VndBadge />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#484848]">Số lượng</label>
          <div className="flex h-12 items-center justify-between rounded-full bg-[#f2f2f2] px-1">
            <button
              type="button"
              onClick={() => onChangeQty(Math.max(1, newQty - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm"
            >
              <MinusIcon />
            </button>
            <span className="text-[16px] font-semibold text-black">{newQty}</span>
            <button
              type="button"
              onClick={() => onChangeQty(newQty + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm"
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      </div>
    </DrawlerBase>
  );
}
