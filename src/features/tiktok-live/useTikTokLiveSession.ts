"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAX_COMMENTS } from "@/constants/config";
import type { LiveComment } from "@/types";
import type { LiveHistoryItem } from "@/features/tiktok-live/types";
import { getLiveHistoryApi } from "@/api/liveHistoryApi";
import { normalizeLiveSession } from "@/features/tiktok-live/liveSessionMapper";
import { calcDurationSeconds } from "@/utils/date";

function formatNowText(nowMs: number) {
  if (!nowMs) return "";

  return new Date(nowMs).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shouldShowHistorySession(session: LiveHistoryItem) {
  const durationSeconds = Number(session.durationSeconds || 0);
  const commentCount = Number(session.commentCount || session.comments?.length || 0);
  const orderCount = Number(session.orderCount || session.orders?.length || 0);

  return durationSeconds > 0 || commentCount > 0 || orderCount > 0;
}

function mergeSession(oldSession: LiveHistoryItem | null, nextSession: LiveHistoryItem) {
  return {
    ...(oldSession || {}),
    ...nextSession,
    startedAt: oldSession?.startedAt || nextSession.startedAt,
    // Không merge comments vào running session state — sessionCommentsRef là nguồn duy nhất
    comments: [],
    orders: oldSession?.orders?.length ? oldSession.orders : nextSession.orders || [],
  } as LiveHistoryItem;
}

export function useTikTokLiveSession(options: { hasHistory?: boolean } = {}) {
  const currentLiveSessionRef = useRef<LiveHistoryItem | null>(null);
  const currentDbLiveSessionIdRef = useRef<string | null>(null);
  const sessionCommentsRef = useRef<LiveComment[]>([]);
  const [nowMs, setNowMs] = useState(0);

  const [currentLiveSession, setCurrentLiveSessionState] =
    useState<LiveHistoryItem | null>(null);
  const [liveHistory, setLiveHistory] = useState<LiveHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [currentLiveSessionId, setCurrentLiveSessionId] = useState<string | null>(null);

  const setDbLiveSessionId = useCallback((id: string | null) => {
    currentDbLiveSessionIdRef.current = id;
    setCurrentLiveSessionId(id);
  }, []);

  const setCurrentLiveSession = useCallback((session: LiveHistoryItem | null) => {
    currentLiveSessionRef.current = session;
    setCurrentLiveSessionState(session);
  }, []);

  const isRunning = Boolean(currentLiveSession?.startedAt && !currentLiveSession?.endedAt);

  const hasHistoryRef = useRef(options.hasHistory);
  hasHistoryRef.current = options.hasHistory;

  const reloadLiveHistory = useCallback(async () => {
    if (hasHistoryRef.current === false) {
      setIsHistoryLoading(false);
      return [];
    }
    try {
      setIsHistoryLoading(true);
      const history = await getLiveHistoryApi();
      setLiveHistory(history);
      return history;
    } catch {
      return [];
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  // Wait until hasHistory is resolved (not undefined) before doing initial load.
  // This prevents a spurious call when hasHistory===false (no live sessions yet).
  const hasHistoryResolved = options.hasHistory !== undefined;

  useEffect(() => {
    if (!hasHistoryResolved) return;

    const timer = window.setTimeout(() => {
      void reloadLiveHistory();
    }, 800);

    const onAuthChange = () => {
      window.clearTimeout(timer);
      window.setTimeout(() => {
        void reloadLiveHistory();
      }, 100);
    };

    window.addEventListener("lumi-auth-change", onAuthChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("lumi-auth-change", onAuthChange);
    };
  }, [hasHistoryResolved, reloadLiveHistory]);

  useEffect(() => {
    if (!isRunning) return;

    // Chỉ phụ thuộc isRunning: interval không restart khi session object thay đổi reference.
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning, setNowMs]);

  const liveDurationSeconds = useMemo(() => {
    const session = currentLiveSessionRef.current;
    if (!session?.startedAt) return 0;
    if (session.endedAt) return session.durationSeconds || 0;

    const start = new Date(session.startedAt).getTime();
    if (!start) return 0;
    return Math.max(0, Math.floor((nowMs - start) / 1000));
  }, [nowMs]);

  const liveNowText = useMemo(() => {
    if (!isRunning) return "";
    return formatNowText(nowMs);
  }, [isRunning, nowMs]);

  const clearLiveHistory = useCallback(() => {
    setLiveHistory([]);
  }, []);

  const resetCurrentSession = useCallback(() => {
    sessionCommentsRef.current = [];
    setCurrentLiveSession(null);
    setDbLiveSessionId(null);
  }, [setCurrentLiveSession, setDbLiveSessionId]);

  const startSessionFromPayload = useCallback(
    (payload: unknown) => {
      const nextSession = normalizeLiveSession(payload);
      // Strip comments from the running-session state — sessionCommentsRef is the source of truth
      nextSession.comments = [];
      const currentSession = currentLiveSessionRef.current;
      const dbLiveSessionId = nextSession.id || null;

      if (
        currentSession &&
        (currentSession.id === nextSession.id || currentSession.sessionId === nextSession.sessionId)
      ) {
        const mergedSession = mergeSession(currentSession, nextSession);
        setCurrentLiveSession(mergedSession);
        setDbLiveSessionId(dbLiveSessionId);
        return mergedSession;
      }

      sessionCommentsRef.current = [];
      setCurrentLiveSession(nextSession);
      setDbLiveSessionId(dbLiveSessionId);

      return nextSession;
    },
    [setCurrentLiveSession, setDbLiveSessionId],
  );

  const finalizeCurrentSessionLocally = useCallback(
    (reason: string) => {
      const session = currentLiveSessionRef.current;
      if (!session?.startedAt) return;

      const endedAt = new Date().toISOString();
      const comments = sessionCommentsRef.current;
      const durationSeconds = calcDurationSeconds(session.startedAt, endedAt);

      const localSession: LiveHistoryItem = {
        ...session,
        endedAt,
        durationSeconds,
        commentCount: comments.length,
        comments,
        reason,
        status: reason === "live_error" ? "error" : "ended",
      };

      setLiveHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== localSession.id);
        return shouldShowHistorySession(localSession) ? [localSession, ...filtered] : filtered;
      });

      sessionCommentsRef.current = [];
      setCurrentLiveSession(null);
      setDbLiveSessionId(null);

      window.setTimeout(() => {
        void reloadLiveHistory();
      }, 300);
    },
    [reloadLiveHistory, setCurrentLiveSession, setDbLiveSessionId],
  );

  const endSessionFromPayload = useCallback(
    (payload: unknown) => {
      const sessionFromServer = normalizeLiveSession(payload);
      const currentSession = currentLiveSessionRef.current;
      const comments = sessionCommentsRef.current;
      const startedAt = currentSession?.startedAt || sessionFromServer.startedAt || new Date().toISOString();
      const endedAt = sessionFromServer.endedAt || new Date().toISOString();
      const durationSeconds = sessionFromServer.durationSeconds || calcDurationSeconds(startedAt, endedAt);
      const finalCommentCount = Math.max(sessionFromServer.commentCount || 0, comments.length);

      const localSession: LiveHistoryItem = {
        ...sessionFromServer,
        startedAt,
        endedAt,
        durationSeconds,
        commentCount: finalCommentCount,
        comments,
        status: sessionFromServer.status || "ended",
      };

      setLiveHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== localSession.id);
        return shouldShowHistorySession(localSession) ? [localSession, ...filtered] : filtered;
      });

      sessionCommentsRef.current = [];
      setCurrentLiveSession(null);
      setDbLiveSessionId(null);

      window.setTimeout(() => {
        void reloadLiveHistory();
      }, 300);
    },
    [reloadLiveHistory, setCurrentLiveSession, setDbLiveSessionId],
  );

  const updateSessionStatusFromPayload = useCallback(
    (payload: unknown) => {
      const data = payload as { startedAt?: string; started_at?: string; liveSessionId?: string; live_session_id?: string } | null;

      if (!data || (!data.startedAt && !data.started_at && !data.liveSessionId && !data.live_session_id)) {
        resetCurrentSession();
        return;
      }

      startSessionFromPayload(payload);
    },
    [resetCurrentSession, startSessionFromPayload],
  );

  const addCommentToCurrentSession = useCallback(
    (comment: LiveComment) => {
      const existed = sessionCommentsRef.current.some((item) => item.id === comment.id);
      const nextComments = existed
        ? sessionCommentsRef.current.map((item) =>
            item.id === comment.id ? { ...item, ...comment } : item,
          )
        : [comment, ...sessionCommentsRef.current].slice(0, MAX_COMMENTS);

      sessionCommentsRef.current = nextComments;

      // Only update the count on the session state — avoid spreading the full comments array
      // into React state on every incoming comment (this is the main memory/render hotspot).
      const session = currentLiveSessionRef.current;
      if (session && session.commentCount !== nextComments.length) {
        setCurrentLiveSession({ ...session, commentCount: nextComments.length });
      }
    },
    [setCurrentLiveSession],
  );

  return {
    currentLiveSession,
    currentLiveSessionId,
    liveHistory,
    isHistoryLoading,
    liveDurationSeconds,
    liveNowText,
    reloadLiveHistory,
    clearLiveHistory,
    finalizeCurrentSessionLocally,
    startSessionFromPayload,
    endSessionFromPayload,
    updateSessionStatusFromPayload,
    addCommentToCurrentSession,
    resetCurrentSession,
  };
}
