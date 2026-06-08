"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { normalizeTikTokUsername } from "@/utils/comment";
import { getDashboardTabFromPathname } from "@/screens/dashboard/DashboardContext";
import { BottomTab } from "../types";

type LiveFooterBar = {
  username: string;
  commentsCount: number;
  ordersCount: number;
  isDisconnecting: boolean;
  onSwitchChannel: () => void;
  onDisconnect: () => void;
};

const ITEMS: { key: BottomTab; label: string; icon: (active: boolean) => ReactNode }[] = [
  {
    key: "home",
    label: "Home",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill={active ? "#ff5f8a" : "#b0b8c9"} />
      </svg>
    ),
  },
  {
    key: "customers",
    label: "Khách hàng",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="7" r="4" fill={active ? "#ff5f8a" : "#b0b8c9"} />
        <path d="M1 20C1 16.13 4.13 13 8 13H10C13.87 13 17 16.13 17 20" stroke={active ? "#ff5f8a" : "#b0b8c9"} strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="8" r="3" fill={active ? "#ff5f8a" : "#b0b8c9"} />
        <path d="M15 20C15 17.33 16.79 15.12 19 14.24" stroke={active ? "#ff5f8a" : "#b0b8c9"} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "shipping",
    label: "Vận đơn",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="6" width="13" height="11" rx="1" fill={active ? "#ff5f8a" : "#b0b8c9"} />
        <path d="M14 9H18L21 13V17H14V9Z" fill={active ? "#ff5f8a" : "#b0b8c9"} />
        <circle cx="6" cy="18.5" r="1.5" fill="white" />
        <circle cx="18" cy="18.5" r="1.5" fill="white" />
      </svg>
    ),
  },
  {
    key: "reports",
    label: "Báo cáo",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="12" width="4" height="9" rx="1" fill={active ? "#ff5f8a" : "#b0b8c9"} />
        <rect x="10" y="7" width="4" height="14" rx="1" fill={active ? "#ff5f8a" : "#b0b8c9"} />
        <rect x="17" y="3" width="4" height="18" rx="1" fill={active ? "#ff5f8a" : "#b0b8c9"} />
      </svg>
    ),
  },
  {
    key: "history",
    label: "Lịch sử",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" stroke={active ? "#ff5f8a" : "#b0b8c9"} strokeWidth="2" />
        <path d="M12 7V12L15.5 14" stroke={active ? "#ff5f8a" : "#b0b8c9"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "settings",
    label: "Cài đặt",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" fill={active ? "#ff5f8a" : "#b0b8c9"} />
        <path fillRule="evenodd" clipRule="evenodd" d="M10.3 2.3a1 1 0 0 1 3.4 0l.5 1.5a8 8 0 0 1 1.7 1l1.6-.4a1 1 0 0 1 1.1.5l1.7 2.9a1 1 0 0 1-.2 1.3l-1.2 1a8.1 8.1 0 0 1 0 2l1.2 1a1 1 0 0 1 .2 1.3l-1.7 2.9a1 1 0 0 1-1.1.5l-1.6-.4a8 8 0 0 1-1.7 1l-.5 1.5a1 1 0 0 1-3.4 0l-.5-1.5a8 8 0 0 1-1.7-1l-1.6.4a1 1 0 0 1-1.1-.5L3.7 15a1 1 0 0 1 .2-1.3l1.2-1a8.1 8.1 0 0 1 0-2l-1.2-1A1 1 0 0 1 3.7 8.4l1.7-2.9a1 1 0 0 1 1.1-.5l1.6.4a8 8 0 0 1 1.7-1l.5-1.5Z" fill={active ? "#ff5f8a" : "#b0b8c9"} />
      </svg>
    ),
  },
];

const ROUTES: Record<BottomTab, string> = {
  home: "/dashboard/live",
  customers: "/dashboard/customers",
  shipping: "/dashboard/shipping",
  reports: "/dashboard/reports",
  history: "/dashboard/history",
  settings: "/dashboard/settings",
};

export default function BottomNav({
  username,
  liveBar,
}: {
  username: string;
  liveBar?: LiveFooterBar;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const active = getDashboardTabFromPathname(pathname);
  const topRow = liveBar ? (
    <div
      className="flex items-center gap-4 rounded-t-[20px] p-4"
      style={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.90)",
        boxShadow: "-4px -4px 24px 0px rgba(0,0,0,0.10)",
      }}
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[16px] font-medium text-[#ff6b8a]">
        {normalizeTikTokUsername(liveBar.username).charAt(0).toUpperCase() || "L"}
      </div>

      {/* Name + stats */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-medium leading-6 text-black">
          {normalizeTikTokUsername(liveBar.username)}
        </p>
        <div className="mt-0.5 flex items-center gap-3">
          {/* Viewers */}
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#787878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="#787878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#787878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#787878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[12px] leading-4.5 text-[#787878]">{liveBar.commentsCount}</span>
          </div>
          <div className="h-3 w-px bg-[#dadada]" />
          {/* Likes / orders */}
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="#787878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[12px] leading-4.5 text-[#787878]">{liveBar.ordersCount}</span>
          </div>
        </div>
      </div>

      {/* Action icons */}
      <div className="flex shrink-0 items-center gap-3 text-[#2b2b2b]">
        {/* Switch channel */}
        <button
          type="button"
          onClick={liveBar.onSwitchChannel}
          aria-label="Đổi kênh"
          className="flex h-6 w-6 items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Settings / filter */}
        <button
          type="button"
          aria-label="Cài đặt"
          className="flex h-6 w-6 items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M1 14h6M9 8h6M17 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
        {/* Stop / power */}
        <button
          type="button"
          onClick={liveBar.onDisconnect}
          disabled={liveBar.isDisconnecting}
          aria-label="Dừng LIVE"
          className="flex h-6 w-6 items-center justify-center disabled:opacity-50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  ) : null;

  return (
    <footer className="fixed bottom-0 left-1/2 z-30 w-full max-w-155 -translate-x-1/2 rounded-t-[28px] border border-black/10 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
      {topRow}
      <nav className="flex h-20 px-4 pb-4 pt-3">
        {ITEMS.map((item) => {
          const isActive = item.key === active;

          return (
            <button
              key={item.key}
              className="relative flex flex-1 flex-col items-center justify-center gap-1"
              onClick={() => router.push(ROUTES[item.key])}
              type="button"
            >
              {isActive && <span className="absolute -top-3 h-0.5 w-10 rounded-full bg-[#ff5f8a]" />}
              {item.icon(isActive)}
              <span
                className={`text-[11px] font-medium ${isActive ? "text-[#ff5f8a]" : "text-[#787878]"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
}
