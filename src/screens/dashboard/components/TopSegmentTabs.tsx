"use client";

import { TopTab } from "../../../types";

export default function TopSegmentTabs({
  activeTab,
  onChange,
}: {
  activeTab: TopTab;
  onChange: (tab: TopTab) => void;
}) {
  return (
    <div className="flex bg-[#d3fbe28c] p-1">
      <button
        className={`min-h-12 flex-1 rounded-xl text-base font-black ${activeTab === "connect" ? "bg-white/80 text-[#17313a]" : "text-[#8aa09a]"}`}
        onClick={() => onChange("connect")}
        type="button"
      >
        KẾT NỐI LIVE
      </button>

      <button
        className={`min-h-12 flex-1 rounded-xl text-base font-black ${activeTab === "history" ? "bg-white/80 text-[#17313a]" : "text-[#8aa09a]"}`}
        onClick={() => onChange("history")}
        type="button"
      >
        LỊCH SỬ
      </button>
    </div>
  );
}
