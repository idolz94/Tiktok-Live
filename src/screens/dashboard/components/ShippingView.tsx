"use client";

import { Order } from "../../../types";

export default function ShippingView({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-auto px-3 pb-[26px] [-webkit-overflow-scrolling:touch] pt-[26px]">
      <div className="px-0 pt-[18px] pb-3">
        <h1 className="m-0 text-[22px] font-black text-[#273044]">Vận đơn</h1>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          Danh sách đơn chờ tạo vận đơn Viettel Post / đơn vị vận chuyển
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="m-0 text-[15px] leading-[22px] text-slate-500">
            Chưa có đơn để tạo vận đơn.
          </p>
        </div>
      ) : (
        orders.map((item) => (
          <article
            key={item.id}
            className="mb-3 block rounded-[20px] border border-gray-200 bg-white p-[14px] shadow-[0_8px_16px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-center justify-between">
              <strong className="text-[17px] font-black text-blue-600">{item.orderCode}</strong>
              <span className="rounded-full bg-amber-100 px-2.5 py-[5px] text-xs font-black text-amber-700">
                Chờ tạo vận đơn
              </span>
            </div>

            <h2 className="mt-2.5 text-base font-black text-[#273044]">{item.username}</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">{item.comment}</p>

            <div className="mt-3 flex">
              <button
                className="mr-2 min-h-[42px] flex-1 rounded-xl bg-blue-600 font-black text-white"
                type="button"
              >
                Tạo vận đơn
              </button>
              <button
                className="min-h-[42px] flex-1 rounded-xl bg-slate-200 font-black text-slate-700"
                type="button"
              >
                Chi tiết
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
