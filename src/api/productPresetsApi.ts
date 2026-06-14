"use client";

import { deleteRequest, getRequest, patchRequest, postRequest } from "@/lib/request";

export type ProductPreset = {
  id: string;
  shopId: string;
  code: string;
  name: string | null;
  color: string | null;
  price: number;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export async function listProductPresetsApi(): Promise<ProductPreset[]> {
  const res = await getRequest<{ presets: ProductPreset[] }>("/me/product-presets");
  return res.presets;
}

export async function createProductPresetApi(
  data: { code: string; name?: string | null; color?: string | null; price: number },
): Promise<ProductPreset> {
  const res = await postRequest<{ preset: ProductPreset }>("/me/product-presets", data);
  return res.preset;
}

export async function updateProductPresetApi(
  presetId: string,
  data: { code?: string; name?: string | null; color?: string | null; price?: number },
): Promise<ProductPreset> {
  const res = await patchRequest<{ preset: ProductPreset }>(`/me/product-presets/${presetId}`, data);
  return res.preset;
}

export async function deleteProductPresetApi(presetId: string): Promise<void> {
  await deleteRequest(`/me/product-presets/${presetId}`);
}
