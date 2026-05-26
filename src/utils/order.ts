import { OrderProduct } from "../types";
import { createId } from "./id";

export const DEFAULT_PRODUCT_PRICE = 20; // 20 = 20.000đ
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

export function createProductFromComment(comment: string): OrderProduct {
  const cleanComment = comment.trim();

  return {
    id: createId(),
    code: cleanComment || "Sản phẩm",
    name: cleanComment || "Sản phẩm",
    price: DEFAULT_PRODUCT_PRICE,
    quantity: DEFAULT_PRODUCT_QUANTITY,
  };
}

export function formatMoneyFromK(value: number) {
  const safeValue = Number(value || 0);
  return `${safeValue.toLocaleString("vi-VN")}.000đ`;
}

export function getProductTotal(product: OrderProduct) {
  return Number(product.price || 0) * Number(product.quantity || 0);
}

export function getOrderTotal(products: OrderProduct[]) {
  return products.reduce((sum, product) => sum + getProductTotal(product), 0);
}
