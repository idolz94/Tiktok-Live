"use client";

import { getRequest, postRequest } from "@/lib/request";
import type { LiveComment } from "@/types";
import { getCommentTikTokUsername, normalizeAtUsername } from "@/utils/tiktok";

type SaveLiveCommentPayload = {
  liveSessionId: string;
  comment: LiveComment;
};

function getCommentText(comment: LiveComment) {
  const data = comment as Record<string, any>;
  return String(data.text || data.comment || data.message || data.raw_text || "").trim();
}

function getDisplayName(comment: LiveComment) {
  return String(comment.displayName || comment.username || "Khách live").trim();
}

function getAvatarUrl(comment: LiveComment) {
  return String(comment.avatarUrl || comment.avatar || "").trim();
}

export async function saveLiveCommentApi({ liveSessionId, comment }: SaveLiveCommentPayload) {
  if (!liveSessionId) return null;

  const commentText = getCommentText(comment);
  if (!commentText) return null;

  const externalCommentId = String(comment.id || "").trim();
  if (!externalCommentId) return null;

  return postRequest<any>("/live-comments", {
    liveSessionId,
    comment,
    externalCommentId,
    tiktokUsername: normalizeAtUsername(getCommentTikTokUsername(comment)),
    displayName: getDisplayName(comment),
    avatarUrl: getAvatarUrl(comment),
    commentText,
    intent: comment.intent || "normal",
    priorityLevel: comment.priorityLevel || "normal",
    finalScore: Number(comment.finalScore || 0),
    isOrderCreated: Boolean(comment.isOrderCreated),
    orderId: comment.orderId || null,
  });
}

export type RunningSessionResponse = {
  session: {
    id: string;
    shopId: string;
    tiktokUsername: string;
    externalSessionId: string;
    status: string;
    startedAt: string | null;
    commentCount: number;
  } | null;
  comments: any[];
};

export async function getRunningSessionApi(): Promise<RunningSessionResponse> {
  return getRequest<RunningSessionResponse>("/live-stream/running-session");
}
