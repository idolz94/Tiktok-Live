import { DEFAULT_WS_URL } from "@/constants/config";
import { buildApiUrl, getAuthToken, postRequest } from "@/lib/request";

function appendParams(url: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  const query = searchParams.toString();
  if (!query) return url;

  return `${url}${url.includes("?") ? "&" : "?"}${query}`;
}

export function getSseBaseUrl() {
  return DEFAULT_WS_URL.trim().replace(/\/+$/, "");
}

export function buildLiveStreamEventsUrl(clientId: string) {
  const accessToken = getAuthToken();
  const url = buildApiUrl("/live-stream/events");

  return appendParams(url, {
    clientId,
    // EventSource không gửi được Authorization header nên truyền token qua query.
    accessToken: accessToken || undefined,
  });
}

export type SubscribeTikTokLiveResult = {
  success: boolean;
  message: string;
  status: string;
  username: string;
};

export async function subscribeTikTokLiveApi({
  clientId,
  username,
}: {
  clientId?: string;
  username: string;
}): Promise<SubscribeTikTokLiveResult> {
  const data = await postRequest<any>("/live-stream/start", {
    username,
    ...(clientId ? { clientId } : {}),
  });

  const result = data?.data ?? data;

  return {
    success: Boolean(result?.success ?? data?.ok ?? true),
    message: String(result?.message ?? ""),
    status: String(result?.status ?? ""),
    username: String(result?.username ?? username),
  };
}

export async function stopTikTokLiveApi(input: string | { clientId?: string; username?: string }) {
  const clientId = typeof input === "string" ? undefined : input.clientId;
  const username = typeof input === "string" ? "" : String(input.username || "").trim();

  if (!username) {
    return {
      ok: false,
      skipped: true,
      message: "Thiếu username để dừng collector.",
    };
  }

  return postRequest<any>("/live-stream/stop", {
    username,
    ...(clientId ? { clientId } : {}),
  });
}

export function sendStopBeacon({
  clientId,
  username,
}: {
  clientId?: string;
  username?: string;
}) {
  if (typeof navigator === "undefined") return;

  const accessToken = getAuthToken();
  const url = appendParams(buildApiUrl("/live-stream/stop"), {
    // sendBeacon không gửi được Authorization header nên truyền token qua query.
    accessToken: accessToken || undefined,
  });

  const data = JSON.stringify({ username, ...(clientId ? { clientId } : {}) });

  navigator.sendBeacon(
    url,
    new Blob([data], {
      type: "application/json",
    }),
  );
}
