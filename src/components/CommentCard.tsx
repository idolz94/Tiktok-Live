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
  onPrintComment,
  isOrderCreated: isOrderCreatedProp,
}: {
  item: LiveComment;
  onCreateOrder: (item: LiveComment) => Promise<{ success: boolean; orderId: string }>;
  onPrintComment?: (item: LiveComment, orderId: string) => void;
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
            <img src={item.avatarUrl} alt="" className="size-4 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#ffe8ee] text-[8px] leading-none font-semibold text-[#ff5f8a]">
              {initial}
            </div>
          )}
          <p className="truncate text-[12px] leading-[18px] text-[#787878]">
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
  const isOwner = item.intent === "user" || (() => {
    const raw = item?.raw as Record<string, any> | undefined;
    const live = String(raw?.liveUsername || "").toLowerCase().replace(/^@/, "");
    const commenter = String(raw?.tiktok_username || raw?.tiktokUsername || "").toLowerCase().replace(/^@/, "");
    return live !== "" && commenter !== "" && live === commenter;
  })();

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
        showAnimatedBorder
          ? "bg-white"
          : isOwner
            ? "mb-3 border border-black/4 bg-[#f8f8f8]"
            : "mb-3 border border-black/8 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.13)]",
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
                onClick={() => onPrintComment?.(item, localOrderId || item.orderId || "")}
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
                    <span className="size-3 animate-spin rounded-full border-2 border-[#FF6B8A] border-t-transparent" />
                    Đang tạo
                  </span>
                ) : (
                  "Tạo đơn"
                )}
              </button>
            )
          )}
        </div>

        <p className="mt-1.5 text-[14px] leading-5 wrap-break-word text-[#2b2b2b]">
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
