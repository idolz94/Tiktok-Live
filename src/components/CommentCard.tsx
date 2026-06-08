"use client";

import { LiveComment } from "../types";
import { formatTime } from "../utils/date";
import { isPriorityComment } from "../utils/comment";
import Avatar from "./Avatar";
import { useState } from "react";
import { TikTokEmojiText } from "@/components/TikTokEmojiText";
function getIntentText(intent?: string) {
  const map: Record<string, string> = {
    buying: "Muốn mua",
    buy: "Muốn mua",
    ask_price: "Hỏi giá",
    ask_stock: "Hỏi tồn kho",
    ask_shipping: "Hỏi ship",
    ask_product: "Hỏi sản phẩm",
    question: "Câu hỏi",
    normal: "Bình thường",
    spam: "Spam",
    unknown: "Chưa rõ",
  };

  return map[String(intent || "unknown")] || String(intent || "Chưa rõ");
}

// function getPriorityText(level?: string) {
//   const map: Record<string, string> = {
//     high: "Ưu tiên cao",
//     medium: "Có khả năng mua",
//     low: "Quan tâm nhẹ",
//     normal: "Bình thường",
//   };

//   return map[String(level || "normal")] || String(level || "Bình thường");
// }

// function getScoreColor(score: number) {
//   if (score >= 75) return "bg-red-600 text-white";
//   if (score >= 50) return "bg-orange-500 text-white";
//   if (score >= 25) return "bg-yellow-100 text-yellow-700";

//   return "bg-slate-100 text-slate-600";
// }

export default function CommentCard({
  item,
  onCreateOrder
}: {
  item: LiveComment;
  onCreateOrder: (item: LiveComment) => void;

}) {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const isPriority = isPriorityComment(item);
  const commentText = item.comment || "";
  // const score = Number(item.finalScore || 0);
  const isCreatedOrder = Boolean(item.isOrderCreated || item.orderId);
  const isOwner = item?.raw?.liveUsername === item?.raw?.tiktok_username;
  const handleCreateOrder = async () => {
  if (isCreatingOrder || item.isOrderCreated) return;

  try {
    setIsCreatingOrder(true);

    await onCreateOrder?.(item);
  } finally {
    setIsCreatingOrder(false);
  }
};

  return (
    <article
      className={[
        "mb-3 flex rounded-[20px] border p-3.5 shadow-[0_8px_16px_rgba(15,23,42,0.08)]",
        (isPriority && !isOwner)
          ? "border-orange-300 bg-orange-50"
          : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <Avatar
        uri={item.avatar || item.avatarUrl}
        username={item.username}
        size={46}
      />

      <div className="ml-3 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-[15px] font-black text-[#273044]">
              {item.displayName || item.username || "Unknown user"}
            </strong>

            {item.displayName && item.username && (
              <span className="mt-0.5 block truncate text-xs font-semibold text-slate-400">
                {item.customerTikTokUsername || `@${item.username.replace("@", "")}`}
              </span>
            )}
          </div>

          {/* <div className="flex shrink-0 items-center gap-1.5">
            <span
              className={[
                "rounded-full px-2.5 py-1 text-xs font-black",
                getScoreColor(score),
              ].join(" ")}
            >
              {score}
            </span>
          </div> */}
        </div>

        <p className="mt-1.5 wrap-break-word text-base leading-6 text-slate-700">
          <TikTokEmojiText
            text={commentText}
          />
        </p>

        {!isOwner && (
               <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span
            className={[
              "rounded-full px-2.5 py-1 font-bold",
              isPriority
                ? "bg-orange-100 text-orange-700"
                : "bg-slate-100 text-slate-600",
            ].join(" ")}
          >
             {getIntentText(String(item.intent || "unknown"))}
          </span>

          {item.aiStatus === "pending" && (
            <span className="rounded-full bg-yellow-100 px-2.5 py-1 font-bold text-yellow-700">
              AI đang phân tích
            </span>
          )}

          {item.aiStatus === "done" && (
            <span className="rounded-full bg-green-100 px-2.5 py-1 font-bold text-green-700">
              AI đã phân tích
            </span>
          )}

          {item.aiStatus === "error" && (
            <span className="rounded-full bg-red-100 px-2.5 py-1 font-bold text-red-600">
              AI lỗi
            </span>
          )}

          {isCreatedOrder && (
            <span className="rounded-full bg-blue-100 px-2.5 py-1 font-bold text-blue-700">
              Đã tạo đơn
            </span>
          )}
        </div>

        )}

   

        {item.matchedReasons && item.matchedReasons.length > 0 && (
          <div className="mt-2 text-xs font-medium leading-5 text-slate-500">
            {item.matchedReasons.join(" · ")}
          </div>
        )}

        {item.aiReason && (
          <div className="mt-2 rounded-xl bg-white p-2 text-xs leading-5 text-slate-600">
            {item.aiReason}
          </div>
        )}

        {item.missingInfo && item.missingInfo.length > 0 && (
          <div className="mt-2 rounded-xl bg-red-50 p-2 text-xs font-semibold leading-5 text-red-600">
            Thiếu: {item.missingInfo.join(", ")}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {formatTime(item.createdAt)}
          </span>

      {!isOwner && (
            <button
        type="button"
        disabled={isCreatingOrder || item.isOrderCreated}
        onClick={handleCreateOrder}
        className={[
          "flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-black text-white transition",
          isCreatingOrder || item.isOrderCreated
            ? "bg-slate-300 text-slate-500"
            : "bg-blue-600 active:scale-95",
        ].join(" ")}
      >
        {isCreatingOrder && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}

        {item.isOrderCreated ? "Đã tạo" : "Tạo đơn"}
      </button>
      )}
  
        </div>
      </div>
    </article>
  );
}