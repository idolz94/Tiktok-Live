"use client";

import type { ReactNode } from "react";
import { BottomTab } from "../types";

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

export default function BottomNav({
  active,
  onChange,
}: {
  active: BottomTab;
  onChange: (tab: BottomTab) => void;
}) {
  return (
    <nav className="fixed bottom-0 flex min-h-19.5 w-full shrink-0 border-t border-gray-100 bg-white px-0 pt-2 pb-3">
      {ITEMS.map((item) => {
        const isActive = item.key === active;

        return (
          <button
            key={item.key}
            className="flex flex-1 flex-col items-center justify-center gap-1"
            onClick={() => onChange(item.key)}
            type="button"
          >
            {item.icon(isActive)}
            <span
              className={`text-[11px] font-bold ${isActive ? "text-[#ff5f8a]" : "text-[#b0b8c9]"}`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
