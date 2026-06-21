"use client";

import { formatMoneyFromK } from "@/utils/order";

export default function ReportsView({
  commentsCount,
  buyingCount,
  ordersCount,
  totalRevenue,
}: {
  commentsCount: number;
  buyingCount: number;
  ordersCount: number;
  totalRevenue: number;
}) {
  return (
    <div className="h-full overflow-y-auto px-3 pt-3 pb-6.5 [-webkit-overflow-scrolling:touch]">
      <div className="-mx-1.25 flex flex-wrap">
        <div className="w-1/2 p-1.25">
          <strong className="flex min-h-21.5 items-center rounded-[18px] bg-white p-3.5 text-[22px] font-black text-[#23c4f5] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
            {commentsCount}
          </strong>
          <span className="-mt-7 block px-3.5 pb-3 text-xs font-extrabold text-slate-500">
            Tổng comment
          </span>
        </div>

        <div className="w-1/2 p-1.25">
          <strong className="flex min-h-21.5 items-center rounded-[18px] bg-white p-3.5 text-[22px] font-black text-[#23c4f5] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
            {buyingCount}
          </strong>
          <span className="-mt-7 block px-3.5 pb-3 text-xs font-extrabold text-slate-500">
            Comment có thể chốt
          </span>
        </div>

        <div className="w-1/2 p-1.25">
          <strong className="flex min-h-21.5 items-center rounded-[18px] bg-white p-3.5 text-[22px] font-black text-[#23c4f5] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
            {ordersCount}
          </strong>
          <span className="-mt-7 block px-3.5 pb-3 text-xs font-extrabold text-slate-500">
            Tổng đơn
          </span>
        </div>

        <div className="w-1/2 p-1.25">
          <strong className="flex min-h-21.5 items-center rounded-[18px] bg-white p-3.5 text-lg font-black text-[#23c4f5] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
            {formatMoneyFromK(totalRevenue)}
          </strong>
          <span className="-mt-7 block px-3.5 pb-3 text-xs font-extrabold text-slate-500">
            Doanh thu tạm tính
          </span>
        </div>
      </div>
    </div>
  );
}
