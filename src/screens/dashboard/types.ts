export type CustomerSummary = {
  username: string;
  avatar?: string;
  totalComments: number;
  totalOrders: number;
  latestComment: string;
};

export type CustomerWithTikTok = CustomerSummary & {
  customerId?: string | null;
  customerTikTokUsername?: string;
};

export type DashboardCounts = {
  buyingCount: number;
  paidOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  orderProductCount: number;
};
