"use client";

import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
};

type ShopMember = {
  id: string;
  shop_id: string;
  user_id: string;
  role: string;
  status: string;
};

type Shop = {
  id: string;
  owner_id: string;
  name: string;
  phone?: string | null;
  default_tiktok_username?: string | null;
  status?: string | null;
};

type ShopLicense = {
  id: string;
  shop_id: string;
  plan_code: string;
  status: string;
  expired_at?: string | null;
  trial_ends_at?: string | null;
  is_current?: boolean | null;
};

export function isLicenseUsable(license: ShopLicense | null) {
  if (!license) return false;

  const validStatus = ["trial", "active"].includes(license.status);

  if (!validStatus) return false;

  const expiredAt = license.expired_at || license.trial_ends_at;

  if (expiredAt) {
    const expiredTime = new Date(expiredAt).getTime();

    if (Number.isNaN(expiredTime)) return false;

    if (expiredTime < Date.now()) return false;
  }

  return true;
}

export async function getMeBootstrapApi() {
  const supabase = createClient();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const session = sessionData.session;

  if (!session) {
    return {
      user: null,
      profile: null,
      shopMember: null,
      shop: null,
      license: null,
      canUseApp: false,
    };
  }

  const user = session.user;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data: shopMember, error: shopMemberError } = await supabase
    .from("shop_members")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<ShopMember>();

  if (shopMemberError) {
    throw new Error(shopMemberError.message);
  }

  if (!shopMember) {
    return {
      user,
      profile,
      shopMember: null,
      shop: null,
      license: null,
      canUseApp: false,
    };
  }

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("*")
    .eq("id", shopMember.shop_id)
    .maybeSingle<Shop>();

  if (shopError) {
    throw new Error(shopError.message);
  }

  if (!shop) {
    return {
      user,
      profile,
      shopMember,
      shop: null,
      license: null,
      canUseApp: false,
    };
  }

  const { data: license, error: licenseError } = await supabase
    .from("shop_licenses")
    .select("*")
    .eq("shop_id", shop.id)
    .eq("is_current", true)
    .maybeSingle<ShopLicense>();

  if (licenseError) {
    throw new Error(licenseError.message);
  }

  return {
    user,
    profile,
    shopMember,
    shop,
    license,
    canUseApp: isLicenseUsable(license),
  };
}