"use client";

import { LiveComment } from "../types";
import { formatTime } from "../utils/date";
import Avatar from "./Avatar";

export default function CommentCard({
  item,
  onCreateOrder,
}: {
  item: LiveComment;
  onCreateOrder: (item: LiveComment) => void;
}) {
  const isBuying = item.intent === "buying";
  const commentText = item.comment || item.text || "";

  return (
    <article
      className={`mb-3 flex rounded-[20px] border p-[14px] shadow-[0_8px_16px_rgba(15,23,42,0.08)] ${isBuying ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"}`}
    >
      <Avatar uri={item.avatar} username={item.username} size={46} />

      <div className="ml-3 min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <strong className="mr-2 min-w-0 flex-1 truncate text-[15px] font-black text-[#273044]">
            {item.username || "Unknown user"}
          </strong>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${isBuying ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
          >
            {isBuying ? "Có thể chốt" : "Thường"}
          </span>
        </div>

        <p className="mt-1.5 text-base leading-[23px] break-words text-slate-700">{commentText}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {formatTime(item.created_at || item.createdAt)}
          </span>

          <button
            type="button"
            onClick={() => onCreateOrder(item)}
            className="rounded-xl bg-blue-600 px-4 py-3 font-bold text-white"
          >
            Tạo đơn
          </button>
        </div>
      </div>
    </article>
  );
}
