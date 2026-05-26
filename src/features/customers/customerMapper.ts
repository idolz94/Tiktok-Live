import { LiveComment } from "@/types";

export type OrderItem = {
  id: string;
  commentId: string;
  username: string;
  avatar?: string;
  comment: string;
  createdAt: string;
};

export type CustomerItem = {
  id: string;
  username: string;
  avatar?: string;
  latestComment: string;
  commentCount: number;
  orderCount: number;
  lastOrderAt: string;
};

export function buildCustomersFromOrders(orders: OrderItem[]): CustomerItem[] {
  const map = new Map<string, CustomerItem>();

  console.log("orders : ", orders);

  orders.forEach((order) => {
    const key = order?.username || order?.commentId;
    const old = map.get(key);

    if (!old) {
      map.set(key, {
        id: key,
        username: order?.username,
        avatar: order?.avatar,
        latestComment: order?.comment,
        commentCount: 1,
        orderCount: 1,
        lastOrderAt: order?.createdAt,
      });

      return;
    }

    map.set(key, {
      ...old,
      avatar: old.avatar || order?.avatar,
      latestComment: order?.comment,
      commentCount: old.commentCount + 1,
      orderCount: old.orderCount + 1,
      lastOrderAt: order?.createdAt,
    });
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
  );
}
