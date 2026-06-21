"use client";

import { useEffect, useMemo, useState } from "react";
import type { Order, OrderProduct } from "@/types";
import { addOrderItemApi, updateOrderItemApi } from "@/api/ordersApi";
import { getCustomerByIdApi } from "@/api/customersApi";
import { listCustomerAddressesApi, type CustomerAddress } from "@/lib/addresses";
import { getOrderTotal } from "@/utils/order";
import { toast } from "sonner";

export function useOrderOverview(
  order: Order,
  callbacks?: {
    onAddProduct?: (orderId: string, product: OrderProduct) => void;
    onUpdateProduct?: (orderId: string, itemId: string, updates: Partial<OrderProduct>) => void;
  },
) {
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showShippingCreateScreen, setShowShippingCreateScreen] = useState(false);
  const [showShippingDrawer, setShowShippingDrawer] = useState(false);
  const [selectedShippingProvider, setSelectedShippingProvider] = useState<"manual" | "ghtk">("manual");
  const [shippingFeeInput, setShippingFeeInput] = useState(order.shippingFee ?? 0);
  const [prepaidAmountInput, setPrepaidAmountInput] = useState(order.codAmount ?? 0);
  const [defaultCustomerAddress, setDefaultCustomerAddress] = useState<CustomerAddress | null>(null);
  const [fetchedCustomerPhone, setFetchedCustomerPhone] = useState<string | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState("");
  const [editInitialPrice, setEditInitialPrice] = useState("");
  const [editInitialQty, setEditInitialQty] = useState(1);

  useEffect(() => {
    setShippingFeeInput(order.shippingFee ?? 0);
    setPrepaidAmountInput(order.codAmount ?? 0);
    setShowAllProducts(false);
    setShowShippingCreateScreen(false);
    setShowShippingDrawer(false);
    setSelectedShippingProvider("manual");
    setDefaultCustomerAddress(null);
    setFetchedCustomerPhone(null);
    setEditingProductId("");
    setEditInitialPrice("");
    setEditInitialQty(1);
  }, [order.id, order.codAmount, order.shippingFee]);

  useEffect(() => {
    if (!order.customerId) {
      setDefaultCustomerAddress(null);
      setFetchedCustomerPhone(null);
      return;
    }

    let cancelled = false;

    listCustomerAddressesApi(order.customerId)
      .then((list) => {
        if (cancelled) return;
        const def = list.find((item) => item?.isDefault) ?? list[0] ?? null;
        setDefaultCustomerAddress(def);
      })
      .catch(() => {});

    getCustomerByIdApi(order.customerId)
      .then((profile) => {
        if (cancelled) return;
        if (profile.phone) setFetchedCustomerPhone(profile.phone);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [order.customerId]);

  const products = useMemo(() => order.products || [], [order.products]);
  const productTotal = useMemo(() => getOrderTotal(products), [products]);
  const shippingFee = shippingFeeInput;
  const prepaidAmount = prepaidAmountInput;
  const remain = order.totalAmount ?? Math.max(0, productTotal + shippingFee - prepaidAmount);
  const totalQuantity = useMemo(() => products.reduce((sum, product) => sum + Number(product.quantity || 0), 0), [products]);
  const displayProducts = showAllProducts ? products : products.slice(0, 3);

  async function handleAddProduct(data: { code: string; price: number; quantity: number }) {
    try {
      setIsAddingProduct(true);
      const item = await addOrderItemApi(order.id, {
        productCode: data.code,
        productName: data.code,
        price: data.price,
        quantity: data.quantity,
      });

      const itemId = String(item.id || item.itemId || item.item_id || item.orderItemId || item.order_item_id || "");

      setAddProductOpen(false);
      toast.success("Đã thêm sản phẩm");

      const nextProduct = {
        id: itemId,
        code: String(item.productCode || item.product_code || data.code),
        name: String(item.productName || item.product_name || data.code),
        price: Number(item.price || data.price),
        quantity: Number(item.quantity || data.quantity),
      } satisfies OrderProduct;

      callbacks?.onAddProduct?.(order.id, nextProduct);
      return nextProduct;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thêm sản phẩm thất bại");
      return null;
    } finally {
      setIsAddingProduct(false);
    }
  }

  function startEditProduct(product: OrderProduct) {
    setEditingProductId(String(product.id || ""));
    setEditInitialPrice(String(product.price || 0));
    setEditInitialQty(product.quantity || 1);
    setEditProductOpen(true);
  }

  function clearEditProduct() {
    setEditingProductId("");
  }

  async function handleUpdateProduct(data: { code: string; price: number; quantity: number }) {
    const itemId = editingProductId.trim();

    if (!itemId) {
      toast.error("Không tìm thấy ID sản phẩm để cập nhật");
      return false;
    }

    try {
      setIsUpdatingProduct(true);
      await updateOrderItemApi(order.id, itemId, { price: data.price, quantity: data.quantity });
      callbacks?.onUpdateProduct?.(order.id, itemId, { price: data.price, quantity: data.quantity });
      setEditingProductId("");
      setEditProductOpen(false);
      toast.success("Đã cập nhật sản phẩm");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cập nhật sản phẩm thất bại");
      return false;
    } finally {
      setIsUpdatingProduct(false);
    }
  }

  return {
    addProductOpen,
    setAddProductOpen,
    editProductOpen,
    setEditProductOpen,
    showAllProducts,
    setShowAllProducts,
    showShippingCreateScreen,
    setShowShippingCreateScreen,
    showShippingDrawer,
    setShowShippingDrawer,
    selectedShippingProvider,
    setSelectedShippingProvider,
    shippingFeeInput,
    setShippingFeeInput,
    prepaidAmountInput,
    setPrepaidAmountInput,
    defaultCustomerAddress,
    fetchedCustomerPhone,
    products,
    productTotal,
    shippingFee,
    prepaidAmount,
    remain,
    totalQuantity,
    displayProducts,
    isAddingProduct,
    isUpdatingProduct,
    editInitialPrice,
    editInitialQty,
    handleAddProduct,
    handleUpdateProduct,
    startEditProduct,
    clearEditProduct,
  };
}
