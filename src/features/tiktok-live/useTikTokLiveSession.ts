"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAX_COMMENTS } from "@/constants/config";
import type { LiveComment } from "@/types";
import type { LiveHistoryItem } from "@/features/tiktok-live/types";
import {
  getLiveHistoryApi,
  saveLiveSessionEndedApi,
  saveLiveSessionStartedApi,
} from "@/api/liveHistoryApi";
import { saveLiveCommentApi } from "@/api/liveCommentsApi";
import { normalizeLiveSession } from "@/features/tiktok-live/liveSessionMapper";
import { calcDurationSeconds } from "@/utils/date";

function formatNowText(nowMs: number) {
  if (!nowMs) return "";

  return new Date(nowMs).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mergeSession(oldSession: LiveHistoryItem | null, nextSession: LiveHistoryItem) {
  return {
    ...(oldSession || {}),
    ...nextSession,
    comments: nextSession.comments?.length ? nextSession.comments : oldSession?.comments || [],
    orders: nextSession.orders?.length ? nextSession.orders : oldSession?.orders || [],
  } as LiveHistoryItem;
}

function shouldShowHistorySession(session: LiveHistoryItem) {
  const durationSeconds = Number(session.durationSeconds || 0);
  const commentCount = Number(session.commentCount || session.comments?.length || 0);
  const orderCount = Number(session.orderCount || session.orders?.length || 0);

  return durationSeconds > 0 || commentCount > 0 || orderCount > 0;
}

export function useTikTokLiveSession() {
  const currentLiveSessionRef = useRef<LiveHistoryItem | null>(null);
  const currentDbLiveSessionIdRef = useRef<string | null>(null);
  const pendingCommentsRef = useRef<LiveComment[]>([]);
  const sessionCommentsRef = useRef<LiveComment[]>([]);

  const [currentLiveSession, setCurrentLiveSessionState] =
    useState<LiveHistoryItem | null>(null);
  const [liveHistory, setLiveHistory] = useState<LiveHistoryItem[]>([]);
  const [currentLiveSessionId, setCurrentLiveSessionId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(0);

  const setDbLiveSessionId = useCallback((id: string | null) => {
    currentDbLiveSessionIdRef.current = id;
    setCurrentLiveSessionId(id);
  }, []);

  const setCurrentLiveSession = useCallback((session: LiveHistoryItem | null) => {
    currentLiveSessionRef.current = session;
    setCurrentLiveSessionState(session);
  }, []);

  const isRunning = Boolean(currentLiveSession?.startedAt && !currentLiveSession?.endedAt);

  const reloadLiveHistory = useCallback(async () => {
    try {
      const history = await getLiveHistoryApi();
      setLiveHistory(history);
      return history;
    } catch (error) {
      console.log("LOAD LIVE HISTORY ERROR:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reloadLiveHistory();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [reloadLiveHistory]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning, currentLiveSession?.sessionId, currentLiveSession?.startedAt]);

  const liveDurationSeconds = useMemo(() => {
    if (!currentLiveSession?.startedAt) return 0;

    if (currentLiveSession.endedAt) {
      return currentLiveSession.durationSeconds || 0;
    }

    if (!nowMs) {
      return currentLiveSession.durationSeconds || 0;
    }

    const start = new Date(currentLiveSession.startedAt).getTime();
    if (!start) return 0;

    return Math.max(0, Math.floor((nowMs - start) / 1000));
  }, [currentLiveSession, nowMs]);

  const liveNowText = useMemo(() => {
    if (!isRunning) return "";
    return formatNowText(nowMs);
  }, [isRunning, nowMs]);

  const savePendingComments = useCallback(async (liveSessionId: string) => {
    const pendingComments = pendingCommentsRef.current;
    pendingCommentsRef.current = [];

    await Promise.all(
      pendingComments.map((comment) =>
        saveLiveCommentApi({ liveSessionId, comment }).catch((error) => {
          console.log("SAVE PENDING LIVE COMMENT ERROR:", error);
        }),
      ),
    );
  }, []);

  const clearLiveHistory = useCallback(() => {
    setLiveHistory([]);
  }, []);

  const resetCurrentSession = useCallback(() => {
    pendingCommentsRef.current = [];
    sessionCommentsRef.current = [];
    setCurrentLiveSession(null);
    setDbLiveSessionId(null);
    setNowMs(0);
  }, [setCurrentLiveSession, setDbLiveSessionId]);

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

      setCurrentLiveSession(localSession);

      void saveLiveSessionEndedApi({
        sessionId: session.sessionId,
        username: session.username,
        startedAt: session.startedAt,
        endedAt,
        durationSeconds,
        commentCount: comments.length,
        reason,
      })
        .then((savedSession) => {
          setLiveHistory((prev) => {
            const filtered = prev.filter((item) => item.id !== savedSession.id);
            return shouldShowHistorySession(savedSession) ? [savedSession, ...filtered] : filtered;
          });
          return reloadLiveHistory();
        })
        .catch((error) => {
          console.log("SAVE LIVE SESSION ENDED ERROR:", error);
        });

      pendingCommentsRef.current = [];
      sessionCommentsRef.current = [];
      setCurrentLiveSession(null);
      setDbLiveSessionId(null);
      setNowMs(0);
    },
    [reloadLiveHistory, setCurrentLiveSession, setDbLiveSessionId],
  );

  const startSessionFromPayload = useCallback(
    (payload: unknown) => {
      const localSession = normalizeLiveSession(payload);

      pendingCommentsRef.current = [];
      sessionCommentsRef.current = [];
      setCurrentLiveSession(localSession);
      setDbLiveSessionId(null);
      setNowMs(Date.now());

      void saveLiveSessionStartedApi({
        sessionId: localSession.sessionId,
        username: localSession.username,
        startedAt: localSession.startedAt,
      })
        .then(async (savedSession) => {
          const mergedSession = mergeSession(currentLiveSessionRef.current, savedSession);
          setDbLiveSessionId(savedSession.id);
          setCurrentLiveSession(mergedSession);
          await savePendingComments(savedSession.id);
          await reloadLiveHistory();
        })
        .catch((error) => {
          console.log("SAVE LIVE SESSION STARTED ERROR:", error);
        });
    },
    [reloadLiveHistory, savePendingComments, setCurrentLiveSession, setDbLiveSessionId],
  );

  const endSessionFromPayload = useCallback(
    (payload: unknown) => {
      const sessionFromPython = normalizeLiveSession(payload);
      const comments = sessionCommentsRef.current;
      const finalCommentCount = Math.max(sessionFromPython.commentCount || 0, comments.length);

      void saveLiveSessionEndedApi({
        sessionId: sessionFromPython.sessionId,
        username: sessionFromPython.username,
        startedAt: sessionFromPython.startedAt,
        endedAt: sessionFromPython.endedAt || new Date().toISOString(),
        durationSeconds: sessionFromPython.durationSeconds,
        commentCount: finalCommentCount,
        reason: sessionFromPython.reason || "live_ended",
      })
        .then((savedSession) => {
          setLiveHistory((prev) => {
            const filtered = prev.filter((item) => item.id !== savedSession.id);
            return shouldShowHistorySession(savedSession) ? [savedSession, ...filtered] : filtered;
          });
          return reloadLiveHistory();
        })
        .catch((error) => {
          console.log("SAVE LIVE SESSION ENDED ERROR:", error);
        });

      pendingCommentsRef.current = [];
      sessionCommentsRef.current = [];
      setCurrentLiveSession(null);
      setDbLiveSessionId(null);
      setNowMs(0);
    },
    [reloadLiveHistory, setCurrentLiveSession, setDbLiveSessionId],
  );

  const updateSessionStatusFromPayload = useCallback(
    (payload: unknown) => {
      const data = payload as { startedAt?: string; started_at?: string } | null;

      if (!data || (!data.startedAt && !data.started_at)) {
        pendingCommentsRef.current = [];
        sessionCommentsRef.current = [];
        setCurrentLiveSession(null);
        setDbLiveSessionId(null);
        setNowMs(0);
        return;
      }

      const session = normalizeLiveSession(payload);
      setCurrentLiveSession(session);
    },
    [setCurrentLiveSession, setDbLiveSessionId],
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

      const session = currentLiveSessionRef.current;
      if (session) {
        const nextSession: LiveHistoryItem = {
          ...session,
          commentCount: nextComments.length,
          comments: nextComments,
        };

        setCurrentLiveSession(nextSession);
      }

      const dbLiveSessionId = currentDbLiveSessionIdRef.current;

      if (!dbLiveSessionId) {
        pendingCommentsRef.current = existed
          ? pendingCommentsRef.current.map((item) =>
              item.id === comment.id ? { ...item, ...comment } : item,
            )
          : [comment, ...pendingCommentsRef.current].slice(0, MAX_COMMENTS);
        return;
      }

      void saveLiveCommentApi({
        liveSessionId: dbLiveSessionId,
        comment,
      }).catch((error) => {
        console.log("SAVE LIVE COMMENT ERROR:", error);
      });
    },
    [setCurrentLiveSession],
  );

  return {
    currentLiveSession,
    currentLiveSessionId,
    liveHistory,
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
