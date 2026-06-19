import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ─── In-memory access token ────────────────────────────────────────────────────
// httpOnly cookie không đọc được từ JS.
// Access token được lưu trong memory sau login/register/refresh.
// Refresh token nằm hoàn toàn trong httpOnly cookie — backend tự đọc.

let memoryToken: string = "";

export function setMemoryToken(token: string) {
  memoryToken = token;
}

export function clearMemoryToken() {
  memoryToken = "";
}

export function getMemoryToken(): string {
  return memoryToken;
}

// getAuthToken kept for any remaining call sites — reads from memory directly
export async function getAuthToken(): Promise<string> {
  return memoryToken;
}

// ─── Session expired event ─────────────────────────────────────────────────────

let hasEmittedSessionExpired = false;

function isBrowser() {
  return typeof window !== "undefined";
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

// ─── Auto-refresh on 401 ───────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function doRefresh(): Promise<string> {
  const response = await axios.post<{ data: { accessToken: string } }>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  const newToken = response.data?.data?.accessToken ?? "";
  setMemoryToken(newToken);
  return newToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    const status = error.response?.status;
    const skipRefresh = originalRequest?.skipRefresh as boolean | undefined;

    if (status === 401 && !originalRequest._retry && !skipRefresh) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
          // Also add a reject path after timeout (safety)
          setTimeout(() => reject(error), 10_000);
        });
      }

      isRefreshing = true;
      try {
        const newToken = await doRefresh();
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        refreshQueue = [];
        clearMemoryToken();
        emitSessionExpired();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Request helpers ───────────────────────────────────────────────────────────

export type RequestParams = Record<string, string | number | boolean | null | undefined>;

export type RequestOptions = {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  skipSessionExpired?: boolean;
  skipRefresh?: boolean;
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

function getErrorMessage(result: any, fallback: string) {
  return String(
    result?.message ||
      result?.error?.message ||
      result?.error ||
      result?.detail ||
      fallback,
  );
}

function cleanParams(params?: RequestParams) {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function maybeEmitSessionExpired(status: number, data: any, skip?: boolean) {
  if (!skip && (status === 401 || data?.code === "UNAUTHORIZED")) {
    emitSessionExpired();
  }
}

function unwrapEnvelope<T>(data: any, status: number, skip?: boolean): T {
  if (data && typeof data === "object") {
    if ("ok" in data && !data.ok) {
      maybeEmitSessionExpired(status, data, skip);
      throw new ApiError(getErrorMessage(data, "API request failed"), status, data);
    }

    if ("success" in data && !data.success) {
      maybeEmitSessionExpired(status, data, skip);
      throw new ApiError(getErrorMessage(data, "API request failed"), status, data);
    }

    if (("ok" in data || "success" in data) && "data" in data) {
      return data.data as T;
    }
  }

  return data as T;
}

function toApiError(error: unknown, skip?: boolean): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;

    maybeEmitSessionExpired(status, data, skip);

    return new ApiError(
      getErrorMessage(data, error.message || "API request failed"),
      status,
      data,
    );
  }

  return new ApiError(error instanceof Error ? error.message : "API request failed", 0);
}

async function buildHeaders(options?: RequestOptions, hasBody = false) {
  const token = memoryToken;

  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };
}

function resolveWithCredentials(options?: RequestOptions) {
  return options?.credentials === "omit" ? false : true;
}

export async function getRequest<T>(
  path: string,
  params?: RequestParams,
  options?: RequestOptions,
): Promise<T> {
  try {
    const response = await apiClient.get<T>(path, {
      params: cleanParams(params),
      withCredentials: resolveWithCredentials(options),
      headers: await buildHeaders(options),
    });

    if (response.status === 204) return null as T;
    return unwrapEnvelope<T>(response.data, response.status, options?.skipSessionExpired);
  } catch (error) {
    throw toApiError(error, options?.skipSessionExpired);
  }
}

export async function postRequest<T>(
  path: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  try {
    const response = await apiClient.post<T>(path, data ?? {}, {
      withCredentials: resolveWithCredentials(options),
      headers: await buildHeaders(options, true),
      skipRefresh: options?.skipRefresh,
    });

    if (response.status === 204) return null as T;
    return unwrapEnvelope<T>(response.data, response.status, options?.skipSessionExpired);
  } catch (error) {
    throw toApiError(error, options?.skipSessionExpired);
  }
}

export async function patchRequest<T>(
  path: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  try {
    const response = await apiClient.patch<T>(path, data ?? {}, {
      withCredentials: resolveWithCredentials(options),
      headers: await buildHeaders(options, true),
    });

    if (response.status === 204) return null as T;
    return unwrapEnvelope<T>(response.data, response.status, options?.skipSessionExpired);
  } catch (error) {
    throw toApiError(error, options?.skipSessionExpired);
  }
}

export async function deleteRequest<T>(
  path: string,
  params?: RequestParams,
  options?: RequestOptions,
): Promise<T> {
  try {
    const response = await apiClient.delete<T>(path, {
      params: cleanParams(params),
      withCredentials: resolveWithCredentials(options),
      headers: await buildHeaders(options),
    });

    if (response.status === 204) return null as T;
    return unwrapEnvelope<T>(response.data, response.status, options?.skipSessionExpired);
  } catch (error) {
    throw toApiError(error, options?.skipSessionExpired);
  }
}
