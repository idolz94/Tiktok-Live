"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { TopTab } from "../../../types";

type HeaderKind = "home" | "sub" | "customers" | "reports" | "settings";

type DashboardHeaderProps = {
  kind: HeaderKind;
  title?: string;
  subtitle?: string;
  activeTab?: TopTab;
  onChangeTab?: (tab: TopTab) => void;
};

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ScanQRIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7" y="7" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="14" y="7" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function HeaderButton({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#2b2b2b] shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
    >
      {children}
    </button>
  );
}

export default function DashboardHeader({
  kind,
  title,
  subtitle,
  activeTab = "tiktok",
  onChangeTab,
}: DashboardHeaderProps) {
  const router = useRouter();

  if (kind === "home") {
    return (
      <header className="bg-linear-to-b from-[#FF6B8A]/30 via-[#FFA66D]/20 to-white/0 px-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-center gap-12">
          <button
            className={`border-b-2 px-1 pb-2 text-[20px] font-medium ${activeTab === "tiktok" ? "border-[#ff5f8a] text-[#ff5f8a]" : "border-transparent text-[#7e7474]"}`}
            onClick={() => onChangeTab?.("tiktok")}
            type="button"
          >
            Tiktok
          </button>

          <button
            className="relative border-b-2 border-transparent px-1 pb-2 text-[20px] font-medium text-[#7e7474] opacity-60"
            onClick={() => onChangeTab?.("facebook")}
            type="button"
          >
            Facebook
            <span className="absolute -right-9 -top-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
              Soon
            </span>
          </button>
        </div>
      </header>
    );
  }

  const isSettings = kind === "settings";

  return (
    <header className={`shrink-0 px-4 pt-[calc(14px+env(safe-area-inset-top))] pb-4 ${isSettings ? "bg-transparent text-white" : "bg-[#f7f7f7] text-[#2b2b2b]"}`}>
      <div className="flex min-h-11 items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() => router.back()}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isSettings ? "bg-white/18 text-white backdrop-blur-[12px]" : "bg-white text-[#2b2b2b] shadow-[0_8px_24px_rgba(15,23,42,0.08)]"}`}
        >
          <BackIcon />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-[24px] font-semibold leading-7">{title}</h1>
          {subtitle && <p className={`mt-1 truncate text-[13px] leading-5 ${isSettings ? "text-white/80" : "text-[#787878]"}`}>{subtitle}</p>}
        </div>
    
        <div className="flex shrink-0 items-center gap-2">
          {kind === "customers" ? (
            <>
              <HeaderButton label="Lọc"><FilterIcon /></HeaderButton>
              <HeaderButton label="Quét QR"><ScanQRIcon /></HeaderButton>
            </>
          ) : (
            <HeaderButton label="Thông báo"><BellIcon /></HeaderButton>
          )}
        </div>
      </div>
    </header>
  );
}
