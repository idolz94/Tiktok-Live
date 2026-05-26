"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDate, formatDuration } from "@/utils/comment";
import LiveStatusPill from "../../../components/LiveStatusPill";
import { formatTime } from "@/utils/date";

type LiveSession = {
  sessionId?: string;
  id?: string;
  username: string;
  startedAt: string;
  endedAt?: string | null;
  durationSeconds?: number;
  commentCount?: number;
};

export default function SessionHeader({
  isConnected,
  status,
  tiktokUsername,
  currentLiveSession,
}: {
  isConnected: boolean;
  status: string;
  tiktokUsername: string;
  currentLiveSession: LiveSession | null;
}) {
  const [now, setNow] = useState(() => Date.now());

  const isRunning = Boolean(currentLiveSession?.startedAt) && !currentLiveSession?.endedAt;

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, currentLiveSession?.sessionId, currentLiveSession?.startedAt]);

  const duration = useMemo(() => {
    if (!currentLiveSession?.startedAt) return 0;

    if (currentLiveSession.endedAt) {
      return currentLiveSession.durationSeconds || 0;
    }

    const start = new Date(currentLiveSession.startedAt).getTime();

    if (!start) return 0;

    return Math.max(0, Math.floor((now - start) / 1000));
  }, [currentLiveSession, now]);

  const startTime = currentLiveSession?.startedAt ? formatTime(currentLiveSession.startedAt) : "";

  const endTime = currentLiveSession?.endedAt
    ? formatTime(currentLiveSession.endedAt)
    : isRunning
      ? formatTime(new Date(now).toISOString())
      : "";

  return (
    <header className="bg-[#fff7cf] px-4 pt-1.5 pb-2.5">
      <div className="flex min-h-11 items-center justify-between">
        <button
          className="inline-flex h-[42px] w-[42px] items-center justify-center text-[40px] leading-10 text-gray-900"
          type="button"
        >
          ‹
        </button>
        <h1 className="m-0 text-[22px] font-black text-[#273044]">Chi tiết phiên LIVE</h1>
        <div className="inline-flex h-[42px] w-[42px] items-center justify-center text-[40px] leading-10 text-gray-900" />
      </div>

      <div className="mt-1">
        {currentLiveSession?.startedAt ? (
          <p className="text-lg font-bold text-gray-800">
            ▣ phiên {formatDate(currentLiveSession.startedAt)} {startTime} - {endTime}{" "}
            <span className="text-gray-400">({formatDuration(duration)})</span>
          </p>
        ) : (
          <p className="text-lg font-bold text-gray-800">▣ Đang chờ comment đầu tiên...</p>
        )}

        <p className="m-0 mt-1 text-lg font-black text-[#273044]">☻ {tiktokUsername}</p>
      </div>

      <LiveStatusPill isConnected={isConnected} status={status} />
    </header>
  );
}
