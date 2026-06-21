"use client";

import { LiveHistoryItem } from "@/features/tiktok-live/types";
import { formatDuration, removeAt } from "@/utils/comment";
import { formatTime } from "@/utils/date";
import { useMemo, useState } from "react";

type GroupedLiveHistory = {
  dateKey: string;
  dateTitle: string;
  totalDuration: number;
  items: LiveHistoryItem[];
};

function getDateKey(dateString: string) {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getRelativeDateTitle(dateKey: string): string {
  const today = new Date();
  const todayKey = getDateKey(today.toISOString());

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday.toISOString());

  if (dateKey === todayKey) return "Hôm nay";
  if (dateKey === yesterdayKey) return "Hôm qua";

  const [y, m, d] = dateKey.split("-");
  return `${d}/${m}/${y}`;
}


function getSessionDuration(item: LiveHistoryItem) {
  if (item.durationSeconds) return item.durationSeconds;
  if (!item.startedAt || !item.endedAt) return 0;
  const start = new Date(item.startedAt).getTime();
  const end = new Date(item.endedAt).getTime();
  if (!start || !end) return 0;
  return Math.max(0, Math.floor((end - start) / 1000));
}


function formatTotalDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `Live ${h} giờ ${m} phút`;
  return `Live ${m} phút`;
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#787878" strokeWidth="1.5" />
      <path d="M12 7v5l3 3" stroke="#787878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#787878" strokeWidth="1.5" />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="#787878" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type SessionRowProps = {
  item: LiveHistoryItem;
  isLast: boolean;
  onSelect: (item: LiveHistoryItem) => void;
};

function SessionRow({ item, isLast, onSelect }: SessionRowProps) {
  const duration = getSessionDuration(item);
  const durationText = formatDuration(duration);

  return (
    <button
      type="button"
      className="w-full text-left"
      onClick={() => onSelect(item)}
    >
      <div className="flex flex-col gap-4 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-[14px] leading-5.5 font-medium text-black">
              Phiên {formatTime(item.startedAt)} - {formatTime(item.endedAt)}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <UserIcon />
                <span className="text-[12px] leading-4.5 whitespace-nowrap text-[#787878]">
                  {removeAt(item.username)}
                </span>
              </div>
              <div className="h-3 w-px bg-[#dadada]" />
              <div className="flex items-center gap-2">
                <ClockIcon />
                <span className="text-[12px] leading-4.5 whitespace-nowrap text-[#787878]">
                  {durationText}
                </span>
              </div>
            </div>
          </div>
          <ChevronRightIcon className="shrink-0 text-[#484848]" />
        </div>
        {!isLast && <div className="h-px w-full bg-[#f2f2f2]" />}
      </div>
    </button>
  );
}

type PlaceholderViewProps = {
  liveHistory: LiveHistoryItem[];
  onSelectSession: (item: LiveHistoryItem) => void;
};

export default function PlaceholderView({ liveHistory, onSelectSession }: PlaceholderViewProps) {
  const groups = useMemo<GroupedLiveHistory[]>(() => {
    const map = new Map<string, GroupedLiveHistory>();

    liveHistory?.forEach((item) => {
      if (!item.startedAt) return;
      if (Number(item.commentCount || item.comments?.length || 0) === 0) return;
      if (Number(item.orderCount || item.orders?.length || 0) === 0) return;

      const dateKey = getDateKey(item.startedAt);
      const existing = map.get(dateKey);

      if (!existing) {
        map.set(dateKey, {
          dateKey,
          dateTitle: getRelativeDateTitle(dateKey),
          totalDuration: getSessionDuration(item),
          items: [item],
        });
      } else {
        existing.totalDuration += getSessionDuration(item);
        existing.items.push(item);
      }
    });

    return Array.from(map.values());
  }, [liveHistory]);

  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const toggleGroup = (dateKey: string) => {
    setCollapsedMap((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#f2f2f2]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#b0b8c9" strokeWidth="1.5" />
            <path d="M12 7v5l3 3" stroke="#b0b8c9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-[14px] font-medium text-[#2b2b2b]">Chưa có lịch sử LIVE</p>
        <p className="mt-1 text-[12px] text-[#787878]">Các phiên live có comment sẽ xuất hiện ở đây.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto pb-6 [-webkit-overflow-scrolling:touch]">
      {groups.map((group, groupIndex) => {
        const isCollapsed = collapsedMap[group.dateKey];

        return (
          <div key={group.dateKey}>
            <div className="flex items-center justify-between px-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-[#ff6b8a]" />
                <span className="text-[14px] leading-5.5 text-[#2b2b2b]">
                  {group.dateTitle}
                </span>
                <div className="h-3 w-px bg-[#dadada]" />
                <span className="text-[12px] leading-4.5 text-[#787878]">
                  {formatTotalDuration(group.totalDuration)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleGroup(group.dateKey)}
                aria-label={isCollapsed ? "Mở rộng" : "Thu gọn"}
                className="flex size-6 items-center justify-center text-[#484848]"
              >
                <ChevronDownIcon
                  className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                />
              </button>
            </div>

            {!isCollapsed && (
              <div className="px-4">
                {group.items.map((item, idx) => (
                  <SessionRow
                    key={item.sessionId}
                    item={item}
                    isLast={idx === group.items.length - 1}
                    onSelect={onSelectSession}
                  />
                ))}
              </div>
            )}

            {groupIndex < groups.length - 1 && (
              <div className="mt-4 h-2 bg-[#f2f2f2]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
