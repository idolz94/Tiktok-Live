export type AiStatus = "none" | "pending" | "done" | "error";

export type CommentPriorityLevel = "high" | "medium" | "low" | "normal";

export type CommentIntent =
  | "buying"
  | "buy"
  | "ask_price"
  | "ask_stock"
  | "ask_shipping"
  | "ask_product"
  | "provide_phone"
  | "provide_address"
  | "contact"
  | "question"
  | "normal"
  | "spam"
  | "unknown"
  | string;

export type LiveComment = {
  id: string;
  username: string;
  displayName?: string;
  customerTikTokUsername?: string;
  customerTikTokName?: string;
  uniqueId?: string;
  avatar?: string;
  avatarUrl?: string;
  comment: string;
  intent?: CommentIntent;
  priorityLevel?: CommentPriorityLevel | string;
  finalScore?: number;
  aiScore?: number;
  ruleScore?: number;
  aiStatus?: AiStatus | string;
  aiReason?: string;
  aiModel?: string;
  matchedReasons?: string[];
  missingInfo?: string[];
  isOrderCreated?: boolean;
  orderId?: string;
  dbId?: string;
  createdAt?: string;
  raw?: unknown;
};

export type OrderProduct = {
  id: string;
  code: string;
  name: string;
  price: number; // đơn vị: nghìn đồng. VD: 20 = 20.000đ
  quantity: number;
  variantName?: string;
  color?: string;
  size?: string;
  totalAmount?: number;
  rawCommentText?: string;
};

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "packed"
  | "shipping"
  | "completed"
  | "canceled"
  | "returned";

export type DepositStatus = "unpaid" | "paid" | "deposited" | "refunded";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type ShippingStatus =
  | "not_shipped"
  | "waiting_pickup"
  | "shipping"
  | "delivered"
  | "failed"
  | "returned";

export type Order = {
  id: string;
  orderCode: string;
  username: string;
  customerName?: string;
  customerTikTokUsername?: string;
  customerTikTokName?: string;
  uniqueId?: string;
  avatar?: string;
  avatarUrl?: string;
  comment: string;
  commentId: string;
  productName: string;
  quantity: number;
  latestComment?: string;
  size: string;
  color: string;
  price: number; // đơn vị: nghìn đồng
  products: OrderProduct[];
  status: OrderStatus;
  depositStatus: DepositStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
  subtotalAmount?: number;
  shippingFee?: number;
  discountAmount?: number;
  totalAmount?: number;
  codAmount?: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

export type OrderWithTikTok = Order;

export type SocketMessage = {
  type?: string;
  payload?: any;
  data?: any;
};

export type AuthUser = {
  id: string;
  username: string;
};

export type LiveTab = "live" | "orders";
export type TopTab = "connect" | "history";
export type BottomTab = "home" | "customers" | "shipping" | "reports" | "settings";
export type OrderFilter = "all" | "unpaid" | "paid" | "draft" | "confirmed";
