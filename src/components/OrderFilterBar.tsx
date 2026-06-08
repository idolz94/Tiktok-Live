"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { DrawlerBase } from "./ui/Drawler";
import { OrderFilter } from "../types";

type SummaryItem = {
  key: OrderFilter;
  label: string;
  value: number;
  cardClassName: string;
  iconClassName: string;
  icon: ReactNode;
};

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function WalletIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7.5h15a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" /><path d="M16 12.5h5M5 7.5 15.4 4.2A2 2 0 0 1 18 6.1v1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function AlertIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 8v5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /><path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="M10.3 4.6 2.8 17.5A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.5L13.7 4.6a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}

function DraftIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6.5 3.5h7.8L18 7.2V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 20V5A1.5 1.5 0 0 1 6.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M14 3.5v4h4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function FilterIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

const FILTER_OPTIONS: { key: OrderFilter; label: string }[] = [
  { key: "confirmed", label: "Đã chốt" },
  { key: "paid", label: "Đã cọc" },
  { key: "unpaid", label: "Chưa cọc" },
  { key: "draft", label: "Đơn nháp" },
];

export default function OrderFilterBar({
  searchText,
  onChangeSearch,
  activeFilter,
  onChangeFilter,
  productCount,
  paidCount,
  draftCount,
  confirmedCount,
  unpaidCount = 0,
}: {
  searchText: string;
  onChangeSearch: (value: string) => void;
  activeFilter: OrderFilter;
  onChangeFilter: (value: OrderFilter) => void;
  productCount: number;
  paidCount: number;
  draftCount: number;
  confirmedCount: number;
  unpaidCount?: number;
}) {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [pendingFilter, setPendingFilter] = useState<OrderFilter>(activeFilter);

  function openFilterDrawer() {
    setPendingFilter(activeFilter);
    setFilterDrawerOpen(true);
  }

  function applyFilter() {
    onChangeFilter(pendingFilter);
    setFilterDrawerOpen(false);
  }

  const summaries: SummaryItem[] = [
    { key: "confirmed", label: "Đã chốt", value: confirmedCount, cardClassName: "bg-[#edfaf4]", iconClassName: "bg-[#2ca87b] text-white", icon: <CheckIcon /> },
    { key: "paid", label: "Đã cọc", value: paidCount, cardClassName: "bg-[#e9f2ff]", iconClassName: "bg-[#468adf] text-white", icon: <WalletIcon /> },
    { key: "unpaid", label: "Chưa cọc", value: unpaidCount, cardClassName: "bg-[#ffe8e8]", iconClassName: "bg-[#ff4242] text-white", icon: <AlertIcon /> },
    { key: "draft", label: "Đơn nháp", value: draftCount, cardClassName: "bg-[#f2f2f2]", iconClassName: "bg-white text-[#484848]", icon: <DraftIcon /> },
  ];

  const filterDrawerFooter = (
    <div className="px-4 pb-2 pt-2">
      <button
        type="button"
        onClick={applyFilter}
        className="flex w-full items-center justify-center rounded-[40px] py-4 text-[16px] font-medium text-black"
        style={{ backgroundImage: "linear-gradient(138deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)" }}
      >
        Áp dụng
      </button>
    </div>
  );

  return (
    <div className="bg-white px-4 pt-2 pb-4">
      <div>
        <h2 className="text-[24px] leading-7 font-semibold text-black">Đơn đã tạo</h2>
        <div className="mt-2 flex items-center gap-2 text-[12px] leading-[18px] text-[#484848]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e9f2ff] text-[10px] font-semibold text-[#468adf]">L</span>
          <span>Lumi Live</span>
          <span className="h-3 w-px bg-[#dadada]" />
          <span className="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" /></svg>
            Phiên hiện tại
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {summaries.map((item) => {
          const isActive = activeFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChangeFilter(isActive ? "all" : item.key)}
              className={`flex items-center gap-3 rounded-xl border border-black/10 p-4 text-left ${item.cardClassName} ${isActive ? "ring-2 ring-black/15" : ""}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.iconClassName}`}>{item.icon}</span>
              <span className="min-w-0">
                <strong className="block text-[18px] leading-6 font-semibold text-black">{item.value}</strong>
                <span className="block text-[12px] leading-[18px] text-[#484848]">{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <strong className="text-[20px] leading-6 font-semibold text-black">{productCount} sản phẩm</strong>
        <button
          type="button"
          onClick={openFilterDrawer}
          className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium transition-colors ${activeFilter !== "all" ? "bg-[#ff6b8a] text-white" : "bg-[#f2f2f2] text-black"}`}
        >
          <FilterIcon />
          {activeFilter !== "all" ? FILTER_OPTIONS.find((o) => o.key === activeFilter)?.label ?? "Filter" : "Filter"}
        </button>
      </div>

      {searchText ? (
        <div className="mt-3 flex items-center gap-2 rounded-full bg-[#f2f2f2] px-3 py-2">
          <input
            value={searchText}
            onChange={(event) => onChangeSearch(event.target.value)}
            placeholder="Tìm kiếm"
            className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none"
          />
          <button type="button" onClick={() => onChangeSearch("")} className="text-xs font-medium text-[#787878]">Xóa</button>
        </div>
      ) : null}

      <DrawlerBase
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        title="Bộ lọc"
        height="auto"
        footer={filterDrawerFooter}
      >
        <div className="flex flex-col gap-5 px-4 pb-2">
          <div className="flex flex-col gap-4">
            <p className="text-[14px] leading-[22px] text-[#2b2b2b]">Trạng thái</p>
            <div className="flex flex-wrap gap-3">
              {FILTER_OPTIONS.map((option) => {
                const isSelected = pendingFilter === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setPendingFilter(isSelected ? "all" : option.key)}
                    className={`flex h-10 items-center justify-center rounded-[28px] px-4 text-[14px] leading-[22px] transition-colors ${
                      isSelected
                        ? "bg-[#ff6b8a] text-white"
                        : "bg-[#f2f2f2] text-[#484848]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DrawlerBase>
    </div>
  );
}
