"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LiveComment, LiveStatus } from "@/types/live-comment";

const PYTHON_LIVE_URL =
  process.env.NEXT_PUBLIC_PYTHON_LIVE_URL || "http://localhost:8765";

function getOrCreateClientId() {
  if (typeof window === "undefined") return "";

  const key = "TIKTOK_LIVE_CLIENT_ID";
  const existing = window.localStorage.getItem(key);

  if (existing) return existing;

  const nextId = `web_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, nextId);

  return nextId;
}

export function normalizeUpdatedComment(raw: any) {
  if (!raw) return null;

  const text = String(raw.text || raw.comment || raw.rawText || raw.raw_text || "").trim();

  if (!text) return null;

  const uniqueId = String(
    raw.uniqueId ||
      raw.unique_id ||
      raw.tiktokUniqueId ||
      raw.tiktok_unique_id ||
      raw.raw?.uniqueId ||
      raw.raw?.unique_id ||
      "",
  ).trim();

  const tiktokUsername = String(
    raw.customerTikTokUsername ||
      raw.customer_tiktok_username ||
      raw.tiktokUsername ||
      raw.tiktok_username ||
      uniqueId ||
      "",
  ).trim();

  const customerTikTokUsername = tiktokUsername
    ? tiktokUsername.startsWith("@")
      ? tiktokUsername
      : `@${tiktokUsername}`
    : "";

  const createdAt = raw.createdAt || raw.created_at || new Date().toISOString();
  const avatar = raw.avatar || raw.avatarUrl || raw.avatar_url || raw.profilePictureUrl || "";

  return {
    id: String(raw.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`),
    username: raw.username || raw.displayName || raw.display_name || customerTikTokUsername || "Unknown",
    displayName: raw.displayName || raw.display_name || raw.username || "Unknown",
    customerTikTokUsername,
    uniqueId,
    avatar,
    avatarUrl: avatar,
    comment: text,
    intent: raw.intent || "normal",
    priorityLevel: raw.priorityLevel || raw.priority_level || "normal",
    finalScore: Number(raw.finalScore || raw.final_score || 0),
    aiScore: Number(raw.aiScore || raw.ai_score || 0),
    ruleScore: Number(raw.ruleScore || raw.rule_score || 0),
    aiStatus: raw.aiStatus || raw.ai_status || "none",
    aiReason: raw.aiReason || raw.ai_reason || "",
    matchedReasons: raw.matchedReasons || raw.matched_reasons || [],
    missingInfo: raw.missingInfo || raw.missing_info || [],
    isOrderCreated: Boolean(raw.isOrderCreated || raw.is_order_created),
    orderId: raw.orderId || raw.order_id || "",
    createdAt,
    raw,
  };
}

export function useTikTokLiveSSE() {
  const eventSourceRef = useRef<EventSource | null>(null);

  const [clientId] = useState(() => getOrCreateClientId());
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [status, setStatus] = useState<LiveStatus>({
    status: "idle",
    message: "Chưa kết nối SSE",
  });
  const [isSSEConnected, setIsSSEConnected] = useState(false);
  const [subscribedUsername, setSubscribedUsername] = useState("");

  const priorityComments = useMemo(() => {
    return comments
      .filter((item) => Number(item.finalScore || 0) >= 50)
      .sort((a, b) => {
        const scoreA = Number(a.finalScore || 0);
        const scoreB = Number(b.finalScore || 0);

        if (scoreB !== scoreA) return scoreB - scoreA;

        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
  }, [comments]);

  const startLive = useCallback(
    async (username: string) => {
      const targetClientId = clientId || getOrCreateClientId();
      const response = await fetch(`${PYTHON_LIVE_URL}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: targetClientId,
          username,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.message || "Không thể subscribe TikTok LIVE");
      }

      setSubscribedUsername(data.username || username);
      return data;
    },
    [clientId]
  );

  const stopLive = useCallback(async () => {
    const targetClientId = clientId || getOrCreateClientId();

    await fetch(`${PYTHON_LIVE_URL}/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: targetClientId,
      }),
    });

    setSubscribedUsername("");
  }, [clientId]);

  const sendFeedback = useCallback(
    async (
      comment: LiveComment,
      action: "created_order" | "ignored" | "marked_wrong",
      extra?: {
        correctedIntent?: string;
        correctedScore?: number;
        note?: string;
      }
    ) => {
      const targetClientId = clientId || getOrCreateClientId();

      await fetch(`${PYTHON_LIVE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: targetClientId,
          commentId: comment.id,
          action,
          correctedIntent: extra?.correctedIntent,
          correctedScore: extra?.correctedScore,
          note: extra?.note,
        }),
      });
    },
    [clientId]
  );

  useEffect(() => {

    const url = `${PYTHON_LIVE_URL}/events?clientId=${encodeURIComponent(
      clientId
    )}`;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("CONNECTED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setIsSSEConnected(true);
      setStatus({
        status: "connected",
        message: payload.message || "SSE đã kết nối",
        createdAt: payload.serverTime,
      });
    });

    eventSource.addEventListener("SUBSCRIBING", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setStatus({
        status: "subscribing",
        message: `Đang chuyển sang ${payload.username}`,
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("SUBSCRIBED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));
      const latestComments = Array.isArray(payload.comments)
        ? payload.comments.map(normalizeUpdatedComment)
        : [];

      setSubscribedUsername(payload.username || "");
      setComments(latestComments);

      setStatus({
        status: "subscribed",
        message: `Đã subscribe ${payload.username}`,
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("LIVE_CONNECTED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setStatus({
        status: "live_connected",
        message: `Đã kết nối LIVE ${payload.username}`,
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("LIVE_ERROR", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setStatus({
        status: "live_error",
        message: payload.message || "TikTok LIVE lỗi",
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("LIVE_DISCONNECTED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setStatus({
        status: "live_disconnected",
        message: `LIVE ${payload.username} đã ngắt`,
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("COMMENT", (event) => {
      const payload = normalizeUpdatedComment(
        JSON.parse(String((event as MessageEvent).data || "{}")),
      );

      if (!payload) return;

      setComments((prev) => {
        const exists = prev.some((item) => item.id === payload.id);
        if (exists) return prev;

        return [payload, ...prev].slice(0, 500);
      });
    });

    eventSource.addEventListener("COMMENT_UPDATED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));
      const commentId = payload.commentId || payload.comment_id;
      const patch = payload.patch || {};

     setComments((prev) =>
      prev.map((item) => {
        if (item.id !== commentId) return item;

        const updatedComment = normalizeUpdatedComment({
          ...item,
          ...patch,
        });

        if (!updatedComment) return item;

        return updatedComment;
      }),
    );
    });

    eventSource.addEventListener("LIVE_TIME_STARTED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setStatus({
        status: "live_time_started",
        message: `Bắt đầu tính phiên live: ${payload.username}`,
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("LIVE_TIME_ENDED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setStatus({
        status: "live_time_ended",
        message: `Kết thúc phiên: ${payload.commentCount || 0} comment`,
        createdAt: payload.endedAt || payload.createdAt,
      });
    });

    eventSource.addEventListener("UNSUBSCRIBED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setSubscribedUsername("");
      setStatus({
        status: "unsubscribed",
        message: `Đã dừng ${payload.username}`,
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("COMMENT_FEEDBACK_SAVED", () => {
      // Có thể show toast tại đây.
    });

    eventSource.onerror = () => {
      setIsSSEConnected(false);
      setStatus({
        status: "sse_error",
        message: "SSE bị ngắt, trình duyệt sẽ tự reconnect",
      });
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [clientId]);

  return {
    clientId,
    comments,
    priorityComments,
    status,
    isSSEConnected,
    subscribedUsername,
    startLive,
    stopLive,
    sendFeedback,
    setComments,
  };
}
