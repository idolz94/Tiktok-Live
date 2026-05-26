"use client";

import { formatMoneyFromK } from "../../../utils/order";

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
    <div className="overflow-auto px-3 pb-[26px] [-webkit-overflow-scrolling:touch]">
      <div className="px-0 pt-[18px] pb-3">
        <h1 className="m-0 text-[22px] font-black text-[#273044]">Báo cáo</h1>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          Thống kê nhanh từ comment và đơn đã tạo
        </p>
      </div>

      <div className="mx-[-5px] flex flex-wrap">
        <div className="w-1/2 p-[5px]">
          <strong className="flex min-h-[86px] items-center rounded-[18px] bg-white p-[14px] text-[22px] font-black text-[#23c4f5] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
            {commentsCount}
          </strong>
          <span className="mt-[-28px] block px-[14px] pb-3 text-xs font-extrabold text-slate-500">
            Tổng comment
          </span>
        </div>

        <div className="w-1/2 p-[5px]">
          <strong className="flex min-h-[86px] items-center rounded-[18px] bg-white p-[14px] text-[22px] font-black text-[#23c4f5] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
            {buyingCount}
          </strong>
          <span className="mt-[-28px] block px-[14px] pb-3 text-xs font-extrabold text-slate-500">
            Comment có thể chốt
          </span>
        </div>

        <div className="w-1/2 p-[5px]">
          <strong className="flex min-h-[86px] items-center rounded-[18px] bg-white p-[14px] text-[22px] font-black text-[#23c4f5] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
            {ordersCount}
          </strong>
          <span className="mt-[-28px] block px-[14px] pb-3 text-xs font-extrabold text-slate-500">
            Tổng đơn
          </span>
        </div>

        <div className="w-1/2 p-[5px]">
          <strong className="flex min-h-[86px] items-center rounded-[18px] bg-white p-[14px] text-lg font-black text-[#23c4f5] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
            {formatMoneyFromK(totalRevenue)}
          </strong>
          <span className="mt-[-28px] block px-[14px] pb-3 text-xs font-extrabold text-slate-500">
            Doanh thu tạm tính
          </span>
        </div>
      </div>
    </div>
  );
}
