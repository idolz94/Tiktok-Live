import type { Order } from "@/types";

export function formatOrderDate(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function statusLabel(status: Order["status"]) {
  const map: Record<string, string> = {
    confirmed: "Đã chốt",
    shipping: "Đang giao hàng",
    completed: "Hoàn thành",
    canceled: "Đã huỷ",
  };

  return map[status] ?? "Đơn nháp";
}
