"use client";

import { CustomerSummary } from "../types";

type CustomerWithTikTok = CustomerSummary & {
  customerTikTokUsername?: string;
};

export default function CustomersView({ customers }: { customers: CustomerWithTikTok[] }) {
  return (
    <div className="overflow-auto px-3 pb-[26px] [-webkit-overflow-scrolling:touch]">
      <div className="px-0 pt-[18px] pb-3">
        <h1 className="m-0 text-[22px] font-black text-[#273044]">Khách hàng</h1>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          Tổng hợp khách đã comment hoặc đã tạo đơn
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="m-0 text-[15px] leading-[22px] text-slate-500">
            Chưa có khách hàng. Khi có comment hoặc tạo đơn, khách sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        customers.map((item) => {
          const tiktokUsername = item.customerTikTokUsername || "";

          return (
            <article
              key={tiktokUsername || item.username}
              className="mb-3 flex rounded-[20px] border border-gray-200 bg-white p-3.5 shadow-[0_8px_16px_rgba(15,23,42,0.08)]"
            >
              <div className="mr-3 inline-flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-black text-blue-600">
                {item.username.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="m-0 text-base font-black text-[#273044]">{item.username}</h2>
                {tiktokUsername && (
                  <p className="mt-0.5 text-sm font-bold text-blue-600">{tiktokUsername}</p>
                )}
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                  {item.latestComment || "Chưa có comment"}
                </p>
                <div className="mt-2.5 flex">
                  <span className="mr-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">
                    {item.totalComments} comment
                  </span>
                  <span className="mr-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">
                    {item.totalOrders} đơn
                  </span>
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
