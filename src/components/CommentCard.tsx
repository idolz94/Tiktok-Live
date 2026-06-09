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
  onCreateOrder,
  isOrderCreated: isOrderCreatedProp,
}: {
  item: LiveComment;
  onCreateOrder: (item: LiveComment) => void;
  isOrderCreated?: boolean;
}) {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const isPriority = isPriorityComment(item);
  const commentText = item.comment || "";
  const isCreatedOrder = Boolean(isOrderCreatedProp || item.isOrderCreated || item.orderId);
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
        "mb-3 flex rounded-[20px] border p-4 shadow-sm",
         isOwner && 'bg-[#d5e3f4]! border-[#eaf3ff]!',
        isPriority
          ? "border-green-400 bg-white"
          : "border-blue-100 bg-white",
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
                {item.customerTikTokUsername || `${item.username.replace("@", "")}`}
              </span>
            )}
          </div>

          {!isOwner && !isCreatedOrder && (
            <button
              type="button"
              disabled={isCreatingOrder}
              onClick={handleCreateOrder}
              className={[
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-black",
                isCreatingOrder ? "bg-slate-200 text-slate-400" : "bg-[#ffe4ee] text-[#ff5f8a] active:scale-95",
              ].join(" ")}
            >
              {isCreatingOrder ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#ff5f8a] border-t-transparent" />
                  Đang tạo
                </span>
              ) : (
                "Tạo đơn"
              )}
            </button>
          )}
        </div>

        <p className="mt-1.5 wrap-break-word text-[15px] leading-6 text-slate-700">
          <TikTokEmojiText text={commentText} />
        </p>

        {!isOwner && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            {isPriority && (
              <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 font-black text-yellow-700">
                👑 VIP
              </span>
            )}

            {item.matchedReasons && item.matchedReasons.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-600">
                {item.matchedReasons.join(" · ")}
              </span>
            )}

            {!isPriority && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-500">
                {getIntentText(String(item.intent || "unknown"))}
              </span>
            )}

            {isCreatedOrder && (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 font-bold text-blue-700">
                Đã tạo đơn
              </span>
            )}
          </div>
        )}

        {item.aiReason && (
          <div className="mt-2 rounded-xl bg-white/70 p-2 text-xs leading-5 text-slate-500">
            {item.aiReason}
          </div>
        )}

        {item.missingInfo && item.missingInfo.length > 0 && (
          <div className="mt-2 rounded-xl bg-red-50 p-2 text-xs font-semibold leading-5 text-red-600">
            Thiếu: {item.missingInfo.join(", ")}
          </div>
        )}

        <span className="mt-2 block text-xs text-slate-400">
          {formatTime(item.createdAt)}
        </span>
      </div>
    </article>
  );
}