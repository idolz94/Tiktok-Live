import type { Customer, ISODateString, Order } from "@/types/database";

export type CustomerItem = {
  id: string;
  customerId: string | null;
  username: string;
  avatar?: string;
  phone?: string;
  address?: string;
  latestComment: string;
  commentCount: number;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: ISODateString;
};

type OrderWithCustomer = Order & {
  customer?: Customer | null;
  customers?: Customer | null;
};

function getOrderCustomer(order: OrderWithCustomer) {
  return order.customer || order.customers || null;
}

function getCustomerKey(order: OrderWithCustomer) {
  const customer = getOrderCustomer(order);

  return (
    customer?.id ||
    order.customer_id ||
    order.customer_phone ||
    order.customer_name ||
    order.id
  );
}

function getCustomerName(order: OrderWithCustomer) {
  const customer = getOrderCustomer(order);

  return (
    customer?.display_name ||
    customer?.tiktok_username ||
    order.customer_name ||
    order.customer_phone ||
    "Khách live"
  );
}

function getCustomerAvatar(order: OrderWithCustomer) {
  const customer = getOrderCustomer(order);

  return (
    customer?.avatar_url ||
    (order as any).customerAvatarUrl ||
    (order as any).customer_avatar_url ||
    undefined
  );
}

function getCustomerPhone(order: OrderWithCustomer) {
  const customer = getOrderCustomer(order);

  return customer?.phone || order.customer_phone || undefined;
}

function getCustomerAddress(order: OrderWithCustomer) {
  const customer = getOrderCustomer(order);

  return customer?.address || order.customer_address || undefined;
}

function getOrderAmount(order: OrderWithCustomer) {
  return Number(order.total_amount || order.cod_amount || order.subtotal_amount || 0);
}

export function buildCustomersFromOrders(orders: OrderWithCustomer[]): CustomerItem[] {
  const map = new Map<string, CustomerItem>();

  orders.forEach((order) => {
    const key = getCustomerKey(order);
    const old = map.get(key);

    const customer = getOrderCustomer(order);
    const orderAmount = getOrderAmount(order);

    if (!old) {
      map.set(key, {
        id: key,
        customerId: customer?.id || order.customer_id || null,
        username: getCustomerName(order),
        avatar: getCustomerAvatar(order),
        phone: getCustomerPhone(order),
        address: getCustomerAddress(order),
        latestComment: order.comment_text || "",
        commentCount: order.comment_text ? 1 : 0,
        orderCount: 1,
        totalSpent: orderAmount,
        lastOrderAt: order.created_at,
      });

      return;
    }

    map.set(key, {
      ...old,
      avatar: old.avatar || getCustomerAvatar(order),
      phone: old.phone || getCustomerPhone(order),
      address: old.address || getCustomerAddress(order),
      latestComment: order.comment_text || old.latestComment,
      commentCount: old.commentCount + (order.comment_text ? 1 : 0),
      orderCount: old.orderCount + 1,
      totalSpent: old.totalSpent + orderAmount,
      lastOrderAt:
        new Date(order.created_at).getTime() > new Date(old.lastOrderAt).getTime()
          ? order.created_at
          : old.lastOrderAt,
    });
  });

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime(),
  );
}