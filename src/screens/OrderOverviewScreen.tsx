"use client";

import { useState } from "react";
import ProductTable from "../components/ProductTable";
import { Order } from "../types";
import { formatMoneyFromK, getOrderTotal } from "../utils/order";

function buildOrderHtml(order: Order) {
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

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${order.orderCode}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; padding: 18px; color: #111827; }
          .center { text-align: center; }
          .title { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
          .subtitle { font-size: 14px; color: #6b7280; margin-bottom: 18px; }
          .info { font-size: 14px; line-height: 22px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; }
          th { background: #f3f4f6; font-size: 14px; padding: 10px 6px; border: 1px solid #d1d5db; text-align: left; }
          td { font-size: 14px; padding: 10px 6px; border: 1px solid #d1d5db; }
          .summary { margin-top: 18px; font-size: 15px; line-height: 26px; }
          .summary-row { display: flex; justify-content: space-between; }
          .total { margin-top: 10px; padding-top: 10px; border-top: 1px solid #d1d5db; font-size: 18px; font-weight: 800; }
          .footer { margin-top: 24px; text-align: center; font-size: 13px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="title">HOÁ ĐƠN BÁN HÀNG</div>
          <div class="subtitle">Flive - TikTok LIVE</div>
        </div>
        <div class="info">
          <div><b>Mã đơn:</b> ${order.orderCode}</div>
          <div><b>Khách hàng:</b> ${order.username}</div>
          <div><b>Comment:</b> ${order.comment}</div>
          <div><b>Ngày tạo:</b> ${new Date(order.createdAt).toLocaleString("vi-VN")}</div>
        </div>
        <table>
          <thead>
            <tr><th>#</th><th>Sản phẩm</th><th>Giá × SL</th><th>Tổng</th></tr>
          </thead>
          <tbody>${productRows}</tbody>
        </table>
        <div class="summary">
          <div class="summary-row"><span>Tạm tính</span><b>${formatMoneyFromK(productTotal)}</b></div>
          <div class="summary-row"><span>Phí vận chuyển</span><b>${formatMoneyFromK(shippingFee)}</b></div>
          <div class="summary-row"><span>Trả trước</span><b>- ${formatMoneyFromK(prepaid)}</b></div>
          <div class="summary-row total"><span>Còn lại</span><span>${formatMoneyFromK(remain)}</span></div>
        </div>
        <div class="footer">Cảm ơn quý khách!</div>
      </body>
    </html>
  `;
}

export default function OrderOverviewScreen({
  order,
  onBack,
  onConfirm,
}: {
  order: Order;
  onBack: () => void;
  onConfirm: (orderId: string) => void;
}) {
  const [showPrinterModal, setShowPrinterModal] = useState(false);

  const productTotal = getOrderTotal(order.products || []);
  const shippingFee = 0;
  const prepaid = 0;
  const remain = productTotal + shippingFee - prepaid;

  function connectPrinter() {
    setShowPrinterModal(false);
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      setShowPrinterModal(true);
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildOrderHtml(order));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  async function handleShare() {
    const text = `${order.orderCode}\nKhách: ${order.username}\nTổng: ${formatMoneyFromK(remain)}`;

    if (navigator.share) {
      await navigator.share({ title: order.orderCode, text });
      return;
    }

    await navigator.clipboard?.writeText(text);
    alert("Đã copy thông tin hoá đơn.");
  }

  function handleShip() {
    alert("Tính năng tạo vận đơn sẽ được tích hợp ở bước tiếp theo.");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[620px] flex-col bg-white">
      <header className="bg-[#fff3bf] px-4 pb-4">
        <div className="flex min-h-16 items-center justify-between">
          <button
            className="inline-flex h-11 w-11 items-center justify-center text-[42px] leading-[42px] text-gray-900"
            onClick={onBack}
            type="button"
          >
            ‹
          </button>

          <div className="flex-1 text-center">
            <h1 className="m-0 text-[22px] font-black text-[#273044]">Tổng quan đơn hàng</h1>
            <span className="mt-0.5 block text-lg font-black text-gray-400">Flive</span>
          </div>

          <button
            className="inline-flex h-11 w-11 items-center justify-center text-[28px]"
            onClick={() => setShowPrinterModal(true)}
            type="button"
          >
            ⚙
          </button>
        </div>

        <div className="pt-1">
          <h2 className="m-0 text-xl font-black text-[#273044]">{order.username}</h2>
          <span className="mt-2 inline-flex min-w-[58px] items-center justify-center rounded-[5px] bg-green-500 px-2.5 py-[3px] text-[15px] font-black text-white">
            VIP
          </span>
          <p className="mt-2.5 text-[17px] leading-[25px] text-emerald-600">
            ♧ 0949179149 (VinaPhone)
          </p>
          <p className="mt-2.5 text-[17px] leading-[25px] text-emerald-600">
            ⌖ Số 10 trường thi tp vinh nghệ an, Phường Trường Thi, Thành Phố Vinh, Tỉnh Nghệ An
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-auto bg-white pb-[34px] [-webkit-overflow-scrolling:touch]">
        <section className="bg-white px-4 pt-[18px] pb-4">
          <ProductTable products={order.products || []} />
        </section>

        <section className="border-y border-gray-200 bg-white px-4 pt-[22px] pb-5">
          <h2 className="mb-[22px] text-xl font-black text-[#273044]">Tóm tắt đơn hàng</h2>

          <div className="flex min-h-[62px] items-center justify-between text-lg text-[#273044]">
            <span>Phí vận chuyển</span>
            <div className="inline-flex min-h-12 min-w-32 items-center justify-end rounded-[10px] border border-gray-400 bg-white px-3 text-lg text-gray-500">
              {formatMoneyFromK(shippingFee)}
            </div>
          </div>

          <div className="flex min-h-[62px] items-center justify-between text-lg text-[#273044]">
            <span>Trả trước</span>
            <div className="flex items-center [&_strong]:mr-1.5 [&_strong]:text-[26px] [&_strong]:font-black [&_strong]:text-[#273044]">
              <strong>-</strong>
              <div className="inline-flex min-h-12 min-w-32 items-center justify-end rounded-[10px] border border-gray-400 bg-white px-3 text-lg text-gray-500">
                {formatMoneyFromK(prepaid)}
              </div>
            </div>
          </div>

          <div className="mt-3 h-px bg-gray-300" />

          <div className="flex items-center justify-between text-xl text-[#273044]">
            <strong>Còn lại</strong>
            <strong>{formatMoneyFromK(remain)}</strong>
          </div>
        </section>

        <section className="bg-white px-4 pt-[26px] pb-[22px]">
          <div className="flex">
            <button
              className="mx-1 min-h-[54px] flex-1 rounded-xl bg-yellow-500 text-[17px] font-black text-white"
              onClick={handlePrint}
              type="button"
            >
              ▣ IN ĐƠN
            </button>
            <button
              className={`mx-1 min-h-[54px] flex-1 rounded-xl text-[17px] font-black text-white ${order.status === "confirmed" ? "bg-green-500" : "bg-yellow-500"}`}
              onClick={() => onConfirm(order.id)}
              type="button"
            >
              {order.status === "confirmed" ? "✓ ĐÃ CHỐT" : "✓ CHỐT ĐƠN"}
            </button>
          </div>

          <button
            className="mt-[14px] min-h-[54px] w-full rounded-xl bg-blue-600 text-[17px] font-black text-white"
            onClick={handleShare}
            type="button"
          >
            ⇧ CHIA SẺ HOÁ ĐƠN
          </button>
        </section>

        <section className="flex border-t border-gray-300 bg-white px-4 pt-5 pb-6">
          <div className="mr-3 flex min-h-14 flex-1 items-center rounded-xl border border-gray-300 bg-white px-3">
            <span className="mr-2.5 inline-flex h-8 w-8 items-center justify-center rounded-[7px] bg-red-500 font-black text-white">
              ▣
            </span>
            <span className="flex-1 text-[17px] text-[#273044]">VTP - Viettel Post</span>
            <span className="text-[26px] font-black text-gray-500">⌄</span>
          </div>

          <button
            className="min-h-14 min-w-[116px] rounded-xl bg-yellow-500 text-[17px] font-black text-white"
            onClick={handleShip}
            type="button"
          >
            SHIP 🚚
          </button>
        </section>
      </div>

      {showPrinterModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-7"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-[420px] rounded-3xl bg-white px-[22px] pt-7 pb-5 text-center">
            <div className="mx-auto mb-[14px] inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-amber-100 text-[34px]">
              🖨️
            </div>
            <h2 className="m-0 text-xl font-black text-[#273044]">Chưa kết nối với máy in</h2>
            <p className="mt-2.5 text-[15px] leading-[22px] text-slate-500">
              Bạn chưa kết nối với máy in nào, hãy kết nối ngay để in ra phiếu giấy.
            </p>

            <button
              className="mt-6 min-h-[52px] w-full rounded-[14px] bg-yellow-500 text-base font-black text-white"
              onClick={connectPrinter}
              type="button"
            >
              KẾT NỐI NGAY
            </button>
            <button
              className="mt-[14px] px-3 py-2 text-[15px] font-extrabold text-slate-500"
              onClick={() => setShowPrinterModal(false)}
              type="button"
            >
              Để sau
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
