"use client";

import { ConfirmIcon, DepositSpinner, PrinterIcon, ShareIcon } from "./icons";

type Props = {
  orderId: string;
  depositStatus?: string | null;
  isDepositLoading: boolean;
  onPrint: () => void;
  onToggleDeposit: (orderId: string) => void;
  onShip: () => void;
};

export function OrderFooterActions({
  orderId,
  depositStatus,
  isDepositLoading,
  onPrint,
  onToggleDeposit,
  onShip,
}: Props) {
  const isDeposited = depositStatus === "paid" || depositStatus === "deposited";

  return (
    <>
      <section className="px-4 pt-3 pb-6">
        <div className="flex justify-center gap-8">
          <button type="button" onClick={onPrint} className="flex flex-1 flex-col items-center gap-2 text-[14px] text-[#484848]">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#f2f2f2]"><PrinterIcon size={20} /></div>
            In đơn
          </button>
          <button
            type="button"
            onClick={() => onToggleDeposit(orderId)}
            disabled={isDepositLoading}
            className="flex flex-1 flex-col items-center gap-2 text-[14px] text-[#484848] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <div className={`flex size-12 items-center justify-center rounded-full ${isDeposited ? "bg-[#2ca87b] text-white" : "bg-[#f5c842] text-black"}`}>
              {isDepositLoading ? <DepositSpinner /> : <ConfirmIcon />}
            </div>
            {isDepositLoading ? "Đang cập nhật..." : isDeposited ? "Đã cọc" : "Chưa cọc"}
          </button>
          <button type="button" className="flex flex-1 flex-col items-center gap-2 text-[14px] text-[#484848]">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#f2f2f2]"><ShareIcon /></div>
            Chia sẻ hóa đơn
          </button>
        </div>
      </section>

      <div className="shrink-0 border-t border-black/10 bg-white px-4 pt-3 pb-[env(safe-area-inset-bottom,8px)]">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onShip}
            className="flex-1 rounded-[40px] bg-[linear-gradient(138.29deg,#ff6b8a_13.52%,#ffa66d_52.12%,#ffc86a_117.76%)] px-6 py-3 text-[14px] font-medium text-black"
          >
            Ship
          </button>
        </div>
      </div>
    </>
  );
}
