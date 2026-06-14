"use client";

import { LiveComment } from "../types";
import { formatTime } from "../utils/date";
import { isPriorityComment } from "../utils/comment";
import Avatar from "./Avatar";
import { useState } from "react";
import { TikTokEmojiText } from "@/components/TikTokEmojiText";


export default function CommentCard({
  item,
  onCreateOrder,
  onPrintOrder,
  isOrderCreated: isOrderCreatedProp,
}: {
  item: LiveComment;
  onCreateOrder: (item: LiveComment) => Promise<{ success: boolean; orderId: string }>;
  onPrintOrder?: (item: LiveComment, orderId: string) => void;
  isOrderCreated?: boolean;
}) {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [localOrderId, setLocalOrderId] = useState("");

  if (item.type === "user_joined") {
    const initial = (item.displayName || item.username || "?").trim().charAt(0).toUpperCase();
    return (
      <div className="flex w-full items-center gap-4 py-3">
        <div className="h-px flex-1 bg-[#d9d9d9]" />
        <div className="flex shrink-0 items-center gap-2">
          {item.avatarUrl ? (
            <img src={item.avatarUrl} alt="" className="h-4 w-4 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ffe8ee] text-[8px] font-semibold leading-none text-[#ff5f8a]">
              {initial}
            </div>
          )}
          <p className="max-w-40 truncate text-[12px] leading-[18px] text-[#787878]">
            {item.displayName || item.username} đã tham gia
          </p>
        </div>
        <div className="h-px flex-1 bg-[#d9d9d9]" />
      </div>
    );
  }

  const isPriority = isPriorityComment(item);
  const commentText = item.comment || "";
  const isCreatedOrder = Boolean(isOrderCreatedProp || item.isOrderCreated || item.orderId || localOrderId);
  const isOwner = item?.raw?.liveUsername === item?.raw?.tiktok_username;

  const handleCreateOrder = async () => {
    if (isCreatingOrder || isCreatedOrder) return;
    try {
      setIsCreatingOrder(true);
      const result = await onCreateOrder(item);
      if (result.success) setLocalOrderId(result.orderId);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const showAnimatedBorder = !isOwner && isPriority;

  const cardInner = (
    <article
      className={[
        "flex gap-[8px] rounded-[16px] p-[12px]",
        showAnimatedBorder ? "bg-white" : "mb-3 border border-black/[0.08] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.13)]",
      ].join(" ")}
    >
      <Avatar
        uri={item.avatar || item.avatarUrl}
        username={item.username}
        size={40}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-[14px] font-bold text-[#273044]">
              {item.displayName || item.username || "Unknown user"}
            </strong>

            {item.displayName && item.username && (
              <span className="mt-0.5 block truncate text-[12px] text-[#787878]">
                {item.customerTikTokUsername || item.username.replace("@", "")}
              </span>
            )}
          </div>

          {!isOwner && (
            isCreatedOrder ? (
              <button
                type="button"
                onClick={() => onPrintOrder?.(item, localOrderId || item.orderId || "")}
                className="shrink-0 rounded-full border border-[#dadada] px-3 py-[5px] text-[12px] font-medium text-[#2b2b2b] transition-all active:scale-95"
              >
                In lại
              </button>
            ) : (
              <button
                type="button"
                disabled={isCreatingOrder}
                onClick={handleCreateOrder}
                className="shrink-0 rounded-full bg-[#FFE8E8] px-4 py-[7px] text-[12px] font-medium text-[#FF6B8A] transition-opacity active:scale-95 disabled:opacity-70"
              >
                {isCreatingOrder ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#FF6B8A] border-t-transparent" />
                    Đang tạo
                  </span>
                ) : (
                  "Tạo đơn"
                )}
              </button>
            )
          )}
        </div>

        <p className="mt-1.5 wrap-break-word text-[14px] leading-5 text-[#2b2b2b]">
          <TikTokEmojiText text={commentText} />
        </p>

        {!isOwner && (item.matchedReasons?.length ?? 0) > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(item.matchedReasons?.length ?? 0) > 0 && (
              <span className="rounded-full bg-white px-2.5 py-[4px] text-[12px] font-medium text-[#2B2B2B]">
                {item.matchedReasons?.join(" · ")}
              </span>
            )}
          </div>
        )}

        {item.aiReason && (
          <div className="mt-2 rounded-xl bg-white/70 p-2 text-xs leading-5 text-slate-500">
            {item.aiReason}
          </div>
        )}

        <span className="mt-1.5 block text-[11px] text-[#9B9B9B]">
          {formatTime(item.createdAt)}
        </span>
      </div>
    </article>
  );

  if (showAnimatedBorder) {
    return (
      <div className="comment-card-priority-border mb-3">
        {cardInner}
      </div>
    );
  }

  return cardInner;
}
