"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { TIKTOK_USERNAME } from "@/constants/config";
import { useTikTokComments } from "@/features/tiktok-live/useTikTokComments";
import { useTikTokLiveSession } from "@/features/tiktok-live/useTikTokLiveSession";
import {
  buildLiveStreamEventsUrl,
  stopTikTokLiveApi,
  subscribeTikTokLiveApi,
} from "@/features/tiktok-live/sseApi";
import { normalizeTikTokUsername, unwrapSseCommentPayload } from "@/utils/comment";
import { getAuthToken } from "@/lib/request";
import { getRunningSessionApi } from "@/api/liveCommentsApi";

const LIVE_RESUME_KEY = "lumi_live_resume_username";

function saveResumeUsername(username: string) {
  try {
    localStorage.setItem(LIVE_RESUME_KEY, username);
  } catch {}
}

function clearResumeUsername() {
  try {
    localStorage.removeItem(LIVE_RESUME_KEY);
  } catch {}
}

function loadResumeUsername(): string {
  try {
    return localStorage.getItem(LIVE_RESUME_KEY) || "";
  } catch {
    return "";
  }
}

function createClientId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

type UseTikTokLiveSocketOptions = {
  initialUsername?: string | null;
  hasHistory?: boolean;
  onOrderShippingUpdated?: (payload: Record<string, unknown>) => void;
};

function getPayloadUsername(payload: Record<string, any>) {
  return payload.username || payload.liveUsername || payload.tiktokUsername || payload.tiktok_username || "";
}

export function useTikTokLiveSocket(options: UseTikTokLiveSocketOptions = {}) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const clientIdRef = useRef(createClientId());
  const isManualCloseRef = useRef(false);
  const isAuthFailedRef = useRef(false);
  const hasBootstrappedRef = useRef(false);
  const isBootstrappingRef = useRef(false);
  const tiktokUsernameRef = useRef(normalizeTikTokUsername(options.initialUsername || TIKTOK_USERNAME));
  const isConnectedRef = useRef(false);
  const onOrderShippingUpdatedRef = useRef(options.onOrderShippingUpdated);
  const handleServerEventRef = useRef<((type: string, payload: Record<string, any>) => void) | null>(null);

  const [status, setStatus] = useState("Đang kết nối Backend SSE...");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isLiveEnded, setIsLiveEnded] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState(
    options.initialUsername || TIKTOK_USERNAME,
  );
  const [liveError, setLiveError] = useState<string | null>(null);
  const [viewersCount, setViewersCount] = useState(0);

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
    isHistoryLoading,
    liveDurationSeconds,
    liveNowText,
    clearLiveHistory,
    reloadLiveHistory,
    finalizeCurrentSessionLocally,
    startSessionFromPayload,
    endSessionFromPayload,
    updateSessionStatusFromPayload,
    addCommentToCurrentSession,
  } = useTikTokLiveSession({ hasHistory: options.hasHistory });

  const handleServerEvent = useCallback(
    (type: string, payload: Record<string, any>) => {
      if (type === "CONNECTED") {
        setStatus("Đã kết nối Backend SSE");
        setIsConnected(true);
        return;
      }

      if (type === "PING") {
        setIsConnected(true);
        if (typeof payload.viewersCount === "number") setViewersCount(payload.viewersCount);
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
        setIsLiveEnded(false);
        setStatus(`Bắt đầu phiên nhận comment: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_TIME_STATUS") {
        updateSessionStatusFromPayload(payload);
        return;
      }

      if (type === "UNSUBSCRIBED") {
        setStatus(`Đã rời LIVE: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_CONNECTED") {
        setIsLiveEnded(false);
        hasBootstrappedRef.current = true;
        isBootstrappingRef.current = false;
        setIsRestoringSession(false);
        setIsConnecting(false);
        setIsConnected(true);
        const username = getPayloadUsername(payload);

        if (username) {
          tiktokUsernameRef.current = username;
          setTiktokUsername(username);
        }

        if (typeof payload.viewersCount === "number") setViewersCount(payload.viewersCount);
        startSessionFromPayload(payload);
        setStatus(`Đã kết nối TikTok Live: ${username}`);
        return;
      }

      if (type === "DISCONNECTED" || type === "STOP") {
        setIsLiveEnded(true);
        setIsRestoringSession(false);
        setIsConnecting(false);
        setIsConnected(false);
        endSessionFromPayload({
          ...payload,
          reason: type === "STOP" ? "manual_stop" : "live_disconnected",
        });
        clearResumeUsername();
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setStatus(type === "STOP" ? "Phiên live đã kết thúc" : "Phiên live đã ngắt kết nối");
        return;
      }

      if (type === "VIEWER_COUNT_UPDATE") {
        const username = getPayloadUsername(payload);

        if (username) {
          tiktokUsernameRef.current = username;
          setTiktokUsername(username);
        }

        if (typeof payload.viewersCount === "number") setViewersCount(payload.viewersCount);
        startSessionFromPayload(payload);
        setIsConnecting(false);
        setStatus(`Đã kết nối TikTok Live: ${username}`);
        return;
      }

      if (type === "VIEWER_COUNT_UPDATE") {
        if (typeof payload.viewersCount === "number") setViewersCount(payload.viewersCount);
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

        addCommentToList({
          id: `join_${payload.joinUsername || payload.nickname || Date.now()}_${payload.createdAt || Date.now()}`,
          type: "user_joined",
          username: payload.joinUsername || payload.nickname || "",
          displayName,
          avatarUrl: joinAvatarUrl,
          comment: "",
          createdAt: payload.createdAt,
        });

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
        startSessionFromPayload(payload);
        const comment = addCommentToList(unwrapSseCommentPayload(payload));

        if (comment) {
          addCommentToCurrentSession(comment);
        }
      }

      if (type === "ORDER_SHIPPING_UPDATED") {
        onOrderShippingUpdatedRef.current?.(payload);
      }
    },
    [
      addCommentToCurrentSession,
      addCommentToList,
      updateCommentInList,
      endSessionFromPayload,
      replaceSnapshot,
      startSessionFromPayload,
      updateSessionStatusFromPayload,
    ],
  );

  useEffect(() => {
    handleServerEventRef.current = handleServerEvent;
  });

  const connectSse = useCallback(async () => {
    if (isAuthFailedRef.current || isLiveEnded) {
      setStatus("Phiên live đã kết thúc");
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
      "COLLECTOR_STOPPED",
      "SNAPSHOT",
      "USER_JOINED",
      "COMMENT",
      "COMMENT_SAVED",
      "COMMENT_UPDATED",
      "ORDER_SHIPPING_UPDATED",
      "VIEWER_COUNT_UPDATE",
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
          handleServerEventRef.current?.(type, payload);
        } catch {
        }
      },

      onerror: (error) => {
        if (isManualCloseRef.current) throw error;

        setIsConnected(false);
        setStatus("SSE Backend mất kết nối, đang thử kết nối lại...");
      },
    });
  }, [isLiveEnded]);

  useEffect(() => {
    if (hasBootstrappedRef.current || isBootstrappingRef.current) return;
    if (!options.hasHistory || isLiveEnded) {
      setIsRestoringSession(false);
      return;
    }

    isBootstrappingRef.current = true;
    setIsRestoringSession(true);

    void (async () => {
      try {
        const result = await getRunningSessionApi();
        const session = result.session;
        const restoredComments = Array.isArray(result.comments) ? result.comments : [];

        if (!session) {
          clearResumeUsername();
          setIsRestoringSession(false);
          setIsConnecting(false);
          isBootstrappingRef.current = false;
          return;
        }

        const sessionPayload = {
          id: session.id,
          liveSessionId: session.id,
          dbLiveSessionId: session.id,
          sessionId: session.externalSessionId,
          externalSessionId: session.externalSessionId,
          username: session.tiktokUsername,
          tiktokUsername: session.tiktokUsername,
          startedAt: session.startedAt,
          commentCount: session.commentCount,
          status: session.status,
        };

        tiktokUsernameRef.current = normalizeTikTokUsername(
          session.tiktokUsername || options.initialUsername || TIKTOK_USERNAME,
        );
        setTiktokUsername(tiktokUsernameRef.current);
        replaceSnapshot(restoredComments);
        startSessionFromPayload(sessionPayload);
        saveResumeUsername(tiktokUsernameRef.current);
        setStatus("Đang khôi phục phiên live...");
        hasBootstrappedRef.current = true;
        setIsConnecting(true);
        await connectSse();
      } catch {
      } finally {
        isBootstrappingRef.current = false;
        setIsRestoringSession(false);
      }
    })();
  }, [
    connectSse,
    isLiveEnded,
    options.hasHistory,
    options.initialUsername,
    replaceSnapshot,
    startSessionFromPayload,
  ]);

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
        isManualCloseRef.current = true;
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
        stopTikTokLiveApi({ clientId: clientIdRef.current, username: oldUsernameWithoutAt, silent: true }).catch(() => {});
      }

      tiktokUsernameRef.current = nextUsername;
      setTiktokUsername(nextUsername);
      setLiveError(null);
      setIsLiveEnded(false);
      setStatus(`Đang yêu cầu Backend start Python collector: ${nextUsername}...`);

      const usernameWithoutAt = nextUsername.replace(/^@/, "");

      setIsConnecting(true);
      isManualCloseRef.current = false;
      void connectSse();



      try {
        const result = await subscribeTikTokLiveApi({
          clientId: clientIdRef.current,
          username: usernameWithoutAt,
        });

        if (result.username) {
          tiktokUsernameRef.current = result.username;
          setTiktokUsername(result.username);
        }

        saveResumeUsername(tiktokUsernameRef.current);
        setStatus(result.message || `Đã start collector cho ${nextUsername}, đang chờ comment...`);
        return result.success;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Không gọi được API start collector ở Backend";
        setIsConnecting(false);
        setLiveError(message);
        setStatus(message);
        return false;
      }
    },
    [connectSse, finalizeCurrentSessionLocally],
  );

  const stopLiveSession = useCallback(async () => {
    setStatus("Đang dừng nhận comment...");

    try {
      await stopTikTokLiveApi({
        clientId: clientIdRef.current,
        username: tiktokUsernameRef.current.replace(/^@/, ""),
      });
    } catch {
    }

    finalizeCurrentSessionLocally("manual_stop");
    clearResumeUsername();

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

    void connectSse();
  }, [connectSse, finalizeCurrentSessionLocally]);

  const disconnect = useCallback(async () => {
    finalizeCurrentSessionLocally("manual_disconnect");
    clearResumeUsername();

    isManualCloseRef.current = true;

    try {
      await stopTikTokLiveApi({
        clientId: clientIdRef.current,
        username: tiktokUsernameRef.current.replace(/^@/, ""),
      });
    } catch {
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setIsConnected(false);
    setStatus("Đã ngắt kết nối");
  }, [finalizeCurrentSessionLocally]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    onOrderShippingUpdatedRef.current = options.onOrderShippingUpdated;
  }, [options.onOrderShippingUpdated]);

  useEffect(() => {
    return () => {
      isManualCloseRef.current = true;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, [isLiveEnded]);

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

  // Auto-resume: if user was live before refresh, reconnect automatically
  useEffect(() => {
    if (!options.hasHistory) return;
    if (isRestoringSession) return;

    const resumeUsername = loadResumeUsername();
    if (!resumeUsername) return;
    if (isConnectedRef.current || isConnecting || isLiveEnded) return;

    const timer = window.setTimeout(() => {
      subscribeTikTokUsername(resumeUsername);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRestoringSession, options.hasHistory, isConnected, isConnecting, isLiveEnded]);

  return {
    status,
    isConnected,
    isConnecting,
    isRestoringSession,
    comments,
    tiktokUsername,
    liveError,
    viewersCount,

    currentLiveSession,
    currentLiveSessionId,
    liveHistory,
    isHistoryLoading,
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
