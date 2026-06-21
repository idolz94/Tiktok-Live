"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DrawlerBase } from "@/components/ui/Drawler";
import { GeoPickerDrawer } from "@/components/ui/GeoPickerDrawer";
import {
  listShopAddressesApi,
  createShopAddressApi,
  updateShopAddressApi,
  deleteShopAddressApi,
  validateAddressForm,
  type ShopAddress,
} from "@/lib/addresses";
import {
  type VnProvince,
  type VnDistrict,
  type VnWard,
  fetchVnProvinces,
  fetchVnDistricts,
  fetchVnWards,
} from "@/lib/vn-geo";
import {
  ChevronLeftSmIcon,
  ChevronRightIcon,
  PencilIcon,
  PhoneSmIcon,
  MapPinSmIcon,
  UserCircleIcon,
} from "./SettingsIcons";

type ShippingAddressDrawerMode = "add" | "edit" | null;

export function ShippingConfigView({ onBack }: { onBack: () => void }) {
  const [addresses, setAddresses] = useState<ShopAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerMode, setDrawerMode] = useState<ShippingAddressDrawerMode>(null);
  const [selectedAddress, setSelectedAddress] = useState<ShopAddress | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ShopAddress | null>(null);

  const [draftName, setDraftName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [draftAddress, setDraftAddress] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftIsDefault, setDraftIsDefault] = useState(false);
  const [draftProvince, setDraftProvince] = useState("");
  const [draftDistrict, setDraftDistrict] = useState("");
  const [draftWard, setDraftWard] = useState("");
  const [draftUseOldFormat, setDraftUseOldFormat] = useState(false);

  const [provinces, setProvinces] = useState<VnProvince[]>([]);
  const [districts, setDistricts] = useState<VnDistrict[]>([]);
  const [wards, setWards] = useState<VnWard[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<VnProvince | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<VnDistrict | null>(null);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = async () => {
    const data = await listShopAddressesApi();
    setAddresses(data);
  };

  useEffect(() => {
    reload()
      .catch(() => toast.error("Không thể tải địa chỉ kho hàng"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (drawerMode !== null && provinces.length === 0) {
      fetchVnProvinces().then(setProvinces).catch(() => {});
    }
  }, [drawerMode, provinces.length]);

  const openAdd = () => {
    setSelectedAddress(null);
    setDraftName("");
    setDraftPhone("");
    setDraftAddress("");
    setDraftLabel("");
    setDraftIsDefault(addresses.length === 0);
    setDraftUseOldFormat(false);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDraftProvince("");
    setDraftDistrict("");
    setDraftWard("");
    setDistricts([]);
    setWards([]);
    setProvinceOpen(false);
    setDistrictOpen(false);
    setWardOpen(false);
    setFormError(null);
    setDrawerMode("add");
  };

  const openEdit = (addr: ShopAddress) => {
    setSelectedAddress(addr);
    setDraftName(addr.name ?? "");
    setDraftPhone(addr.phone ?? "");
    setDraftAddress(addr.address ?? "");
    setDraftLabel(addr.label ?? "");
    setDraftIsDefault(addr.isDefault);
    setDraftUseOldFormat(false);
    setSelectedProvince(addr.province ? { code: -1, name: addr.province } : null);
    setSelectedDistrict(addr.district ? { code: -1, name: addr.district } : null);
    setDraftProvince(addr.province ?? "");
    setDraftDistrict(addr.district ?? "");
    setDraftWard(addr.ward ?? "");
    setDistricts([]);
    setWards([]);
    setProvinceOpen(false);
    setDistrictOpen(false);
    setWardOpen(false);
    setFormError(null);
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setSelectedAddress(null);
  };

  const submitForm = async () => {
    const error = validateAddressForm(draftName, draftPhone, draftProvince, draftDistrict, draftWard);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      const body = {
        name: draftName.trim(),
        phone: draftPhone.replace(/\D/g, ""),
        address: draftAddress.trim() || null,
        label: draftLabel.trim() || null,
        province: draftProvince || null,
        district: draftDistrict || null,
        ward: draftWard || null,
        isDefault: draftIsDefault,
      };
      if (drawerMode === "add") {
        await createShopAddressApi(body);
        toast.success("Đã thêm địa chỉ kho hàng");
      } else if (drawerMode === "edit" && selectedAddress) {
        await updateShopAddressApi(selectedAddress.id, body);
        toast.success("Đã cập nhật địa chỉ kho hàng");
      }
      closeDrawer();
      await reload();
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await deleteShopAddressApi(confirmDelete.id);
      toast.success("Đã xoá địa chỉ");
      setConfirmDelete(null);
      await reload();
    } catch {
      toast.error("Không thể xoá địa chỉ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col bg-white">
        <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex size-11 items-center justify-center rounded-full bg-[#f2f2f2]"
            aria-label="Quay lại"
          >
            <ChevronLeftSmIcon />
          </button>
          <p className="text-[18px] leading-6 font-medium text-black">Cấu hình vận chuyển</p>
          <div className="size-11" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
          <div className="flex flex-col gap-4 px-4 pt-2 pb-5">
            <p className="text-[16px] leading-6 font-medium text-black">Địa chỉ kho hàng</p>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-[104px] w-full animate-pulse rounded-2xl bg-[#e4e4e4]" />
                ))}
              </div>
            ) : (
              <>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex flex-col gap-4 rounded-[16px] border border-black/10 bg-[#f2f2f2] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-black">
                        <UserCircleIcon />
                      </div>
                      <p className="flex-1 text-[16px] leading-6 font-medium text-black">
                        {addr.name ?? "—"}
                        {addr.label ? (
                          <span className="ml-2 text-[12px] font-normal text-[#787878]">({addr.label})</span>
                        ) : null}
                        {addr.isDefault ? (
                          <span className="ml-2 inline-block rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#2b2b2b]">
                            Mặc định
                          </span>
                        ) : null}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(addr)}
                          className="flex items-center gap-1.5 text-black"
                          aria-label="Sửa địa chỉ"
                        >
                          <PencilIcon />
                          <span className="text-[14px] leading-[22px] font-medium">Sửa</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {addr.phone ? (
                        <div className="flex items-center gap-2">
                          <PhoneSmIcon />
                          <p className="text-[12px] leading-[18px] text-[#484848]">{addr.phone}</p>
                        </div>
                      ) : null}
                      {addr.address ? (
                        <div className="flex items-center gap-2">
                          <MapPinSmIcon />
                          <p className="text-[12px] leading-[18px] text-[#484848]">{addr.address}</p>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => setConfirmDelete(addr)}
                      className="self-start text-[12px] leading-[18px] text-[#ef4444]"
                    >
                      Xoá
                    </button>
                  </div>
                ))}
              </>
            )}

            <button
              type="button"
              onClick={openAdd}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-black/20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#484848" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[14px] leading-[22px] text-[#484848]">Thêm mới</span>
            </button>
          </div>

          <div className="h-2 bg-[#f2f2f2]" />

          <div className="flex flex-col gap-5 px-4 py-5">
            <p className="text-[16px] leading-6 font-medium text-black">Đối tác vận chuyển</p>

            <div className="flex flex-col gap-4">
              <p className="text-[14px] leading-[22px] text-[#2b2b2b]">Đã kết nối</p>
              <div className="flex flex-col gap-3">
                {[
                  { name: "Viettel Post", desc: "Dịch vụ bưu chính của Viettel với mạng lưới rộng khắp.", isDefault: true, bg: "#EE0033", letter: "V" },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-4 rounded-[16px] bg-[#f2f2f2] py-4 pr-3 pl-4"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] text-[16px] font-bold text-white" style={{ background: p.bg }}>
                      {p.letter}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] leading-[22px] font-medium text-black">{p.name}</p>
                        {p.isDefault && (
                          <div className="flex h-6 items-center rounded-[16px] bg-white px-2">
                            <span className="text-[12px] leading-[18px] font-medium text-[#2b2b2b]">Mặc định</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[12px] leading-[18px] text-[#484848]">{p.desc}</p>
                    </div>
                    <ChevronRightIcon />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-[14px] leading-[22px] text-[#2b2b2b]">Chưa kết nối</p>
              <div className="flex flex-col gap-3">
                {[
                  { name: "SPX - SPX EXPRESS", desc: "Dịch vụ giao hàng toàn quốc, nhanh, rẻ và an toàn.", bg: "#FF3911", letter: "S" },
                  { name: "JT - J&T Express", desc: "Dịch vụ chuyển phát nhanh J&T Express với mạng lưới toàn quốc.", bg: "#E3000F", letter: "J" },
                  { name: "GHN - Giao Hàng Nhanh", desc: "Dịch vụ giao hàng nhanh với mạng lưới rộng khắp cả nước.", bg: "#FF7200", letter: "G" },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-4 rounded-[16px] bg-[#f2f2f2] py-4 pr-3 pl-4"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] text-[16px] font-bold text-white" style={{ background: p.bg }}>
                      {p.letter}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="text-[14px] leading-[22px] font-medium text-black">{p.name}</p>
                      <p className="text-[12px] leading-[18px] text-[#484848]">{p.desc}</p>
                    </div>
                    <ChevronRightIcon />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pb-8" />
        </div>
      </div>

      <DrawlerBase
        open={drawerMode !== null}
        onOpenChange={(open) => { if (!open) closeDrawer(); }}
        height="auto"
        showHandle
        showCloseButton={false}
        title={drawerMode === "add" ? "Thêm địa chỉ kho hàng" : "Sửa địa chỉ kho hàng"}
        footer={
          <button
            type="button"
            onClick={submitForm}
            disabled={saving}
            className="flex w-full items-center justify-center rounded-[8px] bg-[#ebb140] py-[14px] text-[14px] font-bold tracking-[0.7px] text-white uppercase disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : drawerMode === "add" ? "+ THÊM ĐỊA CHỈ" : "CẬP NHẬT ĐỊA CHỈ"}
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-[#111827]">Tên <span className="text-[#ef4444]">*</span></span>
              <div className="flex h-11 items-center rounded-[8px] border border-[#d1d5db] bg-white px-3">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Tên người gửi"
                  className="flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#d1d5db]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-[#111827]">Điện thoại</span>
              <div className="flex h-11 items-center rounded-[8px] border border-[#d1d5db] bg-white px-3">
                <input
                  type="tel"
                  inputMode="tel"
                  value={draftPhone}
                  onChange={(e) => setDraftPhone(e.target.value)}
                  placeholder="0356 324 488"
                  className="flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#d1d5db]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] leading-[22px] font-semibold text-[#111827]">Dùng định dạng địa chỉ cũ</span>
              <span className="text-[12px] leading-[18px] text-[#9ca3af]">Tỉnh - Phường/Xã (rút gọn)</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draftUseOldFormat}
              onClick={() => setDraftUseOldFormat((v) => !v)}
              className={`relative flex h-6 w-11 shrink-0 items-center rounded-[24px] transition-colors ${
                draftUseOldFormat ? "bg-[#ebb140]" : "bg-[#e5e7eb]"
              }`}
            >
              <span className={`absolute top-[2px] block size-[19px] rounded-full bg-white shadow-sm transition-all ${draftUseOldFormat ? "left-[22px]" : "left-[2px]"}`} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#111827]">Địa chỉ chi tiết</span>
              <span className="rounded-[4px] bg-[#dbeafe] px-2 py-0.5 text-[10px] font-medium text-[#3b82f6]">Địa chỉ mới</span>
            </div>
            <div className="rounded-[8px] border border-[#d1d5db] bg-white px-3 py-2.5">
              <textarea
                value={draftAddress}
                onChange={(e) => setDraftAddress(e.target.value)}
                rows={3}
                placeholder={"Số nhà, tên đường\nPhường/Xã, Quận/Huyện\nTỉnh/Thành phố"}
                className="w-full resize-none bg-transparent text-[14px] text-black outline-none placeholder:text-[#d1d5db]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#111827]">
              Tỉnh/Thành phố <span className="text-[#ef4444]">*</span>
            </span>
            <button
              type="button"
              onClick={() => setProvinceOpen(true)}
              className="flex h-11 w-full items-center justify-between rounded-[8px] border border-[#d1d5db] bg-white px-3 text-left"
            >
              <span className={`text-[14px] ${draftProvince ? "text-black" : "text-[#d1d5db]"}`}>
                {draftProvince || "Chọn tỉnh/thành phố"}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#111827]">
              Huyện/Quận <span className="text-[#ef4444]">*</span>
            </span>
            <button
              type="button"
              disabled={!selectedProvince}
              onClick={() => setDistrictOpen(true)}
              className="flex h-11 w-full items-center justify-between rounded-[8px] border border-[#d1d5db] bg-white px-3 text-left disabled:opacity-50"
            >
              <span className={`text-[14px] ${draftDistrict ? "text-black" : "text-[#d1d5db]"}`}>
                {draftDistrict || "Chọn huyện/quận"}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#111827]">
              Phường/Xã <span className="text-[#ef4444]">*</span>
            </span>
            <button
              type="button"
              disabled={!selectedDistrict}
              onClick={() => setWardOpen(true)}
              className="flex h-11 w-full items-center justify-between rounded-[8px] border border-[#d1d5db] bg-white px-3 text-left disabled:opacity-50"
            >
              <span className={`text-[14px] ${draftWard ? "text-black" : "text-[#d1d5db]"}`}>
                {draftWard || "Chọn phường/xã"}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[14px] leading-[22px] text-[#111827]">Đặt làm địa chỉ mặc định</span>
            <button
              type="button"
              role="switch"
              aria-checked={draftIsDefault}
              onClick={() => setDraftIsDefault((v) => !v)}
              className={`relative flex h-6 w-11 shrink-0 items-center rounded-[24px] transition-colors ${
                draftIsDefault ? "bg-[#ebb140]" : "bg-[#e5e7eb]"
              }`}
            >
              <span className={`absolute top-[2px] block size-[19px] rounded-full bg-white shadow-sm transition-all ${draftIsDefault ? "left-[22px]" : "left-[2px]"}`} />
            </button>
          </div>

          {formError && (
            <p className="rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[13px] text-[#ef4444]">{formError}</p>
          )}
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
        }}
      />

      <DrawlerBase
        open={confirmDelete !== null}
        onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
        height="auto"
        showHandle
        showCloseButton={false}
        title="Xoá địa chỉ?"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="h-12 rounded-full bg-[#f2f2f2] text-[15px] font-medium text-[#111827]"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={doDelete}
              disabled={saving}
              className="h-12 rounded-full bg-[#ff6b8a] text-[15px] font-medium text-white disabled:opacity-60"
            >
              Xoá
            </button>
          </div>
        }
      >
        <p className="text-[14px] leading-5 text-[#484848]">
          Bạn có chắc muốn xoá địa chỉ <span className="font-semibold">{confirmDelete?.name ?? confirmDelete?.label ?? "này"}</span>?
        </p>
      </DrawlerBase>
    </>
  );
}
