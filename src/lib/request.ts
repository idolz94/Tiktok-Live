export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

let hasEmittedSessionExpired = false;
let runtimeAuthToken = "";

function isBrowser() {
  return typeof window !== "undefined";
}

export type RequestParams = Record<string, string | number | boolean | null | undefined>;

export type RequestOptions = {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  skipSessionExpired?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const CLIENT_TOKEN_COOKIE = "lumi_client_at";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function getRuntimeAuthToken() {
  return runtimeAuthToken;
}

export function setRuntimeAuthToken(token?: string | null) {
  runtimeAuthToken = token?.trim() || "";
  if (isBrowser()) {
    if (runtimeAuthToken) {
      setCookie(CLIENT_TOKEN_COOKIE, runtimeAuthToken);
    } else {
      deleteCookie(CLIENT_TOKEN_COOKIE);
    }
  }
}

export function clearRuntimeAuthToken() {
  runtimeAuthToken = "";
  if (isBrowser()) {
    deleteCookie(CLIENT_TOKEN_COOKIE);
  }
}

export function restoreTokenFromCookie(): string {
  if (!isBrowser()) return "";
  const stored = getCookie(CLIENT_TOKEN_COOKIE);
  if (stored) {
    runtimeAuthToken = stored;
  }
  return stored;
}

export type AuthChangeReason = "login" | "register" | "logout";

export function emitAuthChanged(reason: AuthChangeReason) {
  if (!isBrowser()) return;
  hasEmittedSessionExpired = false;
  window.dispatchEvent(new CustomEvent("lumi-auth-change", { detail: { reason } }));
}

export function emitSessionExpired() {
  if (!isBrowser()) return;
  if (hasEmittedSessionExpired) return;
  hasEmittedSessionExpired = true;
  window.dispatchEvent(new Event("lumi-session-expired"));
}

function appendParams(url: string, params?: RequestParams) {
  if (!params) return url;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  if (!queryString) return url;

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

function joinUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path;

  const safePath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl) return safePath;

  return `${baseUrl.replace(/\/+$/, "")}/${safePath.replace(/^\/+/, "")}`;
}

export function buildApiUrl(path: string, params?: RequestParams) {
  return appendParams(joinUrl(API_BASE_URL, path), params);
}

function buildUrl(path: string, params?: RequestParams) {
  return buildApiUrl(path, params);
}

function getErrorMessage(result: any, fallback: string) {
  return String(
    result?.message ||
      result?.error?.message ||
      result?.error ||
      result?.detail ||
      fallback,
  );
}

async function parseResponse(response: Response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  return text || null;
}

async function handleResponse<T>(response: Response, options?: RequestOptions): Promise<T> {
  const result = await parseResponse(response);

  if (!response.ok) {
    if (!options?.skipSessionExpired && (response.status === 401 || result?.code === "UNAUTHORIZED")) {
      emitSessionExpired();
    }

    throw new ApiError(
      getErrorMessage(result, `API request failed: ${response.status}`),
      response.status,
      result,
    );
  }

  if (result && typeof result === "object") {
    if ("ok" in result && !result.ok) {
      if (!options?.skipSessionExpired && (response.status === 401 || result.code === "UNAUTHORIZED")) {
        emitSessionExpired();
      }

      throw new ApiError(getErrorMessage(result, "API request failed"), response.status, result);
    }

    if ("success" in result && !result.success) {
      if (!options?.skipSessionExpired && (response.status === 401 || result.code === "UNAUTHORIZED")) {
        emitSessionExpired();
      }

      throw new ApiError(getErrorMessage(result, "API request failed"), response.status, result);
    }

    if (("ok" in result || "success" in result) && "data" in result) {
      return result.data as T;
    }
  }

  return result as T;
}

function buildHeaders(options?: RequestOptions, hasBody = false) {
  const token = getRuntimeAuthToken();

  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };
}

export async function getRequest<T>(
  path: string,
  params?: RequestParams,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    method: "GET",
    headers: buildHeaders(options),
    cache: "no-store",
    credentials: options?.credentials || "include",
  });

  return handleResponse<T>(response, options);
}

export async function postRequest<T>(
  path: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: buildHeaders(options, true),
    body: JSON.stringify(data || {}),
    credentials: options?.credentials || "include",
  });

  return handleResponse<T>(response, options);
}

export async function patchRequest<T>(
  path: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: buildHeaders(options, true),
    body: JSON.stringify(data || {}),
    credentials: options?.credentials || "include",
  });

  return handleResponse<T>(response, options);
}

export async function deleteRequest<T>(
  path: string,
  params?: RequestParams,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    method: "DELETE",
    headers: buildHeaders(options),
    credentials: options?.credentials || "include",
  });

  return handleResponse<T>(response, options);
}
