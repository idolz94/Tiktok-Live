"use client";

import { LiveHistoryItem } from "@/features/tiktok-live/types";
import CommentCard from "../../../components/CommentCard";
import OrderCard from "../../../components/OrderCard";
import OrderFilterBar from "../../../components/OrderFilterBar";
import { LiveComment, LiveTab, Order, OrderFilter, OrderProduct, TopTab } from "../../../types";
import PlaceholderView from "./PlaceholderView";
import SectionHeader from "./SectionHeader";
import StatsRow from "./StatsRow";

export default function HomeView({
  topTab,
  liveTab,
  comments,
  orders,
  filteredOrders,
  orderFilter,
  orderSearchText,
  buyingCount,
  unpaidOrders,
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
  liveHistory,
}: {
  topTab: TopTab;
  liveTab: LiveTab;
  comments: LiveComment[];
  orders: Order[];
  filteredOrders: Order[];
  orderFilter: OrderFilter;
  orderSearchText: string;
  buyingCount: number;
  unpaidOrders: number;
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
  liveHistory: LiveHistoryItem[];
}) {
  console.log("liveHistory vaof o :", liveHistory);
  if (topTab === "history") {
    return (
      <div className="flex-1 p-4">
        <PlaceholderView liveHistory={liveHistory} />
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-[60px] border-b border-blue-100 bg-white">
        <button
          className={`flex-1 border-b-[3px] text-lg font-black ${liveTab === "live" ? "border-[#f2c300] text-[#f2c300]" : "border-transparent text-[#9ab2ad]"}`}
          onClick={() => onChangeLiveTab("live")}
          type="button"
        >
          ♪ LIVE
        </button>

        <button
          className={`flex-1 border-b-[3px] text-lg font-black ${liveTab === "orders" ? "border-[#f2c300] text-[#f2c300]" : "border-transparent text-[#9ab2ad]"}`}
          onClick={() => onChangeLiveTab("orders")}
          type="button"
        >
          ▧ Đơn đã tạo
        </button>
      </div>

      {liveTab === "live" ? (
        <div className="overflow-auto px-3 pb-[26px] [-webkit-overflow-scrolling:touch]">
          <StatsRow
            commentsCount={comments.length}
            buyingCount={buyingCount}
            ordersCount={orders.length}
          />
          <SectionHeader
            title="Comment realtime"
            actionText="Xóa comment"
            onAction={onClearComments}
          />

          {comments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="m-0 text-[15px] leading-[22px] text-slate-500">
                Chưa có comment. Hãy chạy Python socket, app sẽ tự kết nối.
              </p>
            </div>
          ) : (
            comments.map((item) => (
              <CommentCard key={item.id} item={item} onCreateOrder={onCreateOrderFromComment} />
            ))
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
            unpaidCount={unpaidOrders}
            paidCount={paidOrders}
            draftCount={draftOrders}
            confirmedCount={confirmedOrders}
          />

          <div className="pb-[26px]">
            <SectionHeader title="Đơn đã tạo" actionText="Xóa đơn" onAction={onClearOrders} />

            {filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="m-0 text-[15px] leading-[22px] text-slate-500">Chưa có đơn nào.</p>
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
