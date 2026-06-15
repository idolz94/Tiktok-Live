"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DrawlerBase } from "@/components/ui/Drawler";
import { Order } from "@/types";
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
import { getShippingFeeApi, submitOrderToGhtkApi, patchOrderApi } from "@/api/ordersApi";
import { BackIcon, SettingsIcon, MinusIcon, PlusIcon, PencilLineIcon } from "./icons";
import { Divider, InputField, GradientButton, ToggleSwitch, UnitBadge, RadioOptionRow, VndBadge } from "./shared";
import { AddressFormDrawer, type AddressFormState } from "./AddressFormDrawer";
import { AddressPickerDrawer } from "./AddressPickerDrawer";

type Props = {
  order: Order;
  onBack: () => void;
  onShippingSubmitted?: () => void;
  productTotal: number;
  userName?: string;
};

export function ShippingCreateScreen({ order, onBack, onShippingSubmitted, productTotal, userName }: Props) {
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

  const [senderPickerOpen, setSenderPickerOpen] = useState(false);
  const [senderFormOpen, setSenderFormOpen] = useState(false);
  const [senderFormInitial, setSenderFormInitial] = useState<Partial<AddressFormState> & { id?: string }>({});
  const [shopAddresses, setShopAddresses] = useState<ShopAddress[]>([]);
  const [shopAddressesLoading, setShopAddressesLoading] = useState(false);
  const [selectedSender, setSelectedSender] = useState<ShopAddress | null>(null);
  const [senderSaving, setSenderSaving] = useState(false);

  const [recipientPickerOpen, setRecipientPickerOpen] = useState(false);
  const [recipientFormOpen, setRecipientFormOpen] = useState(false);
  const [recipientFormInitial, setRecipientFormInitial] = useState<Partial<AddressFormState> & { id?: string }>({});
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  const [customerAddressesLoading, setCustomerAddressesLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<CustomerAddress | null>(null);
  const [recipientSaving, setRecipientSaving] = useState(false);

  const [paymentOption, setPaymentOption] = useState<"sender" | "receiver">("sender");
  const [transport, setTransport] = useState<"road" | "fly">("road");
  const [viewCondition, setViewCondition] = useState<string>("none");
  const [pickupOption, setPickupOption] = useState<"store" | "dropoff">("store");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feeLoading, setFeeLoading] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [feeError, setFeeError] = useState<string | null>(null);

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
        setRecipientPickerOpen(false);
        try {
          await patchOrderApi(order.id, { customerAddressId: created.id });
        } catch {
          // non-blocking
        }
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

  async function handleSubmitToGhtk() {
    if (!selectedSender) { toast.error("Vui lòng chọn địa chỉ người gửi."); return; }
    if (!selectedRecipient) { toast.error("Vui lòng chọn địa chỉ người nhận."); return; }
    if (!selectedRecipient.province || !selectedRecipient.district || !selectedRecipient.ward) {
      toast.error("Địa chỉ người nhận chưa có đầy đủ tỉnh/huyện/xã.");
      return;
    }

    setSubmitting(true);
    try {
      await submitOrderToGhtkApi(order.id, {
        pickName: selectedSender.name ?? "",
        pickAddress: selectedSender.address ?? "",
        pickProvince: selectedSender.province ?? "",
        pickDistrict: selectedSender.district ?? "",
        pickWard: selectedSender.ward ?? undefined,
        pickTel: selectedSender.phone ?? "",
        receiverName: selectedRecipient.name ?? order.customerName ?? "",
        receiverAddress: selectedRecipient.address ?? "",
        receiverProvince: selectedRecipient.province,
        receiverDistrict: selectedRecipient.district,
        receiverWard: selectedRecipient.ward,
        receiverTel: selectedRecipient.phone ?? order.customerPhone ?? "",
        note: note || undefined,
        isFreeShip: paymentOption === "sender" ? 1 : 0,
        transport,
        pickOption: pickupOption === "dropoff" ? "post" : "cod",
      });
      toast.success("Đã tạo đơn GHTK thành công!");
      if (onShippingSubmitted) {
        onShippingSubmitted();
      } else {
        onBack();
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Tạo đơn GHTK thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function fetchEstimatedFee() {
    if (
      !selectedSender?.province ||
      !selectedSender?.district ||
      !selectedRecipient?.province ||
      !selectedRecipient?.district
    ) {
      setEstimatedFee(null);
      return;
    }
    setFeeLoading(true);
    setFeeError(null);
    try {
      const result = await getShippingFeeApi(order.id, {
        pickProvince: selectedSender.province,
        pickDistrict: selectedSender.district,
        pickWard: selectedSender.ward ?? undefined,
        pickAddress: selectedSender.address ?? undefined,
        receiverProvince: selectedRecipient.province,
        receiverDistrict: selectedRecipient.district,
        receiverWard: selectedRecipient.ward ?? undefined,
        receiverAddress: selectedRecipient.address ?? undefined,
        weight: dimWeight ? Number(dimWeight) : undefined,
        transport,
      });
      setEstimatedFee(result.fee);
    } catch {
      setEstimatedFee(null);
      setFeeError("Không tính được phí ship.");
    } finally {
      setFeeLoading(false);
    }
  }

  useEffect(() => {
    void fetchEstimatedFee();
  }, [selectedSender?.id, selectedRecipient?.id, transport, dimWeight]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="mx-auto flex h-full w-full flex-col bg-white text-black">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between bg-white px-4 pt-3">
        <button type="button" onClick={onBack} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]">
          <BackIcon />
        </button>
        <h1 className="min-w-0 flex-1 px-4 text-center text-20 font-semibold leading-7 text-black">
          Tạo đơn hàng
        </h1>
        <button type="button" onClick={() => setDimensionsOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]">
          <SettingsIcon />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-[124px] [-webkit-overflow-scrolling:touch]">
        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">Thông tin người gửi</h2>
          {shopAddressesLoading ? (
            <div className="mt-3 animate-pulse rounded-[16px] bg-[#f2f2f2] p-[16px]">
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
            <div className="mt-3 flex flex-col gap-[16px] rounded-[16px] border-[0.5px] border-black/10 bg-[#f2f2f2] p-[16px]">
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
            <button
              type="button"
              onClick={() => { setSenderFormInitial({ name: userName ?? "" }); setSenderFormOpen(true); }}
              className="mt-3 flex h-14 w-full items-center justify-center rounded-xl border border-dashed border-[#ff6b8a] text-[14px] font-medium text-[#ff6b8a]"
            >
              Thêm mới
            </button>
          )}
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">Thông tin người nhận</h2>
          {customerAddressesLoading ? (
            <div className="mt-3 animate-pulse rounded-[16px] bg-[#f2f2f2] p-[16px]">
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
            <div className="mt-3 flex flex-col gap-[16px] rounded-[16px] border-[0.5px] border-black/10 bg-[#f2f2f2] p-[16px]">
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
            <button
              type="button"
              onClick={() => {
                if (!order.customerId) { toast.error("Đơn hàng chưa có khách hàng. Không thể thêm địa chỉ người nhận."); return; }
                setRecipientFormInitial({});
                setRecipientFormOpen(true);
              }}
              className="mt-3 flex h-14 w-full items-center justify-center rounded-xl border border-dashed border-[#ff6b8a] text-[14px] font-medium text-[#ff6b8a]"
            >
              Thêm mới
            </button>
          )}
        </section>

        <Divider />

        <section className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] leading-6 text-black">Thông tin đơn hàng</h2>
            <button type="button" onClick={() => setDimensionsOpen(true)} className="flex items-center gap-2">
              <PencilLineIcon />
              <span className="text-[14px] font-medium leading-[22px] text-black">Thay đổi</span>
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-[8px] rounded-[16px] border-[0.5px] border-black/10 bg-[#f2f2f2] p-[16px]">
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
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm">
              <MinusIcon />
            </button>
            <span className="text-[16px] font-semibold text-black">{totalQuantity || 2}</span>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm">
              <PlusIcon />
            </button>
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">Thông tin thanh toán</h2>
          <div className="mt-3 flex flex-col gap-4">
            <InputField label="Tiền thu hộ (COD)" suffix={<VndBadge />}>
              <input readOnly value={Number(order.codAmount ?? 0).toLocaleString("vi-VN")} className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none" />
            </InputField>
            <InputField label="Tạm tính" suffix={<VndBadge />}>
              <input readOnly value={Number(productTotal ?? 0).toLocaleString("vi-VN")} className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none" />
            </InputField>
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">Tùy chọn thanh toán</h2>
          <div className="mt-3 flex flex-col gap-3">
            <RadioOptionRow label="Bên gửi trả phí" active={paymentOption === "sender"} onClick={() => setPaymentOption("sender")} />
            <RadioOptionRow label="Bên nhận trả phí" active={paymentOption === "receiver"} onClick={() => setPaymentOption("receiver")} />
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">Gói dịch vụ</h2>
          <div className="mt-3 flex flex-col gap-3">
            <RadioOptionRow label="GHTK đường bộ" active={transport === "road"} onClick={() => setTransport("road")} />
            <RadioOptionRow label="GHTK hàng không" active={transport === "fly"} onClick={() => setTransport("fly")} />
          </div>
          {(feeLoading || estimatedFee !== null || feeError) && (
            <div className="mt-3 rounded-xl border border-black/10 px-4 py-3">
              {feeLoading ? (
                <p className="text-[13px] text-[#787878]">Đang tính phí ship...</p>
              ) : feeError ? (
                <p className="text-[13px] text-[#e55]">{feeError}</p>
              ) : estimatedFee !== null ? (
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#484848]">Phí dự kiến</span>
                  <span className="text-[14px] font-semibold text-black">{estimatedFee.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              ) : null}
            </div>
          )}
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">Lưu ý cho xem hàng</h2>
          <div className="mt-3 flex flex-col gap-3">
            <RadioOptionRow label="Không cho xem hàng" active={viewCondition === "none"} onClick={() => setViewCondition("none")} />
            <RadioOptionRow label="Cho xem hàng không thử" active={viewCondition === "view"} onClick={() => setViewCondition("view")} />
            <RadioOptionRow label="Cho thử hàng" active={viewCondition === "try"} onClick={() => setViewCondition("try")} />
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">Shipper lấy hàng</h2>
          <div className="mt-3 flex flex-col gap-3">
            <RadioOptionRow label="Tại cửa hàng" active={pickupOption === "store"} onClick={() => setPickupOption("store")} />
            <RadioOptionRow label="Gửi tại điểm dịch vụ" active={pickupOption === "dropoff"} onClick={() => setPickupOption("dropoff")} />
          </div>
        </section>

        <Divider />

        <section className="px-4 py-4">
          <h2 className="text-[16px] leading-6 text-black">Ghi chú</h2>
          <textarea
            placeholder="Nhập ghi chú"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-3 min-h-24 w-full resize-none rounded-xl border border-black/10 p-4 text-[14px] outline-none placeholder:text-[#787878]"
          />
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-black/8 bg-white px-4 pb-8 pt-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[14px] leading-[22px] text-[#484848]">Phí dự kiến</span>
          <span className="text-[18px] font-semibold text-black">
            {feeLoading ? "..." : estimatedFee !== null ? `${estimatedFee.toLocaleString("vi-VN")} VNĐ` : "—"}
          </span>
        </div>
        <GradientButton
          label={submitting ? "Đang tạo đơn..." : "Tạo đơn hàng"}
          disabled={submitting || !selectedSender || !selectedRecipient}
          onClick={handleSubmitToGhtk}
        />
      </div>

      <DrawlerBase open={dimensionsOpen} onOpenChange={setDimensionsOpen} title="Kích thước sản phẩm (SHIP)" height="auto">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl bg-[#eaf4ff] px-4 py-3 text-[14px] leading-[22px] text-[#0f5d9f]">
            Kích thước sẽ tự động nhân với số lượng sản phẩm (ví dụ: 5 sản phẩm = x5 lần)
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[15px] leading-6 font-medium text-black">Tự động nhân kích thước với số lượng</span>
            <ToggleSwitch on={autoScale} onToggle={() => setAutoScale((value) => !value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Dài" suffix={<UnitBadge unit="cm" />}>
              <input value={dimLength} onChange={(event) => setDimLength(event.target.value)} inputMode="decimal" className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none" />
            </InputField>
            <InputField label="Rộng" suffix={<UnitBadge unit="cm" />}>
              <input value={dimWidth} onChange={(event) => setDimWidth(event.target.value)} inputMode="decimal" className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none" />
            </InputField>
            <InputField label="Cao" suffix={<UnitBadge unit="cm" />}>
              <input value={dimHeight} onChange={(event) => setDimHeight(event.target.value)} inputMode="decimal" className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none" />
            </InputField>
            <InputField label="Khối lượng" suffix={<UnitBadge unit="Gram" />}>
              <input value={dimWeight} onChange={(event) => setDimWeight(event.target.value)} inputMode="decimal" className="min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none" />
            </InputField>
          </div>
          <GradientButton label="Lưu lại" onClick={() => setDimensionsOpen(false)} />
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
        onSelect={(a) => { setSelectedRecipient(a); setRecipientPickerOpen(false); void patchOrderApi(order.id, { customerAddressId: a.id }).catch(() => {}); }}
        onAdd={() => {
          if (!order.customerId) { toast.error("Đơn hàng chưa có khách hàng. Không thể thêm địa chỉ người nhận."); return; }
          setRecipientFormInitial({});
          setRecipientFormOpen(true);
        }}
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
