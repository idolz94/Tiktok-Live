"use client";

export default function StatsRow({
  commentsCount,
  buyingCount,
  ordersCount,
}: {
  commentsCount: number;
  buyingCount: number;
  ordersCount: number;
}) {
  return (
    <div className="mt-4 flex px-2">
      <div className="mx-1 flex-1 rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
        <strong className="block text-2xl font-black text-[#23c4f5]">{commentsCount}</strong>
        <span className="mt-1 block text-xs font-bold text-slate-500">Comment</span>
      </div>

      <div className="mx-1 flex-1 rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
        <strong className="block text-2xl font-black text-[#23c4f5]">{buyingCount}</strong>
        <span className="mt-1 block text-xs font-bold text-slate-500">Có thể chốt</span>
      </div>

      <div className="mx-1 flex-1 rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
        <strong className="block text-2xl font-black text-[#23c4f5]">{ordersCount}</strong>
        <span className="mt-1 block text-xs font-bold text-slate-500">Đơn</span>
      </div>
    </div>
  );
}
