"use client";

import { DrawlerBase } from "@/components/ui/Drawler";
import { type ShopAddress, type CustomerAddress } from "@/lib/addresses";
import { GradientButton } from "./shared";
import { RadioIcon, EditIcon, TrashIcon } from "./icons";

type AddressItem = ShopAddress | CustomerAddress;

type Props<T extends AddressItem> = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  addresses: T[];
  loading: boolean;
  selected: T | null;
  onSelect: (a: T) => void;
  onAdd: () => void;
  onEdit: (a: T) => void;
  onDelete: (a: T) => void;
};

export function AddressPickerDrawer<T extends AddressItem>({
  open,
  onOpenChange,
  title,
  addresses,
  loading,
  selected,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: Props<T>) {
  return (
    <DrawlerBase
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      height="auto"
      footer={
        <div className="px-4 pb-2 pt-1">
          <GradientButton label="Thêm địa chỉ mới" onClick={onAdd} />
        </div>
      }
    >
      <div className="flex flex-col gap-0 px-4 pb-4">
        {loading && (
          <div className="flex items-center justify-center py-8 text-[14px] text-[#787878]">
            Đang tải...
          </div>
        )}
        {!loading && addresses.length === 0 && (
          <div className="flex items-center justify-center py-8 text-[14px] text-[#787878]">
            Chưa có địa chỉ nào
          </div>
        )}
        {!loading && addresses.map((a, i) => (
          <div key={a?.id} className={`flex items-start gap-3 py-4 ${i < addresses.length - 1 ? "border-b border-black/6" : ""}`}>
            <button type="button" onClick={() => onSelect(a)} className="mt-0.5 shrink-0">
              <RadioIcon active={selected?.id === a?.id} />
            </button>
            <div className="min-w-0 flex-1" onClick={() => onSelect(a)}>
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-black">{a?.name || "—"}</p>
                {a?.isDefault && (
                  <span className="rounded bg-[#fff0f3] px-1.5 py-0.5 text-[11px] font-medium text-[#ff6b8a]">Mặc định</span>
                )}
                {a?.label && (
                  <span className="rounded bg-[#f2f2f2] px-1.5 py-0.5 text-[11px] text-[#787878]">{a?.label}</span>
                )}
              </div>
              {a?.phone && <p className="mt-0.5 text-[13px] text-[#484848]">{a?.phone}</p>}
              {(a?.address || a?.ward || a?.district || a?.province) && (
                <p className="mt-0.5 text-[12px] leading-5 text-[#787878]">
                  {[a?.address, a?.ward, a?.district, a?.province].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => onEdit(a)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f2f2] text-[#484848]">
                <EditIcon />
              </button>
              <button type="button" onClick={() => onDelete(a)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0f3] text-[#ff6b8a]">
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </DrawlerBase>
  );
}
