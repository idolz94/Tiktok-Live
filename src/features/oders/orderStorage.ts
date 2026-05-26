import { Order } from "@/types";

const ORDERS_STORAGE_KEY = "ORDERS";

export function readOrders(): Order[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeOrders(orders: Order[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

export function addOrderToStorage(order: Order) {
  const oldOrders = readOrders();

  const existed = oldOrders.some((item) => item.id === order.id);

  if (existed) return oldOrders;

  const nextOrders = [order, ...oldOrders];

  writeOrders(nextOrders);

  return nextOrders;
}

export function clearOrdersStorage() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ORDERS_STORAGE_KEY);
}
