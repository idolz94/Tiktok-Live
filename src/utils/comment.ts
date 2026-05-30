import { LiveComment } from "../types";
import { createId } from "./id";
import { getCommentTikTokUsername } from "./tiktok";

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

function toStringArray(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toNumber(value: unknown, fallback = 0) {
  const nextValue = Number(value);

  if (Number.isNaN(nextValue)) return fallback;

  return nextValue;
}

export function normalizeComment(input: any): LiveComment | null {
  if (!input) return null;

  const id = String(input.id || createId());
  const comment = String(input.comment || input.text || input.rawText || input.raw_text || "").trim();

  if (!comment) return null;

  const customerTikTokUsername = getCommentTikTokUsername(input);
  const username = String(
    input.username || input.displayName || input.display_name || customerTikTokUsername || "Unknown user",
  );
  const displayName = String(input.displayName || input.display_name || username);
  const uniqueId = String(input.uniqueId || input.unique_id || input.tiktokUniqueId || input.tiktok_unique_id || "").trim();
  const createdAt = String(input.createdAt || input.created_at || new Date().toISOString());
  const avatar = String(input.avatar || input.avatarUrl || input.avatar_url || input.profilePictureUrl || "");

  return {
    id,
    username,
    displayName,
    customerTikTokUsername,
    uniqueId,
    avatar,
    avatarUrl: avatar,
    comment,
    intent: input.intent || detectIntent(comment),
    priorityLevel: input.priorityLevel || input.priority_level || "normal",
    finalScore: toNumber(input.finalScore || input.final_score, 0),
    aiScore: toNumber(input.aiScore || input.ai_score, 0),
    ruleScore: toNumber(input.ruleScore || input.rule_score, 0),
    aiStatus: input.aiStatus || input.ai_status || "none",
    aiReason: String(input.aiReason || input.ai_reason || ""),
    aiModel: input.aiModel,
    matchedReasons: toStringArray(input.matchedReasons || input.matched_reasons),
    missingInfo: toStringArray(input.missingInfo || input.missing_info),
    isOrderCreated: Boolean(input.isOrderCreated || input.is_order_created),
    orderId: input.orderId || input.order_id || "",
    createdAt,
    raw: input,
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

type RuleResult = {
  intent: LiveComment["intent"];
  priorityLevel: LiveComment["priorityLevel"];
  finalScore: number;
  matchedReasons: string[];
  missingInfo: string[];
  aiReason: string;
};

export function analyzeCommentByRule(comment: string): RuleResult {
  const text = comment.toLowerCase();

  const matchedReasons: string[] = [];
  const missingInfo: string[] = [];

  let score = 0;
  let intent: LiveComment["intent"] = "normal";

  const buyKeywords = ["chốt", "mua", "lấy", "order", "đặt", "xí", "xin giá"];
  const priceKeywords = ["bao nhiêu", "bn", "giá", "nhiêu tiền", "mấy tiền"];
  const stockKeywords = ["còn không", "còn ko", "còn hàng", "còn size", "còn màu"];
  const shippingKeywords = ["ship", "giao", "cod", "phí ship", "vận chuyển"];
  const productKeywords = ["mã", "size", "sz", "màu", "kg", "trắng", "đen", "đỏ", "xanh"];

  if (buyKeywords.some((keyword) => text.includes(keyword))) {
    score += 45;
    intent = "buying";
    matchedReasons.push("Có từ khóa mua/chốt");
  }

  if (/\d/.test(text)) {
    score += 20;
    matchedReasons.push("Có số/mã hàng/số lượng");
  }

  if (priceKeywords.some((keyword) => text.includes(keyword))) {
    score += 18;
    if (intent === "normal") intent = "ask_price";
    matchedReasons.push("Hỏi giá");
  }

  if (stockKeywords.some((keyword) => text.includes(keyword))) {
    score += 15;
    if (intent === "normal") intent = "ask_stock";
    matchedReasons.push("Hỏi tồn kho");
  }

  if (shippingKeywords.some((keyword) => text.includes(keyword))) {
    score += 12;
    if (intent === "normal") intent = "ask_shipping";
    matchedReasons.push("Hỏi ship/giao hàng");
  }

  if (productKeywords.some((keyword) => text.includes(keyword))) {
    score += 12;
    if (intent === "normal") intent = "ask_product";
    matchedReasons.push("Có thông tin sản phẩm");
  }

  if (text.length <= 2) {
    score -= 20;
    intent = "spam";
    matchedReasons.push("Comment quá ngắn");
  }

  if (intent === "buying" && !/\d/.test(text)) {
    missingInfo.push("mã hàng hoặc số lượng");
  }

  const finalScore = Math.max(0, Math.min(100, score));
  let priorityLevel: LiveComment["priorityLevel"] = "normal";

  if (finalScore >= 75) priorityLevel = "high";
  else if (finalScore >= 50) priorityLevel = "medium";
  else if (finalScore >= 25) priorityLevel = "low";

  return {
    intent,
    priorityLevel,
    finalScore,
    matchedReasons,
    missingInfo,
    aiReason:
      matchedReasons.length > 0
        ? `Rule phát hiện: ${matchedReasons.join(", ")}`
        : "Chưa phát hiện tín hiệu mua hàng rõ ràng",
  };
}

export function isPriorityComment(comment: LiveComment) {
  const score = Number(comment.finalScore || 0);
  const intent = String(comment.intent || "").toLowerCase();
  const priorityLevel = String(comment.priorityLevel || "").toLowerCase();

  const priorityIntents = [
    "buy",
    "buying",
    "ask_price",
    "ask_stock",
    "ask_shipping",
    "ask_product",
    "contact",
    "question",
  ];

  const ignoredIntents = ["normal", "spam", "unknown"];

  if (ignoredIntents.includes(intent) && score < 25) {
    return false;
  }

  return (
    score >= 25 ||
    priorityIntents.includes(intent) ||
    priorityLevel === "high" ||
    priorityLevel === "medium" ||
    priorityLevel === "low"
  );
}

export function createOrderCommentKey(comment: LiveComment) {
  const username = String(comment.customerTikTokUsername || comment.uniqueId || comment.username || "")
    .toLowerCase()
    .replace(/^@/, "")
    .trim();

  const text = String(comment.comment || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  return `${username}:${text}`;
}
