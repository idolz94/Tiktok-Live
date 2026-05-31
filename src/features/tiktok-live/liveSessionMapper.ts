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

  if (!start || !end) return 0;

  return Math.max(0, Math.floor((end - start) / 1000));
}

export function normalizeLiveSession(payload: unknown): LiveHistoryItem {
  const data = (payload || {}) as Record<string, any>;

  const sessionId = String(data.sessionId || data.session_id || data.id || createId());
  const startedAt = String(data.startedAt || data.started_at || new Date().toISOString());
  const endedAt = data.endedAt || data.ended_at || null;

  return {
    id: String(data.dbLiveSessionId || data.db_live_session_id || data.id || sessionId),
    sessionId,
    username: String(data.username || data.tiktokUsername || ""),
    startedAt,
    endedAt,
    durationSeconds: Number(
      data.durationSeconds ||
        data.duration_seconds ||
        (endedAt ? calcDurationSeconds(startedAt, endedAt) : 0),
    ),
    commentCount: Number(data.commentCount || data.comment_count || 0),
    orderCount: Number(data.orderCount || data.order_count || 0),
    status: data.status || (endedAt ? "ended" : "running"),
    reason: data.reason || data.end_reason || "",
    comments: Array.isArray(data.comments) ? data.comments : [],
    orders: Array.isArray(data.orders) ? data.orders : [],
    createdAt: data.createdAt || data.created_at || startedAt,
    updatedAt: data.updatedAt || data.updated_at || "",
  };
}
