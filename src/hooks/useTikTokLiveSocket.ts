"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TIKTOK_USERNAME } from "@/constants/config";
import type { LiveComment } from "@/types";
import { useTikTokComments } from "@/features/tiktok-live/useTikTokComments";
import { useTikTokLiveSession } from "@/features/tiktok-live/useTikTokLiveSession";
import {
  getSseBaseUrl,
  sendStopBeacon,
  stopTikTokLiveApi,
  subscribeTikTokLiveApi,
} from "@/features/tiktok-live/sseApi";
import { normalizeTikTokUsername } from "@/utils/comment";

function createClientId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}
type UseTikTokLiveSocketOptions = {
  initialUsername?: string | null;
};

export function useTikTokLiveSocket(options: UseTikTokLiveSocketOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const clientIdRef = useRef(createClientId());
  const isManualCloseRef = useRef(false);
  const tiktokUsernameRef = useRef(normalizeTikTokUsername(TIKTOK_USERNAME));

  const [status, setStatus] = useState("Đang kết nối server SSE...");
  const [isConnected, setIsConnected] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState(
  options.initialUsername || TIKTOK_USERNAME,
);

  const {
    comments,
    setComments,
    addCommentToList,
    replaceSnapshot,
    clearComments,
  } = useTikTokComments();

  const {
    currentLiveSession,
    liveHistory,
    liveDurationSeconds,
    liveNowText,
    clearLiveHistory,
    finalizeCurrentSessionLocally,
    startSessionFromPayload,
    endSessionFromPayload,
    updateSessionStatusFromPayload,
    addCommentToCurrentSession,
    resetCurrentSession,
  } = useTikTokLiveSession();

  const handleServerEvent = useCallback(
    (type: string, payload: Record<string, any>) => {
      if (type === "CONNECTED") {
        setStatus("Đã kết nối server SSE");
        setIsConnected(true);
        return;
      }

      if (type === "SUBSCRIBING") {
        setStatus(`Đang chuẩn bị lấy comment LIVE: ${payload.username || ""}`);
        return;
      }

      if (type === "SUBSCRIBED") {
        const username = payload.username || payload.tiktokUsername || "";

        if (username) {
          tiktokUsernameRef.current = username;
          setTiktokUsername(username);
        }

        const snapshot = payload.comments || [];
        replaceSnapshot(Array.isArray(snapshot) ? snapshot : []);

        setStatus(`Đã subscribe LIVE ${username}, đang chờ comment đầu tiên...`);
        return;
      }

      if (type === "LIVE_TIME_STARTED") {
        startSessionFromPayload(payload);
        setStatus(`Bắt đầu phiên nhận comment: ${payload.username || ""}`);
        return;
      }

      if (type === "LIVE_TIME_ENDED") {
        endSessionFromPayload(payload);
        setStatus(`Đã lưu phiên LIVE: ${payload.username || ""}`);
        return;
      }

      if (type === "LIVE_TIME_STATUS") {
        updateSessionStatusFromPayload(payload);
        return;
      }

      if (type === "UNSUBSCRIBED") {
        finalizeCurrentSessionLocally("unsubscribed");
        setComments([]);
        setStatus(`Đã rời LIVE: ${payload.username || ""}`);
        return;
      }

      if (type === "LIVE_CONNECTED") {
        setStatus(`Đã kết nối TikTok Live: ${payload.username || ""}`);
        return;
      }

      if (type === "LIVE_DISCONNECTED") {
        finalizeCurrentSessionLocally("live_disconnected");
        setStatus(`TikTok Live đã ngắt: ${payload.username || ""}`);
        return;
      }

      if (type === "LIVE_ERROR") {
        finalizeCurrentSessionLocally("live_error");
        setStatus(
          `TikTok lỗi ${payload.username || ""}: ${
            payload.message || "Không rõ lỗi"
          }`
        );
        return;
      }

      if (type === "SNAPSHOT") {
        const snapshot = payload.comments || [];
        replaceSnapshot(Array.isArray(snapshot) ? snapshot : []);
        return;
      }

      if (type === "COMMENT") {
        const comment = addCommentToList(payload);

        if (comment) {
          addCommentToCurrentSession(comment);
        }
      }
    },
    [
      addCommentToCurrentSession,
      addCommentToList,
      endSessionFromPayload,
      finalizeCurrentSessionLocally,
      replaceSnapshot,
      setComments,
      startSessionFromPayload,
      updateSessionStatusFromPayload,
    ]
  );

  const handleEventSourceMessage = useCallback(
    (type: string, event: MessageEvent) => {
      try {
        const payload = JSON.parse(String(event.data || "{}"));
        handleServerEvent(type, payload);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("SSE parse error:", error);
        }
      }
    },
    [handleServerEvent]
  );

  const connectSse = useCallback(() => {
    const baseUrl = getSseBaseUrl();
    const clientId = clientIdRef.current;

    if (!baseUrl) {
      setStatus("Thiếu SSE URL");
      return;
    }

    isManualCloseRef.current = false;

    eventSourceRef.current?.close();

    const eventSource = new EventSource(
      `${baseUrl}/events?clientId=${encodeURIComponent(clientId)}`
    );

    eventSourceRef.current = eventSource;

    const eventTypes = [
      "CONNECTED",
      "SUBSCRIBING",
      "SUBSCRIBED",
      "LIVE_TIME_STARTED",
      "LIVE_TIME_ENDED",
      "LIVE_TIME_STATUS",
      "UNSUBSCRIBED",
      "LIVE_CONNECTED",
      "LIVE_DISCONNECTED",
      "LIVE_ERROR",
      "SNAPSHOT",
      "COMMENT",
    ];

    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (event) => {
        handleEventSourceMessage(eventType, event as MessageEvent);
      });
    });

    eventSource.onopen = () => {
      setIsConnected(true);
      setStatus("Đã kết nối server SSE");
    };

    eventSource.onerror = () => {
      if (isManualCloseRef.current) return;

      setIsConnected(false);
      setStatus("SSE mất kết nối, browser đang tự kết nối lại...");
    };
  }, [handleEventSourceMessage]);

  const subscribeTikTokUsername = useCallback(
    async (username: string) => {
      const nextUsername = normalizeTikTokUsername(username);

      if (!nextUsername) {
        setStatus("Vui lòng nhập TikTok username");
        return false;
      }

      const oldUsername = tiktokUsernameRef.current;

      if (oldUsername && oldUsername !== nextUsername) {
        finalizeCurrentSessionLocally("change_username");
      }

      tiktokUsernameRef.current = nextUsername;
      setTiktokUsername(nextUsername);
      setComments([]);
      setStatus(`Đang subscribe LIVE ${nextUsername}...`);

      try {
        await subscribeTikTokLiveApi({
          clientId: clientIdRef.current,
          username: nextUsername,
        });

        return true;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("SUBSCRIBE SSE ERROR:", error);
        }

        setStatus("Không gọi được API subscribe Python");
        return false;
      }
    },
    [finalizeCurrentSessionLocally, setComments]
  );

  const stopLiveSession = useCallback(async () => {
    setStatus("Đang dừng nhận comment...");

    try {
      await stopTikTokLiveApi(clientIdRef.current);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("STOP SSE ERROR:", error);
      }
    }

    finalizeCurrentSessionLocally("manual_stop");

    return true;
  }, [finalizeCurrentSessionLocally]);

  const reconnect = useCallback(() => {
    finalizeCurrentSessionLocally("manual_reconnect");

    isManualCloseRef.current = false;

    eventSourceRef.current?.close();
    eventSourceRef.current = null;

    connectSse();
  }, [connectSse, finalizeCurrentSessionLocally]);

  const disconnect = useCallback(async () => {
    finalizeCurrentSessionLocally("manual_disconnect");

    isManualCloseRef.current = true;

    try {
      await stopTikTokLiveApi(clientIdRef.current);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("DISCONNECT SSE ERROR:", error);
      }
    }

    eventSourceRef.current?.close();
    eventSourceRef.current = null;

    setIsConnected(false);
    setStatus("Đã ngắt kết nối");
  }, [finalizeCurrentSessionLocally]);

 useEffect(() => {
  const timer = window.setTimeout(() => {
    connectSse();
  }, 0);

  return () => {
    window.clearTimeout(timer);

    isManualCloseRef.current = true;

    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  };
}, []);

  useEffect(() => {
  const timer = window.setTimeout(() => {
    const nextUsername = normalizeTikTokUsername(options.initialUsername || "");

    if (!nextUsername) return;

    tiktokUsernameRef.current = nextUsername;
    setTiktokUsername(nextUsername);
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, [options.initialUsername]);

  return {
    status,
    isConnected,
    comments,
    tiktokUsername,

    currentLiveSession,
    liveHistory,
    liveDurationSeconds,
    liveNowText,

    setComments,
    clearComments,
    clearLiveHistory,

    reconnect,
    disconnect,
    stopLiveSession,

    changeTikTokUsername: subscribeTikTokUsername,
    subscribeTikTokUsername,
  };
}