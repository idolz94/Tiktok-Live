"use client";

import { useState } from "react";
import { DrawlerBase } from "../components/ui/Drawler";
import { Order, OrderProduct } from "../types";
import { formatMoneyFromK, getOrderTotal } from "../utils/order";

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
function ShareIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 15V4m0 0 4 4m-4-4L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 13v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function ChevronDownIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ShipIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 7h11v9H3V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M14 10h3l3 3v3h-6v-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="2" /><circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="2" /></svg>;
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

function getProductLabel(product: OrderProduct) {
  return [product.code, product.name, product.variantName, product.color, product.size]
    .filter(Boolean).join(" ") || "Sản phẩm";
}

function statusLabel(status: Order["status"]) {
  const map: Record<string, string> = {
    confirmed: "Đã chốt", shipping: "Đang giao hàng",
    completed: "Hoàn thành", canceled: "Đã huỷ",
  };
  return map[status] ?? "Đơn nháp";
}

function ShippingOption({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex h-12 items-center justify-center rounded-[40px] border px-4 text-[14px] leading-[22px] font-medium ${
        active
          ? "border-[#f5c842] bg-[#fff8dc] text-black"
          : "border-black/10 bg-white text-[#484848]"
      }`}
    >
      {label}
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

function ShippingCreateScreen({
  order,
  onBack,
  productTotal,
}: {
  order: Order;
  onBack: () => void;
  productTotal: number;
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

  return (
    <main className="mx-auto flex min-h-screen max-w-[620px] flex-col bg-white text-black">
      <div className="flex-1 overflow-auto pb-[124px]">
        <header className="bg-white px-4 pb-4 pt-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f2f2]"
            >
              <BackIcon />
            </button>
            <button
              type="button"
              onClick={() => setDimensionsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f2f2]"
            >
              <SettingsIcon />
            </button>
          </div>
          <h1 className="mt-3 text-[22px] leading-7 font-semibold text-black">
            Tạo đơn hàng
          </h1>
        </header>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 font-semibold text-black">
            Thông tin người gửi
          </h2>
          <div className="mt-3 rounded-2xl border border-black/8 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[18px] font-semibold text-[#ff6b8a]">
                A
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[15px] font-semibold text-black">
                    Nguyễn Văn An
                  </p>
                  <button
                    type="button"
                    className="shrink-0 text-[13px] font-medium text-[#ff6b8a]"
                  >
                    Thay đổi
                  </button>
                </div>
                <p className="mt-1 text-[13px] leading-5 text-[#484848]">
                  0356 324 488
                </p>
                <p className="mt-1 text-[13px] leading-5 text-[#787878]">
                  76 Lê Lai, phường Bến Thành, Hồ Chí Minh
                </p>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 font-semibold text-black">
            Thông tin người nhận
          </h2>
          <button
            type="button"
            className="mt-3 flex h-14 w-full items-center justify-center rounded-xl border border-dashed border-[#ff6b8a] text-[14px] font-medium text-[#ff6b8a]"
          >
            Thêm mới
          </button>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 font-semibold text-black">
            Thông tin đơn hàng
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              ["Dài", `${dimLength} cm`],
              ["Rộng", `${dimWidth} cm`],
              ["Cao", `${dimHeight} cm`],
              ["Khối lượng", `${dimWeight} gram`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[#f2f2f2] p-3">
                <p className="text-[12px] leading-[18px] text-[#787878]">{label}</p>
                <p className="mt-1 text-[15px] font-semibold text-black">{value}</p>
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
          <h2 className="text-[16px] leading-6 font-semibold text-black">
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
          <h2 className="text-[16px] leading-6 font-semibold text-black">
            Hình thức thanh toán
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <ShippingOption label="Bên gửi trả phí" active />
            <ShippingOption label="Bên nhận trả phí" />
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 font-semibold text-black">
            Dịch vụ vận chuyển
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <ShippingOption label="Viettel Post chuyển nhanh" active />
            <ShippingOption label="Viettel Post chuyển tiết kiệm" />
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 font-semibold text-black">
            Điều kiện xem hàng
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <ShippingOption label="Không cho xem hàng" active />
            <ShippingOption label="Cho xem hàng không thử" />
            <ShippingOption label="Cho thử hàng" />
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 font-semibold text-black">
            Ghi chú
          </h2>
          <textarea
            placeholder="Nhập ghi chú"
            className="mt-3 min-h-24 w-full resize-none rounded-xl border border-black/10 p-4 text-[14px] outline-none placeholder:text-[#787878]"
          />
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[620px] -translate-x-1/2 border-t border-black/8 bg-white px-4 pb-8 pt-3">
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
    </main>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function OrderOverviewScreen({
  order,
  onBack,
  onToggleDeposit,
}: {
  order: Order;
  onBack: () => void;
  onToggleDeposit: (orderId: string) => void;
}) {
  // ── Drawer open states
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  // ── Calculated values
  const products = order.products || [];
  const productTotal = getOrderTotal(products);
  const shippingFee = localShippingFee;
  const prepaid = localPrepaid;
  const remain = productTotal + shippingFee - prepaid;
  const totalQuantity = products.reduce((s, p) => s + Number(p.quantity || 0), 0);
  const displayProducts = showAllProducts ? products : products.slice(0, 3);

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
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[620px] flex-col bg-white text-black">
      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto pb-[208px]">
        {/* Header */}
        <header className="bg-white px-4 pb-4 pt-3">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f2f2]"
            >
              <BackIcon />
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f2f2]"
            >
              <SettingsIcon />
            </button>
          </div>

          {/* Title + meta */}
          <div className="mt-3">
            <h1 className="text-[22px] leading-7 font-semibold text-black">
              Tổng quan đơn hàng
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[13px] leading-5 text-[#787878]">
                #{order.orderCode}
              </span>
              <span className="h-3 w-px bg-[#dadada]" />
              <span className="text-[13px] leading-5 text-[#787878]">
                {formatOrderDate(order.createdAt)}
              </span>
              <span
                className="ml-auto rounded-full bg-[#edfaf4] px-3 py-0.5 text-[13px] font-medium text-[#2ca87b]"
              >
                {statusLabel(order.status)}
              </span>
            </div>
          </div>

          {/* Customer */}
          <div className="mt-4 flex items-center gap-3">
            {order.avatarUrl ? (
              <img
                src={order.avatarUrl}
                alt={order.username}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe8e8] text-[18px] font-semibold text-[#ff6b8a]">
                {(order.customerName || order.username || "?")[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-semibold text-black">
                  {order.customerName || order.username}
                </span>
                <span className="rounded-[4px] bg-[#ffe8e8] px-1.5 py-0.5 text-[11px] font-medium text-[#ff6b8a]">
                  VIP
                </span>
              </div>
              <span className="text-[13px] text-[#787878]">
                @{order.username}
              </span>
            </div>
          </div>

          {/* Contact info */}
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[14px] text-[#484848]">
              <PhoneIcon />
              <span>Chưa có số điện thoại</span>
            </div>
            <div className="flex items-center gap-2 text-[14px] text-[#484848]">
              <AddressIcon />
              <span>Chưa có địa chỉ</span>
            </div>
          </div>

          {/* Action pills */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-black/10 text-[13px] font-medium text-black"
            >
              <TikTokIcon />
              TikTok
            </button>
            <button
              type="button"
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-black/10 text-[13px] font-medium text-black"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#06C755" />
                <path d="M38 22.7c0-7-7-12.7-15.5-12.7S7 15.7 7 22.7c0 6.3 5.6 11.5 13.1 12.5.5.1 1.2.4 1.4.9.2.4.1 1 .1 1l-.2 1.3c-.1.4-.4 1.5 1.3.8s9.4-5.5 12.8-9.5A11.4 11.4 0 0 0 38 22.7Z" fill="white" />
              </svg>
              Zalo
            </button>
            <button
              type="button"
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-black/10 text-[13px] font-medium text-black"
            >
              <PhoneIcon />
              Điện thoại
            </button>
          </div>
        </header>

        <Divider />

        {/* Products section */}
        <section className="px-4 py-4">
          <h2 className="text-[16px] font-semibold text-black">
            Danh sách sản phẩm
          </h2>

          <div className="mt-3 flex flex-col gap-3">
            {displayProducts.map((product, index) => (
              <div key={product.id || index} className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f2f2f2] text-[11px] font-semibold text-[#484848]">
                  {product.code?.slice(0, 3) || "SP"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-black">
                    {getProductLabel(product)}
                  </p>
                  <p className="text-[13px] text-[#787878]">
                    {formatMoneyFromK(Number(product.price || 0))} ×{" "}
                    {product.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-[14px] font-semibold text-[#ff6b8a]">
                  {formatMoneyFromK(
                    Number(product.price || 0) * Number(product.quantity || 0),
                  )}
                </span>
              </div>
            ))}
          </div>

          {products.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllProducts((v) => !v)}
              className="mt-3 text-[13px] text-[#787878] underline"
            >
              {showAllProducts
                ? "Thu gọn"
                : `Xem thêm ${products.length - 3} sản phẩm`}
            </button>
          )}

          {/* Add product button */}
          <button
            type="button"
            onClick={() => setAddProductOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#ff6b8a] py-3 text-[14px] font-medium text-[#ff6b8a]"
          >
            <PlusCircleIcon />
            Thêm mới
          </button>

          <div className="mt-4 flex items-center justify-between border-t border-black/8 pt-3">
            <span className="text-[14px] text-[#484848]">
              Tổng sản phẩm ({totalQuantity})
            </span>
            <span className="text-[16px] font-semibold text-[#ff6b8a]">
              {formatMoneyFromK(productTotal)}
            </span>
          </div>
        </section>

        <Divider />

        {/* Shipping section */}
        <section className="px-4 py-4">
          <h2 className="text-[16px] font-semibold text-black">
            Đơn vị vận chuyển
          </h2>

          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#484848]">Phí vận chuyển</span>
              <span className="text-[14px] font-medium text-black">
                {formatMoneyFromK(shippingFee)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#484848]">Trả trước</span>
              <span className="text-[14px] font-medium text-black">
                - {formatMoneyFromK(prepaid)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-black/8 pt-2">
              <span className="text-[14px] font-medium text-black">
                Còn lại
              </span>
              <span className="text-[16px] font-semibold text-[#ff6b8a]">
                {formatMoneyFromK(remain)}
              </span>
            </div>
          </div>

          {/* VTP Carrier card */}
          <button
            type="button"
            onClick={() => setCarrierOpen(true)}
            className="mt-4 flex w-full items-center gap-3 rounded-xl bg-[#f2f2f2] p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d71920] text-[11px] font-bold text-white">
              VTP
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[14px] font-medium text-black">Viettel Post</p>
              <p className="text-[12px] text-[#787878]">Mặc định</p>
            </div>
            <ChevronRightIcon />
          </button>
        </section>
      </div>

      {/* ── Fixed bottom bar ────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-[620px] -translate-x-1/2 border-t border-black/8 bg-white px-4 pb-8 pt-3">
        {/* Row 1: In đơn + Chốt đơn (deposit-status toggle) */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-[40px] bg-[#f5c842] py-3.5 text-[15px] font-medium text-black"
          >
            <PrinterIcon size={18} />
            In đơn
          </button>
          <button
            type="button"
            onClick={() => onToggleDeposit(order.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-[40px] py-3.5 text-[15px] font-medium ${
              order.depositStatus === "paid" || order.depositStatus === "deposited"
                ? "bg-[#2ca87b] text-white"
                : "bg-[#f5c842] text-black"
            }`}
          >
            <ConfirmIcon />
            {order.depositStatus === "paid" || order.depositStatus === "deposited"
              ? "Đã cọc"
              : "Chưa cọc"}
          </button>
        </div>

        {/* Row 2: Chia sẻ hoá đơn */}
        <button
          type="button"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-[40px] py-3.5 text-[15px] font-medium text-white"
          style={{ backgroundImage: "linear-gradient(90deg, #5b8dee 0%, #7b5cf0 100%)" }}
        >
          <ShareIcon />
          Chia sẻ hoá đơn
        </button>

        {/* Row 3: Carrier selector + Ship button */}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setCarrierOpen(true)}
            className="flex flex-1 items-center gap-2 rounded-[40px] border border-black/10 bg-white px-4 py-3"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d71920] text-[10px] font-bold text-white">
              VTP
            </div>
            <span className="flex-1 text-left text-[14px] font-medium text-black">
              VTP - Viettel Post
            </span>
            <ChevronDownIcon />
          </button>
          <button
            type="button"
            onClick={() => setShowShippingCreateScreen(true)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-[40px] bg-[#f5c842] px-5 py-3 text-[15px] font-semibold text-black"
          >
            <ShipIcon />
            Ship
          </button>
        </div>
      </div>

      {/* ═══ DRAWER 1: Cài đặt đơn hàng ════════════════════════════════════ */}
      <DrawlerBase
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        title="Cài đặt đơn hàng"
        height="auto"
        footer={
          <div className="px-4 pb-2 pt-1">
            <GradientButton
              label="Lưu"
              onClick={() => setSettingsOpen(false)}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-5 px-4 pb-4">
          {/* Phí vận chuyển */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] leading-[22px] text-[#484848]">
              Phí vận chuyển
            </label>
            <div className="flex h-12 items-center gap-2 rounded-xl border border-black/10 px-4">
              <input
                type="number"
                inputMode="numeric"
                value={localShippingFee === 0 ? "" : localShippingFee}
                onChange={(e) =>
                  setLocalShippingFee(Number(e.target.value) || 0)
                }
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
              />
              <VndBadge />
            </div>
          </div>
          {/* Trả trước */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] leading-[22px] text-[#484848]">
              Trả trước
            </label>
            <div className="flex h-12 items-center gap-2 rounded-xl border border-black/10 px-4">
              <input
                type="number"
                inputMode="numeric"
                value={localPrepaid === 0 ? "" : localPrepaid}
                onChange={(e) => setLocalPrepaid(Number(e.target.value) || 0)}
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
              />
              <VndBadge />
            </div>
          </div>
        </div>
      </DrawlerBase>

      {/* ═══ DRAWER 2: Thêm mới sản phẩm ════════════════════════════════════ */}
      <DrawlerBase
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        title="Thêm mới"
        height="auto"
        footer={
          <div className="px-4 pb-2 pt-1">
            <GradientButton
              label="Lưu lại"
              onClick={() => setAddProductOpen(false)}
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
              <input
                type="number"
                inputMode="numeric"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
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
