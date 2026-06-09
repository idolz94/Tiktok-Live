"use client";

import { patchRequest } from "@/lib/request";

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
