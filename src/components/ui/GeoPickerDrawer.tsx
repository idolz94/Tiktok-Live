"use client";

import { useEffect, useState } from "react";
import { DrawlerBase } from "@/components/ui/Drawler";
import { removeDiacritics } from "@/lib/vn-geo";

type GeoItem = { code: number; name: string };

export function GeoPickerDrawer({
  open,
  onOpenChange,
  title,
  placeholder,
  items,
  selectedName,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  placeholder: string;
  items: GeoItem[];
  selectedName: string;
  onSelect: (item: GeoItem) => void;
}) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSearch("");
    }
  }, [open]);

  const filtered = items.filter((item) =>
    removeDiacritics(item.name).includes(removeDiacritics(search)),
  );

  return (
    <DrawlerBase
      open={open}
      onOpenChange={(o) => {
        if (!o) onOpenChange(false);
      }}
      height="lg"
      showHandle
      showCloseButton={false}
      title={title}
      bodyClassName="flex flex-col overflow-hidden p-0"
    >
      <div className="shrink-0 px-4 pt-2 pb-3">
        <div className="relative flex h-10 items-center rounded-[8px] border border-[#d1d5db] bg-[#f9fafb] px-3">
          <svg className="mr-2 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#9ca3af]"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+16px)]">
        {items.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[#9ca3af]">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[#9ca3af]">Không tìm thấy kết quả</p>
        ) : (
          filtered.map((item, idx, arr) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                onSelect(item);
                setSearch("");
              }}
              className={`flex min-h-10 w-full items-center justify-between px-4 py-3 text-left text-[14px] transition-colors active:bg-[#f9fafb] ${
                selectedName === item.name ? "text-[#ebb140]" : "text-[#111827]"
              } ${idx < arr.length - 1 ? "border-b border-[#f3f4f6]" : ""}`}
            >
              <span className={selectedName === item.name ? "font-medium" : ""}>{item.name}</span>
              {selectedName === item.name && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="#ebb140"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))
        )}
      </div>
    </DrawlerBase>
  );
}

