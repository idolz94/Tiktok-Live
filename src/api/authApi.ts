import { postRequest } from "@/lib/request";
import { setMemoryToken, clearMemoryToken } from "@/lib/request";

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  password: string;
  tiktokId: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

export type AuthUserResponse = {
  id: string;
  username: string;
  email?: string | null;
  fullName?: string | null;
};

export type AuthResponse = {
  user: AuthUserResponse;
  accessToken: string;
};

const SESSION_KEY = "lumi_has_session";

export function markHasSession() {
  try { localStorage.setItem(SESSION_KEY, "1"); } catch {}
}

export function clearHasSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("lumi_live_resume_username");
  } catch {}
}

export function hasSession(): boolean {
  try { return localStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const response = await postRequest<AuthResponse>("/auth/login", payload, { skipSessionExpired: true, skipRefresh: true });
  setMemoryToken(response.accessToken);
  markHasSession();
  return response;
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await postRequest<AuthResponse>("/auth/register", payload, { skipSessionExpired: true, skipRefresh: true });
  setMemoryToken(response.accessToken);
  markHasSession();
  return response;
}

export async function refreshApi(): Promise<{ accessToken: string }> {
  const response = await postRequest<{ accessToken: string }>("/auth/refresh", {}, { skipSessionExpired: true });
  setMemoryToken(response.accessToken);
  markHasSession();
  return response;
}

export async function logoutApi(): Promise<void> {
  clearMemoryToken();
  clearHasSession();
  try {
    await postRequest("/auth/logout", {});
  } catch {
    // ignore errors on logout
  }
}
