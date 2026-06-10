"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { TIKTOK_USERNAME } from "@/constants/config";
import type { LiveComment } from "@/types";
import type { UserJoinedEvent } from "@/features/tiktok-live/types";
import { useTikTokComments } from "@/features/tiktok-live/useTikTokComments";
import { useTikTokLiveSession } from "@/features/tiktok-live/useTikTokLiveSession";
import {
  buildLiveStreamEventsUrl,
  stopTikTokLiveApi,
  subscribeTikTokLiveApi,
} from "@/features/tiktok-live/sseApi";
import { normalizeTikTokUsername, unwrapSseCommentPayload } from "@/utils/comment";
import { getAuthToken } from "@/lib/request";

function createClientId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

type UseTikTokLiveSocketOptions = {
  initialUsername?: string | null;
};

function getPayloadUsername(payload: Record<string, any>) {
  return payload.username || payload.liveUsername || payload.tiktokUsername || payload.tiktok_username || "";
}

export function useTikTokLiveSocket(options: UseTikTokLiveSocketOptions = {}) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const clientIdRef = useRef(createClientId());
  const isManualCloseRef = useRef(false);
  const isAuthFailedRef = useRef(false);
  const joinEventTimerRef = useRef<number | null>(null);
  const tiktokUsernameRef = useRef(normalizeTikTokUsername(options.initialUsername || TIKTOK_USERNAME));

  const [status, setStatus] = useState("Đang kết nối Backend SSE...");
  const [isConnected, setIsConnected] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState(
    options.initialUsername || TIKTOK_USERNAME,
  );
  const [joinEvent, setJoinEvent] = useState<UserJoinedEvent | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);

  const {
    comments,
    setComments,
    addCommentToList,
    updateCommentInList,
    replaceSnapshot,
    clearComments,
  } = useTikTokComments();

  const {
    currentLiveSession,
    currentLiveSessionId,
    liveHistory,
    liveDurationSeconds,
    liveNowText,
    clearLiveHistory,
    reloadLiveHistory,
    finalizeCurrentSessionLocally,
    startSessionFromPayload,
    endSessionFromPayload,
    updateSessionStatusFromPayload,
    addCommentToCurrentSession,
  } = useTikTokLiveSession();

  const handleServerEvent = useCallback(
    (type: string, payload: Record<string, any>) => {
      if (type === "CONNECTED") {
        setStatus("Đã kết nối Backend SSE");
        setIsConnected(true);
        return;
      }

      if (type === "PING") {
        setIsConnected(true);
        return;
      }

      // Giữ lại để tương thích nếu server cũ vẫn bắn event này.
      if (type === "SUBSCRIBING") {
        setStatus(`Đang chuẩn bị lấy comment LIVE: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "SUBSCRIBED") {
        const username = getPayloadUsername(payload);

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
        setStatus(`Bắt đầu phiên nhận comment: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_TIME_ENDED") {
        endSessionFromPayload(payload);
        setStatus(`Đã lưu phiên LIVE: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_TIME_STATUS") {
        updateSessionStatusFromPayload(payload);
        return;
      }

      if (type === "UNSUBSCRIBED") {
        finalizeCurrentSessionLocally("unsubscribed");
        setComments([]);
        setStatus(`Đã rời LIVE: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_CONNECTED") {
        const username = getPayloadUsername(payload);

        if (username) {
          tiktokUsernameRef.current = username;
          setTiktokUsername(username);
        }

        startSessionFromPayload(payload);
        setStatus(`Đã kết nối TikTok Live: ${username}`);
        return;
      }

      if (type === "LIVE_DISCONNECTED") {
        endSessionFromPayload(payload);
        setStatus(`TikTok Live đã ngắt: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_ERROR") {
        const message = payload.message || "Không rõ lỗi";

        finalizeCurrentSessionLocally("live_error");
        setIsConnected(false);
        setComments([]);
        if (joinEventTimerRef.current) {
          window.clearTimeout(joinEventTimerRef.current);
          joinEventTimerRef.current = null;
        }
        setJoinEvent(null);
        setLiveError(`TikTok lỗi ${getPayloadUsername(payload)}: ${message}`);
        setStatus(`TikTok lỗi ${getPayloadUsername(payload)}: ${message}`);
        return;
      }

      if (type === "SNAPSHOT") {
        const snapshot = payload.comments || [];
        replaceSnapshot(Array.isArray(snapshot) ? snapshot : []);
        return;
      }

      if (type === "USER_JOINED") {
        const displayName =
          payload.joinDisplayName || payload.nickname || payload.joinUsername || "Người xem";
        const joinAvatarUrl =
          payload.joinAvatarUrl ||
          payload.avatarUrl ||
          payload.avatar ||
          payload.comment?.avatarUrl ||
          payload.comment?.avatar;

        if (joinEventTimerRef.current) {
          window.clearTimeout(joinEventTimerRef.current);
        }

        setJoinEvent({
          shopId: payload.shopId,
          liveUsername: payload.liveUsername,
          nickname: payload.nickname,
          joinUsername: payload.joinUsername,
          joinDisplayName: payload.joinDisplayName,
          joinAvatarUrl,
          createdAt: payload.createdAt,
          displayName,
        });

        joinEventTimerRef.current = window.setTimeout(() => {
          setJoinEvent(null);
          joinEventTimerRef.current = null;
        }, 3000);

        return;
      }

      if (type === "COMMENT_UPDATED") {
        const commentId = String(payload.commentId || payload.comment_id || "");
        const patch = payload.patch || {};

        if (!commentId) return;

        const updatedComment = updateCommentInList(commentId, patch);

        if (updatedComment) {
          addCommentToCurrentSession(updatedComment);
        }

        return;
      }

      if (type === "COMMENT" || type === "COMMENT_SAVED") {
        // Backend mới bắn payload dạng { liveSessionId, comment }.
        // unwrapSseCommentPayload sẽ lấy phần payload.comment để UI không bị "[object Object]".
        startSessionFromPayload(payload);
        const comment = addCommentToList(unwrapSseCommentPayload(payload));

        if (comment) {
          addCommentToCurrentSession(comment);
        }
      }
    },
    [
      addCommentToCurrentSession,
      addCommentToList,
      updateCommentInList,
      endSessionFromPayload,
      finalizeCurrentSessionLocally,
      replaceSnapshot,
      setComments,
      startSessionFromPayload,
      updateSessionStatusFromPayload,
    ],
  );

  const connectSse = useCallback(async () => {
    if (isAuthFailedRef.current) {
      setStatus("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      return;
    }

    const accessToken = await getAuthToken();

    const clientId = clientIdRef.current;
    const url = buildLiveStreamEventsUrl(clientId);

    if (!url) {
      setStatus("Thiếu Backend SSE URL");
      return;
    }

    isManualCloseRef.current = false;
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const EVENT_TYPES = [
      "CONNECTED",
      "PING",
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
      "USER_JOINED",
      "COMMENT",
      "COMMENT_SAVED",
      "COMMENT_UPDATED",
    ];

    fetchEventSource(url, {
      method: "GET",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      credentials: "include",
      signal: abortControllerRef.current.signal,
      openWhenHidden: true,

      onopen: async (response) => {
        if (response.ok) {
          setIsConnected(true);
          setStatus("Đã kết nối Backend SSE");
          return;
        }

        if (response.status === 401 || response.status === 403) {
          isManualCloseRef.current = true;
          isAuthFailedRef.current = true;
          abortControllerRef.current?.abort();
          setIsConnected(false);
          setStatus("Phiên đăng nhập đã hết hạn, đã ngắt SSE.");
        }

        throw new Error(`SSE open failed: ${response.status}`);
      },

      onmessage: (event) => {
        const type = event.event || "message";

        if (!EVENT_TYPES.includes(type)) return;

        try {
          const payload = JSON.parse(event.data || "{}");
          handleServerEvent(type, payload);
        } catch (error) {
          if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
            console.error("SSE parse error:", error);
          }
        }
      },

      onerror: (error) => {
        if (isManualCloseRef.current) throw error;

        setIsConnected(false);
        setStatus("SSE Backend mất kết nối, đang thử kết nối lại...");
      },
    });
  }, [handleServerEvent]);

  const subscribeTikTokUsername = useCallback(
    async (username: string) => {
      const nextUsername = normalizeTikTokUsername(username);

      if (!nextUsername) {
        setStatus("Vui lòng nhập TikTok username");
        return false;
      }

      const oldUsername = tiktokUsernameRef.current;
      const oldUsernameWithoutAt = oldUsername.replace(/^@/, "");

      if (oldUsername && oldUsername !== nextUsername) {
        finalizeCurrentSessionLocally("change_username");
        try {
          await stopTikTokLiveApi({ clientId: clientIdRef.current, username: oldUsernameWithoutAt });
        } catch {
          // ignore — best-effort stop of previous session
        }
      }

      tiktokUsernameRef.current = nextUsername;
      setTiktokUsername(nextUsername);
      setLiveError(null);
      setComments([]);
      connectSse();
      setStatus(`Đang yêu cầu Backend start Python collector: ${nextUsername}...`);

      const usernameWithoutAt = nextUsername.replace(/^@/, "");

      try {
        const result = await subscribeTikTokLiveApi({
          clientId: clientIdRef.current,
          username: usernameWithoutAt,
        });

        if (result.username) {
          tiktokUsernameRef.current = result.username;
          setTiktokUsername(result.username);
        }

        setStatus(result.message || `Đã gửi lệnh start collector cho ${nextUsername}, đang chờ comment...`);
        return result.success;
      } catch (error) {
        if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
          console.error("START LIVE STREAM ERROR:", error);
        }

        setStatus(error instanceof Error ? error.message : "Không gọi được API start collector ở Backend");
        return false;
      }
    },
    [finalizeCurrentSessionLocally, setComments],
  );

  const stopLiveSession = useCallback(async () => {
    setStatus("Đang dừng nhận comment...");

    try {
      await stopTikTokLiveApi({
        clientId: clientIdRef.current,
        username: tiktokUsernameRef.current.replace(/^@/, ""),
      });
    } catch (error) {
      if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
        console.error("STOP LIVE STREAM ERROR:", error);
      }
    }

    finalizeCurrentSessionLocally("manual_stop");

    return true;
  }, [finalizeCurrentSessionLocally]);

  const clearLiveError = useCallback(() => {
    setLiveError(null);
  }, []);

  const reconnect = useCallback(() => {
    finalizeCurrentSessionLocally("manual_reconnect");

    isManualCloseRef.current = false;
    isAuthFailedRef.current = false;
    setLiveError(null);

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    connectSse();
  }, [connectSse, finalizeCurrentSessionLocally]);

  const disconnect = useCallback(async () => {
    finalizeCurrentSessionLocally("manual_disconnect");

    isManualCloseRef.current = true;

    try {
      await stopTikTokLiveApi({
        clientId: clientIdRef.current,
        username: tiktokUsernameRef.current.replace(/^@/, ""),
      });
    } catch (error) {
      if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
        console.error("DISCONNECT LIVE STREAM ERROR:", error);
      }
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setIsConnected(false);
    setStatus("Đã ngắt kết nối");
  }, [finalizeCurrentSessionLocally]);

  useEffect(() => {
    return () => {
      isManualCloseRef.current = true;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;

      if (joinEventTimerRef.current) {
        window.clearTimeout(joinEventTimerRef.current);
        joinEventTimerRef.current = null;
      }
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
    joinEvent,
    liveError,

    currentLiveSession,
    currentLiveSessionId,
    liveHistory,
    liveDurationSeconds,
    liveNowText,

    setComments,
    clearComments,
    clearLiveHistory,
    reloadLiveHistory,

    reconnect,
    disconnect,
    stopLiveSession,
    clearLiveError,

    changeTikTokUsername: subscribeTikTokUsername,
    subscribeTikTokUsername,
  };
}
