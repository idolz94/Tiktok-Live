"use client";

import { BottomTab } from "../types";

const ITEMS: { key: BottomTab; icon: string; label: string }[] = [
  { key: "home", icon: "⌂", label: "Trang chủ" },
  { key: "customers", icon: "👥", label: "Khách hàng" },
  { key: "shipping", icon: "🚚", label: "Vận đơn" },
  { key: "reports", icon: "▣", label: "Báo cáo" },
  { key: "settings", icon: "⚙", label: "Cài đặt" },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: BottomTab;
  onChange: (tab: BottomTab) => void;
}) {
  return (
    <nav className="fixed bottom-0 flex min-h-[78px] w-full shrink-0 border-t border-gray-300 bg-white px-0 pt-2 pb-3">
      {ITEMS.map((item) => {
        const isActive = item.key === active;

        return (
          <button
            key={item.key}
            className="flex flex-1 flex-col items-center justify-center"
            onClick={() => onChange(item.key)}
            type="button"
          >
            <span
              className={`text-[25px] font-black ${isActive ? "text-[#f2c300]" : "text-[#8b949e]"}`}
            >
              {item.icon}
            </span>
            <span
              className={`mt-1 text-xs font-extrabold ${isActive ? "text-[#f2c300]" : "text-[#8b949e]"}`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
