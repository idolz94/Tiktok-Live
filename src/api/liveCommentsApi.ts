"use client";

import { getMeBootstrapApi } from "@/api/meApi";
import { createClient } from "@/lib/supabase/client";
import type { LiveComment } from "@/types";
import { getCommentTikTokUsername, normalizeAtUsername } from "@/utils/tiktok";

type SaveLiveCommentPayload = {
  liveSessionId: string;
  comment: LiveComment;
};

function getCommentText(comment: LiveComment) {
  return String(comment.comment || "").trim();
}

function getDisplayName(comment: LiveComment) {
  return String(comment.displayName || comment.username || "Khách live").trim();
}

function getAvatarUrl(comment: LiveComment) {
  return String(comment.avatarUrl || comment.avatar || "").trim();
}

async function getCurrentShop() {
  const me = await getMeBootstrapApi();

  if (!me.user) {
    throw new Error("Vui lòng đăng nhập lại.");
  }

  if (!me.shop?.id) {
    throw new Error("Không tìm thấy shop.");
  }

  return {
    shopId: me.shop.id,
    userId: me.user.id,
  };
}

export async function saveLiveCommentApi({ liveSessionId, comment }: SaveLiveCommentPayload) {
  if (!liveSessionId) return null;

  const commentText = getCommentText(comment);
  if (!commentText) return null;

  const supabase = createClient();
  const { shopId } = await getCurrentShop();
  const externalCommentId = String(comment.id || "").trim();

  if (!externalCommentId) return null;

  const { data, error } = await supabase
    .from("live_comments")
    .upsert(
      {
        shop_id: shopId,
        live_session_id: liveSessionId,
        external_comment_id: externalCommentId,
        tiktok_username: normalizeAtUsername(getCommentTikTokUsername(comment)),
        display_name: getDisplayName(comment),
        avatar_url: getAvatarUrl(comment),
        comment_text: commentText,
        intent: comment?.intent || "normal",
        priority_level: comment.priorityLevel || "normal",
        final_score: Number(comment.finalScore || 0),
        is_order_created: Boolean(comment.isOrderCreated),
        order_id: comment.orderId || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "shop_id,external_comment_id",
      },
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return data;
}
