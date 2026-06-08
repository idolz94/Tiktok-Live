"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMeBootstrapApi } from "@/api/meApi";
import { signOutApi } from "@/api/authApi";

export type AuthUser = {
  id: string;
  email?: string | null;
  username?: string | null;
  fullName?: string | null;
  phone?: string | null;
  shopId?: string | null;
  shopName?: string | null;
  tiktokUsername?: string | null;
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

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chống gọi /me/bootstrap liên tục khi component re-render hoặc event auth bắn nhiều lần.
  const refreshInFlightRef = useRef<Promise<void> | null>(null);
  const lastRefreshAtRef = useRef(0);

  const refreshAuth = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const now = Date.now();

    if (now - lastRefreshAtRef.current < 1200) {
      return;
    }

    const task = (async () => {
      try {
        lastRefreshAtRef.current = Date.now();
        const me = await getMeBootstrapApi();

        setError(null);

        if (!me.user) {
          setUser(null);
          return;
        }

        setUser({
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
          role: me.shopMember?.role || null,
          canUseApp: me.canUseApp,
        });
      } catch (authError) {
        if (process.env.NODE_ENV === "development") console.error("AUTH REFRESH ERROR:", authError);

        setUser(null);
        setError(
          authError instanceof Error
            ? authError.message
            : "Không thể kiểm tra đăng nhập",
        );
      } finally {
        setIsLoading(false);
        refreshInFlightRef.current = null;
      }
    })();

    refreshInFlightRef.current = task;
    return task;
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      await signOutApi();

      setUser(null);
      setError(null);
    } catch (logoutError) {
      alert(logoutError instanceof Error ? logoutError.message : "Đăng xuất thất bại");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshAuth();
    }, 0);

    const handleAuthChanged = () => {
      void refreshAuth();
    };

    // Chỉ refresh khi login/register/logout thay đổi token.
    // Không nghe window focus để tránh DevTools/tab focus làm spam /me/bootstrap.
    window.addEventListener("lumi-auth-change", handleAuthChanged);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("lumi-auth-change", handleAuthChanged);
    };
  }, [refreshAuth]);

  return {
    user,
    isLoading,
    error,
    refreshAuth,
    logout,
  };
}