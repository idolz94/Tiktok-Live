const VN_API = "https://provinces.open-api.vn/api/v1";

export type VnProvince = { code: number; name: string };
export type VnDistrict = { code: number; name: string };
export type VnWard = { code: number; name: string };

export async function fetchVnProvinces(): Promise<VnProvince[]> {
  const res = await fetch(`${VN_API}/p/`);
  return res.json();
}

export async function fetchVnDistricts(provinceCode: number): Promise<VnDistrict[]> {
  const res = await fetch(`${VN_API}/p/${provinceCode}?depth=2`);
  const data = await res.json();
  return data.districts ?? [];
}

export async function fetchVnWards(districtCode: number): Promise<VnWard[]> {
  const res = await fetch(`${VN_API}/d/${districtCode}?depth=2`);
  const data = await res.json();
  return data.wards ?? [];
}

export function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}
