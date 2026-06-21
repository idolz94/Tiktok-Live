"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMeBootstrapApi, MeBootstrapResponse } from "@/api/meApi";
import { getMemoryToken } from "@/lib/request";
import { logoutApi, refreshApi, hasSession, clearHasSession } from "@/api/authApi";
import { isPublicAuthScreen } from "@/lib/request";
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
  hasOrders?: boolean;
  hasHistory?: boolean;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isSignedIn: boolean;
  error: string | null;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

function mapProfileToAuthUser(profile: MeBootstrapResponse): AuthUser {
  return {
    id: profile?.user?.id || "",
    email: profile?.user?.email || null,
    username: profile?.user?.username || null,
    fullName: profile?.user?.full_name || null,
    phone: profile?.user?.phone || null,
    shopId: profile?.shop?.id || null,
    shopName: profile?.shop?.name || null,
    tiktokUsername: profile?.shop?.default_tiktok_username || null,
    tiktokChannels: Array.isArray(profile?.tiktokChannels) ? profile.tiktokChannels : [],
    role: profile?.shopMember?.role || null,
    canUseApp: profile?.canUseApp ?? false,
    hasOrders: profile?.hasOrders ?? false,
    hasHistory: profile?.hasHistory ?? false,
  };
}

export function useAuth(): AuthState {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const bootstrappedUserIdRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (options?: { background?: boolean }) => {
    const isBackground = options?.background ?? false;

    try {
      if (!isBackground) setIsLoading(true);
      setError(null);

      const token = getMemoryToken();
      if (!token) {
        setIsSignedIn(false);
        setAuthUser(null);
        return;
      }

      const profile = await getMeBootstrapApi();
      setIsSignedIn(true);
      const mapped = mapProfileToAuthUser(profile);
      setAuthUser(mapped);
      bootstrappedUserIdRef.current = mapped.id;

    } catch (err) {

      if (!isBackground) {
        setAuthUser(null);
        setIsSignedIn(false);
      }
      setError(err instanceof Error ? err.message : "Không thể tải thông tin tài khoản");
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    await fetchProfile({ background: Boolean(authUser) });
  }, [authUser, fetchProfile]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setAuthUser(null);
      setIsSignedIn(false);
      setError(null);
      await logoutApi();
      router.replace("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng xuất thất bại");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (getMemoryToken()) {
        await fetchProfile();
        return;
      }

      // Do not attempt refresh on public auth screens — there is no session to restore
      if (isPublicAuthScreen()) {
        if (cancelled) return;
        setIsSignedIn(false);
        setAuthUser(null);
        setIsLoading(false);
        return;
      }

      // Chỉ thử refresh khi user đã từng login (có session flag trong localStorage)
      if (!hasSession()) {
        if (cancelled) return;
        setIsSignedIn(false);
        setAuthUser(null);
        setIsLoading(false);
        return;
      }

      // memoryToken mất sau refresh browser — thử dùng httpOnly cookie để lấy lại token
      if (!cancelled) setIsLoading(true);

      try {
        await refreshApi();
        if (cancelled) return;
        await fetchProfile();
      } catch {
        if (cancelled) return;
        // If refresh fails on the browser while a session flag exists, the cookie is gone.
        // Clear the stale flag so the next load is clean.
        clearHasSession();
        setIsSignedIn(false);
        setAuthUser(null);
        setIsLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchProfile]);

  return { user: authUser, isLoading, isSignedIn, error, refreshAuth, logout };
}
