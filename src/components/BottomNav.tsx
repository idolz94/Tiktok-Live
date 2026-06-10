"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { DotLottie } from "@lottiefiles/dotlottie-react";
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

const ITEMS: { key: BottomTab; label: string; animationSrc: string }[] = [
  { key: "home", label: "Home", animationSrc: "/assets/animations/home.json" },
  { key: "customers", label: "Khách hàng", animationSrc: "/assets/animations/customers.json" },
  { key: "shipping", label: "Vận đơn", animationSrc: "/assets/animations/shipping.json" },
  { key: "reports", label: "Báo cáo", animationSrc: "/assets/animations/reports.json" },
  { key: "history", label: "Lịch sử", animationSrc: "/assets/animations/history.json" },
  { key: "settings", label: "Cài đặt", animationSrc: "/assets/animations/settings.json" },
];

function LottieIcon({ src, isActive }: { src: string; isActive: boolean }) {
  const dotLottieRef = useRef<DotLottie | null>(null);
  const prevActiveRef = useRef(false);

  useEffect(() => {
    if (isActive && !prevActiveRef.current) {
      dotLottieRef.current?.play();
    }

    if (!isActive && prevActiveRef.current) {
      dotLottieRef.current?.stop();
    }

    prevActiveRef.current = isActive;
  }, [isActive]);

  return (
    <DotLottieReact
      src={src}
      dotLottieRefCallback={(ref) => {
        dotLottieRef.current = ref;
      }}
      autoplay={false}
      loop={false}
      style={{ width: 24, height: 24 }}
    />
  );
}

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
  footerHidden = false,
}: {
  username: string;
  liveBar?: LiveFooterBar;
  footerHidden?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameActive = getDashboardTabFromPathname(pathname);
  const [optimisticActive, setOptimisticActive] = useState<BottomTab>(pathnameActive);
  const active = optimisticActive;

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setOptimisticActive(pathnameActive);
    });

    return () => cancelAnimationFrame(frameId);
  }, [pathnameActive]);

  const prefetchedRoutesRef = useRef<Set<string>>(new Set());

  function prefetchRouteOnce(route: string) {
    if (prefetchedRoutesRef.current.has(route)) return;

    prefetchedRoutesRef.current.add(route);
    router.prefetch(route);
  }

  const topRow = liveBar ? (
    <div
      className="flex items-center gap-4 rounded-t-[20px] p-4"
      style={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.90)",
        boxShadow: "-4px -4px 24px 0px rgba(0,0,0,0.10)",
      }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[16px] font-medium text-[#ff6b8a]">
        {normalizeTikTokUsername(liveBar.username).charAt(0).toUpperCase() || "L"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-medium leading-6 text-black">
          {normalizeTikTokUsername(liveBar.username)}
        </p>
        <div className="mt-0.5 flex items-center gap-3">
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
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="#787878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[12px] leading-4.5 text-[#787878]">{liveBar.ordersCount}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 text-[#2b2b2b]">
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
    <footer
      className={`fixed bottom-0 left-1/2 z-30 w-full max-w-155 -translate-x-1/2 rounded-t-[28px] border border-black/10 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-[transform,opacity] duration-300 ease-out ${
        footerHidden ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
    >
      {topRow}
      <nav className="flex h-14  pt-2">
        {ITEMS.map((item) => {
          const isActive = item.key === active;

          return (
            <button
              key={item.key}
              className="relative flex flex-1 pb-1 flex-col items-center justify-between gap-1"
              onPointerEnter={() => prefetchRouteOnce(ROUTES[item.key])}
              onTouchStart={() => prefetchRouteOnce(ROUTES[item.key])}
              onClick={() => {
                const route = ROUTES[item.key];

                prefetchRouteOnce(route);
                setOptimisticActive(item.key);
                router.push(route);
              }}
              type="button"
            >
              {isActive && <span className="absolute bottom-0 h-0.5 w-10 rounded-full bg-[#ff5f8a]" />}
              <LottieIcon src={item.animationSrc} isActive={isActive} />
              <span
                className={`text-[10px] font-medium ${isActive ? "text-[#ff5f8a]" : "text-[#787878]"}`}
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
