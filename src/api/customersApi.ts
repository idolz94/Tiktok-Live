"use client";

import { patchRequest } from "@/lib/request";
import { getOrdersApi } from "@/api/ordersApi";
import type { OrderWithTikTok } from "@/types";

export type UpdateCustomerPayload = {
  customerType?: string;
  phone?: string;
  referenceInfo?: string;
  shippingAddress?: string;
};

export async function updateCustomerApi(
  customerId: string,
  payload: UpdateCustomerPayload,
): Promise<void> {
  await patchRequest<unknown>(`/customers/${customerId}`, payload);
}

export async function getCustomerOrdersApi(customerId: string): Promise<OrderWithTikTok[]> {
  const all = await getOrdersApi();
  return all.filter((o) => o.customerId === customerId);
}
