"use client";

import { getRequest, patchRequest } from "@/lib/request";
import { getOrdersApi } from "@/api/ordersApi";
import type { OrderWithTikTok } from "@/types";

export type CustomerProfile = {
  id: string;
  customerId?: string;
  phone?: string | null;
  customerType?: string | null;
  referenceInfo?: string | null;
  displayName?: string | null;
  tiktokUsername?: string | null;
  avatarUrl?: string | null;
};

export type UpdateCustomerPayload = {
  customerType?: string;
  phone?: string;
  referenceInfo?: string;
  shippingAddress?: string;
};

export async function getCustomerByIdApi(customerId: string): Promise<CustomerProfile> {
  const data = await getRequest<{ customer: CustomerProfile }>(`/customers/${customerId}`);
  return data.customer;
}

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
