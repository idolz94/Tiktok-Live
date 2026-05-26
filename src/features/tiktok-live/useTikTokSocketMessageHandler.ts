"use client";

import { Dispatch, MutableRefObject, SetStateAction, useCallback } from "react";
import type { LiveComment, SocketMessage } from "@/types";
import type { LiveHistoryItem } from "@/features/tiktok-live/types";

type UseTikTokSocketMessageHandlerParams = {
  tiktokUsernameRef: MutableRefObject<string>;
  setStatus: Dispatch<SetStateAction<string>>;
  setIsConnected: Dispatch<SetStateAction<boolean>>;
  setTikTokUsername: Dispatch<SetStateAction<string>>;
  addCommentToList: (rawComment: unknown) => LiveComment | null;
  replaceSnapshot: (rawComments: unknown[]) => void;
  finalizeCurrentSessionLocally: (reason: string) => void;
  startSessionFromPayload: (payload: unknown) => LiveHistoryItem;
  endSessionFromPayload: (payload: unknown) => LiveHistoryItem;
  syncSessionStatus: (payload: Record<string, unknown>) => LiveHistoryItem | null;
  appendCommentToCurrentSession: (comment: LiveComment) => void;
  clearComments: () => void;
};

export function useTikTokSocketMessageHandler({
  tiktokUsernameRef,
  setStatus,
  setIsConnected,
  setTikTokUsername,
  addCommentToList,
  replaceSnapshot,
  finalizeCurrentSessionLocally,
  startSessionFromPayload,
  endSessionFromPayload,
  syncSessionStatus,
  appendCommentToCurrentSession,
  clearComments,
}: UseTikTokSocketMessageHandlerParams) {
  return useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(String(event.data)) as SocketMessage;
        const type = String(message.type || "").toUpperCase();
        const payload =
          (message as { payload?: unknown; data?: unknown }).payload ||
          (message as { payload?: unknown; data?: unknown }).data ||
          {};

        const payloadData = payload as Record<string, unknown>;

        if (type === "CONNECTED") {
          setStatus("Đã kết nối server Python");
          setIsConnected(true);
          return;
        }

        if (type === "SUBSCRIBING") {
          setStatus(`Đang chuẩn bị lấy comment LIVE: ${String(payloadData.username || "")}`);
          return;
        }

        if (type === "SUBSCRIBED") {
          const username = String(payloadData.username || payloadData.tiktokUsername || "");

          if (username) {
            tiktokUsernameRef.current = username;
            setTikTokUsername(username);
          }

          const snapshot = Array.isArray(payloadData.comments) ? payloadData.comments : [];

          replaceSnapshot(snapshot);
          setStatus(`Đã subscribe LIVE ${username}, đang chờ comment đầu tiên...`);
          return;
        }

        if (type === "LIVE_TIME_STARTED") {
          const session = startSessionFromPayload(payload);

          setStatus(`Bắt đầu phiên nhận comment: ${session.username}`);
          return;
        }

        if (type === "LIVE_TIME_ENDED") {
          const session = endSessionFromPayload(payload);

          setStatus(`Đã lưu phiên LIVE: ${session.username}`);
          return;
        }

        if (type === "LIVE_TIME_STATUS") {
          syncSessionStatus(payloadData);
          return;
        }

        if (type === "UNSUBSCRIBED") {
          finalizeCurrentSessionLocally("unsubscribed");
          clearComments();
          setStatus(`Đã rời LIVE: ${String(payloadData.username || "")}`);
          return;
        }

        if (type === "LIVE_CONNECTED") {
          setStatus(`Đã kết nối TikTok Live: ${String(payloadData.username || "")}`);
          return;
        }

        if (type === "LIVE_DISCONNECTED") {
          finalizeCurrentSessionLocally("live_disconnected");
          setStatus(`TikTok Live đã ngắt: ${String(payloadData.username || "")}`);
          return;
        }

        if (type === "LIVE_ERROR") {
          finalizeCurrentSessionLocally("live_error");
          setStatus(
            `TikTok lỗi ${String(payloadData.username || "")}: ${String(
              payloadData.message || "Không rõ lỗi"
            )}`
          );
          return;
        }

        if (type === "SNAPSHOT") {
          const snapshot = Array.isArray(payloadData.comments) ? payloadData.comments : [];

          replaceSnapshot(snapshot);
          return;
        }

        if (type === "COMMENT") {
          const comment = addCommentToList(payload);

          if (comment) {
            appendCommentToCurrentSession(comment);
          }
        }
      } catch {
        setStatus("Không parse được message từ WebSocket");
      }
    },
    [
      addCommentToList,
      appendCommentToCurrentSession,
      clearComments,
      endSessionFromPayload,
      finalizeCurrentSessionLocally,
      replaceSnapshot,
      setIsConnected,
      setStatus,
      setTikTokUsername,
      startSessionFromPayload,
      syncSessionStatus,
      tiktokUsernameRef,
    ]
  );
}
