"use client";

import { OrderFilter } from "../types";

type FilterItem = {
  key: OrderFilter;
  label: string;
  value: number;
};

export default function OrderFilterBar({
  searchText,
  onChangeSearch,
  activeFilter,
  onChangeFilter,
  productCount,
  paidCount,
  draftCount,
  confirmedCount,
}: {
  searchText: string;
  onChangeSearch: (value: string) => void;
  activeFilter: OrderFilter;
  onChangeFilter: (value: OrderFilter) => void;
  productCount: number;
  paidCount: number;
  draftCount: number;
  confirmedCount: number;
}) {
  const filters: FilterItem[] = [
    { key: "paid", label: "Đã Cọc", value: paidCount },
    { key: "draft", label: "Đơn Nháp", value: draftCount },
    { key: "confirmed", label: "Đã Chốt", value: confirmedCount },
  ];

  return (
    <div className="border-b border-gray-200 bg-white px-3 pt-2 pb-2.5">
      <div className="relative min-h-12">
        <div className="mr-24 flex h-12 items-center rounded-[18px] bg-gray-100 px-[14px]">
          <span className="mr-2 text-[26px] text-gray-400">⌕</span>

          <input
            value={searchText}
            onChange={(event) => onChangeSearch(event.target.value)}
            placeholder="Tìm kiếm"
            className="min-w-0 flex-1 border-0 bg-transparent text-lg text-[#273044] outline-none"
          />
        </div>

        <div className="absolute top-0 right-0 flex w-[88px] flex-col items-center">
          <span className="text-[15px] font-extrabold text-neutral-500">Sản Phẩm</span>
          <strong className="mt-0.5 text-[25px] font-black text-gray-900">{productCount}</strong>
        </div>
      </div>

      <div className="mt-2.5 flex items-center">
        <button
          className={`flex min-h-[58px] w-[62px] flex-col items-center justify-center rounded-[10px] ${activeFilter === "all" ? "bg-amber-100" : ""}`}
          onClick={() => onChangeFilter("all")}
          type="button"
        >
          <span className="text-[13px] font-extrabold text-gray-500">Bộ Lọc</span>
          <span className="text-[28px] leading-8 text-gray-900">▼</span>
        </button>

        {filters.map((item) => {
          const isActive = activeFilter === item.key;

          return (
            <button
              key={item.key}
              className={`ml-1.5 flex min-h-[58px] flex-1 flex-col items-center justify-center rounded-[11px] border ${isActive ? "border-[#e6b936] bg-[#fff7d6]" : "border-gray-300 bg-gray-50"}`}
              onClick={() => onChangeFilter(item.key)}
              type="button"
            >
              <span className="text-[13px] font-black text-gray-500 max-[420px]:text-[11px]">
                {item.label}
              </span>
              <strong className="mt-0.5 text-[22px] font-black text-gray-900 max-[420px]:text-lg">
                {item.value}
              </strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}
