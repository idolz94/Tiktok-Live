"use client";

import { useCallback, useMemo, useState } from "react";
import { LiveComment, LiveTab, Order, OrderFilter, OrderProduct } from "../../../types";
import { createId, createOrderCode } from "../../../utils/id";
import {
  createProductFromComment,
  formatMoneyFromK,
  getOrderTotal,
  parseOrderFromComment,
} from "../../../utils/order";
import { CustomerSummary } from "../types";
import { readOrders, writeOrders } from "@/features/oders/orderStorage";
type UseOrderManagerParams = {
  comments: LiveComment[];
  onAfterCreateOrder?: () => void;
};

export function useOrderManager({ comments, onAfterCreateOrder }: UseOrderManagerParams) {
  const [orders, setOrders] = useState<Order[]>(() => readOrders());
  const [liveTab, setLiveTab] = useState<LiveTab>("live");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [orderSearchText, setOrderSearchText] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const buyingCount = useMemo(
    () => comments.filter((item) => item.intent === "buying").length,
    [comments]
  );
  const unpaidOrders = useMemo(
    () => orders.filter((item) => item.depositStatus === "unpaid").length,
    [orders]
  );
  const paidOrders = useMemo(
    () => orders.filter((item) => item.depositStatus === "paid").length,
    [orders]
  );
  const draftOrders = useMemo(
    () => orders.filter((item) => item.status === "draft").length,
    [orders]
  );
  const confirmedOrders = useMemo(
    () => orders.filter((item) => item.status === "confirmed").length,
    [orders]
  );
  const orderProductCount = useMemo(
    () => orders.reduce((sum, order) => sum + (order.products?.length || 0), 0),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const keyword = orderSearchText.trim().toLowerCase();

    return orders.filter((order) => {
      const matchFilter =
        orderFilter === "all" ||
        (orderFilter === "unpaid" && order.depositStatus === "unpaid") ||
        (orderFilter === "paid" && order.depositStatus === "paid") ||
        (orderFilter === "draft" && order.status === "draft") ||
        (orderFilter === "confirmed" && order.status === "confirmed");

      if (!matchFilter) return false;
      if (!keyword) return true;

      const searchValue =
        `${order.orderCode} ${order.username} ${order.comment} ${order.productName}`.toLowerCase();
      return searchValue.includes(keyword);
    });
  }, [orderFilter, orderSearchText, orders]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((order) => order.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  const customers = useMemo<CustomerSummary[]>(() => {
    const map = new Map<string, CustomerSummary>();

    comments.forEach((comment) => {
      const username = comment.username || "Unknown user";
      const current = map.get(username);

      if (!current) {
        map.set(username, {
          username,
          avatar: comment.avatar,
          totalComments: 1,
          totalOrders: orders.filter((order) => order.username === username).length,
          latestComment: comment.comment || comment.text || "",
        });
        return;
      }

      current.totalComments += 1;
      if (!current.latestComment) current.latestComment = comment.comment || comment.text || "";
    });

    orders.forEach((order) => {
      const current = map.get(order.username);

      if (!current) {
        map.set(order.username, {
          username: order.username,
          avatar: order.avatar,
          totalComments: 0,
          totalOrders: 1,
          latestComment: order.comment,
        });
        return;
      }

      current.totalOrders = orders.filter((item) => item.username === order.username).length;
    });

    return Array.from(map.values()).sort((a, b) => b.totalComments - a.totalComments);
  }, [comments, orders]);

  const createOrderFromComment = useCallback(
    (item: LiveComment) => {
      const commentText = item.comment || item.text || "";
      const parsed = parseOrderFromComment(commentText);
      const product = createProductFromComment(commentText);

      const order: Order = {
        id: createId(),
        orderCode: createOrderCode(),
        commentId: item.id,
        username: item.username,
        avatar: item.avatar,
        comment: commentText,
        productName: commentText,
        quantity: parsed.quantity,
        size: parsed.size,
        color: parsed.color,
        price: parsed.price,
        products: [product],
        status: "draft",
        depositStatus: "unpaid",
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => {
        const existed = prev.some((oldOrder) => oldOrder.commentId === item.id);

        if (existed) {
          console.log("Comment này đã tạo đơn rồi:", item.id);
          return prev;
        }

        const nextOrders = [order, ...prev];

        writeOrders(nextOrders);

        return nextOrders;
      });

      setLiveTab("orders");
      onAfterCreateOrder?.();

      console.log(
        `Đã tạo đơn\n${order.orderCode}\nSản phẩm: ${commentText}\nGiá: ${formatMoneyFromK(product.price)} × 1`
      );
    },
    [onAfterCreateOrder]
  );

  const clearOrders = useCallback(() => setOrders([]), []);

  const updateOrder = useCallback((id: string, field: keyof Order, value: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;

        if (field === "quantity" || field === "price") {
          return { ...order, [field]: Number(value || 0) };
        }

        return { ...order, [field]: value };
      })
    );
  }, []);

  const addProductToOrder = useCallback((orderId: string, product: OrderProduct) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return { ...order, products: [...(order.products || []), product] };
      })
    );
  }, []);

  const toggleDepositStatus = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return { ...order, depositStatus: order.depositStatus === "paid" ? "unpaid" : "paid" };
      })
    );
  }, []);

  const confirmOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return { ...order, status: order.status === "confirmed" ? "draft" : "confirmed" };
      })
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }, []);

  const openOrderOverview = useCallback((orderId: string) => setSelectedOrderId(orderId), []);
  const closeOrderOverview = useCallback(() => setSelectedOrderId(null), []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, item) => sum + getOrderTotal(item.products || []), 0),
    [orders]
  );

  return {
    orders,
    filteredOrders,
    customers,
    selectedOrder,
    liveTab,
    setLiveTab,
    orderFilter,
    setOrderFilter,
    orderSearchText,
    setOrderSearchText,
    buyingCount,
    unpaidOrders,
    paidOrders,
    draftOrders,
    confirmedOrders,
    orderProductCount,
    totalRevenue,
    createOrderFromComment,
    clearOrders,
    updateOrder,
    addProductToOrder,
    toggleDepositStatus,
    confirmOrder,
    deleteOrder,
    openOrderOverview,
    closeOrderOverview,
  };
}
