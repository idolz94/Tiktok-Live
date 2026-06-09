"use client";

import { useState } from "react";
import { CustomerSummary } from "../types";

type CustomerWithTikTok = CustomerSummary & {
  customerTikTokUsername?: string;
};

type CustomerTab = "all" | "new" | "tiktok";

function TikTokIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.01a8.16 8.16 0 0 0 4.77 1.52V7.07a4.85 4.85 0 0 1-1-.38z"
        fill="#484848"
      />
    </svg>
  );
}

function ScanQRIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" stroke="#2b2b2b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" stroke="#2b2b2b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" stroke="#2b2b2b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" stroke="#2b2b2b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7" y="7" width="3" height="3" rx="0.5" fill="#2b2b2b" />
      <rect x="14" y="7" width="3" height="3" rx="0.5" fill="#2b2b2b" />
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill="#2b2b2b" />
      <rect x="14" y="14" width="3" height="3" rx="0.5" fill="#2b2b2b" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="#2b2b2b" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function AvatarPlaceholder({ letter }: { letter: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[15px] font-semibold text-[#ff6b8a]">
      {letter}
    </div>
  );
}

export default function CustomersView({ customers }: { customers: CustomerWithTikTok[] }) {
  const [activeTab, setActiveTab] = useState<CustomerTab>("all");

  const allCount = customers.length;
  const tiktokCustomers = customers.filter((c) => !!c.customerTikTokUsername);
  const tiktokCount = tiktokCustomers.length;
  const newCount = Math.max(0, allCount - tiktokCount);

  const displayed =
    activeTab === "tiktok" ? tiktokCustomers : activeTab === "new" ? customers.filter((c) => !c.customerTikTokUsername) : customers;

  return (
    <div className="flex h-full flex-col ">
      <div
      >
        <div className="flex items-center justify-between p-4">
          <h1 className="text-[24px] font-semibold leading-7 text-[#2b2b2b]">Khách hàng</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Lọc"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
            >
              <FilterIcon />
            </button>
            <button
              type="button"
              aria-label="Quét QR"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
            >
              <ScanQRIcon />
            </button>
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`h-10 rounded-full px-4 text-[13px] font-medium transition-colors ${
              activeTab === "all" ? "bg-[#ff6b8a] text-white" : "bg-white text-[#484848]"
            }`}
          >
            Tất cả ({allCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`h-10 rounded-full px-4 text-[13px] font-medium transition-colors ${
              activeTab === "new" ? "bg-[#ff6b8a] text-white" : "bg-white text-[#484848]"
            }`}
          >
            Khách mới ({newCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tiktok")}
            className={`h-10 rounded-full px-4 text-[13px] font-medium transition-colors ${
              activeTab === "tiktok" ? "bg-[#ff6b8a] text-white" : "bg-white text-[#484848]"
            }`}
          >
            TikTok ({tiktokCount})
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 [-webkit-overflow-scrolling:touch]">
        {displayed.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[15px] leading-6 text-[#8c8c8c]">Chưa có khách hàng trong danh sách này.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {displayed.map((item, index) => {
              const tiktokUsername = item.customerTikTokUsername || "";
              const letter = item.username.charAt(0).toUpperCase();
              const isLast = index === displayed.length - 1;

              return (
                <div key={tiktokUsername || item.username}>
                  <div className="flex items-center gap-3 py-3.5">
                    <AvatarPlaceholder letter={letter} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium leading-6 text-[#2b2b2b]">{item.username}</p>
                      {tiktokUsername && (
                        <div className="mt-0.5 flex items-center gap-1">
                          <TikTokIcon />
                          <span className="text-[12px] leading-4.5 text-[#484848]">{tiktokUsername}</span>
                        </div>
                      )}
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="rounded-full bg-[#f2f2f2] px-2.5 py-0.5 text-[11px] font-medium text-[#484848]">Lẻ</span>
                        <span className="text-[11px] text-[#8c8c8c]">{item.totalOrders} đơn</span>
                      </div>
                    </div>
                  </div>
                  {!isLast && <div className="h-px bg-[#f0f0f0]" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
