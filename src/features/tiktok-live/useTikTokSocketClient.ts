"use client";

import { Dispatch, MutableRefObject, SetStateAction, useCallback, useEffect, useRef } from "react";
import { DEFAULT_WS_URL, RECONNECT_DELAY } from "@/constants/config";

type SendJson = (type: string, payload?: Record<string, unknown>) => boolean;

type UseTikTokSocketClientParams = {
  tiktokUsernameRef: MutableRefObject<string>;
  onMessage: (event: MessageEvent) => void;
  onSocketClose: (reason: string) => void;
  setStatus: Dispatch<SetStateAction<string>>;
  setIsConnected: Dispatch<SetStateAction<boolean>>;
};

export function useTikTokSocketClient({
  tiktokUsernameRef,
  onMessage,
  onSocketClose,
  setStatus,
  setIsConnected,
}: UseTikTokSocketClientParams) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectSocketRef = useRef<(() => void) | null>(null);

  const shouldReconnectRef = useRef(true);
  const isManualCloseRef = useRef(false);

  const clearReconnectTimer = useCallback(() => {
    if (!reconnectTimerRef.current) return;

    clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
  }, []);

  const sendJson: SendJson = useCallback((type, payload = {}) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify({ type, payload }));

    return true;
  }, []);

  const subscribeCurrentUsername = useCallback(
    (socket: WebSocket) => {
      const username = tiktokUsernameRef.current;

      if (!username) return;

      socket.send(
        JSON.stringify({
          type: "SUBSCRIBE_TIKTOK_USERNAME",
          payload: { username },
        })
      );
    },
    [tiktokUsernameRef]
  );

  const scheduleReconnect = useCallback(() => {
    reconnectTimerRef.current = setTimeout(() => {
      connectSocketRef.current?.();
    }, RECONNECT_DELAY);
  }, []);

  const connectSocket = useCallback(() => {
    const url = DEFAULT_WS_URL.trim();

    if (!url) {
      setStatus("Thiếu WebSocket URL");
      return;
    }

    const currentSocket = socketRef.current;

    if (
      currentSocket &&
      (currentSocket.readyState === WebSocket.OPEN ||
        currentSocket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    clearReconnectTimer();

    try {
      setStatus("Đang kết nối server Python...");
      setIsConnected(false);

      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("Đã kết nối server Python");
        setIsConnected(true);
        subscribeCurrentUsername(socket);
      };

      socket.onmessage = onMessage;

      socket.onerror = () => {
        setStatus("Lỗi WebSocket");
        setIsConnected(false);
      };

      socket.onclose = () => {
        onSocketClose("socket_close");
        setIsConnected(false);
        socketRef.current = null;

        if (isManualCloseRef.current || !shouldReconnectRef.current) {
          setStatus("Đã ngắt kết nối");
          return;
        }

        setStatus("Mất kết nối, đang tự kết nối lại...");
        scheduleReconnect();
      };
    } catch {
      setStatus("Lỗi kết nối WebSocket");
      setIsConnected(false);
      scheduleReconnect();
    }
  }, [
    clearReconnectTimer,
    onMessage,
    onSocketClose,
    scheduleReconnect,
    setIsConnected,
    setStatus,
    subscribeCurrentUsername,
  ]);

  useEffect(() => {
    connectSocketRef.current = connectSocket;
  }, [connectSocket]);

  const startSocket = useCallback(() => {
    shouldReconnectRef.current = true;
    isManualCloseRef.current = false;
    connectSocketRef.current?.();
  }, []);

  const reconnect = useCallback(() => {
    shouldReconnectRef.current = true;
    isManualCloseRef.current = false;

    socketRef.current?.close();
    socketRef.current = null;

    connectSocketRef.current?.();
  }, []);

  const disconnect = useCallback(
    (reason = "manual_disconnect") => {
      onSocketClose(reason);

      shouldReconnectRef.current = false;
      isManualCloseRef.current = true;

      clearReconnectTimer();

      sendJson("STOP", {
        username: tiktokUsernameRef.current,
      });

      socketRef.current?.close();
      socketRef.current = null;

      setIsConnected(false);
      setStatus("Đã ngắt kết nối");
    },
    [clearReconnectTimer, onSocketClose, sendJson, setIsConnected, setStatus, tiktokUsernameRef]
  );

  const closeSocket = useCallback(
    (reason = "component_unmount") => {
      onSocketClose(reason);

      shouldReconnectRef.current = false;
      isManualCloseRef.current = true;

      clearReconnectTimer();

      sendJson("STOP", {
        username: tiktokUsernameRef.current,
      });

      socketRef.current?.close();
      socketRef.current = null;
    },
    [clearReconnectTimer, onSocketClose, sendJson, tiktokUsernameRef]
  );

  return {
    sendJson,
    startSocket,
    reconnect,
    disconnect,
    closeSocket,
  };
}
