export const ORDER_API_BASE = "/api/proxy";

export const orderUrl = (path: string) => `${ORDER_API_BASE}/api/${path}`;

export const ORDER_ENDPOINTS = {
  regionRevenue: "sales/region-revenue",
  shopTypeRevenue: "sales/shop-type-revenue",
  revenueSummary: "sales/revenue-summary",
  regionStat: "sales/region-stat",
  overallSummary: "sales/overall-summary",
  regionActualPie: "sales/region-actual-pie",
  dailyRegionRevenue: "sales/daily-region-revenue",
  dailyByShopType: "sales/daily-by-shop-type",
  dailyByCustomerType: "sales/daily-by-customer-type",
  dailyOrderStats: "sales/daily-order-stats",
  fullStoreRevenue: "sales/full-store-revenue",
  regionOrderBreakdownTable: "sales/region-order-breakdown-table",
  regionOrderBreakdown: "sales/region-order-breakdown",
  overallOrderSummary: "sales/overall-order-summary",
  paymentRevenueCustomerStatus:
    "customer-sale/payment-revenue-customer-status",
} as const;
