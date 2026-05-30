export type BootstrapReason =
  | null
  | "NO_USER"
  | "NO_SHOP"
  | "NO_LICENSE"
  | "TRIAL_EXPIRED"
  | "LICENSE_INACTIVE";

export type BootstrapResponse = {
  user: any | null;
  shop: any | null;
  member: any | null;
  canUseApp: boolean;
  reason: BootstrapReason;
  message?: string;
};

export async function registerApi(payload: {
  email: string;
  password: string;
  shopName?: string;
}) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Đăng ký thất bại.");
  }

  return data;
}

export async function loginApi(payload: {
  email: string;
  password: string;
}) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Đăng nhập thất bại.");
  }

  return data;
}

export async function getMeBootstrapApi(): Promise<BootstrapResponse> {
  const res = await fetch("/api/me/bootstrap", {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Không lấy được thông tin tài khoản.");
  }

  return data;
}