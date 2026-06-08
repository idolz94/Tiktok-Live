"use client";

import { useState } from "react";
import { Order } from "../../../types";
import { Divider, GradientButton, InputField, ShippingOption, VndBadge } from "./shared";
import { BackIcon, MinusIcon, PlusIcon, SettingsIcon } from "./icons";
import { ShippingSettingsDrawer } from "./ShippingSettingsDrawer";

export function ShippingCreateScreen({
  order,
  onBack,
  productTotal,
}: {
  order: Order;
  onBack: () => void;
  productTotal: number;
}) {
  const totalQuantity = (order.products || []).reduce(
    (sum, p) => sum + Number(p.quantity || 0),
    0,
  );

  const [dimensionsOpen, setDimensionsOpen] = useState(false);
  const [dimLength] = useState("40");
  const [dimWidth] = useState("40");
  const [dimHeight] = useState("10");
  const [dimWeight] = useState("200");

  const formattedTotal = productTotal
    ? String(productTotal * 1000).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    : "40.000";

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-white text-black">
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
                  <p className="text-[15px] font-semibold text-black">Nguyễn Văn An</p>
                  <button type="button" className="shrink-0 text-[13px] font-medium text-[#ff6b8a]">
                    Thay đổi
                  </button>
                </div>
                <p className="mt-1 text-[13px] leading-5 text-[#484848]">0356 324 488</p>
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
                <p className="text-[12px] leading-4.5 text-[#787878]">{label}</p>
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
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-5.5 text-black outline-none"
              />
            </InputField>
            <InputField label="Tổng giá trị hàng hóa" suffix={<VndBadge />}>
              <input
                readOnly
                value={formattedTotal}
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-5.5 text-black outline-none"
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
          <h2 className="text-[16px] leading-6 font-semibold text-black">Ghi chú</h2>
          <textarea
            placeholder="Nhập ghi chú"
            className="mt-3 min-h-24 w-full resize-none rounded-xl border border-black/10 p-4 text-[14px] outline-none placeholder:text-[#787878]"
          />
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-black/8 bg-white px-4 pb-8 pt-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[14px] leading-5.5 text-[#484848]">Phí dự kiến</span>
          <span className="text-[18px] font-semibold text-black">0 ₫</span>
        </div>
        <GradientButton label="Tạo đơn hàng" disabled />
      </div>

      <ShippingSettingsDrawer open={dimensionsOpen} onOpenChange={setDimensionsOpen} />
    </main>
  );
}
