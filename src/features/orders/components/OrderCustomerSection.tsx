"use client";

import type { Order } from "@/types";
import { AddressIcon, PhoneIcon, TikTokIcon } from "./icons";
import { getOrderTikTokUsername, openTikTokProfile } from "@/utils/tiktok";

type Props = {
  order: Order;
  phone: string;
  address: string;
  onCustomerClick?: (customerKey: string) => void;
};

export function OrderCustomerSection({ order, phone, address, onCustomerClick }: Props) {
  return (
    <div className="mt-4 flex flex-col gap-4 rounded-3xl bg-white">
      <button
        type="button"
        onClick={() => {
          const key = order.customerTikTokUsername || order.username;
          if (key) onCustomerClick?.(key);
        }}
        disabled={!onCustomerClick || (!order.customerTikTokUsername && !order.username)}
        className="flex items-center gap-4 text-left disabled:pointer-events-none"
      >
        {order.avatarUrl ? (
          <img src={order.avatarUrl} alt={order.username} className="size-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[15px] font-semibold text-[#ff6b8a]">
            {(order.customerName || order.username || "?")?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="w-full text-[16px] leading-6 font-medium text-black">{order.customerName || order.username}</p>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.09 6.26L20 9.27l-4.91 4.79 1.18 6.94L12 17.77l-4.27 3.23 1.18-6.94L4 9.27l5.91-1.01z" fill="#f5c842" />
            </svg>
            <span className="text-[12px] leading-[18px] font-medium text-[#484848]">VIP</span>
          </div>
        </div>
      </button>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[#484848]"><PhoneIcon /></span>
          <p className="text-[12px] leading-[18px] text-[#484848]">{phone}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="shrink-0 pt-0.5 text-[#484848]"><AddressIcon /></span>
          <p className="text-[12px] leading-[18px] text-[#484848]">{address}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => openTikTokProfile(getOrderTikTokUsername(order))} disabled={!getOrderTikTokUsername(order)} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black disabled:opacity-40">
          <TikTokIcon />Tiktok
        </button>
        <button type="button" className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 4H4v12h8l4 4v-4h4V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M8 10h8M8 7h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>Zalo</button>
        <button type="button" className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#f2f2f2] text-[12px] font-medium text-black"><PhoneIcon />Điện thoại</button>
      </div>
    </div>
  );
}
