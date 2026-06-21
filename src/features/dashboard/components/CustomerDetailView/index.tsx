"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomerWithTikTok } from "@/features/dashboard/types";
import { getCustomerByIdApi, getCustomerOrdersApi, updateCustomerApi } from "@/api/customersApi";
import type { OrderWithTikTok } from "@/types";
import type { CustomerAddress } from "@/lib/addresses";
import { listCustomerAddressesApi, createCustomerAddressApi, updateCustomerAddressApi, deleteCustomerAddressApi } from "@/lib/addresses";
import { formatMoneyFromK, getOrderTotal } from "@/utils/order";
import { AddressPickerDrawer } from "@/features/orders/components/AddressPickerDrawer";
import { AddressFormDrawer, type AddressFormState } from "@/features/orders/components/AddressFormDrawer";

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

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M7 12h10M11 18h2" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 12l2 2 4-4M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.6" />
      <path d="M12 7v1m0 8v1M9.5 10a2.5 2 0 0 1 5 0c0 1-1 1.5-2.5 2s-2.5 1-2.5 2a2.5 2 0 0 0 5 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.6" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="#484848" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#2b2b2b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type CustomerTab = "info" | "orders";

function getDepositStatusLabel(order: OrderWithTikTok): { label: string; bg: string; color: string } {
  if (order.depositStatus === "paid" || order.depositStatus === "deposited") {
    return { label: "Đã cọc", bg: "#e9f2ff", color: "#468adf" };
  }
  return { label: "Chưa cọc", bg: "#ffe8e8", color: "#ff4242" };
}

function getOrderStatusLabel(order: OrderWithTikTok): { label: string; bg: string; color: string } {
  if (order.status === "confirmed" || order.status === "packed" || order.status === "shipping" || order.status === "completed") {
    return { label: "Đã chốt", bg: "#d9ffee", color: "#2ca87b" };
  }
  return { label: "Đơn nháp", bg: "#f2f2f2", color: "#2b2b2b" };
}

function formatDateVN(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTimeVN(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function groupOrdersByDate(orders: OrderWithTikTok[]): { date: string; orders: OrderWithTikTok[] }[] {
  const map = new Map<string, OrderWithTikTok[]>();
  for (const order of orders) {
    const key = formatDateVN(order.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(order);
  }
  return Array.from(map.entries()).map(([date, orders]) => ({ date, orders }));
}

function OrderCard({ order }: { order: OrderWithTikTok }) {
  const subtotal = order.subtotalAmount && order.subtotalAmount > 0
    ? order.subtotalAmount
    : getOrderTotal(order.products);

  const depositTag = getDepositStatusLabel(order);
  const statusTag = getOrderStatusLabel(order);
  const time = formatTimeVN(order.createdAt);

  return (
    <div className="flex flex-col gap-1 px-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[14px] leading-[22px] font-medium text-black">
                {order.orderCode ? `#${order.orderCode}` : "Đơn hàng"}
              </p>
              <p className="text-[12px] leading-[18px] text-[#787878]">{time}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <span
              className="flex h-6 items-center rounded-2xl px-2 text-[12px] font-medium"
              style={{ backgroundColor: depositTag.bg, color: depositTag.color }}
            >
              {depositTag.label}
            </span>
            <span
              className="flex h-6 items-center rounded-2xl px-2 text-[12px] font-medium"
              style={{ backgroundColor: statusTag.bg, color: statusTag.color }}
            >
              {statusTag.label}
            </span>
          </div>
        </div>

        <div className="h-px bg-black/8" />
      </div>

      <div className="flex flex-col">
        {order?.products?.map((product, idx) => (
          <div key={product.id ?? idx} className="flex flex-col gap-3 pt-3">
            <div className="flex items-start gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-[14px] leading-[22px] text-[#2b2b2b]">{product.name || product.code || "Sản phẩm"}</p>
                <p className="text-[12px] leading-[18px] text-[#787878]">{time}</p>
              </div>
              <div className="flex w-[92px] shrink-0 flex-col items-end gap-0.5">
                <p className="text-right text-[14px] leading-[22px] font-medium whitespace-nowrap text-black">
                  {formatMoneyFromK(product.price)}
                </p>
                <p className="text-right text-[12px] leading-[18px] text-[#787878]">x{product.quantity}</p>
              </div>
            </div>
            <div className="h-px bg-black/8" />
          </div>
        ))}

        <div className="flex items-start gap-4 pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-[22px] text-[#2b2b2b]">Tạm tính</p>
          </div>
          <div className="flex w-[92px] shrink-0 items-end justify-end">
            <p className="text-right text-[14px] leading-[22px] font-medium whitespace-nowrap text-[#ff6b8a]">
              {formatMoneyFromK(subtotal)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 pt-4">
        <button
          type="button"
          className="flex h-10 flex-1 items-center justify-center rounded-[40px] bg-[#ffe8e8] text-[14px] font-medium text-[#ff6b8a]"
        >
          Gộp đơn
        </button>
        <button
          type="button"
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[40px] border border-[#dadada] text-[14px] font-medium text-black"
        >
          <ClipboardIcon />
          Tổng đơn hàng
        </button>
      </div>
    </div>
  );
}

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!customer.customerId) return;
    let cancelled = false;
    getCustomerByIdApi(customer.customerId).then((profile) => {
      if (cancelled) return;
      if (profile.customerType) setCustomerType(profile.customerType);
      if (profile.phone) setPhone(profile.phone);
      if (profile.referenceInfo) setReferenceInfo(profile.referenceInfo);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [customer.customerId]);

  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addressFormInitial, setAddressFormInitial] = useState<Partial<AddressFormState> & { id?: string }>({});
  const [addressSaving, setAddressSaving] = useState(false);

  const [customerOrders, setCustomerOrders] = useState<OrderWithTikTok[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const letter = (customer.username || "?").charAt(0).toUpperCase();

  useEffect(() => {
    if (activeTab !== "orders" || !customer.customerId) return;

    let cancelled = false;
    setOrdersLoading(true);
    getCustomerOrdersApi(customer.customerId)
      .then((orders) => {
        if (!cancelled) setCustomerOrders(orders);
      })
      .catch(() => {
        if (!cancelled) setCustomerOrders([]);
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, customer.customerId]);

  useEffect(() => {
    if (!customer.customerId) return;
    let cancelled = false;
    setAddressesLoading(true);
    listCustomerAddressesApi(customer.customerId)
      .then((list) => {
        if (!cancelled) setCustomerAddresses(list);
      })
      .catch(() => {
        if (!cancelled) setCustomerAddresses([]);
      })
      .finally(() => {
        if (!cancelled) setAddressesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customer.customerId]);

  const confirmedCount = customerOrders.filter(
    (o) => o.status === "confirmed" || o.status === "packed" || o.status === "shipping" || o.status === "completed",
  ).length;
  const paidCount = customerOrders.filter(
    (o) => o.depositStatus === "paid" || o.depositStatus === "deposited",
  ).length;
  const unpaidCount = customerOrders.filter((o) => o.depositStatus === "unpaid").length;
  const draftCount = customerOrders.filter((o) => o.status === "draft").length;
  const totalProductCount = customerOrders.reduce((sum, o) => sum + o.products.length, 0);
  const grouped = groupOrdersByDate(customerOrders);

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
      });
      toast.success("Đã lưu thông tin khách hàng.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lưu thông tin khách hàng thất bại.");
    } finally {
      setSaving(false);
    }
  };

  async function handleAddressFormSave(data: AddressFormState) {
    if (!customer.customerId) {
      toast.error("Khách hàng chưa được lưu. Không thể lưu địa chỉ.");
      return;
    }
    setAddressSaving(true);
    try {
      if (addressFormInitial.id) {
        const updated = await updateCustomerAddressApi(customer.customerId, addressFormInitial.id, data);
        setCustomerAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const created = await createCustomerAddressApi(customer.customerId, data);
        setCustomerAddresses((prev) => [...prev, created]);
      }
      setAddressFormOpen(false);
    } catch {
      toast.error("Lưu địa chỉ thất bại");
    } finally {
      setAddressSaving(false);
    }
  }

  async function handleDeleteAddress(a: CustomerAddress) {
    if (!customer.customerId) return;
    try {
      await deleteCustomerAddressApi(customer.customerId, a.id);
      setCustomerAddresses((prev) => prev.filter((x) => x.id !== a.id));
    } catch {
      toast.error("Xoá địa chỉ thất bại");
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto pb-32 [-webkit-overflow-scrolling:touch]">
        <div className="px-4 pt-2 pb-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex size-8 shrink-0 items-center justify-center rounded-full"
                aria-label="Quay lại"
              >
                <ChevronLeftIcon />
              </button>
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.username}
                  className="size-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[15px] font-semibold text-[#ff6b8a]">
                  {letter}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[16px] leading-6 font-medium text-black">{customer.username}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (customer?.customerTikTokUsername) window.open(`https://www.tiktok.com/${customer?.customerTikTokUsername}`, "_blank");
                }}
                disabled={!customer.customerTikTokUsername}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black disabled:opacity-40"
              >
                <TikTokIcon size={20} />
                Tiktok
              </button>
              <button
                type="button"
                onClick={() => {
                  if (phone) window.open(`https://zalo.me/${phone.replace(/\D/g, "")}`, "_blank");
                }}
                disabled={!phone}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black disabled:opacity-40"
              >
                <ZaloIcon />
                Zalo
              </button>
              <button
                type="button"
                onClick={() => {
                  if (phone) window.location.href = `tel:${phone.replace(/\D/g, "")}`;
                }}
                disabled={!phone}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black disabled:opacity-40"
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
              {addressesLoading ? (
                <div className="h-20 animate-pulse rounded-xl bg-[#f2f2f2]" />
              ) : customerAddresses.length === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setAddressFormInitial({});
                    setAddressFormOpen(true);
                  }}
                  className="flex h-12 items-center justify-center gap-2 rounded-lg border border-dashed border-black/20"
                >
                  <PlusIcon />
                  <span className="text-[14px] text-[#484848]">Thêm mới</span>
                </button>
              ) : (() => {
                const def = customerAddresses.find((a) => a.isDefault) ?? customerAddresses[0];
                return (
                  <div className="flex flex-col gap-3 rounded-xl border border-black/10 bg-[#fafafa] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-[15px] font-semibold text-[#468adf]">
                        {def.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <p className="min-w-0 flex-1 text-[15px] font-semibold text-black">{def.name}</p>
                      <button
                        type="button"
                        onClick={() => setAddressPickerOpen(true)}
                        className="flex shrink-0 items-center gap-1"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#484848" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#484848" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[13px] font-medium text-[#484848]">Thay đổi</span>
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {def.phone && (
                        <div className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.63a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#787878" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <p className="text-[13px] leading-5 text-[#484848]">{def.phone}</p>
                        </div>
                      )}
                      {(def.address || def.ward || def.district || def.province) && (
                        <div className="flex items-start gap-2">
                          <svg className="mt-px shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#787878" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="#787878" strokeWidth="1.8"/></svg>
                          <p className="text-[13px] leading-5 text-[#484848]">
                            {[def.ward, def.district, def.province].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <AddressPickerDrawer
              open={addressPickerOpen}
              onOpenChange={setAddressPickerOpen}
              title="Địa chỉ giao hàng"
              addresses={customerAddresses}
              loading={addressesLoading}
              selected={customerAddresses.find((a) => a.isDefault) ?? customerAddresses[0] ?? null}
              onSelect={(a) => {
                setCustomerAddresses((prev) => prev.map((x) => ({ ...x, isDefault: x.id === a.id })));
                setAddressPickerOpen(false);
              }}
              onAdd={() => {
                setAddressFormInitial({});
                setAddressPickerOpen(false);
                setAddressFormOpen(true);
              }}
              onEdit={(a) => {
                setAddressFormInitial({ id: a.id, name: a.name ?? "", phone: a.phone ?? "", address: a.address ?? "", province: a.province ?? "", district: a.district ?? "", ward: a.ward ?? "", label: a.label ?? "home", isDefault: a.isDefault ?? false });
                setAddressPickerOpen(false);
                setAddressFormOpen(true);
              }}
              onDelete={handleDeleteAddress}
            />

            <AddressFormDrawer
              open={addressFormOpen}
              onOpenChange={setAddressFormOpen}
              title={addressFormInitial.id ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              initial={addressFormInitial}
              saving={addressSaving}
              onSave={handleAddressFormSave}
            />
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Status summary cards */}
            <div className="flex flex-col gap-5 px-4 pt-3 pb-4">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="flex flex-1 items-start gap-3 rounded-xl border border-black/10 bg-[#edfaf4] p-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2ca87b]">
                      <CheckBadgeIcon />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="text-[18px] leading-6 font-semibold text-black">{confirmedCount}</p>
                      <p className="text-[12px] leading-[18px] text-[#484848]">Đã chốt</p>
                    </div>
                  </div>
                  <div className="flex flex-1 items-start gap-3 rounded-xl border border-black/10 bg-[#e9f2ff] p-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#468adf]">
                      <MoneyIcon />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="text-[18px] leading-6 font-semibold text-black">{paidCount}</p>
                      <p className="text-[12px] leading-[18px] text-[#484848]">Đã cọc</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-start gap-3 rounded-xl border border-black/10 bg-[#ffe8e8] p-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ff4242]">
                      <XCircleIcon />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="text-[18px] leading-6 font-semibold text-black">{unpaidCount}</p>
                      <p className="text-[12px] leading-[18px] text-[#484848]">Chưa cọc</p>
                    </div>
                  </div>
                  <div className="flex flex-1 items-start gap-3 rounded-xl border border-black/10 bg-[#f2f2f2] p-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white">
                      <ShoppingBagIcon />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="text-[18px] leading-6 font-semibold text-black">{draftCount}</p>
                      <p className="text-[12px] leading-[18px] text-[#484848]">Đơn nháp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product count + filter */}
            <div className="flex items-center justify-between px-4 py-2">
              <p className="text-[20px] leading-6 font-semibold text-black">{totalProductCount} sản phẩm</p>
              <div className="flex items-center gap-2">
                <FilterIcon />
                <span className="text-[14px] font-medium text-black">Filter</span>
              </div>
            </div>

            {/* Orders list */}
            {ordersLoading ? (
              <div className="flex flex-col gap-4 px-4 pt-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-[#f2f2f2]" />
                ))}
              </div>
            ) : !customer.customerId ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-[15px] text-[#8c8c8c]">Khách hàng chưa được lưu.</p>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-[15px] text-[#8c8c8c]">Chưa có đơn hàng.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-4">
                {grouped.map(({ date, orders: dateOrders }, groupIdx) => (
                  <div key={date} className="flex flex-col gap-2">
                    {groupIdx > 0 && <div className="h-2 bg-[#f2f2f2]" />}
                    <div className="flex items-center gap-2 px-4 py-2">
                      <div className="size-1.5 shrink-0 rounded-full bg-[#2b2b2b]" />
                      <p className="text-[14px] leading-[22px] text-[#2b2b2b]">{date}</p>
                    </div>
                    <div className="flex flex-col gap-8">
                      {dateOrders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
