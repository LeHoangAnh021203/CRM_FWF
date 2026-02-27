const ACCOUNTING_API_BASE = "/api/proxy";

export const ACCOUNTING_ENDPOINTS = {
  customerSummary: "/api/customer-sale/customer-summary",
  paymentPercentNew: "/api/customer-sale/payment-percent-new",
  paymentPercentOld: "/api/customer-sale/payment-percent-old",
  paymentByRegion: "/api/sales/payment-by-region",
} as const;

export const accountingUrl = (path: string) => `${ACCOUNTING_API_BASE}${path}`;
