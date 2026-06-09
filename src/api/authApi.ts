"use client";

import { clearRuntimeAuthToken, emitAuthChanged, postRequest, setRuntimeAuthToken } from "@/lib/request";
import { phoneToAuthEmail } from "@/utils/phone";

export type SignUpPayload = {
  fullName: string;
  phone: string;
  password: string;
  tiktokId: string;
};

export type SignInPayload = {
  phone: string;
  password: string;
  remember?: boolean;
};

type AuthApiResponse = {
  user?: any;
  session?: any;
  token?: string;
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  [key: string]: any;
};

function extractAndSaveToken(response: AuthApiResponse) {
  const token = String(
    response?.data?.accessToken ||
      response?.data?.access_token ||
      response?.data?.token ||
      response?.accessToken ||
      response?.access_token ||
      response?.token ||
      response?.session?.accessToken ||
      response?.session?.access_token ||
      "",
  ).trim();

  if (token) {
    setRuntimeAuthToken(token);
  }
}

export async function signUpApi(payload: SignUpPayload) {
  const rawPhone = payload.phone.trim();
  const tiktokId = payload.tiktokId.trim();

  const data = await postRequest<AuthApiResponse>("/auth/register", {
    fullName: payload.fullName.trim(),
    phone: rawPhone,
    email: phoneToAuthEmail(rawPhone),
    password: payload.password,
    tiktokId,
    defaultTikTokUsername: tiktokId,
    shopName: `${payload.fullName.trim()}'s Shop`,
    loginType: "phone_password",
  });

  extractAndSaveToken(data);
  emitAuthChanged("register");
  return data;
}

export async function signInApi(payload: SignInPayload) {
  const rawPhone = payload.phone.trim();

  const data = await postRequest<AuthApiResponse>("/auth/login", {
    phone: rawPhone,
    email: phoneToAuthEmail(rawPhone),
    password: payload.password,
    remember: payload.remember ?? true,
    loginType: "phone_password",
  });

  extractAndSaveToken(data);
  emitAuthChanged("login");
  return data;
}

export async function signOutApi() {
  try {
    await postRequest("/auth/logout", {});
  } catch {
  } finally {
    clearRuntimeAuthToken();
    emitAuthChanged("logout");
  }

  return true;
}
