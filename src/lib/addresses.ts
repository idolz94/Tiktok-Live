import { deleteRequest, getRequest, patchRequest, postRequest } from "@/lib/request";

const SPECIAL_CHARS_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;
export function validateAddressForm(
  name: string,
  phone: string,
  province: string,
  district: string,
  ward: string,
): string | null {
  if (!name.trim()) return "Tên không được bỏ trống";
  if (SPECIAL_CHARS_RE.test(name)) return "Tên không được chứa ký tự đặc biệt";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "Số điện thoại không được bỏ trống";
  if (digits.length < 10 || digits.length > 12) return "Số điện thoại phải từ 10 đến 12 chữ số";
  if (!province) return "Vui lòng chọn Tỉnh/Thành phố";
  if (!district) return "Vui lòng chọn Huyện/Quận";
  if (!ward) return "Vui lòng chọn Phường/Xã";
  return null;
}

export type ShopAddress = {
  id: string;
  shopId: string;
  label: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomerAddress = {
  id: string;
  customerId: string;
  shopId: string;
  label: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type AddressBody = {
  label?: string | null;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  isDefault?: boolean;
};

// ─── Shop addresses (sender) ──────────────────────────────────────────────────

export async function listShopAddressesApi(): Promise<ShopAddress[]> {
  const data = await getRequest<{ addresses: ShopAddress[] }>("/me/shop-addresses");
  return data.addresses ?? [];
}

export async function createShopAddressApi(body: AddressBody): Promise<ShopAddress> {
  const data = await postRequest<{ address: ShopAddress }>("/me/shop-addresses", body);
  return data.address;
}

export async function updateShopAddressApi(addressId: string, body: AddressBody): Promise<ShopAddress> {
  const data = await patchRequest<{ address: ShopAddress }>(`/me/shop-addresses/${addressId}`, body);
  return data.address;
}

export async function deleteShopAddressApi(addressId: string): Promise<void> {
  await deleteRequest(`/me/shop-addresses/${addressId}`);
}

// ─── Customer addresses (recipient) ──────────────────────────────────────────

export async function listCustomerAddressesApi(customerId: string): Promise<CustomerAddress[]> {
  const data = await getRequest<{ addresses: CustomerAddress[] }>(`/customers/${customerId}/addresses`);
  return data.addresses ?? [];
}

export async function createCustomerAddressApi(customerId: string, body: AddressBody): Promise<CustomerAddress> {
  const data = await postRequest<{ address: CustomerAddress }>(`/customers/${customerId}/addresses`, body);
  return data.address;
}

export async function updateCustomerAddressApi(
  customerId: string,
  addressId: string,
  body: AddressBody,
): Promise<CustomerAddress> {
  const data = await patchRequest<{ address: CustomerAddress }>(
    `/customers/${customerId}/addresses/${addressId}`,
    body,
  );
  return data.address;
}

export async function deleteCustomerAddressApi(customerId: string, addressId: string): Promise<void> {
  await deleteRequest(`/customers/${customerId}/addresses/${addressId}`);
}
