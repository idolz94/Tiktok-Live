import type { Order, OrderProduct, OrderWithTikTok } from "../types";
import { createId } from "./id";
import { cleanTikTokUsername, getOrderTikTokUsername } from "./tiktok";

export const DEFAULT_PRODUCT_PRICE = 20000;
export const DEFAULT_PRODUCT_QUANTITY = 1;

export function parseOrderFromComment(comment: string) {
  const text = comment.toLowerCase();
  const quantityMatch = text.match(/(?:x|sl|số lượng)?\s*(\d+)\s*(?:cái|c|sp|sản phẩm)?/i);
  const sizeMatch = text.match(/\b(size|sz)\s*([a-z0-9]+)/i);
  const colorMatch = text.match(/\b(đen|trắng|đỏ|xanh|vàng|hồng|be|nâu|kem|tím|cam|ghi|xám)\b/i);

  return {
    productName: comment.trim(),
    quantity: quantityMatch ? Number(quantityMatch[1]) : DEFAULT_PRODUCT_QUANTITY,
    size: sizeMatch?.[2]?.toUpperCase() || "",
    color: colorMatch?.[1] || "",
    price: DEFAULT_PRODUCT_PRICE,
  };
}

export function normalizeProductForUi(product: any, order?: any): OrderProduct {
  const code = String(product?.code || product?.product_code || product?.productCode || "");
  const name = String(
    product?.name ||
      product?.product_name ||
      product?.productName ||
      order?.productName ||
      order?.product_name ||
      order?.comment ||
      order?.comment_text ||
      "Sản phẩm",
  );
  const quantity = Number(product?.quantity || 1);
  const price = Number(product?.price || order?.price || 0);
  const totalAmount = Number(product?.totalAmount || product?.total_amount || quantity * price);

  return {
    id: String(product?.id || createId()),
    code,
    name,
    variantName: String(product?.variantName || product?.variant_name || ""),
    color: String(product?.color || order?.color || ""),
    size: String(product?.size || order?.size || ""),
    quantity,
    price,
    totalAmount,
    rawCommentText: String(
      product?.rawCommentText ||
        product?.raw_comment_text ||
        order?.comment ||
        order?.comment_text ||
        "",
    ),
  };
}

export function createProductFromComment(comment: string): OrderProduct {
  const cleanComment = comment.trim() || "Sản phẩm";

  return normalizeProductForUi({
    id: createId(),
    code: cleanComment,
    name: cleanComment,
    quantity: DEFAULT_PRODUCT_QUANTITY,
    price: DEFAULT_PRODUCT_PRICE,
    rawCommentText: cleanComment,
  });
}

export function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`;
}

/** @deprecated use formatMoney */
export const formatMoneyFromK = formatMoney;

export function getProductTotal(product: Pick<OrderProduct, "price" | "quantity">) {
  return Number(product.price || 0) * Number(product.quantity || 0);
}

export function getOrderTotal(products: OrderProduct[] = []) {
  return products.reduce((sum, product) => sum + getProductTotal(product), 0);
}

function buildFallbackProduct(order: any): OrderProduct {
  const comment = String(order?.comment || order?.comment_text || "Sản phẩm");

  return normalizeProductForUi(
    {
      id: order?.id || createId(),
      code: "",
      name: comment,
      quantity: Number(order?.quantity || 1),
      price: Number(
        order?.price || order?.subtotalAmount || order?.subtotal_amount || DEFAULT_PRODUCT_PRICE,
      ),
      color: order?.color || "",
      size: order?.size || "",
      rawCommentText: comment,
    },
    order,
  );
}

export function normalizeApiOrderForUi(order: any): OrderWithTikTok {
  const customerTikTokUsername = getOrderTikTokUsername(order);
  const rawProducts = Array.isArray(order?.products) ? order.products : [];
  const products = rawProducts.length
    ? rawProducts.map((product: any) => normalizeProductForUi(product, order))
    : [buildFallbackProduct(order)];

  const firstProduct = products[0];
  const orderCode = String(order?.orderCode || order?.order_code || "");
  const comment = String(
    order?.comment || order?.commentText || order?.comment_text || firstProduct.rawCommentText || "",
  );
  const createdAt = String(order?.createdAt || order?.created_at || new Date().toISOString());
  const subtotalAmount = Number(order?.subtotalAmount ?? order?.subtotal_amount ?? getOrderTotal(products));
  const totalAmount = subtotalAmount;

  return {
    id: String(order?.id || createId()),
    orderCode,
    username: String(
      order?.username ||
        order?.customerName ||
        order?.customer_name ||
        customerTikTokUsername ||
        "Khách live",
    ),
    customerId: order?.customerId || order?.customer_id || null,
    customerName: String(order?.customerName || order?.customer_name || order?.username || ""),
    customerPhone: String(order?.customerPhone || order?.customer_phone || ""),
    customerAddress: String(order?.customerAddress || order?.customer_address || ""),
    customerAddressId: order?.customerAddressId || order?.customer_address_id || null,
    customerAddressData: order?.customerAddressData || order?.customer_address_data || null,
    customerTikTokUsername,
    customerTikTokName: customerTikTokUsername,
    uniqueId: cleanTikTokUsername(customerTikTokUsername),
    avatar: String(order?.avatar || order?.avatarUrl || order?.avatar_url || ""),
    avatarUrl: String(order?.avatarUrl || order?.avatar || order?.avatar_url || ""),
    comment,
    commentId: String(order?.commentId || order?.comment_id || order?.live_comment_id || ""),
    productName: String(order?.productName || order?.product_name || firstProduct.name || comment),
    quantity: Number(order?.quantity || firstProduct.quantity || 1),
    size: String(order?.size || firstProduct.size || ""),
    color: String(order?.color || firstProduct.color || ""),
    price: Number(order?.price || firstProduct.price || 0),
    products,
    status: order?.status || "draft",
    depositStatus: order?.depositStatus || order?.deposit_status || "unpaid",
    paymentStatus: order?.paymentStatus || order?.payment_status || "unpaid",
    shippingStatus: order?.shippingStatus || order?.shipping_status || "not_shipped",
    subtotalAmount,
    shippingFee: Number(order?.shippingFee || order?.shipping_fee || 0),
    discountAmount: Number(order?.discountAmount || order?.discount_amount || 0),
    totalAmount,
    codAmount: Number(order?.codAmount ?? order?.cod_amount ?? 0),
    note: String(order?.note || ""),
    createdAt,
    updatedAt: String(order?.updatedAt || order?.updated_at || ""),
  };
}

export function printOrder(order: Order) {
  const products = order.products || [];
  const productTotal = getOrderTotal(products);
  const shippingFee = Number(order.shippingFee ?? 0);
  const prepaid = 0;
  const remain = productTotal + shippingFee - prepaid;

  const productRows = products
    .map((item, index) => {
      const total = Number(item.price || 0) * Number(item.quantity || 0);
      return `<tr>
        <td>${index + 1}</td>
        <td>${item.code || item.name || ""}</td>
        <td>${Number(item.price || 0).toLocaleString("vi-VN")}đ × ${item.quantity}</td>
        <td>${formatMoney(total)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${order.orderCode}</title>
    <style>
      body{font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif;padding:18px;color:#111827}
      .center{text-align:center}.title{font-size:22px;font-weight:800;margin-bottom:4px}
      .subtitle{font-size:14px;color:#6b7280;margin-bottom:18px}
      .info{font-size:14px;line-height:22px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;margin-top:12px;margin-bottom:16px}
      th{background:#f3f4f6;font-size:14px;padding:10px 6px;border:1px solid #d1d5db;text-align:left}
      td{font-size:14px;padding:10px 6px;border:1px solid #d1d5db}
      .summary{margin-top:18px;font-size:15px;line-height:26px}
      .summary-row{display:flex;justify-content:space-between}
      .total{margin-top:10px;padding-top:10px;border-top:1px solid #d1d5db;font-size:18px;font-weight:800}
      .footer{margin-top:24px;text-align:center;font-size:13px;color:#6b7280}
    </style></head><body>
    <div class="center"><div class="title">HOÁ ĐƠN BÁN HÀNG</div><div class="subtitle">Lumi - TikTok LIVE</div></div>
    <div class="info">
      <div><b>Mã đơn:</b> ${order.orderCode}</div>
      <div><b>Khách hàng:</b> ${order.username || order.customerName || ""}</div>
      <div><b>Comment:</b> ${order.comment || ""}</div>
      <div><b>Ngày tạo:</b> ${new Date(order.createdAt).toLocaleString("vi-VN")}</div>
    </div>
    <table><thead><tr><th>#</th><th>Sản phẩm</th><th>Giá × SL</th><th>Tổng</th></tr></thead>
    <tbody>${productRows}</tbody></table>
    <div class="summary">
      <div class="summary-row"><span>Tạm tính</span><b>${formatMoneyFromK(productTotal)}</b></div>
      <div class="summary-row"><span>Phí vận chuyển</span><b>${formatMoneyFromK(shippingFee)}</b></div>
      <div class="summary-row"><span>Trả trước</span><b>- ${formatMoneyFromK(prepaid)}</b></div>
      <div class="summary-row total"><span>Còn lại</span><span>${formatMoneyFromK(remain)}</span></div>
    </div>
    <div class="footer">Cảm ơn quý khách!</div>
    </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
