export type CustomerSummary = {
  username: string;
  avatar?: string;
  totalComments: number;
  totalOrders: number;
  latestComment: string;
};

export type DashboardCounts = {
  buyingCount: number;
  unpaidOrders: number;
  paidOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  orderProductCount: number;
};
