"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setAuthTokenProvider } from "@/lib/request";

export function ClerkTokenSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenProvider(() => getToken());
    return () => setAuthTokenProvider(null);
  }, [getToken]);

  return null;
}
