"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LiveComment, LiveStatus } from "@/types/live-comment";
import {
  buildLiveStreamEventsUrl,
  stopTikTokLiveApi,
  subscribeTikTokLiveApi,
} from "@/features/tiktok-live/sseApi";
import { normalizeComment, unwrapSseCommentPayload } from "@/utils/comment";
import { getRunningSessionApi } from "@/api/liveCommentsApi";

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
  return normalizeComment(unwrapSseCommentPayload(raw));
}

function getPayloadUsername(payload: any) {
  return payload?.username || payload?.liveUsername || payload?.tiktokUsername || payload?.tiktok_username || "";
}

export function useTikTokLiveSSE() {
  const eventSourceRef = useRef<EventSource | null>(null);

  const [clientId] = useState(() => getOrCreateClientId());
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [status, setStatus] = useState<LiveStatus>({
    status: "idle",
    message: "Chưa kết nối Backend SSE",
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
      const data = await subscribeTikTokLiveApi({
        clientId: clientId || getOrCreateClientId(),
        username,
      });

      setSubscribedUsername(data.username || username);
      setStatus({
        status: data.status || "starting",
        message: data.message || "Đã gửi yêu cầu bắt đầu live stream.",
      });
      return data;
    },
    [clientId],
  );

  const stopLive = useCallback(async () => {
    await stopTikTokLiveApi({
      clientId: clientId || getOrCreateClientId(),
      username: subscribedUsername,
    });

    setSubscribedUsername("");
  }, [clientId, subscribedUsername]);

  const sendFeedback = useCallback(
    async (
      _comment: LiveComment,
      _action: "created_order" | "ignored" | "marked_wrong",
      _extra?: {
        correctedIntent?: string;
        correctedScore?: number;
        note?: string;
      },
    ) => {
      // Flow mới: AI/feedback không còn xử lý ở Python. Giữ hàm này để không vỡ UI cũ.
      return null;
    },
    [],
  );

  useEffect(() => {
    const url = buildLiveStreamEventsUrl(clientId);
    const eventSource = new EventSource(url, {
      withCredentials: true,
    });
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("CONNECTED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setIsSSEConnected(true);
      setStatus({
        status: "connected",
        message: "Backend SSE đã kết nối",
        createdAt: payload.connectedAt || payload.serverTime,
      });

      // Hydrate comments from the running session so browser refresh doesn't lose history
      getRunningSessionApi()
        .then((result) => {
          if (!result.session) return;

          const restored = result.comments
            .map((raw: any) => normalizeComment(unwrapSseCommentPayload(raw)))
            .filter(Boolean) as LiveComment[];

          if (restored.length > 0) {
            setComments(restored);
          }

          if (result.session.tiktokUsername) {
            setSubscribedUsername(result.session.tiktokUsername);
          }
        })
        .catch(() => {
          // Silently ignore — SSE will deliver new comments normally
        });
    });

    eventSource.addEventListener("PING", () => {
      setIsSSEConnected(true);
    });

    eventSource.addEventListener("SUBSCRIBING", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setStatus({
        status: "subscribing",
        message: `Đang chuyển sang ${getPayloadUsername(payload)}`,
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("SUBSCRIBED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));
      const latestComments = Array.isArray(payload.comments)
        ? payload.comments.map(normalizeUpdatedComment).filter(Boolean)
        : [];

      setSubscribedUsername(getPayloadUsername(payload));
      setComments(latestComments as LiveComment[]);

      setStatus({
        status: "subscribed",
        message: `Đã subscribe ${getPayloadUsername(payload)}`,
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("LIVE_CONNECTED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));
      const username = getPayloadUsername(payload);

      setSubscribedUsername(username);
      setStatus({
        status: "live_connected",
        message: `Đã kết nối LIVE ${username}`,
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("LIVE_ERROR", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setComments([]);
      setStatus({
        status: "live_error",
        message: payload.message || "TikTok LIVE lỗi",
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("LIVE_DISCONNECTED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setComments([]);
      setStatus({
        status: "live_disconnected",
        message: `LIVE ${getPayloadUsername(payload)} đã ngắt`,
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

    eventSource.addEventListener("COMMENT_SAVED", (event) => {
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

          return updatedComment || item;
        }),
      );
    });

    eventSource.addEventListener("LIVE_TIME_STARTED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setStatus({
        status: "live_time_started",
        message: `Bắt đầu tính phiên live: ${getPayloadUsername(payload)}`,
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
        message: `Đã dừng ${getPayloadUsername(payload)}`,
        createdAt: payload.createdAt,
      });
    });

    eventSource.addEventListener("COLLECTOR_STOPPED", (event) => {
      const payload = JSON.parse(String((event as MessageEvent).data || "{}"));

      setComments([]);
      setSubscribedUsername("");
      setStatus({
        status: "unsubscribed",
        message: `Collector đã dừng ${getPayloadUsername(payload)}`,
        createdAt: payload.createdAt,
      });
    });

    eventSource.onerror = () => {
      setIsSSEConnected(false);
      setStatus({
        status: "sse_error",
        message: "Backend SSE bị ngắt, trình duyệt sẽ tự reconnect",
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
