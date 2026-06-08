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

function formatDateTitle(dateString: string) {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getSessionDuration(item: LiveHistoryItem) {
  if (item.durationSeconds) return item.durationSeconds;

  if (!item.startedAt || !item.endedAt) return 0;

  const start = new Date(item.startedAt).getTime();
  const end = new Date(item.endedAt).getTime();

  if (!start || !end) return 0;

  return Math.max(0, Math.floor((end - start) / 1000));
}

function shouldShowSession(item: LiveHistoryItem) {
  const duration = getSessionDuration(item);
  const commentCount = Number(item.commentCount || item.comments?.length || 0);
  const orderCount = Number(item.orderCount || item.orders?.length || 0);

  return duration > 0 || commentCount > 0 || orderCount > 0;
}

export default function PlaceholderView({ liveHistory }: { liveHistory: LiveHistoryItem[] }) {
  const groups = useMemo<GroupedLiveHistory[]>(() => {
    const map = new Map<string, GroupedLiveHistory>();

    liveHistory?.forEach((item) => {
      if (!item.startedAt) return;
      if (!shouldShowSession(item)) return;

      const dateKey = getDateKey(item.startedAt);
      const oldGroup = map.get(dateKey);

      if (!oldGroup) {
        map.set(dateKey, {
          dateKey,
          dateTitle: formatDateTitle(item.startedAt),
          totalDuration: getSessionDuration(item),
          items: [item],
        });
      } else {
        oldGroup.totalDuration += getSessionDuration(item);
        oldGroup.items.push(item);
      }
    });

    return Array.from(map.values());
  }, [liveHistory]);

  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const toggleGroup = (dateKey: string) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  return (
    <div className="space-y-3 bg-slate-100 px-3 py-3 text-left">
      {groups.map((group) => {
        const isCollapsed = collapsedMap[group.dateKey];

        return (
          <section key={group.dateKey} className="overflow-hidden rounded-xl bg-white shadow-sm">
            <button
              type="button"
              onClick={() => toggleGroup(group.dateKey)}
              className="flex w-full items-center justify-between border-b border-gray-200 px-4 py-3 text-left"
            >
              <h3 className="text-base font-bold text-gray-800">
                {group.dateTitle} - LIVE {formatDuration(group.totalDuration)}
              </h3>

              <span className="text-xl font-bold text-gray-800">{isCollapsed ? "⌄" : "⌃"}</span>
            </button>

            {!isCollapsed && (
              <div className="px-4">
                {group.items.map((item) => {
                  const duration = getSessionDuration(item);

                  return (
                    <div
                      key={item.sessionId}
                      className="flex items-center justify-between border-b border-gray-200 py-3 last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500">▣</span>

                          <p className="truncate text-base font-semibold text-gray-800">
                            Phiên {formatTime(item.startedAt)} - {formatTime(item.endedAt)}
                            <span className="ml-1 font-normal text-gray-400">
                              ({formatDuration(duration)})
                            </span>
                          </p>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-yellow-500">☻</span>

                          <p className="truncate text-base font-semibold text-gray-700">
                            {removeAt(item.username)}
                          </p>
                        </div>

                        <div className="mt-1 text-sm font-semibold text-slate-400">
                          {item.commentCount || item.comments?.length || 0} comment · {item.orderCount || item.orders?.length || 0} đơn
                        </div>
                      </div>

                      <button
                        type="button"
                        className="ml-3 text-3xl leading-none text-gray-500"
                        onClick={() => {}}
                      >
                        ›
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
