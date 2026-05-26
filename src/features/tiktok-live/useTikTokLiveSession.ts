"use client";

import { useCallback, useRef, useState } from "react";
import { MAX_COMMENTS } from "@/constants/config";
import type { LiveComment } from "@/types";
import { calcDurationSeconds } from "@/utils/date";
import {
  clearLiveHistoryStorage,
  readLiveHistory,
  saveHistoryItem,
} from "@/features/tiktok-live/liveHistoryStorage";
import { normalizeLiveSession } from "@/features/tiktok-live/liveSessionMapper";
import type { LiveHistoryItem } from "@/features/tiktok-live/types";

export function useTikTokLiveSession() {
  const currentSessionRef = useRef<LiveHistoryItem | null>(null);
  const sessionCommentsRef = useRef<LiveComment[]>([]);

  const [currentLiveSession, setCurrentLiveSession] = useState<LiveHistoryItem | null>(null);
  const [liveHistory, setLiveHistory] = useState<LiveHistoryItem[]>([]);

  const loadLiveHistory = useCallback(() => {
    setLiveHistory(readLiveHistory());
  }, []);

  const resetCurrentSession = useCallback(() => {
    currentSessionRef.current = null;
    sessionCommentsRef.current = [];
    setCurrentLiveSession(null);
  }, []);

  const finalizeCurrentSessionLocally = useCallback(
    (reason: string) => {
      const session = currentSessionRef.current;

      if (!session?.startedAt) return;

      const endedAt = new Date().toISOString();
      const commentsOfSession = sessionCommentsRef.current;

      const historyItem: LiveHistoryItem = {
        ...session,
        endedAt,
        durationSeconds: calcDurationSeconds(session.startedAt, endedAt),
        commentCount: commentsOfSession.length,
        comments: commentsOfSession,
        reason,
      };

      const nextHistory = saveHistoryItem(historyItem);

      setLiveHistory(nextHistory);
      resetCurrentSession();
    },
    [resetCurrentSession]
  );

  const startSessionFromPayload = useCallback((payload: unknown) => {
    const session = normalizeLiveSession(payload);

    currentSessionRef.current = session;
    sessionCommentsRef.current = [];

    setCurrentLiveSession(session);

    return session;
  }, []);

  const endSessionFromPayload = useCallback(
    (payload: unknown) => {
      const sessionFromPython = normalizeLiveSession(payload);

      const commentsOfSession =
        currentSessionRef.current?.sessionId === sessionFromPython.sessionId
          ? sessionCommentsRef.current
          : [];

      const historyItem: LiveHistoryItem = {
        ...sessionFromPython,
        comments: commentsOfSession,
        commentCount: Math.max(sessionFromPython.commentCount, commentsOfSession.length),
      };

      const nextHistory = saveHistoryItem(historyItem);

      setLiveHistory(nextHistory);

      if (currentSessionRef.current?.sessionId === sessionFromPython.sessionId) {
        resetCurrentSession();
      }

      return sessionFromPython;
    },
    [resetCurrentSession]
  );

  const syncSessionStatus = useCallback(
    (payload: Record<string, unknown>) => {
      if (!payload || !payload.startedAt) {
        resetCurrentSession();
        return null;
      }

      const session = normalizeLiveSession(payload);

      currentSessionRef.current = session;
      setCurrentLiveSession(session);

      return session;
    },
    [resetCurrentSession]
  );

  const appendCommentToCurrentSession = useCallback((comment: LiveComment) => {
    const session = currentSessionRef.current;

    if (!session) return;

    const existed = sessionCommentsRef.current.some((item) => item.id === comment.id);

    if (!existed) {
      sessionCommentsRef.current = [comment, ...sessionCommentsRef.current].slice(0, MAX_COMMENTS);
    }

    const nextSession: LiveHistoryItem = {
      ...session,
      commentCount: sessionCommentsRef.current.length,
      comments: sessionCommentsRef.current,
    };

    currentSessionRef.current = nextSession;
    setCurrentLiveSession(nextSession);
  }, []);

  const clearLiveHistory = useCallback(() => {
    setLiveHistory([]);
    clearLiveHistoryStorage();
  }, []);

  return {
    currentLiveSession,
    liveHistory,

    loadLiveHistory,
    finalizeCurrentSessionLocally,
    startSessionFromPayload,
    endSessionFromPayload,
    syncSessionStatus,
    appendCommentToCurrentSession,
    clearLiveHistory,
  };
}
