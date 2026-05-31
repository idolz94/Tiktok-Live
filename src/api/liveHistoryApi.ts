"use client";

import { getMeBootstrapApi } from "@/api/meApi";
import { createClient } from "@/lib/supabase/client";
import type { LiveComment, OrderWithTikTok } from "@/types";
import { normalizeApiOrderForUi } from "@/utils/order";
import { normalizeAtUsername } from "@/utils/tiktok";

export type LiveHistoryItem = {
  id: string; // DB live_sessions.id
  sessionId: string; // Python external session id
  username: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  commentCount: number;
  orderCount: number;
  status: "running" | "ended" | "error" | string;
  reason?: string;
  comments: LiveComment[];
  orders: OrderWithTikTok[];
  createdAt: string;
  updatedAt?: string;
};

type SaveLiveStartedPayload = {
  sessionId: string;
  username: string;
  startedAt: string;
};

type SaveLiveEndedPayload = {
  sessionId: string;
  username: string;
  startedAt?: string | null;
  endedAt: string;
  durationSeconds?: number;
  commentCount?: number;
  reason?: string;
};

function toNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function calcDurationSeconds(startedAt?: string | null, endedAt?: string | null) {
  if (!startedAt || !endedAt) return 0;

  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();

  if (!start || !end) return 0;

  return Math.max(0, Math.floor((end - start) / 1000));
}

function mapDbLiveComment(row: any): LiveComment {
  const customerTikTokUsername = normalizeAtUsername(row?.tiktok_username || row?.customer_tiktok_name || row?.customer_tiktok_username);
  const comment = String(row?.comment_text || "");

  return {
    id: String(row?.external_comment_id || row?.id || ""),
    dbId: String(row?.id || ""),
    username: String(row?.display_name || customerTikTokUsername || "Khách live"),
    displayName: String(row?.display_name || customerTikTokUsername || "Khách live"),
    customerTikTokUsername,
    uniqueId: customerTikTokUsername.replace("@", ""),
    avatar: String(row?.avatar_url || ""),
    avatarUrl: String(row?.avatar_url || ""),
    comment,
    intent: row?.intent || "normal",
    priorityLevel: row?.priority_level || "normal",
    finalScore: toNumber(row?.final_score),
    isOrderCreated: Boolean(row?.is_order_created),
    orderId: row?.order_id || "",
    createdAt: row?.created_at || new Date().toISOString(),
    raw: row,
  } as LiveComment;
}

export function mapDbLiveSession(row: any): LiveHistoryItem {
  const startedAt = row?.started_at || row?.created_at || new Date().toISOString();
  const endedAt = row?.ended_at || null;

  const comments = Array.isArray(row?.comments)
    ? row.comments.map(mapDbLiveComment)
    : [];

  const orders = Array.isArray(row?.orders)
    ? row.orders.map(normalizeApiOrderForUi)
    : [];

  return {
    id: String(row?.id || ""),
    sessionId: String(row?.external_session_id || row?.id || ""),
    username: normalizeAtUsername(row?.tiktok_username),
    startedAt,
    endedAt,
    durationSeconds: toNumber(row?.duration_seconds || calcDurationSeconds(startedAt, endedAt)),
    commentCount: toNumber(row?.comment_count || comments.length),
    orderCount: toNumber(row?.order_count || orders.length),
    status: row?.status || "ended",
    reason: row?.end_reason || "",
    comments,
    orders,
    createdAt: row?.created_at || startedAt,
    updatedAt: row?.updated_at || "",
  };
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

async function findLiveSessionByExternalId({
  shopId,
  sessionId,
}: {
  shopId: string;
  sessionId: string;
}) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("live_sessions")
    .select("*")
    .eq("shop_id", shopId)
    .eq("external_session_id", sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function attachOrdersAndComments(sessions: LiveHistoryItem[]) {
  if (sessions.length === 0) return sessions;

  const supabase = createClient();
  const sessionIds = sessions.map((session) => session.id).filter(Boolean);

  if (sessionIds.length === 0) return sessions;

  const [{ data: orders, error: orderError }, { data: comments, error: commentError }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .in("live_session_id", sessionIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("live_comments")
        .select("*")
        .in("live_session_id", sessionIds)
        .order("created_at", { ascending: false }),
    ]);

  if (orderError) throw new Error(orderError.message);
  if (commentError) throw new Error(commentError.message);

  const orderIds = (orders || []).map((order: any) => order.id);
  const itemsByOrderId = new Map<string, any[]>();

  if (orderIds.length > 0) {
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (orderItemsError) throw new Error(orderItemsError.message);

    (orderItems || []).forEach((item: any) => {
      const oldItems = itemsByOrderId.get(item.order_id) || [];
      oldItems.push(item);
      itemsByOrderId.set(item.order_id, oldItems);
    });
  }

  const ordersBySessionId = new Map<string, OrderWithTikTok[]>();
  const commentsBySessionId = new Map<string, LiveComment[]>();

  (orders || []).forEach((order: any) => {
    const sessionId = String(order.live_session_id || "");
    const oldOrders = ordersBySessionId.get(sessionId) || [];

    oldOrders.push(
      normalizeApiOrderForUi({
        ...order,
        products: itemsByOrderId.get(order.id) || [],
      }),
    );

    ordersBySessionId.set(sessionId, oldOrders);
  });

  (comments || []).forEach((comment: any) => {
    const sessionId = String(comment.live_session_id || "");
    const oldComments = commentsBySessionId.get(sessionId) || [];

    oldComments.push(mapDbLiveComment(comment));
    commentsBySessionId.set(sessionId, oldComments);
  });

  return sessions.map((session) => {
    const sessionOrders = ordersBySessionId.get(session.id) || [];
    const sessionComments = commentsBySessionId.get(session.id) || [];

    return {
      ...session,
      orders: sessionOrders,
      comments: sessionComments,
      orderCount: Math.max(session.orderCount || 0, sessionOrders.length),
      commentCount: Math.max(session.commentCount || 0, sessionComments.length),
    };
  });
}

function shouldShowLiveSession(session: LiveHistoryItem) {
  const durationSeconds = Number(session.durationSeconds || 0);
  const commentCount = Number(session.commentCount || session.comments?.length || 0);
  const orderCount = Number(session.orderCount || session.orders?.length || 0);

  // Không hiển thị các phiên rỗng do vừa start rồi stop/reconnect:
  // 0 giây + 0 comment + 0 đơn.
  return durationSeconds > 0 || commentCount > 0 || orderCount > 0;
}

export async function getLiveHistoryApi(limit = 100) {
  const supabase = createClient();
  const { shopId } = await getCurrentShop();

  const { data, error } = await supabase
    .from("live_sessions")
    .select("*")
    .eq("shop_id", shopId)
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const sessions = (data || []).map(mapDbLiveSession);
  const sessionsWithDetails = await attachOrdersAndComments(sessions);

  return sessionsWithDetails.filter(shouldShowLiveSession);
}

export async function saveLiveSessionStartedApi({
  sessionId,
  username,
  startedAt,
}: SaveLiveStartedPayload) {
  const supabase = createClient();
  const { shopId, userId } = await getCurrentShop();
  const externalSessionId = String(sessionId || "").trim();

  if (!externalSessionId) {
    throw new Error("Thiếu sessionId.");
  }

  const existed = await findLiveSessionByExternalId({
    shopId,
    sessionId: externalSessionId,
  });

  if (existed) {
    const { data, error } = await supabase
      .from("live_sessions")
      .update({
        tiktok_username: normalizeAtUsername(username),
        started_at: startedAt,
        status: "running",
        ended_at: null,
        end_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existed.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return mapDbLiveSession(data);
  }

  const { data, error } = await supabase
    .from("live_sessions")
    .insert({
      shop_id: shopId,
      created_by: userId,
      external_session_id: externalSessionId,
      tiktok_username: normalizeAtUsername(username),
      started_at: startedAt,
      status: "running",
      comment_count: 0,
      order_count: 0,
      duration_seconds: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return mapDbLiveSession(data);
}

export async function saveLiveSessionEndedApi({
  sessionId,
  username,
  startedAt,
  endedAt,
  durationSeconds,
  commentCount = 0,
  reason = "live_ended",
}: SaveLiveEndedPayload) {
  const supabase = createClient();
  const { shopId, userId } = await getCurrentShop();
  const externalSessionId = String(sessionId || "").trim();

  if (!externalSessionId) {
    throw new Error("Thiếu sessionId.");
  }

  const existed = await findLiveSessionByExternalId({
    shopId,
    sessionId: externalSessionId,
  });

  const finalStartedAt = startedAt || existed?.started_at || endedAt || new Date().toISOString();
  const finalDurationSeconds =
    typeof durationSeconds === "number"
      ? durationSeconds
      : calcDurationSeconds(finalStartedAt, endedAt);

  if (existed) {
    const { data, error } = await supabase
      .from("live_sessions")
      .update({
        tiktok_username: normalizeAtUsername(username),
        started_at: finalStartedAt,
        ended_at: endedAt,
        duration_seconds: finalDurationSeconds,
        comment_count: commentCount,
        status: reason === "live_error" ? "error" : "ended",
        end_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existed.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return mapDbLiveSession(data);
  }

  const { data, error } = await supabase
    .from("live_sessions")
    .insert({
      shop_id: shopId,
      created_by: userId,
      external_session_id: externalSessionId,
      tiktok_username: normalizeAtUsername(username),
      started_at: finalStartedAt,
      ended_at: endedAt,
      duration_seconds: finalDurationSeconds,
      comment_count: commentCount,
      order_count: 0,
      status: reason === "live_error" ? "error" : "ended",
      end_reason: reason,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return mapDbLiveSession(data);
}
