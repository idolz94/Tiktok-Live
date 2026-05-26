"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TIKTOK_USERNAME } from "@/constants/config";
import { normalizeTikTokUsername } from "@/features/tiktok-live/tiktokUsername";
import { useBrowserCloseSession } from "@/features/tiktok-live/useBrowserCloseSession";
import { useLiveDuration } from "@/features/tiktok-live/useLiveDuration";
import { useTikTokComments } from "@/features/tiktok-live/useTikTokComments";
import { useTikTokLiveSession } from "@/features/tiktok-live/useTikTokLiveSession";
import { useTikTokSocketClient } from "@/features/tiktok-live/useTikTokSocketClient";
import { useTikTokSocketMessageHandler } from "@/features/tiktok-live/useTikTokSocketMessageHandler";

export function useTikTokLiveSocket() {
  const tiktokUsernameRef = useRef(normalizeTikTokUsername(TIKTOK_USERNAME));

  const [status, setStatus] = useState("Đang kết nối...");
  const [isConnected, setIsConnected] = useState(false);
  const [tiktokUsername, setTikTokUsername] = useState(normalizeTikTokUsername(TIKTOK_USERNAME));

  const { comments, setComments, addCommentToList, replaceSnapshot, clearComments } =
    useTikTokComments();

  const {
    currentLiveSession,
    liveHistory,
    loadLiveHistory,
    finalizeCurrentSessionLocally,
    startSessionFromPayload,
    endSessionFromPayload,
    syncSessionStatus,
    appendCommentToCurrentSession,
    clearLiveHistory,
  } = useTikTokLiveSession();

  const { liveDurationSeconds, liveNowText } = useLiveDuration(currentLiveSession);

  const handleSocketMessage = useTikTokSocketMessageHandler({
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
  });

  const {
    sendJson,
    startSocket,
    reconnect: reconnectSocket,
    disconnect: disconnectSocket,
    closeSocket,
  } = useTikTokSocketClient({
    tiktokUsernameRef,
    onMessage: handleSocketMessage,
    onSocketClose: finalizeCurrentSessionLocally,
    setStatus,
    setIsConnected,
  });

  useEffect(() => {
    loadLiveHistory();
  }, [loadLiveHistory]);

  useBrowserCloseSession(() => {
    finalizeCurrentSessionLocally("browser_close");
  });

  const subscribeTikTokUsername = useCallback(
    (username: string) => {
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
      setTikTokUsername(nextUsername);
      setComments([]);
      setStatus(`Đang subscribe LIVE ${nextUsername}...`);

      const sent = sendJson("SUBSCRIBE_TIKTOK_USERNAME", {
        username: nextUsername,
      });

      if (!sent) {
        setStatus("Chưa kết nối server Python. Sẽ tự subscribe lại khi kết nối.");
      }

      return sent;
    },
    [finalizeCurrentSessionLocally, sendJson, setComments]
  );

  const stopLiveSession = useCallback(() => {
    setStatus("Đang dừng nhận comment...");

    sendJson("STOP", {
      username: tiktokUsernameRef.current,
    });

    finalizeCurrentSessionLocally("manual_stop");

    return true;
  }, [finalizeCurrentSessionLocally, sendJson]);

  const reconnect = useCallback(() => {
    finalizeCurrentSessionLocally("manual_reconnect");
    reconnectSocket();
  }, [finalizeCurrentSessionLocally, reconnectSocket]);

  const disconnect = useCallback(() => {
    disconnectSocket("manual_disconnect");
  }, [disconnectSocket]);

  useEffect(() => {
    startSocket();

    return () => {
      closeSocket("component_unmount");
    };
  }, [closeSocket, startSocket]);

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
