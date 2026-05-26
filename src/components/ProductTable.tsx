"use client";

import { OrderProduct } from "../types";
import { formatMoneyFromK, getOrderTotal, getProductTotal } from "../utils/order";

export default function ProductTable({
  products,
  onAddProduct,
}: {
  products: OrderProduct[];
  onAddProduct?: () => void;
}) {
  const total = getOrderTotal(products);

  return (
    <div className="mt-[14px]">
      <div className="flex min-h-11 items-center justify-between">
        <h3 className="m-0 text-base font-black text-[#273044]">Danh sách sản phẩm</h3>

        {onAddProduct && (
          <button
            className="h-[42px] w-[42px] rounded-[10px] border border-gray-300 bg-slate-50 text-[28px] leading-[30px] font-light text-gray-700"
            onClick={onAddProduct}
            type="button"
            aria-label="Thêm sản phẩm"
          >
            ＋
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-gray-300 bg-white">
        <div className="flex min-h-10 items-stretch border-b border-gray-300 bg-slate-100 last:border-b-0">
          <div className="flex w-[42px] flex-none items-center px-2 text-[15px] text-[#273044]">
            #
          </div>
          <div className="flex min-w-0 flex-[1.25] items-center px-2 text-[15px] text-[#273044]">
            Mã
          </div>
          <div className="flex min-w-0 flex-[1.3] items-center justify-center px-2 text-center text-[15px] text-cyan-900">
            Giá × SL
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-end px-2 text-right text-[15px] text-[#273044]">
            Tổng
          </div>
        </div>

        {products.map((product, index) => {
          const productTotal = getProductTotal(product);

          return (
            <div
              key={product.id}
              className="flex min-h-12 items-stretch border-b border-gray-300 last:border-b-0"
            >
              <div className="flex w-[42px] flex-none items-center px-2 text-[15px] text-[#273044]">
                {index + 1}.
              </div>
              <div className="flex min-w-0 flex-[1.25] items-center truncate px-2 text-[15px] text-[#273044]">
                {product.code}
              </div>
              <div className="flex min-w-0 flex-[1.3] items-center justify-center bg-[#dcfdf7] px-2 text-center text-[15px] text-cyan-900">
                {product.price} × {product.quantity}
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-end px-2 text-right text-[15px] text-[#273044]">
                {formatMoneyFromK(productTotal)}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-right text-base text-[#273044]">
        {products.length} sản phẩm, tổng cộng <strong>{formatMoneyFromK(total)}</strong>
      </p>
    </div>
  );
}
