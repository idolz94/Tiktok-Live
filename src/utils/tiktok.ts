export function cleanTikTokUsername(username?: string | null) {
  return String(username || "")
    .trim()
    .replace(/^@/, "");
}

export function normalizeAtUsername(username?: string | null) {
  const value = String(username || "").trim();

  if (!value) return "";

  return value.startsWith("@") ? value : `@${value}`;
}

export function getTikTokProfileUrl(username?: string | null) {
  const cleanUsername = cleanTikTokUsername(username);

  if (!cleanUsername) return "";

  return `https://www.tiktok.com/@${cleanUsername}`;
}

export function openTikTokProfile(username?: string | null) {
  const url = getTikTokProfileUrl(username);

  if (!url) {
    alert("Không tìm thấy TikTok username của khách.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

export function getCommentTikTokUsername(comment: any) {
  const username = String(
    comment?.uniqueId ||
      comment?.customer_tiktok_username ||
      "",
  ).trim();

  return normalizeAtUsername(username);
}

export function getOrderTikTokUsername(order: any) {
  const username = String(
    order?.customerTikTokUsername ||
      order?.customer_tiktok_username ||
      order?.tiktokUsername ||
      order?.tiktok_username ||
      order?.uniqueId ||
      order?.unique_id ||
      order?.customer?.tiktok_username ||
      order?.customers?.tiktok_username ||
      "",
  ).trim();

  return normalizeAtUsername(username);
}
