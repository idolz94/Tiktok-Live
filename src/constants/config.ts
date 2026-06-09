export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// SSE hiện đi qua Backend Node.js, không gọi trực tiếp Python nữa.
// Nếu backend chạy riêng: NEXT_PUBLIC_API_URL=http://localhost:3001/api
export const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;

export const MAX_COMMENTS = 500;
export const RECONNECT_DELAY = 2000;

export const TIKTOK_USERNAME = process.env.NEXT_PUBLIC_TIKTOK_USERNAME || "conlavungday02";
