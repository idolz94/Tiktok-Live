"use client";

import { useState, useEffect } from "react";
import { DrawlerBase } from "@/components/ui/Drawler";
import { GradientButton, VndBadge } from "./shared";
import { MinusIcon, PlusIcon } from "./icons";
import { MoneyInput } from "@/components/MoneyInput";

type ProductDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialCode?: string;
  initialPrice?: string;
  initialQty?: number;
  loading?: boolean;
  onSave: (data: { code: string; price: number; quantity: number }) => void;
};

export function ProductDrawer({
  open,
  onOpenChange,
  mode,
  initialCode = "",
  initialPrice = "",
  initialQty = 1,
  loading = false,
  onSave,
}: ProductDrawerProps) {
  const [code, setCode] = useState(initialCode);
  const [price, setPrice] = useState(initialPrice);
  const [qty, setQty] = useState(initialQty);

  useEffect(() => {
    if (open) {
      setCode(initialCode);
      setPrice(initialPrice);
      setQty(initialQty);
    }
  }, [open, initialCode, initialPrice, initialQty]);

  const canSave =
    mode === "add"
      ? code.trim() !== "" && Number(price) > 0 && qty > 0
      : Number(price) > 0 && qty > 0;

  return (
    <DrawlerBase
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "add" ? "Thêm mới" : "Sửa sản phẩm"}
      height="auto"
      footer={
        <div className="px-4 pt-1 pb-2">
          <GradientButton
            label={loading ? "Đang lưu..." : "Lưu lại"}
            disabled={!canSave || loading}
            onClick={() => onSave({ code: code.trim(), price: Number(price), quantity: qty })}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-5 px-4 pb-4">
        {mode === "add" && (
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Mã</label>
            <div className="flex h-12 items-center rounded-xl border border-black/10 px-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã sản phẩm"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
              />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#484848]">Giá</label>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-black/10 px-4">
            <MoneyInput
              value={Number(price) || 0}
              onChange={(vnd) => setPrice(String(vnd))}
            />
            <VndBadge />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#484848]">Số lượng</label>
          <div className="flex h-12 items-center justify-between rounded-full bg-[#f2f2f2] px-1">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex size-10 items-center justify-center rounded-full bg-white text-black shadow-sm"
            >
              <MinusIcon />
            </button>
            <span className="text-[16px] font-semibold text-black">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex size-10 items-center justify-center rounded-full bg-white text-black shadow-sm"
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      </div>
    </DrawlerBase>
  );
}
