"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CustomerWithTikTok } from "../types";
import { updateCustomerApi } from "@/api/customersApi";

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="#2b2b2b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.01a8.16 8.16 0 0 0 4.77 1.52V7.07a4.85 4.85 0 0 1-1-.38z"
        fill="currentColor"
      />
    </svg>
  );
}

function ZaloIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 15V9l3 4V9M14 15h3M15.5 9h-3.5v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.6 21 3 12.4 3 5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="#787878" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18" stroke="#484848" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

type CustomerTab = "info" | "orders";

export default function CustomerDetailView({
  customer,
  onBack,
}: {
  customer: CustomerWithTikTok;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<CustomerTab>("info");
  const [customerType, setCustomerType] = useState("Lẻ");
  const [phone, setPhone] = useState("");
  const [referenceInfo, setReferenceInfo] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const letter = (customer.username || "?").charAt(0).toUpperCase();
  const tiktokHandle = customer.customerTikTokUsername || "";

  const handleSave = async () => {
    if (!customer.customerId) {
      toast.error("Chưa có mã khách hàng để cập nhật.");
      return;
    }

    try {
      setSaving(true);
      await updateCustomerApi(customer.customerId, {
        customerType,
        phone,
        referenceInfo,
        shippingAddress,
      });
      toast.success("Đã lưu thông tin khách hàng.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lưu thông tin khách hàng thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="relative flex shrink-0 items-center justify-center px-4 pt-6 pb-4">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={onBack}
          className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[16px] font-semibold leading-6 text-black">Chi tiết khách hàng</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-32 [-webkit-overflow-scrolling:touch]">
        <div className="px-4 pb-5 pt-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.username}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[15px] font-semibold text-[#ff6b8a]">
                  {letter}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-medium leading-6 text-black">{customer.username}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <HashIcon />
                  <span className="text-[12px] leading-4.5 text-[#484848]">
                    {tiktokHandle ? `@${tiktokHandle}` : customer.username}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black"
              >
                <TikTokIcon size={20} />
                Tiktok
              </button>
              <button
                type="button"
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black"
              >
                <ZaloIcon />
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

        <div className="relative flex border-b border-black/10 px-4">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`flex flex-1 items-center justify-center pb-2 text-[16px] font-medium ${
              activeTab === "info"
                ? "border-b-2 border-[#ff6b8a] text-[#ff6b8a]"
                : "text-[#787878]"
            }`}
          >
            Thông tin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex flex-1 items-center justify-center pb-2 text-[16px] font-medium ${
              activeTab === "orders"
                ? "border-b-2 border-[#ff6b8a] text-[#ff6b8a]"
                : "text-[#787878]"
            }`}
          >
            Đơn hàng
          </button>
        </div>

        {activeTab === "info" ? (
          <div className="flex flex-col gap-5 px-4 py-5">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-5.5 text-[#484848]">Loại khách hàng</label>
              <div className="flex flex-col gap-1">
                <div className="relative flex h-12 items-center rounded-lg border border-black/10 px-4">
                  <select
                    value={customerType}
                    onChange={(event) => setCustomerType(event.target.value)}
                    className="h-full flex-1 appearance-none bg-transparent text-[14px] text-black outline-none"
                  >
                    <option value="Lẻ">Lẻ</option>
                    <option value="Sỉ">Sỉ</option>
                    <option value="VIP">VIP</option>
                  </select>
                  <svg className="pointer-events-none" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-[12px] leading-4.5 text-[#484848]">
                  Tỉ lệ đánh giá tốt từ các shop: {customer.totalOrders}/{customer.totalOrders}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-5.5 text-[#484848]">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Nhập số điện thoại"
                className="flex h-12 items-center rounded-lg border border-black/10 px-4 text-[14px] text-black outline-none placeholder:text-[#c0c0c0]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-5.5 text-[#484848]">Thông tin tham khảo</label>
              <textarea
                value={referenceInfo}
                onChange={(event) => setReferenceInfo(event.target.value)}
                placeholder="Nhập thông tin"
                rows={3}
                className="min-h-22 resize-none rounded-lg border border-black/10 px-4 py-3 text-[14px] leading-5.5 text-black outline-none placeholder:text-[#787878]"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[14px] leading-5.5 text-[#484848]">Địa chỉ giao hàng</label>
              {shippingAddress ? (
                <textarea
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  rows={3}
                  className="min-h-22 resize-none rounded-lg border border-black/10 px-4 py-3 text-[14px] leading-5.5 text-black outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShippingAddress(" ")}
                  className="flex h-12 items-center justify-center gap-2 rounded-lg border border-dashed border-black/20"
                >
                  <PlusIcon />
                  <span className="text-[14px] text-[#484848]">Thêm mới</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[15px] text-[#8c8c8c]">
              {customer.totalOrders === 0 ? "Chưa có đơn hàng." : `${customer.totalOrders} đơn hàng`}
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full border-t border-black/10 bg-white px-4 pt-2 pb-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center rounded-[40px] py-4 text-[16px] font-medium text-black disabled:opacity-70"
          style={{
            backgroundImage: "linear-gradient(138.46deg, #ff6b8a 13.52%, #ffa66d 52.12%, #ffc86a 117.76%)",
          }}
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  );
}
