"use client";

import { getMeBootstrapApi } from "@/api/meApi";
import { createClient } from "@/lib/supabase/client";
import type { LiveComment, OrderWithTikTok } from "@/types";
import { normalizeApiOrderForUi } from "@/utils/order";
import { getCommentTikTokUsername } from "@/utils/tiktok";

type CreateOrderFromCommentPayload = {
  comment: LiveComment;
  liveSessionId?: string | null;
  price?: number;
  quantity?: number;
  note?: string;
};

const DEFAULT_PRICE = 20;
const DEFAULT_QUANTITY = 1;

function isUuid(value?: string | null) {
  if (!value) return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function createOrderCode() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, "0");

  return `DH${yyyy}${mm}${dd}${hh}${mi}${ss}${random}`;
}

function getCommentText(comment: LiveComment) {
  const data = comment as Record<string, any>;

  return String(data.text || data.comment || data.message || data.raw_text || "").trim();
}

function getCommentDisplayName(comment: LiveComment) {
  const data = comment as Record<string, any>;

  return String(
    data.displayName ||
      data.display_name ||
      data.username ||
      data.nickname ||
      data.name ||
      getCommentTikTokUsername(comment) ||
      "Khách live",
  ).trim();
}

function getCommentAvatar(comment: LiveComment) {
  const data = comment as Record<string, any>;

  return String(
    data.avatar || data.avatarUrl || data.avatar_url || data.profilePictureUrl || "",
  ).trim();
}

async function getCurrentShop() {
  const me = await getMeBootstrapApi();

  if (!me.user) {
    throw new Error("Vui lòng đăng nhập lại.");
  }

  if (!me.shop?.id) {
    throw new Error("Không tìm thấy shop.");
  }

  if (!me.canUseApp) {
    throw new Error("Shop đã hết hạn dùng thử hoặc chưa có license.");
  }

  return {
    shopId: me.shop.id,
    userId: me.user.id,
  };
}

async function findOrCreateCustomer({
  shopId,
  tiktokUsername,
  displayName,
  avatarUrl,
}: {
  shopId: string;
  tiktokUsername: string;
  displayName: string;
  avatarUrl: string;
}) {
  const supabase = createClient();

  if (!tiktokUsername) return null;

  const { data: existedCustomer, error: findError } = await supabase
    .from("customers")
    .select("*")
    .eq("shop_id", shopId)
    .eq("tiktok_username", tiktokUsername)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (existedCustomer) return existedCustomer;

  const { data: newCustomer, error: createError } = await supabase
    .from("customers")
    .insert({
      shop_id: shopId,
      tiktok_username: tiktokUsername,
      display_name: displayName,
      avatar_url: avatarUrl,
      total_orders: 0,
      total_spent: 0,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (createError) throw new Error(createError.message);

  return newCustomer;
}

async function updateCustomerAfterOrder({
  customerId,
  totalAmount,
}: {
  customerId: string;
  totalAmount: number;
}) {
  const supabase = createClient();

  const { data: customer, error: findError } = await supabase
    .from("customers")
    .select("id,total_orders,total_spent")
    .eq("id", customerId)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (!customer) return;

  const { error } = await supabase
    .from("customers")
    .update({
      total_orders: Number(customer.total_orders || 0) + 1,
      total_spent: Number(customer.total_spent || 0) + totalAmount,
      last_order_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) throw new Error(error.message);
}

async function updateLiveSessionOrderCount(liveSessionId?: string | null) {
  if (!isUuid(liveSessionId)) return;

  const supabase = createClient();

  const { data: liveSession, error: findError } = await supabase
    .from("live_sessions")
    .select("id,order_count")
    .eq("id", liveSessionId)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (!liveSession) return;

  const { error } = await supabase
    .from("live_sessions")
    .update({
      order_count: Number(liveSession.order_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", liveSessionId);

  if (error) throw new Error(error.message);
}

async function updateLiveCommentOrder({
  commentId,
  orderId,
}: {
  commentId?: string | null;
  orderId: string;
}) {
  if (!isUuid(commentId)) return;

  const supabase = createClient();

  const { error } = await supabase
    .from("live_comments")
    .update({
      is_order_created: true,
      order_id: orderId,
    })
    .eq("id", commentId);

  if (error) throw new Error(error.message);
}

async function findDbLiveCommentId({
  shopId,
  comment,
}: {
  shopId: string;
  comment: LiveComment;
}) {
  const commentRecord = comment as Record<string, any>;

  if (isUuid(commentRecord.dbId)) return String(commentRecord.dbId);
  if (isUuid(commentRecord.liveCommentId)) return String(commentRecord.liveCommentId);
  if (isUuid(commentRecord.id)) return String(commentRecord.id);

  const externalCommentId = String(commentRecord.id || "").trim();
  if (!externalCommentId) return null;

  const supabase = createClient();

  const { data, error } = await supabase
    .from("live_comments")
    .select("id")
    .eq("shop_id", shopId)
    .eq("external_comment_id", externalCommentId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data?.id || null;
}


export async function getOrdersApi(): Promise<OrderWithTikTok[]> {
  const supabase = createClient();
  const { shopId } = await getCurrentShop();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });

  if (ordersError) throw new Error(ordersError.message);

  const orderRows = orders || [];
  if (!orderRows.length) return [];

  console.log("orderRows :",orderRows);

  const orderIds = orderRows.map((item: any) => item.id);

  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  if (orderItemsError) throw new Error(orderItemsError.message);

  const itemsByOrderId = new Map<string, any[]>();

  (orderItems || []).forEach((item: any) => {
    const currentItems = itemsByOrderId.get(item.order_id) || [];
    currentItems.push(item);
    itemsByOrderId.set(item.order_id, currentItems);
  });

  return orderRows.map((order: any) =>
    normalizeApiOrderForUi({
      ...order,
      products: itemsByOrderId.get(order.id) || [],
    }),
  );
}

export async function createOrderFromCommentApi({
  comment,
  liveSessionId,
  price = DEFAULT_PRICE,
  quantity = DEFAULT_QUANTITY,
  note = "",
}: CreateOrderFromCommentPayload) {
  const supabase = createClient();
  const { shopId, userId } = await getCurrentShop();

  const commentText = getCommentText(comment);
  const customerTikTokUsername = getCommentTikTokUsername(comment);
  const displayName = getCommentDisplayName(comment);
  const avatarUrl = getCommentAvatar(comment);

  if (!commentText) {
    throw new Error("Comment không có nội dung để tạo đơn.");
  }

  const customer = await findOrCreateCustomer({
    shopId,
    tiktokUsername: customerTikTokUsername,
    displayName,
    avatarUrl,
  });

  const subtotalAmount = price * quantity;
  const shippingFee = 0;
  const discountAmount = 0;
  const codAmount = subtotalAmount + shippingFee - discountAmount;

  const liveCommentId = await findDbLiveCommentId({ shopId, comment });
  const dbLiveSessionId = isUuid(liveSessionId) ? liveSessionId : null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      shop_id: shopId,
      customer_id: customer?.id || null,
      live_session_id: dbLiveSessionId,
      live_comment_id: liveCommentId,
      order_code: createOrderCode(),
      source: "live_comment",
      customer_name: displayName,
      customer_tiktok_username: customerTikTokUsername,
      customer_phone: "",
      customer_address: "",
      comment_text: commentText,
      status: "draft",
      deposit_status: "unpaid",
      payment_status: "unpaid",
      shipping_status: "not_shipped",
      subtotal_amount: subtotalAmount,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      deposit_amount: 0,
      cod_amount: codAmount,
      note,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (orderError) throw new Error(orderError.message);

  const { data: orderItem, error: orderItemError } = await supabase
    .from("order_items")
    .insert({
      order_id: order.id,
      shop_id: shopId,
      product_code: "",
      product_name: commentText,
      variant_name: "",
      color: "",
      size: "",
      quantity,
      price,
      raw_comment_text: commentText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (orderItemError) throw new Error(orderItemError.message);

  await updateLiveCommentOrder({
    commentId: liveCommentId,
    orderId: order.id,
  });

  await updateLiveSessionOrderCount(dbLiveSessionId);

  if (customer?.id) {
    await updateCustomerAfterOrder({
      customerId: customer.id,
      totalAmount: codAmount,
    });
  }

  const uiOrder = normalizeApiOrderForUi({
    ...order,
    avatar: customer?.avatar_url || avatarUrl,
    products: [orderItem],
  });

  return {
    order,
    orderItem,
    customer,
    uiOrder,
  };
}

export async function updateOrderDepositStatusApi({
  orderId,
  depositStatus,
}: {
  orderId: string;
  depositStatus: "unpaid" | "paid" | "deposited" | "refunded";
}) {
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .update({
      deposit_status: depositStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return normalizeApiOrderForUi(order);
}

export async function updateOrderStatusApi({
  orderId,
  status,
}: {
  orderId: string;
  status: "draft" | "confirmed" | "packed" | "shipping" | "completed" | "canceled" | "returned";
}) {
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return normalizeApiOrderForUi(order);
}

export async function deleteOrderApi(orderId: string) {
  const supabase = createClient();

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", orderId);

  if (orderItemsError) throw new Error(orderItemsError.message);

  const { error: orderError } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (orderError) throw new Error(orderError.message);

  return { ok: true };
}
