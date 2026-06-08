"use client";

import { useMemo, useState } from "react";
import { DrawlerBase } from "@/components/ui/Drawler";
import type { ShopTikTokChannel } from "@/types/database";
import { isPriorityComment, normalizeTikTokUsername } from "@/utils/comment";
import CommentCard from "../../../components/CommentCard";
import OrderCard from "../../../components/OrderCard";
import OrderFilterBar from "../../../components/OrderFilterBar";
import {
  LiveComment,
  LiveTab,
  Order,
  OrderFilter,
  OrderProduct,
  TopTab,
} from "../../../types";

type CommentTab = "all" | "priority";

export default function HomeView({
  topTab,
  liveTab,
  comments,
  orders,
  filteredOrders,
  orderFilter,
  orderSearchText,
  buyingCount,
  paidOrders,
  draftOrders,
  confirmedOrders,
  orderProductCount,
  onChangeLiveTab,
  onChangeOrderFilter,
  onChangeOrderSearchText,
  onClearComments,
  onClearOrders,
  onCreateOrderFromComment,
  onUpdateOrder,
  onDeleteOrder,
  onAddProductToOrder,
  onToggleDeposit,
  onConfirmOrder,
  onOpenOrderOverview,
  tiktokUsername,
  tiktokChannels,
  isConnected,
  showChannelSwitcher,
  onShowChannelSwitcherChange,
  onConnectTikTokLive,
}: {
  topTab: TopTab;
  liveTab: LiveTab;
  comments: LiveComment[];
  orders: Order[];
  filteredOrders: Order[];
  orderFilter: OrderFilter;
  orderSearchText: string;
  buyingCount: number;
  paidOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  orderProductCount: number;
  onChangeLiveTab: (tab: LiveTab) => void;
  onChangeOrderFilter: (filter: OrderFilter) => void;
  onChangeOrderSearchText: (value: string) => void;
  onClearComments: () => void;
  onClearOrders: () => void;
  onCreateOrderFromComment: (item: LiveComment) => void;
  onUpdateOrder: (id: string, field: keyof Order, value: string) => void;
  onDeleteOrder: (id: string) => void;
  onAddProductToOrder: (orderId: string, product: OrderProduct) => void;
  onToggleDeposit: (orderId: string) => void;
  onConfirmOrder: (orderId: string) => void;
  onOpenOrderOverview: (orderId: string) => void;
  tiktokUsername: string;
  tiktokChannels: ShopTikTokChannel[];
  isConnected: boolean;
  showChannelSwitcher: boolean;
  onShowChannelSwitcherChange: (open: boolean) => void;
  onConnectTikTokLive: (username: string) => Promise<boolean | void>;
}) {
  const [commentTab, setCommentTab] = useState<CommentTab>("all");
  const [selectedUsername, setSelectedUsername] = useState(tiktokUsername || "");
  const [isConnecting, setIsConnecting] = useState(false);

  const priorityComments = useMemo(() => {
    return comments.filter(isPriorityComment);
  }, [comments]);

  const currentComments = useMemo(() => {
    if (commentTab === "priority") return priorityComments;

    return comments;
  }, [commentTab, comments, priorityComments]);

  const channelOptions = useMemo(() => {
    const options = tiktokChannels.map((channel) => ({
      id: channel.id,
      username: normalizeTikTokUsername(channel.tiktokUsername),
      isDefault: channel.isDefault,
    }));
    const normalizedCurrent = normalizeTikTokUsername(tiktokUsername);

    if (normalizedCurrent && !options.some((option) => option.username === normalizedCurrent)) {
      options.unshift({ id: "current", username: normalizedCurrent, isDefault: true });
    }

    return options;
  }, [tiktokChannels, tiktokUsername]);

  const connectSelectedChannel = async () => {
    const nextUsername = normalizeTikTokUsername(selectedUsername);

    if (!nextUsername || isConnecting) return;

    try {
      setIsConnecting(true);
      await onConnectTikTokLive(nextUsername);
    } finally {
      setIsConnecting(false);
    }
  };

  if (topTab === "facebook") {
    return (
      <div className="flex-1 p-4">
        <div className="rounded-[28px] bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-[20px] font-black text-[#273044]">Facebook</p>
          <p className="mt-2 text-sm font-semibold text-slate-400">
            Tính năng Facebook đang được phát triển.
          </p>
        </div>
      </div>
    );
  }

  // When live and connected: full-screen layout matching Figma 3:1899
  if (isConnected && liveTab === "live") {
    return (
      <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f2f2f2]">
        {/* Tab switcher */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex gap-2 rounded-full bg-white p-1 shadow-[0_10px_24px_rgba(255,95,138,0.08)]">
            <button
              type="button"
              onClick={() => onChangeLiveTab("live")}
              className="relative flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-[14px] font-semibold bg-[#ff6b8a] text-white shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-white opacity-90" />
              Live
            </button>
            <button
              type="button"
              onClick={() => onChangeLiveTab("orders")}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-[#787878]"
            >
              Đơn đã tạo
            </button>
          </div>
        </div>


        {/* Comment section: tab filter (sticky) + scrollable list */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Tab filter — neo trên đầu vùng scroll */}
          <div className="shrink-0 flex gap-2 px-4 pb-2 mt-3">
            <button
              type="button"
              onClick={() => setCommentTab("all")}
              className={`rounded-2xl px-4 py-2 text-[13px] font-semibold ${
                commentTab === "all"
                  ? "bg-[#2b2b2b] text-white"
                  : "bg-white text-[#484848]"
              }`}
            >
              Tất cả · {comments.length}
            </button>
            <button
              type="button"
              onClick={() => setCommentTab("priority")}
              className={`rounded-2xl px-4 py-2 text-[13px] font-semibold ${
                commentTab === "priority"
                  ? "bg-[#ff8c42] text-white"
                  : "bg-white text-[#ff8c42]"
              }`}
            >
              Ưu tiên · {priorityComments.length}
            </button>
            <button
              type="button"
              onClick={onClearComments}
              className="ml-auto rounded-2xl bg-white px-4 py-2 text-[13px] font-semibold text-[#ff4242]"
            >
              Xóa
            </button>
          </div>

          {/* Scrollable comment list */}
          <div
            className="overflow-y-auto overscroll-contain px-4 pb-24 [-webkit-overflow-scrolling:touch] h-auto"
          >
            {currentComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-center text-[15px] leading-5.5 text-[#787878]">
                  {commentTab === "priority"
                    ? "Chưa có comment ưu tiên."
                    : "Đang chờ comment realtime từ TikTok LIVE."}
                </p>
              </div>
            ) : (
              currentComments.map((item) => (
                <CommentCard
                  key={item.id}
                  item={item}
                  onCreateOrder={onCreateOrderFromComment}
                />
              ))
            )}
          </div>
        </div>

        {/* Channel switcher drawer — Figma 3:1975 */}
        <DrawlerBase
          open={showChannelSwitcher}
          onOpenChange={onShowChannelSwitcherChange}
          height="auto"
          showHandle
          showCloseButton={false}
          title="Chuyển kênh"
          footer={
            <button
              type="button"
              onClick={async () => {
                await connectSelectedChannel();
                onShowChannelSwitcherChange(false);
              }}
              disabled={isConnecting || !selectedUsername}
              className="flex w-full items-center justify-center rounded-[40px] py-3.5 text-[16px] font-medium text-black disabled:opacity-60"
              style={{
                backgroundImage: "linear-gradient(138deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)",
              }}
            >
              {isConnecting ? "Đang kết nối..." : "Kết nối lại"}
            </button>
          }
        >
          <div className="flex flex-col gap-3">
            {channelOptions.map((option) => {
              const isActive = option.username === selectedUsername;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedUsername(option.username)}
                  className="flex w-full items-center gap-4 rounded-2xl bg-[#f2f2f2] p-4 text-left"
                >
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[16px] font-semibold text-[#ff6b8a]">
                    {option.username.charAt(0).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium leading-5.5 text-black">
                      {option.username}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {/* TikTok icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="#484848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[12px] leading-4.5 text-[#484848]">TikTok</span>
                    </div>
                  </div>
                  {/* Selected check */}
                  {isActive && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                      <path d="M20 6 9 17l-5-5" stroke="#ff6b8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </DrawlerBase>
      </div>
    );
  }

  return (
    <>
      <div className="bg-linear-to-b from-white/0 to-transparent px-4 py-3">
        <div className="flex gap-2 rounded-full bg-white p-1 shadow-[0_10px_24px_rgba(255,95,138,0.08)]">
        <button
          className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-black ${
            liveTab === "live"
              ? "bg-[#ff5f8a] text-white shadow-sm"
              : "bg-slate-100 text-slate-500"
          }`}
          onClick={() => onChangeLiveTab("live")}
          type="button"
        >
          {liveTab === "live" && (
            <span className="h-2.5 w-2.5 rounded-full bg-white opacity-90" />
          )}
          Live
        </button>

        <button
          className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-black ${
            liveTab === "orders"
              ? "bg-[#ff5f8a] text-white shadow-sm"
              : "bg-slate-100 text-slate-500"
          }`}
          onClick={() => onChangeLiveTab("orders")}
          type="button"
        >
          Đơn đã tạo
        </button>
        </div>
      </div>

      {liveTab === "live" ? (
        <div className="overflow-auto px-3 pb-6.5 [-webkit-overflow-scrolling:touch] pt-6.5">
          <div className="mb-3 rounded-3xl border border-pink-100 bg-white p-4 shadow-sm">
            <p className="text-[15px] font-black text-[#273044]">Chọn tài khoản LIVE</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Chọn kênh TikTok rồi bấm Kết nối để bắt đầu nhận comment.
            </p>

            <div className="mt-3 flex gap-2">
              <select
                className="min-h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-[15px] font-black text-[#273044] outline-none"
                value={selectedUsername}
                onChange={(event) => setSelectedUsername(event.target.value)}
                disabled={isConnecting}
              >
                <option value="">Chọn tài khoản TikTok</option>
                {channelOptions.map((option) => (
                  <option key={option.id} value={option.username}>
                    {option.username}{option.isDefault ? " · Mặc định" : ""}
                  </option>
                ))}
              </select>

              <button
                className="min-h-12 shrink-0 rounded-2xl bg-[#ff5f8a] px-5 text-[15px] font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                onClick={connectSelectedChannel}
                type="button"
                disabled={isConnecting || !selectedUsername}
              >
                {isConnecting ? "Đang kết nối..." : "Kết nối"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full overflow-y-auto pb-6.5 [-webkit-overflow-scrolling:touch]">
          <OrderFilterBar
            searchText={orderSearchText}
            onChangeSearch={onChangeOrderSearchText}
            activeFilter={orderFilter}
            onChangeFilter={onChangeOrderFilter}
            productCount={orderProductCount}
            paidCount={paidOrders}
            draftCount={draftOrders}
            confirmedCount={confirmedOrders}
            unpaidCount={orders.filter((o) => o.depositStatus !== "paid" && o.depositStatus !== "deposited").length}
          />

          <div className="pb-20">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-[13px] text-[#787878]">{filteredOrders.length} đơn</span>
              <button type="button" onClick={onClearOrders} className="text-[13px] font-medium text-[#ff4242]">Xóa đơn</button>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="m-0 text-[15px] leading-5.5 text-slate-500">
                  Chưa có đơn nào.
                </p>
              </div>
            ) : (
              filteredOrders.map((item) => (
                <OrderCard
                  key={item.id}
                  item={item}
                  onUpdate={onUpdateOrder}
                  onDelete={onDeleteOrder}
                  onAddProduct={onAddProductToOrder}
                  onToggleDeposit={onToggleDeposit}
                  onConfirmOrder={onConfirmOrder}
                  onOpenOverview={onOpenOrderOverview}
                />
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}