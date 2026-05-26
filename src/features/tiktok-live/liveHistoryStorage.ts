import type { LiveHistoryItem } from "@/features/tiktok-live/types";

const LIVE_HISTORY_KEY = "LIVE_HISTORY";

export function readLiveHistory(): LiveHistoryItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LIVE_HISTORY_KEY);
    const parsed = JSON.parse(raw || "[]");

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLiveHistory(data: LiveHistoryItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LIVE_HISTORY_KEY, JSON.stringify(data));
}

export function clearLiveHistoryStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LIVE_HISTORY_KEY);
}

export function saveHistoryItem(item: LiveHistoryItem) {
  const oldHistory = readLiveHistory();

  const existed = oldHistory.find(
    (history) => history.sessionId === item.sessionId
  );

  const fixedItem: LiveHistoryItem = {
    ...item,
    comments: item.comments.length > 0 ? item.comments : existed?.comments || [],
    commentCount: Math.max(
      item.commentCount || 0,
      item.comments.length || existed?.comments?.length || 0
    ),
  };

  const nextHistory = [
    fixedItem,
    ...oldHistory.filter((history) => history.sessionId !== item.sessionId),
  ].slice(0, 300);

  writeLiveHistory(nextHistory);

  return nextHistory;
}