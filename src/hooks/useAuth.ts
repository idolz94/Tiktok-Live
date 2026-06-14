"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { getMeBootstrapApi, MeBootstrapResponse } from "@/api/meApi";
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

function mapProfileToAuthUser(clerkUser: any, profile: MeBootstrapResponse): AuthUser {
  return {
    id: clerkUser?.id || profile?.user?.id || "",
    email: clerkUser?.primaryEmailAddress?.emailAddress || profile?.user?.email || null,
    username:
      profile?.profile?.full_name ||
      profile?.profile?.phone ||
      clerkUser?.fullName ||
      clerkUser?.firstName ||
      "User",
    fullName:
      profile?.profile?.full_name ||
      clerkUser?.fullName ||
      "",
    phone: profile?.profile?.phone || clerkUser?.primaryPhoneNumber?.phoneNumber || null,
    shopId: profile?.shop?.id || null,
    shopName: profile?.shop?.name || null,
    tiktokUsername:
      profile?.shop?.default_tiktok_username ||
      null,
    tiktokChannels: Array.isArray(profile?.tiktokChannels) ? profile.tiktokChannels : [],
    role: profile?.shopMember?.role || null,
    canUseApp: profile?.canUseApp ?? false,
    hasOrders: profile?.hasOrders ?? false,
    hasHistory: profile?.hasHistory ?? false,
  };
}

export function useAuth(): AuthState {
  const { isSignedIn, isLoaded: authLoaded, signOut } = useClerkAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bootstrappedUserIdRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (options?: { background?: boolean }) => {
    const isBackground = options?.background ?? false;

    try {
      if (!isBackground) {
        setIsLoading(true);
      }
      setError(null);

      const profile = await getMeBootstrapApi();

      const mapped = mapProfileToAuthUser(clerkUser, profile);
      setAuthUser(mapped);
      bootstrappedUserIdRef.current = clerkUser?.id || mapped.id || null;
    } catch (err) {
      if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
        console.error("AUTH PROFILE ERROR:", err);
      }

      if (!isBackground) {
        setAuthUser(null);
      }
      setError(err instanceof Error ? err.message : "Không thể tải thông tin tài khoản");
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      }
    }
  }, [clerkUser?.id]);

  const refreshAuth = useCallback(async () => {
    if (!isSignedIn) return;
    await fetchProfile({ background: Boolean(authUser) });
  }, [authUser, isSignedIn, fetchProfile]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await signOut();
      setAuthUser(null);
      setError(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng xuất thất bại");
    } finally {
      setIsLoading(false);
    }
  }, [signOut]);

  useEffect(() => {
    if (!authLoaded || !userLoaded) return;

    if (!isSignedIn) {
      bootstrappedUserIdRef.current = null;
      setAuthUser(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const clerkUserId = clerkUser?.id || null;
    const hasBootstrappedCurrentUser = bootstrappedUserIdRef.current === clerkUserId;

    void fetchProfile({ background: hasBootstrappedCurrentUser });
  }, [authLoaded, userLoaded, isSignedIn, clerkUser?.id, fetchProfile]);

  const combinedLoading = !authLoaded || !userLoaded || isLoading;

  return { user: authUser, isLoading: combinedLoading, isSignedIn: isSignedIn ?? false, error, refreshAuth, logout };
}
