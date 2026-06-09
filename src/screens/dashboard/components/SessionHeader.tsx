"use client";

import { TopTab } from "../../../types";

export default function SessionHeader({
  activeTab,
  onChangeTab,
}: {
  isConnected: boolean;
  status: string;
  tiktokUsername: string;
  currentLiveSession: unknown;
  liveDurationSeconds: number;
  liveNowText: string;
  activeTab: TopTab;
  onChangeTab: (tab: TopTab) => void;
}) {
  return (
    <header className="bg-linear-to-b from-[#FF6B8A]/30 via-[#FFA66D]/20 to-white/0 px-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
      <div className="flex items-center justify-center gap-12">
        <button
          className={`border-b-2 px-1 pb-2 text-[20px] font-medium ${activeTab === "tiktok" ? "border-[#ff5f8a] text-[#ff5f8a]" : "border-transparent text-[#7e7474]"}`}
          onClick={() => onChangeTab("tiktok")}
          type="button"
        >
          Tiktok
        </button>

        <button
          className="relative border-b-2 border-transparent px-1 pb-2 text-[20px] font-medium text-[#7e7474] opacity-60"
          onClick={() => onChangeTab("facebook")}
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
