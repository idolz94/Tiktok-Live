"use client";

import { getRequest, patchRequest } from "@/lib/request";

export type ProductDefaults = {
  code: string;
  color: string;
  size: string;
  price: number;
};

export async function getProductDefaultsApi(): Promise<ProductDefaults> {
  const res = await getRequest<ProductDefaults>("/me/shop-settings/product-defaults");
  return res;
}

export async function patchProductDefaultsApi(payload: Partial<ProductDefaults>): Promise<ProductDefaults> {
  return await patchRequest<ProductDefaults>("/me/shop-settings/product-defaults", payload);
}
