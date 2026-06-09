"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getMeBootstrapApi } from "@/api/meApi";
import { signOutApi } from "@/api/authApi";
import type { AuthChangeReason } from "@/lib/request";
import { getRuntimeAuthToken, restoreTokenFromCookie } from "@/lib/request";
import type { ShopTikTokChannel } from "@/types/database";

export type AuthUser = {
  id: string;
  email?: string | null;
  username?: string | null;
  fullName?: string | null;
  phone?: string | null;
  shopId?: string | null;
  shopName?: string | null;
  tiktokUsername?: string | null;
  tiktokChannels?: ShopTikTokChannel[];
  role?: string | null;
  canUseApp?: boolean;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

let bootstrapInFlight: Promise<AuthUser | null> | null = null;
let bootstrapDone = false;
let cachedUser: AuthUser | null = null;

function mapBootstrapUser(me: Awaited<ReturnType<typeof getMeBootstrapApi>>): AuthUser | null {
  if (!me.user) return null;

  return {
    id: me.user.id,
    email: me.user.email,
    username:
      me.profile?.full_name ||
      me.profile?.phone ||
      me.user.user_metadata?.full_name ||
      "User",
    fullName: me.profile?.full_name || me.user.user_metadata?.full_name || "",
    phone: me.profile?.phone || me.user.user_metadata?.phone || "",
    shopId: me.shop?.id || null,
    shopName: me.shop?.name || null,
    tiktokUsername:
      me.shop?.default_tiktok_username ||
      me.user.user_metadata?.default_tiktok_username ||
      me.user.user_metadata?.tiktok_id ||
      "",
    tiktokChannels: me.tiktokChannels,
    role: me.shopMember?.role || null,
    canUseApp: me.canUseApp,
  };
}

export async function bootstrapAuth() {
  if (bootstrapInFlight) return bootstrapInFlight;

  restoreTokenFromCookie();

  const token = getRuntimeAuthToken();
  if (!token) {
    bootstrapDone = true;
    cachedUser = null;
    return null;
  }

  bootstrapInFlight = (async () => {
    const me = await getMeBootstrapApi();
    cachedUser = mapBootstrapUser(me);
    bootstrapDone = true;
    return cachedUser;
  })().finally(() => {
    bootstrapInFlight = null;
  });

  return bootstrapInFlight;
}

function clearAuthCache() {
  bootstrapDone = false;
  cachedUser = null;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(!bootstrapDone);
  const [error, setError] = useState<string | null>(null);

  const runBootstrap = useCallback(async () => {
    try {
      setIsLoading(true);
      const nextUser = await bootstrapAuth();
      setUser(nextUser);
      setError(null);
    } catch (authError) {
      if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
        console.error("AUTH BOOTSTRAP ERROR:", authError);
      }
      clearAuthCache();
      setUser(null);
      setError(
        authError instanceof Error ? authError.message : "Không thể kiểm tra đăng nhập",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    clearAuthCache();
    return runBootstrap();
  }, [runBootstrap]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await signOutApi();
      clearAuthCache();
      setUser(null);
      setError(null);
    } catch (logoutError) {
      toast.error(logoutError instanceof Error ? logoutError.message : "Đăng xuất thất bại");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!bootstrapDone) {
      void runBootstrap();
    }
  }, [runBootstrap]);

  useEffect(() => {
    const handleAuthChanged = (e: Event) => {
      const reason = (e as CustomEvent<{ reason: AuthChangeReason }>).detail?.reason;

      if (reason === "login" || reason === "register") {
        clearAuthCache();
        void runBootstrap();
        return;
      }

      if (reason === "logout") {
        clearAuthCache();
        setUser(null);
        setError(null);
        setIsLoading(false);
      }
    };

    window.addEventListener("lumi-auth-change", handleAuthChanged);
    return () => window.removeEventListener("lumi-auth-change", handleAuthChanged);
  }, [runBootstrap]);

  return { user, isLoading, error, refreshAuth, logout };
}
