"use client";

import { TOKEN_TO_UNICODE } from "@/constants/emoji";
import React from "react";
"@tiktok-emojis/react";


type TikTokEmojiTextProps = {
  text?: string | null;
  className?: string;
};


export function renderTikTokEmojiTokens(text?: string | null) {
  return String(text || "").replace(/\[([a-zA-Z0-9_]+)\]/g, (match, token) => {
    const emoji = TOKEN_TO_UNICODE[String(token).toLowerCase()];

    return emoji || match;
  });
}

export function TikTokEmojiText({
  text,
  className = "",
}: TikTokEmojiTextProps) {
  const value = renderTikTokEmojiTokens(text);

  if (!value) return null;

  return (
    <span className={["whitespace-pre-wrap wrap-break-word", className].join(" ")}>
      {value}
    </span>
  );
}