"use client";

import { Order, OrderProduct } from "../types";
import { createProductFromComment, formatMoneyFromK, getOrderTotal } from "../utils/order";
import Avatar from "./Avatar";
import ProductTable from "./ProductTable";
import { getOrderTikTokUsername, openTikTokProfile } from "@/utils/tiktok";
function createDisplayCode(orderCode: string) {
  const numbers = orderCode.replace(/\D/g, "");
  return `#${(numbers || orderCode).slice(-6).padStart(6, "0")}`;
}

export default function OrderCard({
  item,
  onUpdate,
  onDelete,
  onAddProduct,
  onToggleDeposit,
  onConfirmOrder,
  onOpenOverview,
}: {
  item: Order;
  onUpdate: (id: string, field: keyof Order, value: string) => void;
  onDelete: (id: string) => void;
  onAddProduct?: (orderId: string, product: OrderProduct) => void;
  onToggleDeposit?: (orderId: string) => void;
  onConfirmOrder?: (orderId: string) => void;
  onOpenOverview?: (orderId: string) => void;
}) {
  const total = getOrderTotal(item.products || []);
  const isPaid = item.depositStatus === "paid";
  const isConfirmed = item.status === "confirmed";

  const tiktokUsername = getOrderTikTokUsername(item);

  return (
    <article className="mb-2.5 border-b-[6px] border-slate-100 bg-white p-4 shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
      <div className="flex items-start">
        <Avatar uri={item.avatar} username={item.username} size={58} />

        <div className="ml-3 min-w-0 flex-1">
          <strong className="block text-lg font-black text-[#3478f6]">
            {createDisplayCode(item.orderCode)}
          </strong>
          <h3 className="mt-1 text-[19px] leading-[25px] font-black text-[#273044]">
            {item.username || "Unknown user"}
          </h3>

          {tiktokUsername && (
            <button
              type="button"
              onClick={() => openTikTokProfile(tiktokUsername)}
              className="mt-0.5 block max-w-full truncate text-left text-sm font-black text-blue-600"
            >
              {tiktokUsername}
            </button>
          )}

          <div className="mt-2 flex items-center">
            <span className="mr-2 inline-flex min-w-14 items-center justify-center rounded-[5px] bg-[#e8b72e] px-2.5 py-[3px] text-[15px] font-black text-white">
              VIP
            </span>
            <span className="mr-1 inline-flex min-h-[26px] min-w-[30px] items-center justify-center rounded-[7px] border border-gray-300 text-sm text-gray-500">
              ⌖
            </span>
            <span className="mr-1 inline-flex min-h-[26px] min-w-[30px] items-center justify-center rounded-[7px] border border-gray-300 text-sm text-gray-500">
              ☎
            </span>
          </div>
        </div>

        <div className="ml-2 flex flex-col items-end">
          <button
          type="button"
          onClick={() => openTikTokProfile(tiktokUsername)}
          disabled={!tiktokUsername}
          className="flex items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-black text-white disabled:bg-slate-200 disabled:text-slate-400"
        >
          Mở TikTok
        </button>
          <span
            className={`rounded-md px-2.5 py-1 text-[15px] font-black whitespace-nowrap text-white ${isConfirmed ? "bg-green-500" : "bg-[#e6b936]"}`}
          >
            {isConfirmed ? "Đã Chốt" : "⊖ Đơn Nháp"}
          </span>

          <div className="mt-2 flex">
            <button
              className="ml-2 h-12 w-12 rounded-[9px] border border-gray-300 bg-slate-50 text-[21px] text-gray-500"
              onClick={() => onDelete(item.id)}
              type="button"
            >
              🗑
            </button>
            <button
              className="ml-2 h-12 w-12 rounded-[9px] border border-gray-300 bg-slate-50 text-[21px] text-gray-500"
              type="button"
            >
              ▣
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-end">
        <div className="flex-1">
          <p className="m-0 text-lg leading-6 font-semibold text-gray-500">{item.comment}</p>
          <span className="mt-1 block text-sm font-bold text-gray-500 italic">
            {new Date(item.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center pl-2 text-[22px] text-gray-500">
          <span>🗑</span>
          <span className="text-2xl text-gray-300">│</span>
          <span>▣</span>
        </div>
      </div>

      <div className="mt-3 h-px bg-gray-300" />

      <div className="mt-2.5 flex items-end justify-between">
        <div>
          <span className="block text-base text-gray-500 italic">Tạm tính</span>
          <strong className="mt-0.5 block text-[17px] font-black text-[#273044]">
            {formatMoneyFromK(total)}
          </strong>
        </div>

        <span className="text-lg text-[#7c7c7c] italic">Thêm ghi chú ✎</span>
      </div>

      <ProductTable
        products={item.products || []}
        onAddProduct={
          onAddProduct
            ? () => onAddProduct(item.id, createProductFromComment(item.comment))
            : undefined
        }
      />

      <div className="mt-[14px]">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-slate-600">
            Tên đơn / sản phẩm
          </span>
          <input
            value={item.productName}
            onChange={(event) => onUpdate(item.id, "productName", event.target.value)}
            placeholder="Tên sản phẩm"
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      <div className="mt-[14px] flex">
        <button
          className={`mr-3 min-h-12 flex-1 rounded-[9px] border text-[17px] font-black ${isPaid ? "border-green-500 bg-green-200 text-green-700" : "border-[#45b75a] bg-green-100 text-gray-900"}`}
          onClick={() => onToggleDeposit?.(item.id)}
          type="button"
        >
          {isPaid ? "ĐÃ CỌC" : "CHƯA CỌC"}
        </button>

        <button
          className={`min-h-12 flex-1 rounded-[9px] text-[17px] font-black text-white ${isConfirmed ? "bg-green-500" : "bg-[#e8b72e]"}`}
          onClick={() => onOpenOverview?.(item.id)}
          type="button"
        >
          TỔNG ĐƠN
        </button>
      </div>

      {onConfirmOrder ? null : null}
    </article>
  );
}
