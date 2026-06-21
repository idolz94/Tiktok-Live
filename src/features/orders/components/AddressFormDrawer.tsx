"use client";

import { useState, useEffect } from "react";
import { DrawlerBase } from "@/components/ui/Drawler";
import { GeoPickerDrawer } from "@/components/ui/GeoPickerDrawer";
import {
  type VnProvince,
  type VnDistrict,
  type VnWard,
  fetchVnProvinces,
  fetchVnDistricts,
  fetchVnWards,
} from "@/lib/vn-geo";
import { GradientButton } from "./shared";

export type AddressFormState = {
  name: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  label: string;
  isDefault: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  initial?: Partial<AddressFormState> & { id?: string };
  saving: boolean;
  onSave: (data: AddressFormState) => void;
  isFirstAddress?: boolean;
};

export function AddressFormDrawer({ open, onOpenChange, title, initial, saving, onSave, isFirstAddress }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? isFirstAddress ?? false);

  const [draftProvince, setDraftProvince] = useState(initial?.province ?? "");
  const [draftDistrict, setDraftDistrict] = useState(initial?.district ?? "");
  const [draftWard, setDraftWard] = useState(initial?.ward ?? "");
  const [selectedProvince, setSelectedProvince] = useState<VnProvince | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<VnDistrict | null>(null);
  const [provinces, setProvinces] = useState<VnProvince[]>([]);
  const [districts, setDistricts] = useState<VnDistrict[]>([]);
  const [wards, setWards] = useState<VnWard[]>([]);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<"name" | "phone", boolean>>>({});

  // Đầu số VN theo VNPT/Bộ TT&TT (tính đến 2024):
  // Viettel:      032-039, 086, 096, 097, 098
  // Mobifone:     070, 076, 077, 078, 079, 089, 090, 093
  // Vinaphone:    081, 082, 083, 084, 085, 088, 091, 094
  // Vietnamobile: 052, 056, 058, 092
  // Gmobile:      059
  // Reddi:        055
  const VN_PHONE_RE = /^(\+84|0)(3[2-9]|5[25689]|7[06-9]|8[1-689]|9[0-46-8])\d{7}$/;

  function validateName(v: string): string | undefined {
    const t = v.trim();
    if (!t) return "Họ và tên không được để trống";
    if (t.length < 4) return "Họ và tên phải có ít nhất 4 ký tự";
    if (t.length > 64) return "Họ và tên không được vượt quá 64 ký tự";
    return undefined;
  }

  function validatePhone(v: string): string | undefined {
    const t = v.trim();
    if (!t) return "Số điện thoại không được để trống";
    const digits = t.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 12) return "Số điện thoại phải từ 10 đến 12 chữ số";
    if (!VN_PHONE_RE.test(t)) return "Số điện thoại không đúng nhà mạng Việt Nam";
    return undefined;
  }

  const nameError = touched.name ? validateName(name) : undefined;
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneError = (touched.phone || phoneDigits.length >= 10) ? validatePhone(phone) : undefined;

  useEffect(() => {
    if (!open) return;

    setName(initial?.name ?? "");
    setPhone(initial?.phone ?? "");
    setAddress(initial?.address ?? "");
    setLabel(initial?.label ?? "");
    setIsDefault(initial?.isDefault ?? isFirstAddress ?? false);
    setErrors({});
    setTouched({});

    const p = initial?.province ?? "";
    const d = initial?.district ?? "";
    const w = initial?.ward ?? "";
    setDraftProvince(p);
    setDraftDistrict(d);
    setDraftWard(w);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);

    const initGeo = async () => {
      let provList = provinces;
      if (provList.length === 0) {
        provList = await fetchVnProvinces();
        setProvinces(provList);
      }
      if (!p) return;
      const matchedProvince = provList.find((pv) => pv.name === p);
      if (!matchedProvince) {
        setSelectedProvince({ code: -1, name: p });
        return;
      }
      setSelectedProvince(matchedProvince);
      const distList = await fetchVnDistricts(matchedProvince.code);
      setDistricts(distList);
      if (!d) return;
      const matchedDistrict = distList.find((dv) => dv.name === d);
      if (!matchedDistrict) {
        setSelectedDistrict({ code: -1, name: d });
        return;
      }
      setSelectedDistrict(matchedDistrict);
      const wardList = await fetchVnWards(matchedDistrict.code);
      setWards(wardList);
    };

    initGeo().catch(() => {});
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (): boolean => {
    const next: Partial<Record<keyof AddressFormState, string>> = {};
    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);
    if (nameErr) next.name = nameErr;
    if (phoneErr) next.phone = phoneErr;
    if (!draftProvince) next.province = "Vui lòng chọn tỉnh/thành phố";
    if (!draftDistrict) next.district = "Vui lòng chọn huyện/quận";
    if (!draftWard) next.ward = "Vui lòng chọn phường/xã";
    setErrors(next);
    setTouched({ name: true, phone: true });
    return Object.keys(next).length === 0;
  };

  const canSave = !saving && !validateName(name) && !validatePhone(phone) && !!draftProvince && !!draftDistrict && !!draftWard;

  return (
    <>
      <DrawlerBase
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        height="lg"
        footer={
          <div className="px-4 pt-1 pb-2">
            <GradientButton
              label={saving ? "Đang lưu..." : "Lưu lại"}
              disabled={!canSave}
              onClick={() => {
                if (!validate()) return;
                onSave({ name: name.trim(), phone: phone.trim(), address: address.trim(), province: draftProvince, district: draftDistrict, ward: draftWard, label: label.trim(), isDefault });
              }}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-5 px-4 pb-4">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Họ và tên</label>
            <div className={`flex h-12 items-center rounded-xl border px-4 ${nameError ? "border-red-400" : "border-black/10"}`}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" })}
                placeholder="Nhập họ và tên"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
              />
            </div>
            {nameError && <p className="text-[12px] text-red-500">{nameError}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Số điện thoại</label>
            <div className={`flex h-12 items-center rounded-xl border px-4 ${phoneError ? "border-red-400" : "border-black/10"}`}>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" })}
                placeholder="Nhập số điện thoại"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
              />
            </div>
            {phoneError && <p className="text-[12px] text-red-500">{phoneError}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Tỉnh/Thành phố</label>
            <button
              type="button"
              onClick={(e) => { e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" }); setProvinceOpen(true); }}
              className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left ${errors.province ? "border-red-400" : "border-black/10"}`}
            >
              <span className={`text-[14px] ${draftProvince ? "text-black" : "text-[#787878]"}`}>{draftProvince || "Chọn tỉnh/thành phố"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {errors.province && <p className="text-[12px] text-red-500">{errors.province}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className={`text-[14px] ${selectedProvince ? "text-[#484848]" : "text-[#9ca3af]"}`}>Huyện/Quận</label>
            <button
              type="button"
              disabled={!selectedProvince}
              onClick={(e) => { e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" }); setDistrictOpen(true); }}
              className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left disabled:opacity-50 ${errors.district ? "border-red-400" : "border-black/10"}`}
            >
              <span className={`text-[14px] ${draftDistrict ? "text-black" : "text-[#787878]"}`}>{draftDistrict || "Chọn huyện/quận"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {errors.district && <p className="text-[12px] text-red-500">{errors.district}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className={`text-[14px] ${selectedDistrict ? "text-[#484848]" : "text-[#9ca3af]"}`}>Phường/Xã</label>
            <button
              type="button"
              disabled={!selectedDistrict}
              onClick={(e) => { e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" }); setWardOpen(true); }}
              className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left disabled:opacity-50 ${errors.ward ? "border-red-400" : "border-black/10"}`}
            >
              <span className={`text-[14px] ${draftWard ? "text-black" : "text-[#787878]"}`}>{draftWard || "Chọn phường/xã"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {errors.ward && <p className="text-[12px] text-red-500">{errors.ward}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Địa chỉ chi tiết</label>
            <div className="flex items-start rounded-xl border border-black/10 px-4 py-3">
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" })} placeholder="Nhập địa chỉ chi tiết (số nhà, đường...)" rows={2} className="min-w-0 flex-1 resize-none bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isFirstAddress && setIsDefault((v) => !v)}
            className="flex items-center gap-3 text-left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={isDefault ? "#ff6b8a" : "#dadada"} strokeWidth="2" />
              {isDefault && <circle cx="12" cy="12" r="5" fill="#ff6b8a" />}
            </svg>
            <span className="text-[14px] leading-5.5 text-[#0c0c0c]">Đặt làm địa chỉ mặc định</span>
          </button>
        </div>
      </DrawlerBase>

      <GeoPickerDrawer
        open={provinceOpen}
        onOpenChange={(o) => { if (!o) setProvinceOpen(false); }}
        title="Chọn Tỉnh/Thành phố"
        placeholder="Tìm tỉnh/thành phố..."
        items={provinces}
        selectedName={draftProvince}
        onSelect={(p) => {
          setDraftProvince(p.name);
          setSelectedProvince(p);
          setDraftDistrict("");
          setDraftWard("");
          setSelectedDistrict(null);
          setDistricts([]);
          setWards([]);
          setProvinceOpen(false);
          setErrors((prev) => ({ ...prev, province: undefined, district: undefined, ward: undefined }));
          fetchVnDistricts(p.code).then(setDistricts).catch(() => {});
        }}
      />

      <GeoPickerDrawer
        open={districtOpen}
        onOpenChange={(o) => { if (!o) setDistrictOpen(false); }}
        title="Chọn Huyện/Quận"
        placeholder="Tìm huyện/quận..."
        items={districts}
        selectedName={draftDistrict}
        onSelect={(d) => {
          setDraftDistrict(d.name);
          setSelectedDistrict(d);
          setDraftWard("");
          setWards([]);
          setDistrictOpen(false);
          setErrors((prev) => ({ ...prev, district: undefined, ward: undefined }));
          fetchVnWards(d.code).then(setWards).catch(() => {});
        }}
      />

      <GeoPickerDrawer
        open={wardOpen}
        onOpenChange={(o) => { if (!o) setWardOpen(false); }}
        title="Chọn Phường/Xã"
        placeholder="Tìm phường/xã..."
        items={wards}
        selectedName={draftWard}
        onSelect={(w) => {
          setDraftWard(w.name);
          setWardOpen(false);
          setErrors((prev) => ({ ...prev, ward: undefined }));
        }}
      />
    </>
  );
}
