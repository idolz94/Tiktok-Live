"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DrawlerBase } from "@/components/ui/Drawler";
import liveDotAnimation from "../../../../public/assets/animations/dot.json";
import { createTikTokChannelApi } from "@/api/meApi";
import type { ShopTikTokChannel } from "@/types/database";
import { isPriorityComment, normalizeTikTokUsername } from "@/utils/comment";
import { printOrder } from "@/utils/order";
import CommentCard from "@/components/CommentCard";
import OrderCard from "@/components/OrderCard";
import OrderFilterBar from "@/components/OrderFilterBar";
import type {
  LiveComment,
  LiveTab,
  Order,
  OrderFilter,
  OrderProduct,
  TopTab,
} from "@/types";

const liveDotAnimationData = JSON.stringify(liveDotAnimation);

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
  onCreateOrderFromComment,
  isCommentOrderCreated,
  onUpdateOrder,
  onDeleteOrder,
  onAddProductToOrder,
  onToggleDeposit,
  onConfirmOrder,
  onOpenOrderOverview,
  depositLoadingIds,
  orderLoading,
  tiktokUsername,
  tiktokChannels,
  isConnected,
  showChannelSwitcher,
  onShowChannelSwitcherChange,
  onConnectTikTokLive,
  onLiveControlsHiddenChange,
  onChannelAdded,
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
  onCreateOrderFromComment: (item: LiveComment) => Promise<{ success: boolean; orderId: string }>;
  isCommentOrderCreated: (item: LiveComment) => boolean;
  onUpdateOrder: (id: string, field: keyof Order, value: string) => void;
  onDeleteOrder: (id: string) => void;
  onAddProductToOrder: (orderId: string, product: OrderProduct) => void;
  onToggleDeposit: (orderId: string) => void;
  onConfirmOrder: (orderId: string) => void;
  onOpenOrderOverview: (orderId: string) => void;
  depositLoadingIds: Set<string>;
  orderLoading?: boolean;
  tiktokUsername: string;
  tiktokChannels: ShopTikTokChannel[];
  isConnected: boolean;
  showChannelSwitcher: boolean;
  onShowChannelSwitcherChange: (open: boolean) => void;
  onConnectTikTokLive: (username: string) => Promise<boolean | void>;
  onLiveControlsHiddenChange?: (hidden: boolean) => void;
  onChannelAdded?: () => void | Promise<void>;
})  {
  const [commentTab, setCommentTab] = useState<CommentTab>("all");
  const [selectedUsername, setSelectedUsername] = useState(tiktokUsername || "");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const lastScrollTopRef = useRef(0);
const tickingRef = useRef(false);

const handleCommentListScroll = (event: React.UIEvent<HTMLDivElement>) => {
  const element = event.currentTarget;

  if (tickingRef.current) return;

  tickingRef.current = true;

  requestAnimationFrame(() => {
    const currentScrollTop = element.scrollTop;
    const diff = currentScrollTop - lastScrollTopRef.current;

    const isAtBottom = currentScrollTop + element.clientHeight >= element.scrollHeight - 8;

    if (isAtBottom) {
      onLiveControlsHiddenChange?.(false);
    } else if (Math.abs(diff) > 8) {
      onLiveControlsHiddenChange?.(diff > 0);
    }

    lastScrollTopRef.current = currentScrollTop;
    tickingRef.current = false;
  });
};

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
        <div className="px-4 pt-4">
          <div className="flex gap-2 rounded-full bg-white p-1 shadow-[0_10px_24px_rgba(255,95,138,0.08)]">
            <button
              type="button"
              onClick={() => onChangeLiveTab("live")}
              className="relative flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-[14px] font-semibold bg-[#ff6b8a] text-white shadow-sm"
            >
              <DotLottieReact
                data={liveDotAnimationData}
                loop
                autoplay
                className="h-8 w-8 shrink-0"
              />
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

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 flex gap-2 px-4 my-3">
            <button
              type="button"
              onClick={() => setCommentTab("all")}
              className={`rounded-2xl px-4 py-2 text-[13px] font-semibold ${
                commentTab === "all"
                  ? "bg-[#2b2b2b] text-white"
                  : "bg-white text-[#484848]"
              }`}
            >
              Tất cả · {comments?.length}
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
              Ưu tiên · {priorityComments?.length}
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
            onScroll={handleCommentListScroll}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-35 [-webkit-overflow-scrolling:touch]"
          >
            {(currentComments?.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-center text-[15px] leading-5.5 text-[#787878]">
                    Đang chờ comment
                </p>
              </div>
            ) : (
              currentComments?.map((item) => (
                <CommentCard
                  key={item.id}
                  item={item}
                  onCreateOrder={onCreateOrderFromComment}
                  isOrderCreated={isCommentOrderCreated(item)}
                  onPrintOrder={(comment, orderId) => {
                    const order = orders.find(
                      (o) => o.id === orderId || o.id === comment.orderId || o.commentId === comment.id,
                    );
                    if (order) printOrder(order);
                  }}
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
      <div className="bg-linear-to-b from-white/0 to-transparent px-4 pb-3">
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
          {/* {liveTab === "live" && ( */}
            <DotLottieReact
              data={liveDotAnimationData}
              autoplay
              loop
              className="h-10 w-10 shrink-0"
            />
          {/* )} */}
          <span className="-ml-3">Live</span>
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
        <div className="overflow-y-auto px-4 pb-24 pt-4 [-webkit-overflow-scrolling:touch]">
          {/* Header */}
          <div className="mb-4 flex flex-col gap-1">
            <p className="text-[20px] font-semibold leading-6 text-black">Chọn tài khoản</p>
            <p className="text-[14px] leading-[22px] text-[#484848]">
              Chọn kênh tiktok rồi bấm &ldquo;<span className="font-medium text-black">kết nối</span>&rdquo; để bắt đầu nhận bình luận.
            </p>
          </div>

          {/* Channel list card */}
          {channelOptions.length > 0 && (
            <div className="mb-4 overflow-hidden rounded-2xl border border-[#f2f2f2] bg-white">
              {channelOptions.map((option, index) => (
                <div key={option.id}>
                  {index > 0 && <div className="mx-4 h-px bg-[#f2f2f2]" />}
                  <div className="flex items-center gap-4 p-4">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] text-[16px] font-semibold text-[#ff6b8a]">
                      {option.username.charAt(0).toUpperCase()}
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium leading-[22px] text-black">
                        {option.username}
                      </p>
                      <p className="text-[12px] leading-[18px] text-[#484848]">
                        ID: {option.username}
                      </p>
                    </div>
                    {/* Connect button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUsername(option.username);
                        void (async () => {
                          setIsConnecting(true);
                          try {
                            await onConnectTikTokLive(option.username);
                          } finally {
                            setIsConnecting(false);
                          }
                        })();
                      }}
                      disabled={isConnecting}
                      className="flex h-10 shrink-0 items-center justify-center rounded-full bg-[#ffe8e8] px-4 text-[14px] font-medium leading-[22px] text-[#ff6b8a] disabled:opacity-60"
                    >
                      {isConnecting && selectedUsername === option.username ? "Đang kết nối..." : "Kết nối"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new channel button */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowAddChannel(true)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-black/20 bg-white text-[14px] leading-[22px] text-[#484848]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3.75v10.5M3.75 9h10.5" stroke="#484848" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Thêm mới
            </button>
            <p className="text-[12px] leading-[18px] text-[#484848]">
              Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới và dấu chấm.
            </p>
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
            unpaidCount={orders?.filter((o) => o.depositStatus !== "paid" && o.depositStatus !== "deposited")?.length}
          />

          <div className="pb-32">
            <div className="flex items-center px-4 py-2">
              <span className="text-[13px] text-[#787878]">{filteredOrders?.length} đơn</span>
            </div>

            {orderLoading ? (
              <div className="flex flex-col gap-3 px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#f2f2f2]" />
                ))}
              </div>
            ) : filteredOrders?.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="m-0 text-[15px] leading-5.5 text-slate-500">
                  Chưa có đơn nào.
                </p>
              </div>
            ) : (
              filteredOrders?.map((item) => (
                <OrderCard
                  key={item.id}
                  item={item}
                  onUpdate={onUpdateOrder}
                  onDelete={onDeleteOrder}
                  onAddProduct={onAddProductToOrder}
                  onToggleDeposit={onToggleDeposit}
                  onConfirmOrder={onConfirmOrder}
                  onOpenOverview={onOpenOrderOverview}
                  isDepositLoading={depositLoadingIds.has(item.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Add channel bottom sheet */}
      <DrawlerBase
        open={showAddChannel}
        onOpenChange={(open) => {
          setShowAddChannel(open);
          if (!open) setNewUsername("");
        }}
        height="auto"
        showHandle={false}
        showCloseButton={false}
        title={
          <div className="flex items-center justify-between">
            <span className="text-[18px] font-medium text-black">Thêm mới kênh Tiktok</span>
            <button
              type="button"
              onClick={() => { setShowAddChannel(false); setNewUsername(""); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f2f2] text-[18px] text-[#484848]"
              aria-label="Đóng"
            >
              ×
            </button>
          </div>
        }
        footer={
          <button
            type="button"
            disabled={!newUsername.trim() || isSaving}
            onClick={async () => {
              const username = normalizeTikTokUsername(newUsername.trim());
              if (!username) return;
              setIsSaving(true);
              try {
                await createTikTokChannelApi({ tiktokUsername: username });
                toast.success("Đã thêm kênh TikTok");
                setShowAddChannel(false);
                setNewUsername("");
                await onChannelAdded?.();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Thêm kênh thất bại");
              } finally {
                setIsSaving(false);
              }
            }}
            className="flex w-full items-center justify-center rounded-[40px] py-3.5 text-[16px] font-medium text-black disabled:opacity-40"
            style={{
              backgroundImage: "linear-gradient(139deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)",
            }}
          >
            {isSaving ? "Đang lưu..." : "Lưu lại"}
          </button>
        }
      >
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-medium leading-[22px] text-black">Tiktok ID</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Nhập Tiktok ID của bạn"
            className="h-12 w-full rounded-lg border border-black/10 px-4 text-[14px] leading-[22px] text-black placeholder:text-[#a0a0a0] focus:border-black/20 focus:outline-none"
          />
          <p className="text-[12px] leading-[18px] text-[#484848]">
            Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới và dấu chấm.
          </p>
        </div>
      </DrawlerBase>
    </>
  );
}