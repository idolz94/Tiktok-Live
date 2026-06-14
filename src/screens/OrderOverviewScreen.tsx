"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DrawlerBase } from "../components/ui/Drawler";
import { Order, OrderProduct } from "../types";
import { formatMoneyFromK, getOrderTotal } from "../utils/order";
import { addOrderItemApi, deleteOrderItemApi } from "@/api/ordersApi";
import { MoneyInput } from "@/components/MoneyInput";
import {
  type ShopAddress,
  type CustomerAddress,
  listShopAddressesApi,
  createShopAddressApi,
  updateShopAddressApi,
  deleteShopAddressApi,
  listCustomerAddressesApi,
  createCustomerAddressApi,
  updateCustomerAddressApi,
  deleteCustomerAddressApi,
} from "@/lib/addresses";
import {
  type VnProvince,
  type VnDistrict,
  type VnWard,
  fetchVnProvinces,
  fetchVnDistricts,
  fetchVnWards,
  removeDiacritics as removeDiacriticsOrder,
} from "@/lib/vn-geo";
import { GeoPickerDrawer } from "@/components/ui/GeoPickerDrawer";
import { getOrderTikTokUsername, openTikTokProfile } from "@/utils/tiktok";

// ─── Print helper (unchanged) ──────────────────────────────────────────────

function buildOrderHtml(order: Order) {
  const products = order.products || [];
  const productTotal = getOrderTotal(products);
  const shippingFee = 0;
  const prepaid = 0;
  const remain = productTotal + shippingFee - prepaid;

  const productRows = products
    .map((item, index) => {
      const total = Number(item.price || 0) * Number(item.quantity || 0);
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.code}</td>
          <td>${item.price}.000đ × ${item.quantity}</td>
          <td>${formatMoneyFromK(total)}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${order.orderCode}</title>
    <style>
      body{font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif;padding:18px;color:#111827}
      .center{text-align:center}.title{font-size:22px;font-weight:800;margin-bottom:4px}
      .subtitle{font-size:14px;color:#6b7280;margin-bottom:18px}
      .info{font-size:14px;line-height:22px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;margin-top:12px;margin-bottom:16px}
      th{background:#f3f4f6;font-size:14px;padding:10px 6px;border:1px solid #d1d5db;text-align:left}
      td{font-size:14px;padding:10px 6px;border:1px solid #d1d5db}
      .summary{margin-top:18px;font-size:15px;line-height:26px}
      .summary-row{display:flex;justify-content:space-between}
      .total{margin-top:10px;padding-top:10px;border-top:1px solid #d1d5db;font-size:18px;font-weight:800}
      .footer{margin-top:24px;text-align:center;font-size:13px;color:#6b7280}
    </style></head><body>
    <div class="center"><div class="title">HOÁ ĐƠN BÁN HÀNG</div><div class="subtitle">Flive - TikTok LIVE</div></div>
    <div class="info">
      <div><b>Mã đơn:</b> ${order.orderCode}</div>
      <div><b>Khách hàng:</b> ${order.username}</div>
      <div><b>Comment:</b> ${order.comment}</div>
      <div><b>Ngày tạo:</b> ${new Date(order.createdAt).toLocaleString("vi-VN")}</div>
    </div>
    <table><thead><tr><th>#</th><th>Sản phẩm</th><th>Giá × SL</th><th>Tổng</th></tr></thead>
    <tbody>${productRows}</tbody></table>
    <div class="summary">
      <div class="summary-row"><span>Tạm tính</span><b>${formatMoneyFromK(productTotal)}</b></div>
      <div class="summary-row"><span>Phí vận chuyển</span><b>${formatMoneyFromK(shippingFee)}</b></div>
      <div class="summary-row"><span>Trả trước</span><b>- ${formatMoneyFromK(prepaid)}</b></div>
      <div class="summary-row total"><span>Còn lại</span><span>${formatMoneyFromK(remain)}</span></div>
    </div>
    <div class="footer">Cảm ơn quý khách!</div>
    </body></html>`;
}

// ─── Icons ─────────────────────────────────────────────────────────────────

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function SettingsIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2.06 2.06 0 0 1-2.91 2.91l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21a2.06 2.06 0 0 1-4.12 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2.06 2.06 0 0 1-2.91-2.91l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2.06 2.06 0 0 1 0-4.12h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2.06 2.06 0 0 1 2.91-2.91l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2.06 2.06 0 0 1 4.12 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2.06 2.06 0 0 1 2.91 2.91l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1H21a2.06 2.06 0 0 1 0 4.12h-.09a1.7 1.7 0 0 0-1.55 1Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function PhoneIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.31 1.85.53 2.81.66A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function AddressIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" /></svg>;
}
function TikTokIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 3c.4 3 2.1 4.9 5 5.2v3.1c-1.9.1-3.6-.5-5-1.6v5.9c0 3.1-2.3 5.4-5.5 5.4A5.3 5.3 0 0 1 4 15.7c0-3.4 3-5.9 6.5-5.2v3.2c-1.6-.5-3.2.5-3.2 2.1 0 1.2.9 2.1 2.2 2.1 1.4 0 2.2-.9 2.2-2.4V3H15Z" fill="currentColor" /></svg>;
}
function PrinterIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 14h10v7H7v-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}
function PlusCircleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function ChevronRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function EyeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>;
}
function InfoIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function MinusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>;
}
function PlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>;
}
function ConfirmIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" /><path d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function DepositSpinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}
function ShareIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 15V4m0 0 4 4m-4-4L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 13v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function ChevronDownIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ShipIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 7h11v9H3V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M14 10h3l3 3v3h-6v-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="2" /><circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="2" /></svg>;
}
function TrashIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

// ─── Small shared UI ────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-2 bg-[#f2f2f2]" />;
}

function VndBadge() {
  return (
    <span className="rounded-[2px] bg-[#f2f2f2] px-2 py-[3px] text-[12px] leading-[18px] font-medium text-[#161616]">VND</span>
  );
}

function InputField({ label, placeholder, suffix, children }: { label: string; placeholder?: string; suffix?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] leading-[22px] text-[#484848]">{label}</label>
      <div className="flex h-12 items-center gap-4 rounded-[8px] border border-black/10 px-4">
        {children ?? (
          <input className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none placeholder:text-[#787878]" placeholder={placeholder} />
        )}
        {suffix}
      </div>
    </div>
  );
}

function GradientButton({ label, disabled, onClick }: { label: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center rounded-[40px] p-4 text-[16px] leading-6 font-medium text-black transition-opacity ${disabled ? "opacity-40" : ""}`}
      style={{ backgroundImage: "linear-gradient(138deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)" }}
    >
      {label}
    </button>
  );
}

// ─── Carrier data ───────────────────────────────────────────────────────────

const CARRIERS = [
  {
    id: "vtp",
    name: "Viettel Post",
    shortName: "VTP",
    description: "Dịch vụ bưu chính của Viettel với mạng lưới rộng khắp.",
    bgColor: "bg-[#d71920]",
    linked: true,
    isDefault: true,
  },
  {
    id: "spx",
    name: "SPX - SPX EXPRESS",
    shortName: "SPX",
    description: "Dịch vụ giao hàng toàn quốc, nhanh, rẻ và an toàn.",
    bgColor: "bg-[#ff3911]",
    linked: false,
    isDefault: false,
  },
  {
    id: "jt",
    name: "JT - J&T Express",
    shortName: "J&T",
    description: "Dịch vụ chuyển phát nhanh J&T Express với mạng lưới toàn quốc.",
    bgColor: "bg-[#e31837]",
    linked: false,
    isDefault: false,
  },
  {
    id: "ghn",
    name: "GHN - Giao Hàng Nhanh",
    shortName: "GHN",
    description: "Dịch vụ giao hàng nhanh với mạng lưới rộng khắp cả nước.",
    bgColor: "bg-[#ff6700]",
    linked: false,
    isDefault: false,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatOrderDate(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function statusLabel(status: Order["status"]) {
  const map: Record<string, string> = {
    confirmed: "Đã chốt", shipping: "Đang giao hàng",
    completed: "Hoàn thành", canceled: "Đã huỷ",
  };
  return map[status] ?? "Đơn nháp";
}

function RadioOptionRow({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[8px] border px-4 py-3 text-left ${
        active ? "border-[#ff6b8a]" : "border-[#dadada]"
      }`}
    >
      <RadioIcon checked={!!active} />
      <span className="text-[14px] leading-[22px] text-[#0c0c0c]">{label}</span>
    </button>
  );
}

function UnitBadge({ unit }: { unit: string }) {
  return (
    <span className="flex items-center gap-1 rounded-[2px] bg-[#f2f2f2] px-2 py-[3px] text-[12px] font-medium text-[#161616]">
      {unit}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-checked={on}
      role="switch"
      className={`relative flex h-6 w-11 shrink-0 items-center rounded-full p-[2.4px] transition-colors ${on ? "justify-end bg-[#ff6b8a]" : "justify-start bg-[#dadada]"}`}
    >
      <span className="block h-[19.2px] w-[19.2px] rounded-full bg-white shadow" />
    </button>
  );
}

function EditIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function PencilLineIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function RadioIcon({ checked }: { checked: boolean }) {
  return checked
    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#ff6b8a" strokeWidth="2" /><circle cx="12" cy="12" r="5" fill="#ff6b8a" /></svg>
    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#dadada" strokeWidth="2" /></svg>;
}

type AddressItem = ShopAddress | CustomerAddress;

type AddressFormState = {
  name: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  label: string;
  isDefault: boolean;
};


function AddressFormDrawer({
  open,
  onOpenChange,
  title,
  initial,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  initial?: Partial<AddressFormState> & { id?: string };
  saving: boolean;
  onSave: (data: AddressFormState) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

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

  useEffect(() => {
    if (!open) return;

    setName(initial?.name ?? "");
    setPhone(initial?.phone ?? "");
    setAddress(initial?.address ?? "");
    setLabel(initial?.label ?? "");
    setIsDefault(initial?.isDefault ?? false);
    setErrors({});

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
    if (!name.trim()) {
      next.name = "Họ và tên không được để trống";
    } else if (/[^a-zA-ZÀ-ỹ\s]/.test(name.trim())) {
      next.name = "Họ và tên không được chứa ký tự đặc biệt";
    }
    const digits = phone.trim().replace(/\D/g, "");
    if (!phone.trim()) {
      next.phone = "Số điện thoại không được để trống";
    } else if (digits.length < 10 || digits.length > 12) {
      next.phone = "Số điện thoại phải từ 10 đến 12 chữ số";
    }
    if (!draftProvince) next.province = "Vui lòng chọn tỉnh/thành phố";
    if (!draftDistrict) next.district = "Vui lòng chọn huyện/quận";
    if (!draftWard) next.ward = "Vui lòng chọn phường/xã";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const canSave = !saving;

  return (
    <>
      <DrawlerBase
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        height="lg"
        footer={
          <div className="px-4 pb-2 pt-1">
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
            <div className={`flex h-12 items-center rounded-xl border px-4 ${errors.name ? "border-red-400" : "border-black/10"}`}>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }} onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" })} placeholder="Nhập họ và tên" className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]" />
            </div>
            {errors.name && <p className="text-[12px] text-red-500">{errors.name}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Số điện thoại</label>
            <div className={`flex h-12 items-center rounded-xl border px-4 ${errors.phone ? "border-red-400" : "border-black/10"}`}>
              <input type="tel" inputMode="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }} onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" })} placeholder="Nhập số điện thoại" className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]" />
            </div>
            {errors.phone && <p className="text-[12px] text-red-500">{errors.phone}</p>}
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
          <button type="button" onClick={() => setIsDefault((v) => !v)} className="flex items-center gap-3">
            <RadioIcon checked={isDefault} />
            <span className="text-[14px] text-black">Đặt làm địa chỉ mặc định</span>
          </button>
        </div>
      </DrawlerBase>


      {/* Province picker */}
      <GeoPickerDrawer
        open={provinceOpen}
        onOpenChange={(o) => {
          if (!o) setProvinceOpen(false);
        }}
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

      {/* District picker */}
      <GeoPickerDrawer
        open={districtOpen}
        onOpenChange={(o) => {
          if (!o) setDistrictOpen(false);
        }}
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

      {/* Ward picker */}
      <GeoPickerDrawer
        open={wardOpen}
        onOpenChange={(o) => {
          if (!o) setWardOpen(false);
        }}
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

function AddressPickerDrawer<T extends AddressItem>({
  open,
  onOpenChange,
  title,
  addresses,
  loading,
  selected,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  addresses: T[];
  loading: boolean;
  selected: T | null;
  onSelect: (a: T) => void;
  onAdd: () => void;
  onEdit: (a: T) => void;
  onDelete: (a: T) => void;
}) {
  return (
    <DrawlerBase
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      height="auto"
      footer={
        <div className="px-4 pb-2 pt-1">
          <GradientButton label="Thêm địa chỉ mới" onClick={onAdd} />
        </div>
      }
    >
      <div className="flex flex-col gap-0 px-4 pb-4">
        {loading && (
          <div className="flex items-center justify-center py-8 text-[14px] text-[#787878]">
            Đang tải...
          </div>
        )}
        {!loading && addresses.length === 0 && (
          <div className="flex items-center justify-center py-8 text-[14px] text-[#787878]">
            Chưa có địa chỉ nào
          </div>
        )}
        {!loading && addresses.map((a, i) => (
          <div key={a?.id} className={`flex items-start gap-3 py-4 ${i < addresses.length - 1 ? "border-b border-black/6" : ""}`}>
            <button type="button" onClick={() => onSelect(a)} className="mt-0.5 shrink-0">
              <RadioIcon checked={selected?.id === a?.id} />
            </button>
            <div className="min-w-0 flex-1" onClick={() => onSelect(a)}>
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-black">{a?.name || "—"}</p>
                {a?.isDefault && (
                  <span className="rounded bg-[#fff0f3] px-1.5 py-0.5 text-[11px] font-medium text-[#ff6b8a]">Mặc định</span>
                )}
                {a?.label && (
                  <span className="rounded bg-[#f2f2f2] px-1.5 py-0.5 text-[11px] text-[#787878]">{a?.label}</span>
                )}
              </div>
              {a?.phone && <p className="mt-0.5 text-[13px] text-[#484848]">{a?.phone}</p>}
              {(a?.address || a?.ward || a?.district || a?.province) && (
                <p className="mt-0.5 text-[12px] leading-5 text-[#787878]">
                  {[a?.address, a?.ward, a?.district, a?.province].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => onEdit(a)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f2f2] text-[#484848]">
                <EditIcon />
              </button>
              <button type="button" onClick={() => onDelete(a)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0f3] text-[#ff6b8a]">
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </DrawlerBase>
  );
}

function ShippingCreateScreen({
  order,
  onBack,
  productTotal,
  userName,
}: {
  order: Order;
  onBack: () => void;
  productTotal: number;
  userName?: string;
}) {
  const totalQuantity = (order.products || []).reduce(
    (sum, product) => sum + Number(product.quantity || 0),
    0,
  );

  const [dimensionsOpen, setDimensionsOpen] = useState(false);
  const [autoScale, setAutoScale] = useState(true);
  const [dimLength, setDimLength] = useState("40");
  const [dimWidth, setDimWidth] = useState("40");
  const [dimHeight, setDimHeight] = useState("10");
  const [dimWeight, setDimWeight] = useState("200");

  // ── Sender (shop address)
  const [senderPickerOpen, setSenderPickerOpen] = useState(false);
  const [senderFormOpen, setSenderFormOpen] = useState(false);
  const [senderFormInitial, setSenderFormInitial] = useState<Partial<AddressFormState> & { id?: string }>({});
  const [shopAddresses, setShopAddresses] = useState<ShopAddress[]>([]);
  const [shopAddressesLoading, setShopAddressesLoading] = useState(false);
  const [selectedSender, setSelectedSender] = useState<ShopAddress | null>(null);
  const [senderSaving, setSenderSaving] = useState(false);

  // ── Recipient (customer address)
  const [recipientPickerOpen, setRecipientPickerOpen] = useState(false);
  const [recipientFormOpen, setRecipientFormOpen] = useState(false);
  const [recipientFormInitial, setRecipientFormInitial] = useState<Partial<AddressFormState> & { id?: string }>({});
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  const [customerAddressesLoading, setCustomerAddressesLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<CustomerAddress | null>(null);
  const [recipientSaving, setRecipientSaving] = useState(false);

  const [paymentOption, setPaymentOption] = useState<"sender" | "receiver">("sender");
  const [shippingService, setShippingService] = useState<string>("fast");
  const [viewCondition, setViewCondition] = useState<string>("none");
  const [pickupOption, setPickupOption] = useState<"store" | "dropoff">("store");

  async function loadShopAddresses() {
    setShopAddressesLoading(true);
    try {
      const list = await listShopAddressesApi();
      setShopAddresses(list);
      if (!selectedSender) {
        const def = list.find((a) => a?.isDefault) ?? list[0] ?? null;
        setSelectedSender(def);
      }
    } catch {
      toast.error("Không tải được địa chỉ người gửi");
    } finally {
      setShopAddressesLoading(false);
    }
  }

  async function loadCustomerAddresses() {
    if (!order.customerId) return;
    setCustomerAddressesLoading(true);
    try {
      const list = await listCustomerAddressesApi(order?.customerId);
      setCustomerAddresses(list);
      if (!selectedRecipient) {
        const def = list.find((a) => a?.isDefault) ?? list[0] ?? null;
        setSelectedRecipient(def);
      }
    } catch {
      toast.error("Không tải được địa chỉ người nhận");
    } finally {
      setCustomerAddressesLoading(false);
    }
  }

  function openSenderPicker() {
    setSenderPickerOpen(true);
    loadShopAddresses();
  }

  function openRecipientPicker() {
    setRecipientPickerOpen(true);
    loadCustomerAddresses();
  }

  async function handleSenderFormSave(data: AddressFormState) {
    setSenderSaving(true);
    try {
      if (senderFormInitial.id) {
        const updated = await updateShopAddressApi(senderFormInitial.id, data);
        setShopAddresses((prev) => prev.map((a) => (a?.id === updated?.id ? updated : a)));
        if (selectedSender?.id === updated.id) setSelectedSender(updated);
      } else {
        const created = await createShopAddressApi(data);
        setShopAddresses((prev) => [...prev, created]);
        setSelectedSender(created);
      }
      setSenderFormOpen(false);
    } catch {
      toast.error("Lưu địa chỉ thất bại");
    } finally {
      setSenderSaving(false);
    }
  }

  async function handleDeleteShopAddress(a: ShopAddress) {
    try {
      await deleteShopAddressApi(a?.id);
      setShopAddresses((prev) => prev.filter((x) => x.id !== a?.id));
      if (selectedSender?.id === a?.id) setSelectedSender(null);
    } catch {
      toast.error("Xoá địa chỉ thất bại");
    }
  }

  async function handleRecipientFormSave(data: AddressFormState) {
    if (!order.customerId) {
      toast.error("Đơn hàng chưa có khách hàng. Không thể lưu địa chỉ người nhận.");
      return;
    }
    setRecipientSaving(true);
    try {
      if (recipientFormInitial.id) {
        const updated = await updateCustomerAddressApi(order.customerId, recipientFormInitial.id, data);
        setCustomerAddresses((prev) => prev.map((a) => (a?.id === updated?.id ? updated : a)));
        if (selectedRecipient?.id === updated.id) setSelectedRecipient(updated);
      } else {
        const created = await createCustomerAddressApi(order.customerId, data);
        setCustomerAddresses((prev) => [...prev, created]);
        setSelectedRecipient(created);
      }
      setRecipientFormOpen(false);
    } catch {
      toast.error("Lưu địa chỉ thất bại");
    } finally {
      setRecipientSaving(false);
    }
  }

  async function handleDeleteCustomerAddress(a: CustomerAddress) {
    if (!order.customerId) return;
    try {
      await deleteCustomerAddressApi(order.customerId, a?.id);
      setCustomerAddresses((prev) => prev.filter((x) => x.id !== a?.id));
      if (selectedRecipient?.id === a?.id) setSelectedRecipient(null);
    } catch {
      toast.error("Xoá địa chỉ thất bại");
    }
  }

  useEffect(() => {
    void loadShopAddresses();
    if (order.customerId) void loadCustomerAddresses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="mx-auto flex h-full w-full flex-col bg-white text-black">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between bg-white px-4 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]"
        >
          <BackIcon />
        </button>
        <h1 className="min-w-0 flex-1 px-4 text-center text-20 font-semibold leading-7 text-black">
          Tạo đơn hàng
        </h1>
        <button
          type="button"
          onClick={() => setDimensionsOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]"
        >
          <SettingsIcon />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-[124px] [-webkit-overflow-scrolling:touch]">
        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">
            Thông tin người gửi
          </h2>
          {shopAddressesLoading ? (
            <div className="mt-3 rounded-[16px] bg-[#f2f2f2] p-[16px] animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-black/10" />
                <div className="h-4 flex-1 rounded-md bg-black/10" />
                <div className="h-4 w-16 rounded-md bg-black/10" />
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <div className="h-3 w-32 rounded-md bg-black/10" />
                <div className="h-3 w-48 rounded-md bg-black/10" />
              </div>
            </div>
          ) : selectedSender ? (
            <div className="mt-3 rounded-[16px] border-[0.5px] border-black/10 bg-[#f2f2f2] p-[16px] flex flex-col gap-[16px]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[16px] font-semibold text-[#ff6b8a]">
                  {selectedSender.name?.[0]?.toUpperCase() ?? "S"}
                </div>
                <p className="min-w-0 flex-1 text-[16px] font-medium text-black">{selectedSender.name}</p>
                <button type="button" onClick={openSenderPicker} className="flex shrink-0 items-center gap-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-[14px] font-medium text-black">Thay đổi</span>
                </button>
              </div>
              <div className="flex flex-col gap-[8px]">
                {selectedSender.phone && (
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.63a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#484848" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <p className="text-[12px] leading-[18px] text-[#484848]">{selectedSender.phone}</p>
                  </div>
                )}
                {(selectedSender.address || selectedSender.ward || selectedSender.district || selectedSender.province) && (
                  <div className="flex items-start gap-2">
                    <svg className="mt-[1px] shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#484848" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="#484848" strokeWidth="1.8"/></svg>
                    <p className="text-[12px] leading-[18px] text-[#484848]">
                      {[selectedSender.address, selectedSender.ward, selectedSender.district, selectedSender.province].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => { setSenderFormInitial({ name: userName ?? "" }); setSenderFormOpen(true); }} className="mt-3 flex h-14 w-full items-center justify-center rounded-xl border border-dashed border-[#ff6b8a] text-[14px] font-medium text-[#ff6b8a]">
              Thêm mới
            </button>
          )}
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">
            Thông tin người nhận
          </h2>
          {customerAddressesLoading ? (
            <div className="mt-3 rounded-[16px] bg-[#f2f2f2] p-[16px] animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-black/10" />
                <div className="h-4 flex-1 rounded-md bg-black/10" />
                <div className="h-4 w-16 rounded-md bg-black/10" />
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <div className="h-3 w-32 rounded-md bg-black/10" />
                <div className="h-3 w-48 rounded-md bg-black/10" />
              </div>
            </div>
          ) : selectedRecipient ? (
            <div className="mt-3 rounded-[16px] border-[0.5px] border-black/10 bg-[#f2f2f2] p-[16px] flex flex-col gap-[16px]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-[16px] font-semibold text-[#468adf]">
                  {selectedRecipient.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <p className="min-w-0 flex-1 text-[16px] font-medium text-black">{selectedRecipient.name}</p>
                <button type="button" onClick={openRecipientPicker} className="flex shrink-0 items-center gap-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-[14px] font-medium text-black">Thay đổi</span>
                </button>
              </div>
              <div className="flex flex-col gap-[8px]">
                {selectedRecipient.phone && (
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.63a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#484848" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <p className="text-[12px] leading-[18px] text-[#484848]">{selectedRecipient.phone}</p>
                  </div>
                )}
                {(selectedRecipient.address || selectedRecipient.ward || selectedRecipient.district || selectedRecipient.province) && (
                  <div className="flex items-start gap-2">
                    <svg className="mt-[1px] shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#484848" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="#484848" strokeWidth="1.8"/></svg>
                    <p className="text-[12px] leading-[18px] text-[#484848]">
                      {[selectedRecipient.address, selectedRecipient.ward, selectedRecipient.district, selectedRecipient.province].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => { if (!order.customerId) { toast.error("Đơn hàng chưa có khách hàng. Không thể thêm địa chỉ người nhận."); return; } setRecipientFormInitial({}); setRecipientFormOpen(true); }} className="mt-3 flex h-14 w-full items-center justify-center rounded-xl border border-dashed border-[#ff6b8a] text-[14px] font-medium text-[#ff6b8a]">
              Thêm mới
            </button>
          )}
        </section>

        <Divider />

        <section className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] leading-6 text-black">
              Thông tin đơn hàng
            </h2>
            <button
              type="button"
              onClick={() => setDimensionsOpen(true)}
              className="flex items-center gap-2"
            >
              <PencilLineIcon />
              <span className="text-[14px] font-medium leading-[22px] text-black">Thay đổi</span>
            </button>
          </div>
          <div className="mt-3 rounded-[16px] border-[0.5px] border-black/10 bg-[#f2f2f2] p-[16px] flex flex-col gap-[8px]">
            {([
              ["M", `${dimLength} cm`, <svg key="d" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 7H2M22 17H2M12 7v10" stroke="#484848" strokeWidth="1.8" strokeLinecap="round"/></svg>],
              ["R", `${dimWidth} cm`, <svg key="w" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 2v20M17 2v20M7 12h10" stroke="#484848" strokeWidth="1.8" strokeLinecap="round"/></svg>],
              ["C", `${dimHeight} cm`, <svg key="h" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="#484848" strokeWidth="1.8" strokeLinecap="round"/></svg>],
              ["KL", `${dimWeight} gram`, <svg key="kg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z" stroke="#484848" strokeWidth="1.8"/><path d="M3 8h18l-2 13H5L3 8z" stroke="#484848" strokeWidth="1.8" strokeLinejoin="round"/></svg>],
            ] as [string, string, React.ReactNode][]).map(([label, value, icon]) => (
              <div key={label} className="flex items-center gap-[8px]">
                {icon}
                <span className="flex-1 text-[14px] leading-[22px] text-[#484848]">
                  {label === "M" ? "Dài" : label === "R" ? "Rộng" : label === "C" ? "Cao" : "Khối lượng"}
                </span>
                <span className="text-[14px] font-medium leading-[22px] text-black">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex h-12 items-center justify-between rounded-full bg-[#f2f2f2] px-1">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm"
            >
              <MinusIcon />
            </button>
            <span className="text-[16px] font-semibold text-black">
              {totalQuantity || 2}
            </span>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm"
            >
              <PlusIcon />
            </button>
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">
            Thông tin thanh toán
          </h2>
          <div className="mt-3 flex flex-col gap-4">
            <InputField label="Tiền thu hộ (COD)" suffix={<VndBadge />}>
              <input
                readOnly
                value="60.000"
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none"
              />
            </InputField>
            <InputField label="Tổng giá trị hàng hóa" suffix={<VndBadge />}>
              <input
                readOnly
                value={productTotal ? String(productTotal * 1000).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "40.000"}
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none"
              />
            </InputField>
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">
            Tùy chọn thanh toán
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <RadioOptionRow label="Bên gửi trả phí" active={paymentOption === "sender"} onClick={() => setPaymentOption("sender")} />
            <RadioOptionRow label="Bên nhận trả phí" active={paymentOption === "receiver"} onClick={() => setPaymentOption("receiver")} />
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">
            Gói dịch vụ
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <RadioOptionRow label="Viettel Post chuyển nhanh" active={shippingService === "fast"} onClick={() => setShippingService("fast")} />
            <RadioOptionRow label="Viettel Post chuyển tiết kiệm" active={shippingService === "economy"} onClick={() => setShippingService("economy")} />
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">
            Lưu ý cho xem hàng
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <RadioOptionRow label="Không cho xem hàng" active={viewCondition === "none"} onClick={() => setViewCondition("none")} />
            <RadioOptionRow label="Cho xem hàng không thử" active={viewCondition === "view"} onClick={() => setViewCondition("view")} />
            <RadioOptionRow label="Cho thử hàng" active={viewCondition === "try"} onClick={() => setViewCondition("try")} />
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">
            Shipper lấy hàng
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <RadioOptionRow label="Tại cửa hàng" active={pickupOption === "store"} onClick={() => setPickupOption("store")} />
            <RadioOptionRow label="Gửi tại điểm dịch vụ" active={pickupOption === "dropoff"} onClick={() => setPickupOption("dropoff")} />
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">
            Ghi chú
          </h2>
          <textarea
            placeholder="Nhập ghi chú"
            className="mt-3 min-h-24 w-full resize-none rounded-xl border border-black/10 p-4 text-[14px] outline-none placeholder:text-[#787878]"
          />
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-black/8 bg-white px-4 pb-8 pt-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[14px] leading-[22px] text-[#484848]">
            Phí dự kiến
          </span>
          <span className="text-[18px] font-semibold text-black">0 ₫</span>
        </div>
        <GradientButton label="Tạo đơn hàng" disabled />
      </div>

      <DrawlerBase
        open={dimensionsOpen}
        onOpenChange={setDimensionsOpen}
        title="Kích thước sản phẩm (SHIP)"
        height="auto"
      >
        <div className="flex flex-col gap-6">
          <div className="rounded-xl bg-[#eaf4ff] px-4 py-3 text-[14px] leading-[22px] text-[#0f5d9f]">
            Kích thước sẽ tự động nhân với số lượng sản phẩm (ví dụ: 5 sản phẩm = x5 lần)
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[15px] leading-6 font-medium text-black">
              Tự động nhân kích thước với số lượng
            </span>
            <ToggleSwitch on={autoScale} onToggle={() => setAutoScale((value) => !value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Dài" suffix={<UnitBadge unit="cm" />}>
              <input
                value={dimLength}
                onChange={(event) => setDimLength(event.target.value)}
                inputMode="decimal"
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none"
              />
            </InputField>
            <InputField label="Rộng" suffix={<UnitBadge unit="cm" />}>
              <input
                value={dimWidth}
                onChange={(event) => setDimWidth(event.target.value)}
                inputMode="decimal"
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none"
              />
            </InputField>
            <InputField label="Cao" suffix={<UnitBadge unit="cm" />}>
              <input
                value={dimHeight}
                onChange={(event) => setDimHeight(event.target.value)}
                inputMode="decimal"
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none"
              />
            </InputField>
            <InputField label="Khối lượng" suffix={<UnitBadge unit="Gram" />}>
              <input
                value={dimWeight}
                onChange={(event) => setDimWeight(event.target.value)}
                inputMode="decimal"
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none"
              />
            </InputField>
          </div>

          <GradientButton label="Lưu lại" disabled />
        </div>
      </DrawlerBase>

      <AddressPickerDrawer<ShopAddress>
        open={senderPickerOpen}
        onOpenChange={setSenderPickerOpen}
        title="Địa chỉ người gửi"
        addresses={shopAddresses}
        loading={shopAddressesLoading}
        selected={selectedSender}
        onSelect={(a) => { setSelectedSender(a); setSenderPickerOpen(false); }}
        onAdd={() => { setSenderFormInitial({ name: userName ?? "" }); setSenderFormOpen(true); }}
        onEdit={(a) => { setSenderFormInitial({ id: a?.id, name: a?.name ?? "", phone: a?.phone ?? "", address: a.address ?? "", province: a.province ?? "", district: a.district ?? "", ward: a.ward ?? "", label: a.label ?? "", isDefault: a.isDefault }); setSenderFormOpen(true); }}
        onDelete={handleDeleteShopAddress}
      />

      <AddressFormDrawer
        open={senderFormOpen}
        onOpenChange={setSenderFormOpen}
        title={senderFormInitial.id ? "Sửa địa chỉ người gửi" : "Thêm địa chỉ người gửi"}
        initial={senderFormInitial}
        saving={senderSaving}
        onSave={handleSenderFormSave}
      />

      <AddressPickerDrawer<CustomerAddress>
        open={recipientPickerOpen}
        onOpenChange={setRecipientPickerOpen}
        title="Địa chỉ người nhận"
        addresses={customerAddresses}
        loading={customerAddressesLoading}
        selected={selectedRecipient}
        onSelect={(a) => { setSelectedRecipient(a); setRecipientPickerOpen(false); }}
        onAdd={() => { if (!order.customerId) { toast.error("Đơn hàng chưa có khách hàng. Không thể thêm địa chỉ người nhận."); return; } setRecipientFormInitial({ name: order.customerTikTokName ?? order.customerTikTokUsername ?? "" }); setRecipientFormOpen(true); }}
        onEdit={(a) => { setRecipientFormInitial({ id: a?.id, name: a?.name ?? "", phone: a?.phone ?? "", address: a?.address ?? "", province: a?.province ?? "", district: a?.district ?? "", ward: a?.ward ?? "", label: a?.label ?? "", isDefault: a?.isDefault }); setRecipientFormOpen(true); }}
        onDelete={handleDeleteCustomerAddress}
      />

      <AddressFormDrawer
        open={recipientFormOpen}
        onOpenChange={setRecipientFormOpen}
        title={recipientFormInitial.id ? "Sửa địa chỉ người nhận" : "Thêm địa chỉ người nhận"}
        initial={recipientFormInitial}
        saving={recipientSaving}
        onSave={handleRecipientFormSave}
      />
    </main>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function OrderOverviewScreen({
  order,
  onBack,
  onToggleDeposit,
  onAddProduct,
  onDeleteProduct,
  isDepositLoading = false,
  userName,
}: {
  order: Order;
  onBack: () => void;
  onToggleDeposit: (orderId: string) => void;
  onAddProduct?: (orderId: string, product: OrderProduct) => void;
  onDeleteProduct?: (orderId: string, itemId: string) => void;
  isDepositLoading?: boolean;
  userName?: string;
}) {
  // ── Drawer open states
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [carrierOpen, setCarrierOpen] = useState(false);
  const [linkCarrierOpen, setLinkCarrierOpen] = useState(false);

  // ── Settings drawer state
  const [localShippingFee, setLocalShippingFee] = useState(
    order.shippingFee ?? 0,
  );
  const [localPrepaid, setLocalPrepaid] = useState(order.codAmount ?? 0);

  // ── Add-product drawer state
  const [newCode, setNewCode] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState("");

  // ── Link-carrier drawer state
  const [selectedCarrier, setSelectedCarrier] = useState<
    (typeof CARRIERS)[0] | null
  >(null);
  const [linkAccount, setLinkAccount] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [linkIsDefault, setLinkIsDefault] = useState(true);

  // ── Collapsed product list
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showShippingCreateScreen, setShowShippingCreateScreen] = useState(false);

  // ── Default customer address from API
  const [defaultCustomerAddress, setDefaultCustomerAddress] = useState<CustomerAddress | null>(null);

  useEffect(() => {
    if (!order.customerId) return;
    listCustomerAddressesApi(order.customerId).then((list) => {
      const def = list.find((a) => a?.isDefault) ?? list[0] ?? null;
      setDefaultCustomerAddress(def);
    }).catch(() => { /* silent — fall back to order snapshot */ });
  }, [order.customerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Calculated values
  const products = order.products || [];
  const productTotal = getOrderTotal(products);
  const shippingFee = localShippingFee;
  const prepaid = localPrepaid;
  const remain = productTotal + shippingFee - prepaid;
  const totalQuantity = products.reduce((s, p) => s + Number(p.quantity || 0), 0);
  const displayProducts = showAllProducts ? products : products.slice(0, 3);
  const canSaveProduct = newCode.trim() && Number(newPrice) > 0 && newQty > 0;

  async function handleAddProduct() {
    const productCode = newCode.trim();
    const price = Number(newPrice);

    if (!productCode) {
      toast.warning("Vui lòng nhập mã sản phẩm");
      return;
    }

    if (!price || price <= 0) {
      toast.warning("Vui lòng nhập giá sản phẩm");
      return;
    }

    try {
      setIsAddingProduct(true);
      const item = await addOrderItemApi(order.id, {
        productCode,
        productName: productCode,
        price,
        quantity: newQty,
      });

      const itemId = String(item.id || item.itemId || item.item_id || item.orderItemId || item.order_item_id || "");

      onAddProduct?.(order.id, {
        id: itemId,
        code: String(item.productCode || item.product_code || productCode),
        name: String(item.productName || item.product_name || productCode),
        price: Number(item.price || price),
        quantity: Number(item.quantity || newQty),
      });

      setNewCode("");
      setNewPrice("");
      setNewQty(1);
      setAddProductOpen(false);
      toast.success("Đã thêm sản phẩm");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thêm sản phẩm thất bại");
    } finally {
      setIsAddingProduct(false);
    }
  }

  async function handleDeleteProduct(product: OrderProduct) {
    const itemId = String(product.id || "").trim();

    if (!itemId) {
      toast.error("Không tìm thấy ID sản phẩm để xoá");
      return;
    }

    try {
      setDeletingProductId(itemId);
      await deleteOrderItemApi(order.id, itemId);
      onDeleteProduct?.(order.id, itemId);
      toast.success("Đã xoá sản phẩm");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Xoá sản phẩm thất bại");
    } finally {
      setDeletingProductId("");
    }
  }


  // ── Print
  function handlePrint() {
    const html = buildOrderHtml(order);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  // ── Open carrier-link form
  function openLinkCarrier(carrier: (typeof CARRIERS)[0]) {
    setSelectedCarrier(carrier);
    setLinkAccount("");
    setLinkPassword("");
    setLinkIsDefault(true);
    setLinkCarrierOpen(true);
  }

  if (showShippingCreateScreen) {
    return (
      <ShippingCreateScreen
        order={order}
        onBack={() => setShowShippingCreateScreen(false)}
        productTotal={productTotal}
        userName={userName}
      />
    );
  }

  return (
    <main className="mx-auto flex h-dvh max-w-120 flex-col bg-white text-black">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between bg-white px-4 pb-4 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]"
        >
          <BackIcon />
        </button>
        <h1 className="min-w-0 flex-1 px-4 text-center text-[24px] font-semibold leading-7 text-black">
          Tổng quan đơn hàng
        </h1>
        <div className="h-11 w-11" />
      </header>

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-40 [-webkit-overflow-scrolling:touch]">
        {/* Info section */}
        <div className="flex flex-col gap-6 px-4 pb-5 pt-2">
          {/* Order meta + status tag */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[12px] leading-[18px] text-[#484848]">
              <span className="min-w-0 flex-1 truncate">
                Order ID: {order.orderCode || order.id}
              </span>
              <span className="h-3 w-px shrink-0 bg-[#dadada]" />
              <span className="shrink-0 whitespace-nowrap">
                {formatOrderDate(order.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-flex h-6 items-center rounded-2xl bg-[#d9ffee] px-2 text-[12px] font-medium leading-[18px] text-[#2ca87b]">
                {statusLabel(order.status)}
              </span>
            </div>
          </div>

          {/* Customer info */}
          <div className="flex flex-col gap-4">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              {order.avatarUrl ? (
                <img
                  src={order.avatarUrl}
                  alt={order.username}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[15px] font-semibold text-[#ff6b8a]">
                  {(order.customerName || order.username || "?")?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="w-full text-[16px] font-medium leading-6 text-black">
                  {order.customerName || order.username}
                </p>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l2.09 6.26L20 9.27l-4.91 4.79 1.18 6.94L12 17.77l-4.27 3.23 1.18-6.94L4 9.27l5.91-1.01z" fill="#f5c842" />
                  </svg>
                  <span className="text-[12px] leading-[18px] font-medium text-[#484848]">VIP</span>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[#484848]"><PhoneIcon /></span>
                <p className="text-[12px] leading-[18px] text-[#484848]">
                  {defaultCustomerAddress?.phone || order.customerPhone || "Chưa có số điện thoại"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[#484848]"><AddressIcon /></span>
                <p className="text-[12px] leading-[18px] text-[#484848]">
                  {defaultCustomerAddress
                    ? [defaultCustomerAddress.address, defaultCustomerAddress.ward, defaultCustomerAddress.district, defaultCustomerAddress.province].filter(Boolean).join(", ") || order.customerAddress || "Chưa có địa chỉ"
                    : order.customerAddressData
                      ? [order.customerAddressData?.address, order.customerAddressData?.ward, order.customerAddressData?.district, order.customerAddressData?.province].filter(Boolean).join(", ") || order.customerAddress || "Chưa có địa chỉ"
                      : order.customerAddress || "Chưa có địa chỉ"}
                </p>
              </div>
            </div>

            {/* Action pills */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => openTikTokProfile(getOrderTikTokUsername(order))}
                disabled={!getOrderTikTokUsername(order)}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black disabled:opacity-40"
              >
                <TikTokIcon />
                Tiktok
              </button>
              <button
                type="button"
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 4H4v12h8l4 4v-4h4V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M8 10h8M8 7h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Zalo
              </button>
              <button
                type="button"
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black"
              >
                <PhoneIcon />
                Điện thoại
              </button>
            </div>
          </div>
        </div>

        <Divider />

        {/* Products section */}
        <section className="px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[18px] font-semibold leading-6 text-black">
              Danh sách sản phẩm
            </h2>
            <button
              type="button"
              onClick={() => setAddProductOpen(true)}
              className="flex shrink-0 items-center gap-1 text-[14px] font-medium leading-[22px] text-black"
            >
              <PlusCircleIcon />
              Thêm mới
            </button>
          </div>

          <div className="mt-1 flex flex-col">
            {displayProducts.map((product, index) => (
              <div
                key={product.id || index}
                className="flex items-center justify-between gap-4 border-b border-black/10 py-3"
              >
                <p className="min-w-0 flex-1 text-[14px] leading-[22px] text-[#2b2b2b]">
                  {
                  product.code}
                </p>
                <div className="flex shrink-0 items-center gap-2">

                  <span className="text-[14px] font-medium leading-[22px] text-black">
                    {formatMoneyFromK(
                      Number(product.price || 0) * Number(product.quantity || 0),
                    )}
                  </span>
                                    <span className="text-[12px] leading-4.5 text-[#787878]">
                    x{product.quantity}
                  </span>
                  <button
                      type="button"
                      onClick={() => void handleDeleteProduct(product)}
                      disabled={!!deletingProductId && deletingProductId === product.id}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff0f0] text-[#ff6b8a] disabled:opacity-40"
                      aria-label="Xoá sản phẩm"
                    >
                      <TrashIcon />
                    </button>
                </div>
              </div>
            ))}
          </div>

          {products.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllProducts((value) => !value)}
              className="flex h-11 w-full items-center justify-center gap-1 text-[14px] font-medium leading-[22px] text-[#484848]"
            >
              {showAllProducts ? "Thu gọn" : `Xem thêm (${products.length - 3})`}
              <ChevronDownIcon />
            </button>
          )}

          <div className="mt-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[14px] leading-5.5 text-[#484848]">
                Tổng sản phẩm
              </span>
              <span className="text-[14px] font-semibold leading-5.5 text-black">
                {totalQuantity}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[14px] leading-5.5 text-[#484848]">
                Tổng tiền
              </span>
              <span className="text-[14px] font-semibold leading-5.5 text-[#ff6b8a]">
                {formatMoneyFromK(productTotal)}
              </span>
            </div>
          </div>
        </section>

        <Divider />

        {/* Shipping section */}
        <section className="px-4 pb-4 pt-5">
          <h2 className="text-[18px] font-semibold leading-6 text-black">
            Đơn vị vận chuyển
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {/* Phí vận chuyển inline input */}
            <div className="flex items-center justify-between gap-4">
              <span className="shrink-0 text-[14px] leading-5.5 text-[#2b2b2b]">Phí vận chuyển</span>
              <div className="flex h-10 w-36 items-center gap-1 rounded-xl border border-black/10 px-3">
                <MoneyInput valueK={localShippingFee} onChange={setLocalShippingFee} />
                <VndBadge />
              </div>
            </div>
            {/* Trả trước inline input */}
            <div className="flex items-center justify-between gap-4">
              <span className="shrink-0 text-[14px] leading-5.5 text-[#2b2b2b]">Trả trước</span>
              <div className="flex h-10 w-36 items-center gap-1 rounded-xl border border-black/10 px-3">
                <MoneyInput valueK={localPrepaid} onChange={setLocalPrepaid} />
                <VndBadge />
              </div>
            </div>
            {/* Còn lại */}
            <div className="flex items-center justify-between gap-4 border-t border-black/10 pt-3">
              <span className="text-[14px] leading-5.5 text-[#484848]">Còn lại</span>
              <span className="text-[14px] font-semibold leading-5.5 text-[#ff6b8a]">
                {formatMoneyFromK(remain)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCarrierOpen(true)}
            className="mt-4 w-full overflow-hidden rounded-xl border border-black/10 bg-white text-left"
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-[12px] leading-4.5 text-[#484848]">Mã VTP</span>
              <span className="truncate text-[12px] leading-4.5 text-black">
                {order.orderCode || order.id}
              </span>
            </div>
            <div className="flex items-center gap-4 bg-[#f2f2f2] px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d71920] text-[10px] font-bold text-white">
                VTP
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[14px] font-medium leading-5.5 text-black">Viettel Post</p>
                  <span className="text-[12px] font-medium leading-4.5 text-[#2ca87b]">
                    Đang giao hàng
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="truncate text-[12px] leading-4.5 text-[#484848]">
                    {formatOrderDate(order.createdAt)}
                  </p>
                  <button
                    type="button"
                    className="flex shrink-0 items-center gap-1 text-[12px] font-medium leading-4.5 text-black"
                  >
                    Theo dõi
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            </div>
          </button>
        </section>

        <Divider />

        {/* Action buttons in scrollable body */}
        <section className="px-4 pb-6 pt-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onToggleDeposit(order.id)}
              disabled={isDepositLoading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-[40px] py-3 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-70 ${
                order.depositStatus === "paid" || order.depositStatus === "deposited"
                  ? "bg-[#2ca87b] text-white"
                  : "bg-[#f5c842] text-black"
              }`}
            >
              {isDepositLoading ? <DepositSpinner /> : <ConfirmIcon />}
              {isDepositLoading
                ? "Đang cập nhật..."
                : order.depositStatus === "paid" || order.depositStatus === "deposited"
                  ? "Đã cọc"
                  : "Chưa cọc"}
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-[40px] py-3 text-[14px] font-medium text-white"
              style={{ backgroundImage: "linear-gradient(90deg, #5b8dee 0%, #7b5cf0 100%)" }}
            >
              <ShareIcon />
              Chia sẻ hoá đơn
            </button>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[40px] bg-[#ffe8e8] py-3 text-[14px] font-medium text-[#ff6b8a]"
          >
            <PrinterIcon size={18} />
            In đơn hàng
          </button>
        </section>
      </div>

      {/* ── Footer: provider selector + Ship ──────────────────────────── */}
      <div className="shrink-0 border-t border-black/10 bg-white px-4 pb-[env(safe-area-inset-bottom,8px)] pt-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCarrierOpen(true)}
            className="flex flex-1 items-center gap-2 overflow-hidden rounded-[40px] border border-black/10 bg-[#f2f2f2] px-4 py-3"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#d71920] text-[9px] font-bold text-white">
              VTP
            </div>
            <span className="min-w-0 flex-1 truncate text-left text-[14px] font-medium text-black">
              Viettel Post
            </span>
            <ChevronRightIcon />
          </button>
          <button
            type="button"
            onClick={() => setShowShippingCreateScreen(true)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-[40px] bg-[#f5c842] px-6 py-3 text-[14px] font-semibold text-black"
          >
            <ShipIcon />
            Ship
          </button>
        </div>
      </div>

      {/* ═══ DRAWER 2: Thêm mới sản phẩm ════════════════════════════════════ */}
      <DrawlerBase
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        title="Thêm mới"
        height="auto"
        footer={
          <div className="px-4 pb-2 pt-1">
            <GradientButton
              label={isAddingProduct ? "Đang lưu..." : "Lưu lại"}
              disabled={!canSaveProduct || isAddingProduct}
              onClick={() => void handleAddProduct()}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-5 px-4 pb-4">
          {/* Mã sản phẩm */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Mã</label>
            <div className="flex h-12 items-center rounded-xl border border-black/10 px-4">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Nhập mã sản phẩm"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
              />
            </div>
          </div>
          {/* Giá */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Giá</label>
            <div className="flex h-12 items-center gap-2 rounded-xl border border-black/10 px-4">
              <MoneyInput
                valueK={Number(newPrice) || 0}
                onChange={(k) => setNewPrice(String(k))}
              />
              <VndBadge />
            </div>
          </div>
          {/* Số lượng stepper */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Số lượng</label>
            <div className="flex h-12 items-center justify-between rounded-full bg-[#f2f2f2] px-1">
              <button
                type="button"
                onClick={() => setNewQty((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm"
              >
                <MinusIcon />
              </button>
              <span className="text-[16px] font-semibold text-black">
                {newQty}
              </span>
              <button
                type="button"
                onClick={() => setNewQty((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm"
              >
                <PlusIcon />
              </button>
            </div>
          </div>
        </div>
      </DrawlerBase>

      {/* ═══ DRAWER 3: Đối tác vận chuyển ════════════════════════════════════ */}
      <DrawlerBase
        open={carrierOpen}
        onOpenChange={setCarrierOpen}
        title="Đối tác vận chuyển"
        height="auto"
      >
        <div className="flex flex-col gap-1 px-4 pb-6">
          {/* Connected */}
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#787878]">
            Đã kết nối
          </p>
          {CARRIERS.filter((c) => c.linked).map((carrier) => (
            <div
              key={carrier.id}
              className="flex items-center gap-3 rounded-xl bg-[#f2f2f2] p-3"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${carrier.bgColor} text-[11px] font-bold text-white`}
              >
                {carrier.shortName}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-black">
                    {carrier.name}
                  </span>
                  {carrier.isDefault && (
                    <span className="rounded-full bg-[#edfaf4] px-2 py-0.5 text-[11px] font-medium text-[#2ca87b]">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#787878]">
                  {carrier.description}
                </p>
              </div>
            </div>
          ))}

          {/* Not connected */}
          <p className="mb-2 mt-4 text-[12px] font-medium uppercase tracking-wide text-[#787878]">
            Chưa kết nối
          </p>
          {CARRIERS.filter((c) => !c.linked).map((carrier) => (
            <button
              key={carrier.id}
              type="button"
              onClick={() => openLinkCarrier(carrier)}
              className="flex w-full items-center gap-3 rounded-xl border border-black/8 bg-white p-3 text-left"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${carrier.bgColor} text-[11px] font-bold text-white`}
              >
                {carrier.shortName}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[14px] font-medium text-black">
                  {carrier.name}
                </span>
                <p className="text-[12px] text-[#787878]">
                  {carrier.description}
                </p>
              </div>
              <ChevronRightIcon />
            </button>
          ))}
        </div>
      </DrawlerBase>

      {/* ═══ DRAWER 4: Thông tin liên kết ════════════════════════════════════ */}
      <DrawlerBase
        open={linkCarrierOpen}
        onOpenChange={setLinkCarrierOpen}
        title={selectedCarrier?.name ?? "Liên kết"}
        height="auto"
        footer={
          <div className="px-4 pb-2 pt-1">
            <GradientButton
              label="Kết nối"
              disabled={!linkAccount || !linkPassword}
              onClick={() => setLinkCarrierOpen(false)}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-5 px-4 pb-4">
          {/* Info toast */}
          <div className="flex items-start gap-2 rounded-xl bg-[#e9f2ff] p-3">
            <span className="mt-0.5 shrink-0 text-[#468adf]">
              <InfoIcon />
            </span>
            <p className="text-[13px] leading-5 text-[#468adf]">
              Nhập thông tin tài khoản{" "}
              {selectedCarrier?.name ?? "đơn vị vận chuyển"} để liên kết và
              tạo vận đơn tự động.
            </p>
          </div>

          {/* Tài khoản */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Tài khoản</label>
            <div className="flex h-12 items-center rounded-xl border border-black/10 px-4">
              <input
                type="tel"
                inputMode="tel"
                value={linkAccount}
                onChange={(e) => setLinkAccount(e.target.value)}
                placeholder="Số điện thoại"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#484848]">Mật khẩu</label>
            <div className="flex h-12 items-center gap-2 rounded-xl border border-black/10 px-4">
              <input
                type={showPassword ? "text" : "password"}
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                placeholder="••••••••"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[#787878]"
              >
                <EyeIcon />
              </button>
            </div>
          </div>

          {/* Default toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[#484848]">
              Đặt làm mặc định
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={linkIsDefault}
              onClick={() => setLinkIsDefault((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                linkIsDefault ? "bg-[#ff6b8a]" : "bg-[#d1d1d1]"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  linkIsDefault ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </DrawlerBase>
    </main>
  );
}
