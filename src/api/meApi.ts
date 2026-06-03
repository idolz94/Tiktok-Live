"use client";

import { ApiError, getRequest } from "@/lib/request";
import { Profile, Shop, ShopLicense, ShopMember } from "@/types/database";

type BootstrapUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
  metadata?: Record<string, any>;
  [key: string]: any;
};

export type MeBootstrapResponse = {
  user: BootstrapUser | null;
  profile: Profile | null;
  shopMember: ShopMember | null;
  shop: Shop | null;
  license: ShopLicense | null;
  canUseApp: boolean;
  reason?: string | null;
};

const EMPTY_ME: MeBootstrapResponse = {
  user: null,
  profile: null,
  shopMember: null,
  shop: null,
  license: null,
  canUseApp: false,
  reason: "NO_USER",
};

export function isLicenseUsable(license: ShopLicense | null) {
  if (!license) return false;

  const validStatus = ["trial", "trialing", "active"].includes(String(license.status));

  if (!validStatus) return false;

  const expiredAt = license.expired_at || license.trial_ends_at;

  if (expiredAt) {
    const expiredTime = new Date(expiredAt).getTime();

    if (Number.isNaN(expiredTime)) return false;

    if (expiredTime < Date.now()) return false;
  }

  return true;
}

function normalizeUser(user: any): BootstrapUser | null {
  if (!user) return null;

  const metadata = user.user_metadata || user.metadata || {};

  return {
    ...user,
    id: String(user.id || user.userId || user.user_id || ""),
    email: user.email || null,
    user_metadata: {
      full_name: metadata.full_name || metadata.fullName || user.fullName || user.full_name || "",
      phone: metadata.phone || user.phone || "",
      tiktok_id: metadata.tiktok_id || metadata.tiktokId || user.tiktokId || "",
      default_tiktok_username:
        metadata.default_tiktok_username ||
        metadata.defaultTikTokUsername ||
        user.defaultTikTokUsername ||
        user.default_tiktok_username ||
        "",
      ...metadata,
    },
  };
}

function normalizeProfile(raw: any, user: BootstrapUser | null): Profile | null {
  if (!raw && !user) return null;

  const metadata = user?.user_metadata || {};
  const source = raw || {};

  return {
    id: String(source.id || user?.id || ""),
    full_name: source.full_name || source.fullName || metadata.full_name || null,
    email: source.email || user?.email || null,
    phone: source.phone || metadata.phone || null,
    avatar_url: source.avatar_url || source.avatarUrl || null,
    status: source.status || "active",
    created_at: source.created_at || source.createdAt || new Date().toISOString(),
    updated_at: source.updated_at || source.updatedAt || new Date().toISOString(),
  };
}

function normalizeMeBootstrap(raw: any): MeBootstrapResponse {
  const source = raw || {};
  const user = normalizeUser(source.user || source.account || source.me);
  const profile = normalizeProfile(source.profile, user);
  const shopMember = source.shopMember || source.member || null;
  const shop = source.shop || null;
  const license = source.license || source.shopLicense || source.shop_license || null;

  return {
    user,
    profile,
    shopMember,
    shop,
    license,
    canUseApp:
      typeof source.canUseApp === "boolean" ? source.canUseApp : isLicenseUsable(license),
    reason: source.reason || null,
  };
}

export async function getMeBootstrapApi(): Promise<MeBootstrapResponse> {
  try {
    const data = await getRequest<any>("/me/bootstrap");
    return normalizeMeBootstrap(data);
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
      return EMPTY_ME;
    }

    throw error;
  }
}
