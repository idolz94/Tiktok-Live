import { LiveComment } from "../types";
import { createId } from "./id";

export function detectIntent(comment: string): "buying" | "normal" {
  const text = comment.toLowerCase();

  const buyingKeywords = [
    "chốt",
    "mua",
    "lấy",
    "order",
    "đặt",
    "ship",
    "ib",
    "inbox",
    "size",
    "sz",
    "màu",
    "bao nhiêu",
    "còn không",
    "còn ko",
    "kg",
  ];

  return buyingKeywords.some((keyword) => text.includes(keyword)) ? "buying" : "normal";
}

export function normalizeComment(input: any): LiveComment | null {
  if (!input) return null;

  const id = String(input.id || createId());
  const username = String(input.username || input.nickname || input.uniqueId || "Unknown user");
  const comment = String(input.comment || input.text || input.raw_text || "").trim();

  if (!comment) return null;

  const createdAt = input.createdAt || input.created_at || new Date().toISOString();

  return {
    id,
    username,
    comment,
    text: comment,
    raw_text: input.raw_text,
    avatar: input.avatar,
    uniqueId: input.uniqueId,
    intent: input.intent || detectIntent(comment),
    created_at: createdAt,
    createdAt,
  };
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h} giờ ${m} phút`;
  if (m > 0) return `${m} phút ${s} giây`;
  return `${s} giây`;
}

export function formatDate(dateString?: string | null) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}
export function removeAt(username: string) {
  return String(username || "").replace(/^@/, "");
}

export function normalizeTikTokUsername(value: string) {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return "";
  return cleanValue.startsWith("@") ? cleanValue : `@${cleanValue}`;
}