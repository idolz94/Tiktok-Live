"use client";

import { useMemo, useState } from "react";
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
import SectionHeader from "./SectionHeader";
import StatsRow from "./StatsRow";

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
  onConnectTikTokLive,
  onDisconnectTikTokLive,
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
  onConnectTikTokLive: (username: string) => Promise<boolean | void>;
  onDisconnectTikTokLive: () => Promise<void>;
}) {
  const [commentTab, setCommentTab] = useState<CommentTab>("all");
  const [selectedUsername, setSelectedUsername] = useState(tiktokUsername || "");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [liveBarExpanded, setLiveBarExpanded] = useState(true);
  const [showChannelSwitcher, setShowChannelSwitcher] = useState(false);

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

  const disconnectLive = async () => {
    if (isDisconnecting) return;

    try {
      setIsDisconnecting(true);
      await onDisconnectTikTokLive();
      setLiveBarExpanded(true);
    } finally {
      setIsDisconnecting(false);
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
        <div className="overflow-auto px-3 pb-[26px] [-webkit-overflow-scrolling:touch] pt-[26px]">
          {!isConnected ? (
            <div className="mb-3 rounded-[24px] border border-pink-100 bg-white p-4 shadow-sm">
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
          ) : (
            <>
              <StatsRow
                commentsCount={comments.length}
                buyingCount={priorityComments.length || buyingCount}
                ordersCount={orders.length}
              />

              <SectionHeader
                title="Comment realtime"
                actionText="Xóa comment"
                onAction={onClearComments}
              />

              <div className="mb-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCommentTab("all")}
                  className={[
                    "rounded-2xl px-3 py-3 text-sm font-black",
                    commentTab === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600",
                  ].join(" ")}
                >
                  Tất cả · {comments.length}
                </button>

                <button
                  type="button"
                  onClick={() => setCommentTab("priority")}
                  className={[
                    "rounded-2xl px-3 py-3 text-sm font-black",
                    commentTab === "priority"
                      ? "bg-orange-500 text-white"
                      : "bg-white text-orange-600",
                  ].join(" ")}
                >
                  Ưu tiên · {priorityComments.length}
                </button>
              </div>

              {currentComments.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="m-0 text-[15px] leading-[22px] text-slate-500">
                    {commentTab === "priority"
                      ? "Chưa có comment ưu tiên."
                      : "Chưa có comment. Đang chờ comment realtime từ TikTok LIVE."}
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

              {liveBarExpanded ? (
                <div className="sticky bottom-3 z-20 mt-4 rounded-[24px] bg-white p-3 shadow-[0_12px_36px_rgba(15,23,42,0.18)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4389dc] text-lg font-black text-white">
                      {normalizeTikTokUsername(tiktokUsername).charAt(0).toUpperCase() || "L"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-black text-[#273044]">
                        {normalizeTikTokUsername(tiktokUsername)}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400">
                        Đang LIVE · {comments.length} người đang xem
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-lg"
                        onClick={() => setShowChannelSwitcher((v) => !v)}
                        type="button"
                        aria-label="Đổi kênh"
                      >
                        ⇌
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 disabled:opacity-50"
                        onClick={disconnectLive}
                        type="button"
                        disabled={isDisconnecting}
                        aria-label="Ngắt LIVE"
                      >
                        ⏻
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                        onClick={() => setLiveBarExpanded(false)}
                        type="button"
                        aria-label="Thu gọn"
                      >
                        ⌄
                      </button>
                    </div>
                  </div>

                  {showChannelSwitcher && (
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <select
                        className="min-h-11 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-[14px] font-black text-[#273044] outline-none"
                        value={selectedUsername}
                        onChange={(e) => setSelectedUsername(e.target.value)}
                        disabled={isConnecting}
                      >
                        <option value="">Chọn tài khoản</option>
                        {channelOptions.map((option) => (
                          <option key={option.id} value={option.username}>
                            {option.username}{option.isDefault ? " · Mặc định" : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        className="min-h-11 shrink-0 rounded-2xl bg-[#ff5f8a] px-4 text-[14px] font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={async () => {
                          await connectSelectedChannel();
                          setShowChannelSwitcher(false);
                        }}
                        type="button"
                        disabled={isConnecting || !selectedUsername}
                      >
                        {isConnecting ? "..." : "Kết nối lại"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="sticky bottom-3 z-20 ml-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5f8a] text-xl font-black text-white shadow-[0_12px_30px_rgba(255,95,138,0.35)]"
                  onClick={() => setLiveBarExpanded(true)}
                  type="button"
                  aria-label="Hiện điều khiển LIVE"
                >
                  ⌃
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="overflow-auto pb-[26px] [-webkit-overflow-scrolling:touch]">
          <OrderFilterBar
            searchText={orderSearchText}
            onChangeSearch={onChangeOrderSearchText}
            activeFilter={orderFilter}
            onChangeFilter={onChangeOrderFilter}
            productCount={orderProductCount}
            paidCount={paidOrders}
            draftCount={draftOrders}
            confirmedCount={confirmedOrders}
          />

          <div className="pb-[26px]">
            <SectionHeader
              title="Đơn đã tạo"
              actionText="Xóa đơn"
              onAction={onClearOrders}
            />

            {filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="m-0 text-[15px] leading-[22px] text-slate-500">
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