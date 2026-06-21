import type { Order } from "@/types";
import type { ShopAddress } from "@/lib/addresses";
import { formatMoney, getOrderTotal } from "@/utils/order";

function buildAddress(data: {
  address?: string | null;
  ward?: string | null;
  district?: string | null;
  province?: string | null;
}): string {
  return [data.address, data.ward, data.district, data.province]
    .filter(Boolean)
    .join(", ");
}

export function buildDeliverySlipHtml(order: Order, sender?: ShopAddress | null): string {
  const products = order.products || [];
  const productTotal = getOrderTotal(products);
  const shippingFee = order.shippingFee ?? 0;
  const codAmount = order.codAmount ?? 0;
  const totalAmount = order.totalAmount ?? Math.max(0, productTotal + shippingFee - codAmount);

  const addr = order.customerAddressData;
  const recipientName = addr?.name || order.customerName || order.username || "";
  const recipientPhone = addr?.phone || order.customerPhone || "";
  const recipientAddress = addr
    ? buildAddress(addr)
    : order.customerAddress || "";

  const senderName = sender?.name || "";
  const senderPhone = sender?.phone || "";
  const senderAddress = sender ? buildAddress(sender) : "";

  const productRows = products
    .map(
      (item, i) => `
        <tr>
          <td class="center">${i + 1}</td>
          <td>${item.name || item.code || ""}</td>
          <td class="center">${item.quantity}</td>
          <td class="right">${formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}</td>
        </tr>`,
    )
    .join("");

  const trackingBlock = order.trackingCode
    ? `<div class="tracking"><span class="tracking-label">Mã vận đơn</span><span class="tracking-code">${order.trackingCode}</span></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Phiếu giao hàng ${order.orderCode}</title>
<style>
  @page { size: A4; margin: 14mm 14mm 14mm 14mm; }
  *,*::before,*::after { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    font-size: 12px;
    color: #111827;
    margin: 0;
    padding: 0;
    background: #fff;
  }
  .slip { max-width: 720px; margin: 0 auto; padding: 0; }

  /* Header */
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #111827; padding-bottom: 10px; margin-bottom: 14px; }
  .header-title { font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
  .header-meta { text-align: right; font-size: 11px; color: #6b7280; line-height: 18px; }
  .header-meta .order-code { font-size: 14px; font-weight: 700; color: #111827; }

  /* Tracking */
  .tracking { display: flex; align-items: center; justify-content: space-between; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; }
  .tracking-label { font-size: 11px; color: #6b7280; }
  .tracking-code { font-size: 15px; font-weight: 700; letter-spacing: 1px; }

  /* Parties grid */
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  .party-box { border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 12px; }
  .party-box.recipient { border-color: #111827; border-width: 1.5px; }
  .party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 6px; }
  .party-name { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .party-phone { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 4px; }
  .party-address { font-size: 11px; color: #374151; line-height: 16px; }

  /* Products table */
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  thead tr { background: #f3f4f6; }
  th { font-size: 11px; padding: 7px 8px; border: 1px solid #d1d5db; font-weight: 700; text-align: left; }
  td { font-size: 11px; padding: 6px 8px; border: 1px solid #d1d5db; vertical-align: top; }
  .center { text-align: center; }
  .right { text-align: right; }

  /* Summary */
  .summary { margin-left: auto; width: 240px; }
  .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
  .summary-row:last-child { border-bottom: none; }
  .summary-total { display: flex; justify-content: space-between; padding: 8px 0 0; font-size: 15px; font-weight: 800; border-top: 2px solid #111827; margin-top: 4px; }

  /* Note */
  .note-box { border: 1px dashed #d1d5db; border-radius: 6px; padding: 8px 12px; margin-top: 14px; font-size: 11px; color: #374151; }
  .note-label { font-weight: 700; margin-bottom: 4px; }

  /* Footer */
  .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .slip { max-width: 100%; }
  }
</style>
</head>
<body>
<div class="slip">

  <div class="header">
    <div class="header-title">PHIẾU GIAO HÀNG</div>
    <div class="header-meta">
      <div class="order-code">${order.orderCode}</div>
      <div>${new Date(order.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</div>
    </div>
  </div>

  ${trackingBlock}

  <div class="parties">
    <div class="party-box">
      <div class="party-label">Người gửi</div>
      ${senderName ? `<div class="party-name">${senderName}</div>` : ""}
      ${senderPhone ? `<div class="party-phone">${senderPhone}</div>` : ""}
      ${senderAddress ? `<div class="party-address">${senderAddress}</div>` : ""}
    </div>
    <div class="party-box recipient">
      <div class="party-label">Người nhận</div>
      ${recipientName ? `<div class="party-name">${recipientName}</div>` : ""}
      ${recipientPhone ? `<div class="party-phone">${recipientPhone}</div>` : ""}
      ${recipientAddress ? `<div class="party-address">${recipientAddress}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="center" style="width:28px">#</th>
        <th>Sản phẩm</th>
        <th class="center" style="width:40px">SL</th>
        <th class="right" style="width:90px">Thành tiền</th>
      </tr>
    </thead>
    <tbody>${productRows}</tbody>
  </table>

  <div class="summary">
    <div class="summary-row"><span>Tạm tính</span><span>${formatMoney(productTotal)}</span></div>
    <div class="summary-row"><span>Phí vận chuyển</span><span>${formatMoney(shippingFee)}</span></div>
    ${codAmount > 0 ? `<div class="summary-row"><span>Đã thanh toán trước</span><span>- ${formatMoney(codAmount)}</span></div>` : ""}
    <div class="summary-total"><span>Tiền thu hộ (COD)</span><span>${formatMoney(totalAmount)}</span></div>
  </div>

  ${order.note ? `<div class="note-box"><div class="note-label">Ghi chú:</div>${order.note}</div>` : ""}

  <div class="footer">Lumi — Phiếu giao hàng được tạo tự động</div>
</div>
</body>
</html>`;
}

export function buildOrderHtml(order: Order): string {
  return buildDeliverySlipHtml(order, null);
}
