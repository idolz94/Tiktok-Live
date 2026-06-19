"use client";

import { deleteRequest, getRequest, patchRequest, postRequest } from "@/lib/request";
import type { LiveComment, OrderWithTikTok } from "@/types";
import { normalizeApiOrderForUi } from "@/utils/order";

type CreateOrderFromCommentPayload = {
  comment: LiveComment;
  liveSessionId?: string | null;
  price?: number;
  quantity?: number;
  note?: string;
};

const DEFAULT_PRICE = 20000;
const DEFAULT_QUANTITY = 1;

function pickArrayResponse(data: any, keys: string[]) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function pickObjectResponse(data: any, keys: string[]) {
  for (const key of keys) {
    if (data?.[key]) return data[key];
  }

  return data;
}

function normalizeOrderResponse(data: any) {
  const rawOrder = pickObjectResponse(data, ["uiOrder", "order", "item"]);

  if (data?.uiOrder) {
    return normalizeApiOrderForUi(data.uiOrder);
  }

  if (data?.order && data?.orderItem) {
    return normalizeApiOrderForUi({
      ...data.order,
      products: [data.orderItem],
      avatar: data.customer?.avatar_url || data.customer?.avatarUrl || data.order.avatar,
    });
  }

  return normalizeApiOrderForUi(rawOrder);
}

export async function getOrdersApi(shippingStatus?: string): Promise<OrderWithTikTok[]> {
  const path = shippingStatus ? `/orders?shippingStatus=${encodeURIComponent(shippingStatus)}` : "/orders";
  const data = await getRequest<any>(path);
  const rows = pickArrayResponse(data, ["orders", "items", "data"]);

  return rows.map((order: any) => normalizeApiOrderForUi(order));
}

export type CreateOrderFromCommentResult = {
  success: boolean;
  message: string;
  orderId: string;
  orderCode: string;
};

export async function createOrderFromCommentApi({
  comment,
  liveSessionId,
  price = DEFAULT_PRICE,
  quantity = DEFAULT_QUANTITY,
  note = "",
}: CreateOrderFromCommentPayload): Promise<CreateOrderFromCommentResult> {
  const data = await postRequest<any>("/orders/from-comment", {
    comment,
    liveSessionId,
    price,
    quantity,
    note,
  });

  const result = data?.data ?? data;

  return {
    success: Boolean(result?.success ?? true),
    message: String(result?.message ?? ""),
    orderId: String(result?.orderId ?? result?.order_id ?? ""),
    orderCode: String(result?.orderCode ?? result?.order_code ?? ""),
  };
}

export async function updateOrderDepositStatusApi({
  orderId,
  depositStatus,
}: {
  orderId: string;
  depositStatus: "unpaid" | "paid" | "deposited" | "refunded";
}) {
  const data = await patchRequest<any>(`/orders/${orderId}/deposit-status`, {
    depositStatus,
  });

  return normalizeOrderResponse(data);
}

export async function updateOrderStatusApi({
  orderId,
  status,
}: {
  orderId: string;
  status: "draft" | "confirmed" | "packed" | "shipping" | "completed" | "canceled" | "returned";
}) {
  const data = await patchRequest<any>(`/orders/${orderId}/status`, {
    status,
  });

  return normalizeOrderResponse(data);
}

export async function deleteOrderApi(orderId: string) {
  return deleteRequest<{ ok: boolean }>(`/orders/${orderId}`);
}

export async function patchOrderApi(
  orderId: string,
  patch: {
    customerAddressId?: string | null;
    note?: string;
    color?: string | null;
    codAmount?: number;
  },
) {
  const data = await patchRequest<any>(`/orders/${orderId}`, patch);
  return normalizeOrderResponse(data);
}

export type AddOrderItemPayload = {
  productCode: string;
  productName: string;
  price: number;
  quantity: number;
};

export type AddOrderItemResult = {
  id: string;
  productCode?: string;
  productName?: string;
  price: number;
  quantity: number;
  [key: string]: any;
};

export async function addOrderItemApi(
  orderId: string,
  payload: AddOrderItemPayload,
): Promise<AddOrderItemResult> {
  const data = await postRequest<any>(`/orders/${orderId}/items`, payload);
  // mutateCreated returns { status, message, data: { item } } — unwrapped as-is since key is "status" not "ok"/"success"
  const item =
    data?.item ??
    data?.data?.item ??
    data?.orderItem ??
    data?.data?.orderItem ??
    data?.order_item ??
    data?.data?.order_item ??
    data?.data ??
    data;
  return item as AddOrderItemResult;
}

export async function deleteOrderItemApi(orderId: string, itemId: string) {
  return deleteRequest<{ ok: boolean }>(`/orders/${orderId}/items/${itemId}`);
}

export type UpdateOrderItemPayload = {
  productCode?: string;
  productName?: string;
  price?: number;
  quantity?: number;
};

export async function updateOrderItemApi(
  orderId: string,
  itemId: string,
  payload: UpdateOrderItemPayload,
): Promise<AddOrderItemResult> {
  const data = await patchRequest<any>(`/orders/${orderId}/items/${itemId}`, payload);
  const item =
    data?.item ??
    data?.data?.item ??
    data?.orderItem ??
    data?.data?.orderItem ??
    data?.order_item ??
    data?.data?.order_item ??
    data?.data ??
    data;
  return item as AddOrderItemResult;
}

export type SubmitShippingPayload = {
  pickName: string;
  pickAddress: string;
  pickProvince: string;
  pickDistrict: string;
  pickWard?: string;
  pickTel: string;
  receiverName: string;
  receiverAddress: string;
  receiverProvince: string;
  receiverDistrict: string;
  receiverWard: string;
  receiverHamlet?: string;
  receiverTel: string;
  note?: string;
  isFreeShip?: 0 | 1;
  transport?: "road" | "fly";
  pickOption?: "cod" | "post";
};

export type ShippingFeeResult = {
  name: string;
  fee: number;
  insuranceFee: number;
  delivery: boolean;
  extFees: Array<{ title: string; amount: number; type: string }>;
};

export async function getShippingFeeApi(
  orderId: string,
  params: {
    pickProvince: string;
    pickDistrict: string;
    pickWard?: string;
    pickAddress?: string;
    receiverProvince: string;
    receiverDistrict: string;
    receiverWard?: string;
    receiverAddress?: string;
    weight?: number;
    transport?: "road" | "fly";
  },
): Promise<ShippingFeeResult> {
  const data = await postRequest<any>(`/orders/${orderId}/shipping/fee`, params);
  return (data?.fee ?? data) as ShippingFeeResult;
}

export async function submitOrderToGhtkApi(
  orderId: string,
  payload: SubmitShippingPayload,
): Promise<{ orderId: string; label?: string; trackingId?: number; fee?: number }> {
  return postRequest(`/orders/${orderId}/shipping/submit`, payload);
}

export type GhtkTrackingResult = {
  labelId: string;
  partnerId: string;
  status: string;
  statusText: string;
  created: string;
  modified: string;
  message: string;
  pickDate: string;
  deliverDate: string;
  customerFullname: string;
  customerTel: string;
  address: string;
  storageDay: number;
  shipMoney: number;
  insurance: number;
  value: number;
  weight: number;
  pickMoney: number;
  isFreeship: number;
};

export async function getShippingTrackingApi(orderId: string): Promise<GhtkTrackingResult> {
  const data = await getRequest<any>(`/orders/${orderId}/shipping/tracking`);
  return (data?.tracking ?? data) as GhtkTrackingResult;
}

export type ManualShippingPayload = {
  trackingCode: string;
  providerName?: string;
  shippingFee?: number;
  note?: string;
};

export type ManualShippingResult = {
  orderId: string;
  trackingCode: string;
  providerName: string;
  shippingStatus: string;
};

export async function submitManualShippingApi(
  orderId: string,
  payload: ManualShippingPayload,
): Promise<ManualShippingResult> {
  const data = await postRequest<any>(`/orders/${orderId}/shipping/manual`, payload);
  return (data?.shipping ?? data) as ManualShippingResult;
}
