import type { LiveHistoryItem } from "@/features/tiktok-live/types";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function calcDurationSeconds(startedAt: string, endedAt: string) {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();

  if (!start || !end) {
    return 0;
  }

  return Math.max(0, Math.floor((end - start) / 1000));
}

export function normalizeLiveSession(payload: unknown): LiveHistoryItem {
  const data = (payload || {}) as Record<string, any>;

  const sessionId = String(
    data.sessionId || data.session_id || data.id || createId()
  );

  const startedAt = String(
    data.startedAt || data.started_at || new Date().toISOString()
  );

  const endedAt = data.endedAt || data.ended_at || null;

  return {
    id: sessionId,
    sessionId,
    username: String(data.username || data.tiktokUsername || ""),
    startedAt,
    endedAt,
    durationSeconds: Number(
      data.durationSeconds ||
        data.duration_seconds ||
        (endedAt ? calcDurationSeconds(startedAt, endedAt) : 0)
    ),
    commentCount: Number(data.commentCount || data.comment_count || 0),
    reason: data.reason,
    comments: Array.isArray(data.comments) ? data.comments : [],
  };
}