"use client";

import { getRequest, postRequest } from "@/lib/request";
import { ShopLicense } from "@/types/database";

export type LicenseCurrentResponse = {
  license: ShopLicense | null;
  canUseApp: boolean;
  reason: string | null;
};

export type LicenseRefreshResponse = {
  license: ShopLicense | null;
  canUseApp: boolean;
  reason: string | null;
};

export type AdminActivatePayload = {
  username: string;
  planCode: "trial" | "basic" | "pro" | "vip";
  months: number;
  price: number;
};

export type AdminActivateResponse = {
  license: ShopLicense;
  shopId: string;
  shopName: string;
};

export async function getLicenseCurrentApi(): Promise<LicenseCurrentResponse> {
  const data = await getRequest<any>("/licenses/current");
  return {
    license: data?.license ?? data?.data?.license ?? null,
    canUseApp: data?.canUseApp ?? data?.data?.canUseApp ?? false,
    reason: data?.reason ?? data?.data?.reason ?? null,
  };
}

export async function refreshLicenseApi(): Promise<LicenseRefreshResponse> {
  const data = await postRequest<any>("/licenses/refresh", {});
  return {
    license: data?.license ?? data?.data?.license ?? null,
    canUseApp: data?.canUseApp ?? data?.data?.canUseApp ?? false,
    reason: data?.reason ?? data?.data?.reason ?? null,
  };
}

export async function adminActivateLicenseApi(
  payload: AdminActivatePayload,
): Promise<AdminActivateResponse> {
  const data = await postRequest<any>("/licenses/admin-activate", payload);
  return data?.data ?? data;
}
