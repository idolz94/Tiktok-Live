"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { setAuthTokenProvider } from "@/lib/request";

export function ClerkTokenSync() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    setAuthTokenProvider(() => getTokenRef.current());
    return () => setAuthTokenProvider(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
