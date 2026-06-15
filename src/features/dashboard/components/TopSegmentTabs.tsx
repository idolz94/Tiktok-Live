"use client";

import type { TopTab } from "@/types";

export default function TopSegmentTabs({
  activeTab,
  onChange,
}: {
  activeTab: TopTab;
  onChange: (tab: TopTab) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-12 px-3 pb-3">
      <button
        className={`border-b-2 px-1 pb-2 text-[20px] font-medium ${activeTab === "tiktok" ? "border-[#ff5f8a] text-[#ff5f8a]" : "border-transparent text-[#7e7474]"}`}
        onClick={() => onChange("tiktok")}
        type="button"
      >
        Tiktok
      </button>

      <button
        className="relative border-b-2 border-transparent px-1 pb-2 text-[20px] font-medium text-[#7e7474] opacity-60"
        onClick={() => onChange("facebook")}
        type="button"
      >
        Facebook
        <span className="absolute -right-9 -top-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
          Soon
        </span>
      </button>
    </div>
  );
}
