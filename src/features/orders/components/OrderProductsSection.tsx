"use client";

import type { OrderProduct } from "@/types";
import { formatMoney } from "@/utils/order";
import { ChevronDownIcon, EditIcon, PlusCircleIcon } from "./icons";
import { Divider } from "./shared";

type Props = {
  products: OrderProduct[];
  displayProducts: OrderProduct[];
  showAllProducts: boolean;
  totalQuantity: number;
  productTotal: number;
  onToggleShowAll: () => void;
  onAdd: () => void;
  onEdit: (product: OrderProduct) => void;
};

export function OrderProductsSection({
  products,
  displayProducts,
  showAllProducts,
  totalQuantity,
  productTotal,
  onToggleShowAll,
  onAdd,
  onEdit,
}: Props) {
  return (
    <>
      <Divider />
      <section className="px-4 py-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] leading-6 font-semibold text-black">Danh sách sản phẩm</h2>
          <button type="button" onClick={onAdd} className="flex shrink-0 items-center gap-1 text-[14px] leading-[22px] font-medium text-black">
            <PlusCircleIcon />Thêm mới
          </button>
        </div>

        <div className="mt-1 flex flex-col">
          {displayProducts.map((product, index) => (
            <div key={product.id || index} className="flex flex-col gap-2 border-b border-black/10 py-3">
              <div className="flex items-center justify-between gap-4">
                <p className="min-w-0 flex-1 text-[14px] leading-[22px] break-words text-[#2b2b2b]">{product.name || product.code || "Sản phẩm"}</p>
                <button type="button" onClick={() => onEdit(product)} className="shrink-0 text-[#484848]" aria-label="Sửa sản phẩm">
                  <EditIcon />
                </button>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[12px] leading-[18px] text-[#787878]">x{product.quantity}</span>
                <span className="text-[14px] leading-[22px] font-medium text-[#2b2b2b]">{formatMoney(Number(product.price || 0) * Number(product.quantity || 0))}</span>
              </div>
            </div>
          ))}
        </div>

        {products.length > 3 && (
          <button type="button" onClick={onToggleShowAll} className="flex h-11 w-full items-center justify-center gap-1 text-[14px] leading-[22px] font-medium text-[#484848]">
            {showAllProducts ? "Thu gọn" : `Xem thêm (${products.length - 3})`}
            <ChevronDownIcon />
          </button>
        )}

        <div className="mt-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[14px] leading-5.5 text-[#484848]">Tổng sản phẩm</span>
            <span className="text-[14px] leading-5.5 font-semibold text-black">{totalQuantity}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[14px] leading-5.5 text-[#484848]">Tổng tiền</span>
            <span className="text-[14px] leading-5.5 font-semibold text-[#ff6b8a]">{formatMoney(productTotal)}</span>
          </div>
        </div>
      </section>
    </>
  );
}
