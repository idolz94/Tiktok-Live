import { Order } from "@/types";
import { formatMoneyFromK, getOrderTotal } from "@/utils/order";

export function buildOrderHtml(order: Order) {
  const products = order.products || [];
  const productTotal = getOrderTotal(products);
  const shippingFee = 0;
  const prepaid = 0;
  const remain = productTotal + shippingFee - prepaid;

  const productRows = products
    .map((item, index) => {
      const total = Number(item.price || 0) * Number(item.quantity || 0);
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.code}</td>
          <td>${item.price}.000đ × ${item.quantity}</td>
          <td>${formatMoneyFromK(total)}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${order.orderCode}</title>
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
    <div class="center"><div class="title">HOÁ ĐƠN BÁN HÀNG</div><div class="subtitle">Flive - TikTok LIVE</div></div>
    <div class="info">
      <div><b>Mã đơn:</b> ${order.orderCode}</div>
      <div><b>Khách hàng:</b> ${order.username}</div>
      <div><b>Comment:</b> ${order.comment}</div>
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
}

export function formatOrderDate(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export function statusLabel(status: Order["status"]) {
  const map: Record<string, string> = {
    confirmed: "Đã chốt", shipping: "Đang giao hàng",
    completed: "Hoàn thành", canceled: "Đã huỷ",
  };
  return map[status] ?? "Đơn nháp";
}
